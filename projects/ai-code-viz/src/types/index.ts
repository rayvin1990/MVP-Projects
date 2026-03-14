// 代码节点类型
export interface CodeNode {
  id: string;
  type: 'file' | 'function' | 'class' | 'import' | 'export';
  label: string;
  path?: string;
  line?: number;
}

// 代码边类型
export interface CodeEdge {
  id: string;
  source: string;
  target: string;
  type: 'import' | 'call' | 'inherit' | 'use';
  label?: string;
}

// 依赖图数据
export interface DependencyGraph {
  nodes: CodeNode[];
  edges: CodeEdge[];
}

// 文件信息
export interface FileInfo {
  path: string;
  name: string;
  imports: string[];
  exports: string[];
  functions: string[];
  classes: string[];
}
