# AI Code Viz - 数据流设计

## 1. 数据流总览

```
┌──────────────────────────────────────────────────────────────────┐
│                         用户操作                                  │
│  (打开项目 / 文件变更 / 搜索 / 点击节点 / 展开折叠)                │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                       前端 UI 层                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │  项目加载  │  │  文件树    │  │  图形视图  │  │  搜索面板  │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              ↓ ↑
                    ┌─────────┴─────────┐
                    │   Zustand Store   │
                    │  (全局状态管理)    │
                    └─────────┬─────────┘
                              ↓ ↑
┌──────────────────────────────────────────────────────────────────┐
│                      Web Worker (后台线程)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │  文件扫描  │  │  AST 解析   │  │  依赖图构建│  │  布局计算  │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              ↓ ↑
                    ┌─────────┴─────────┐
                    │   文件系统 API     │
                    │  (Node.js / 浏览器) │
                    └───────────────────┘
```

---

## 2. 核心数据结构

### 2.1 原始数据层

#### FileNode（文件节点）
```typescript
interface FileNode {
  id: string;              // 唯一标识：文件路径 hash
  path: string;            // 相对路径：src/components/Button.tsx
  name: string;            // 文件名：Button.tsx
  language: string;        // 语言：typescript
  size: number;            // 文件大小（字节）
  lastModified: number;    // 最后修改时间戳
  children?: FileNode[];   // 子文件/文件夹（目录树）
}
```

#### RawAST（原始 AST）
```typescript
interface RawAST {
  fileId: string;          // 关联文件 ID
  tree: any;               // Tree-sitter 语法树
  rootType: string;        // 根节点类型：program, module
  parseTime: number;       // 解析耗时（ms）
  errors: ParseError[];    // 解析错误列表
}

interface ParseError {
  row: number;
  column: number;
  message: string;
}
```

### 2.2 符号数据层

#### Symbol（代码符号）
```typescript
interface Symbol {
  id: string;              // 唯一标识：fileId:symbolName
  fileId: string;          // 所属文件
  name: string;            // 符号名称
  kind: SymbolKind;        // 符号类型
  position: Position;      // 在文件中的位置
  range: Range;            // 完整范围
  parameters?: string[];   // 函数参数
  returnType?: string;     // 返回类型
  modifiers?: string[];    // 修饰符：export, async, static
  docComment?: string;     // 文档注释
}

type SymbolKind = 
  | 'function'
  | 'class'
  | 'interface'
  | 'type'
  | 'enum'
  | 'variable'
  | 'constant'
  | 'method'
  | 'property';

interface Position {
  row: number;
  column: number;
}

interface Range {
  start: Position;
  end: Position;
}
```

#### SymbolTable（符号表）
```typescript
interface SymbolTable {
  fileId: string;
  symbols: Symbol[];
  imports: ImportStatement[];
  exports: ExportStatement[];
}

interface ImportStatement {
  source: string;          // 导入路径
  specifiers: string[];    // 导入的符号名
  isDefault: boolean;
}

interface ExportStatement {
  symbolId: string;
  isDefault: boolean;
}
```

### 2.3 图数据层

#### CodeGraph（代码图）
```typescript
interface CodeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: GraphMetadata;
}

interface GraphMetadata {
  createdAt: number;
  updatedAt: number;
  fileCount: number;
  nodeCount: number;
  edgeCount: number;
  languages: string[];
}
```

#### GraphNode（图节点）
```typescript
interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  group?: string;          // 分组：文件/模块
  position?: { x: number; y: number };
  data: {
    symbolId?: string;
    fileId?: string;
    path?: string;
    kind?: SymbolKind;
    isEntry?: boolean;     // 是否是入口文件
    isExternal?: boolean;  // 是否是外部依赖
  };
  style?: NodeStyle;
}

type NodeType = 'file' | 'function' | 'class' | 'variable' | 'folder';
```

#### GraphEdge（图边）
```typescript
interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
  style?: EdgeStyle;
}

type EdgeType = 
  | 'calls'        // 函数调用
  | 'imports'      // 文件导入
  | 'extends'      // 继承
  | 'implements'   // 实现接口
  | 'references'   // 引用变量
  | 'returns'      // 返回类型
  | 'parameter';   // 参数类型
```

### 2.4 布局数据层

#### LayoutGraph（布局图）
```typescript
interface LayoutGraph {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  bounds: Bounds;
}

interface LayoutNode extends GraphNode {
  x: number;
  y: number;
  width: number;
  height: number;
  collapsed?: boolean;     // 是否折叠
}

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
```

### 2.5 视图数据层

#### ViewState（视图状态）
```typescript
interface ViewState {
  zoom: number;
  pan: { x: number; y: number };
  selectedNodeIds: string[];
  hoveredNodeId?: string;
  focusedPath?: string[];  // 高亮路径
  filters: ViewFilters;
}

interface ViewFilters {
  nodeTypes: NodeType[];
  edgeTypes: EdgeType[];
  searchQuery?: string;
  filePattern?: string;
}
```

---

## 3. 数据处理流程

### 3.1 项目加载流程

```
1. 用户选择项目目录
         ↓
2. 读取目录结构（递归扫描）
         ↓
3. 生成 FileNode 树
         ↓
4. 更新 UI（文件树面板）
         ↓
5. 触发解析任务（Web Worker）
```

**状态变化：**
```typescript
// Zustand Store
{
  project: {
    status: 'loading' → 'ready',
    rootPath: '/path/to/project',
    fileTree: FileNode[]
  }
}
```

---

### 3.2 解析流程

```
1. 主线程发送解析请求（postMessage）
         ↓
2. Worker 接收文件列表
         ↓
3. 加载 Tree-sitter WASM（如未加载）
         ↓
4. 并行解析文件（批处理）
   ├─ 读取文件内容
   ├─ 调用 parser.parse()
   └─ 生成 RawAST
         ↓
5. 符号提取（遍历 AST）
   ├─ 识别函数/类/变量
   ├─ 提取导入/导出
   └─ 生成 SymbolTable
         ↓
6. 构建依赖图
   ├─ 解析 import 路径
   ├─ 匹配符号引用
   └─ 生成 CodeGraph
         ↓
7. 计算布局（dagre）
         ↓
8. 返回 LayoutGraph 到主线程
         ↓
9. 更新 React Flow 节点和边
```

**Worker 消息协议：**
```typescript
// 主线程 → Worker
interface ParseRequest {
  type: 'PARSE';
  payload: {
    files: FileNode[];
    language: string;
  };
}

// Worker → 主线程
interface ParseResponse {
  type: 'PARSE_COMPLETE';
  payload: {
    graph: CodeGraph;
    layout: LayoutGraph;
    stats: {
      fileCount: number;
      parseTime: number;
      errorCount: number;
    };
  };
}
```

---

### 3.3 增量更新流程

```
1. chokidar 检测文件变更
         ↓
2. 识别变更类型
   ├─ CREATE: 新文件
   ├─ UPDATE: 修改文件
   └─ DELETE: 删除文件
         ↓
3. 增量解析
   ├─ CREATE/UPDATE: 解析单个文件
   └─ DELETE: 从图中移除节点
         ↓
4. 更新依赖图
   ├─ 添加/更新/删除节点
   └─ 更新相关边
         ↓
5. 增量布局（仅受影响区域）
         ↓
6. 更新视图
```

**增量更新策略：**
```typescript
interface IncrementalUpdate {
  type: 'incremental';
  added: GraphNode[];
  updated: GraphNode[];
  removed: string[];  // 节点 ID 列表
  affectedEdges: GraphEdge[];
}
```

---

### 3.4 交互流程

#### 节点点击
```
1. 用户点击节点
         ↓
2. 更新 selectedNodeIds
         ↓
3. 高亮节点（React Flow）
         ↓
4. 显示详情面板（符号信息、位置、文档）
         ↓
5. 可选：定位到 IDE 中的代码位置
```

#### 搜索过滤
```
1. 用户输入搜索词
         ↓
2. 防抖（300ms）
         ↓
3. 匹配符号名称/路径
         ↓
4. 更新 filters.searchQuery
         ↓
5. 过滤可见节点
         ↓
6. 聚焦首个匹配节点
```

#### 展开/折叠
```
1. 用户点击折叠按钮
         ↓
2. 切换 node.collapsed
         ↓
3. 隐藏/显示子节点
         ↓
4. 重新计算布局（局部）
```

---

## 4. 状态管理设计

### 4.1 Zustand Store 结构

```typescript
interface AppState {
  // 项目状态
  project: {
    status: 'idle' | 'loading' | 'ready' | 'error';
    rootPath: string | null;
    fileTree: FileNode[];
  };
  
  // 解析状态
  parser: {
    status: 'idle' | 'parsing' | 'complete' | 'error';
    progress: number;  // 0-100
    stats: {
      totalFiles: number;
      parsedFiles: number;
      errorCount: number;
    };
  };
  
  // 图数据
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
    metadata: GraphMetadata;
  };
  
  // 布局
  layout: {
    nodes: LayoutNode[];
    edges: LayoutEdge[];
    bounds: Bounds;
  };
  
  // 视图
  view: ViewState;
  
  // 操作
  actions: {
    loadProject: (path: string) => void;
    parseFiles: (files: FileNode[]) => void;
    updateLayout: (layout: LayoutGraph) => void;
    selectNode: (nodeId: string) => void;
    setSearchQuery: (query: string) => void;
    toggleCollapse: (nodeId: string) => void;
  };
}
```

### 4.2 状态更新示例

```typescript
const useStore = create<AppState>((set, get) => ({
  project: { status: 'idle', rootPath: null, fileTree: [] },
  parser: { status: 'idle', progress: 0, stats: { totalFiles: 0, parsedFiles: 0, errorCount: 0 } },
  graph: { nodes: [], edges: [], metadata: { createdAt: 0, updatedAt: 0, fileCount: 0, nodeCount: 0, edgeCount: 0, languages: [] } },
  layout: { nodes: [], edges: [], bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 } },
  view: { zoom: 1, pan: { x: 0, y: 0 }, selectedNodeIds: [], filters: { nodeTypes: [], edgeTypes: [] } },
  
  actions: {
    loadProject: (path) => set({ project: { status: 'loading', rootPath: path, fileTree: [] } }),
    
    parseFiles: (files) => {
      set({ 
        parser: { 
          status: 'parsing', 
          progress: 0,
          stats: { totalFiles: files.length, parsedFiles: 0, errorCount: 0 }
        }
      });
      // 发送 Worker 消息...
    },
    
    updateLayout: (layout) => set({ 
      layout,
      parser: { ...get().parser, status: 'complete', progress: 100 },
      graph: { ...get().graph, metadata: { ...get().graph.metadata, updatedAt: Date.now() } }
    }),
    
    selectNode: (nodeId) => set({ 
      view: { ...get().view, selectedNodeIds: [nodeId] }
    }),
  }
}));
```

---

## 5. 性能优化策略

### 5.1 数据分块

```typescript
// 大文件分批解析
async function parseInChunks(files: FileNode[], chunkSize: number = 10) {
  for (let i = 0; i < files.length; i += chunkSize) {
    const chunk = files.slice(i, i + chunkSize);
    await parseChunk(chunk);
    reportProgress(i + chunk.length, files.length);
  }
}
```

### 5.2 虚拟节点

```typescript
// 仅渲染可视区域内的节点
const visibleNodes = useMemo(() => {
  return nodes.filter(node => {
    return isInViewport(node.x, node.y, viewport);
  });
}, [nodes, viewport]);
```

### 5.3 数据缓存

```typescript
// 解析结果缓存
const parseCache = new Map<string, SymbolTable>();

function getCachedOrParse(file: FileNode): SymbolTable {
  const cached = parseCache.get(file.id);
  if (cached && cached.lastModified === file.lastModified) {
    return cached;
  }
  const result = parseFile(file);
  parseCache.set(file.id, result);
  return result;
}
```

---

## 6. 错误处理

### 6.1 解析错误

```typescript
interface ParseResult {
  success: boolean;
  data?: SymbolTable;
  errors: ParseError[];
}

// 容错处理：即使有错误也返回部分结果
function parseWithFallback(file: FileNode): ParseResult {
  try {
    const ast = parser.parse(file.content);
    const symbols = extractSymbols(ast);
    return { success: true, data: symbols, errors: [] };
  } catch (error) {
    return { 
      success: false, 
      errors: [{ message: error.message, row: 0, column: 0 }],
      data: { fileId: file.id, symbols: [], imports: [], exports: [] }
    };
  }
}
```

### 6.2 Worker 错误

```typescript
worker.onerror = (event) => {
  console.error('Worker error:', event.message);
  store.setState({ 
    parser: { 
      ...store.getState().parser, 
      status: 'error' 
    } 
  });
};
```

---

## 7. 数据流图总结

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   文件系统   │ ──→ │   解析器    │ ──→ │   符号表    │
└─────────────┘     └─────────────┘     └─────────────┘
                                              ↓
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   视图渲染   │ ←── │   布局引擎   │ ←── │   依赖图    │
└─────────────┘     └─────────────┘     └─────────────┘
       ↑                                       ↓
       └──────────── 用户交互 ─────────────────┘
```

---

## 8. 下一步

1. 实现 Zustand Store
2. 创建 Web Worker 解析器
3. 定义消息协议
4. 实现增量更新逻辑
5. 添加错误处理和重试机制
