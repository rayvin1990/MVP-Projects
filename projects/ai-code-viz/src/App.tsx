import { CodeFlow } from './components/CodeFlow';
import { initialNodes, initialEdges } from './utils/mockData';
import './App.css';

function App() {
  return (
    <div className="w-full h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航栏 */}
      <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI Code Viz
        </h1>
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
          代码依赖可视化工具
        </span>
      </header>
      
      {/* 主内容区 - 代码流程图 */}
      <main className="calc(100vh - 3.5rem)">
        <CodeFlow nodes={initialNodes} edges={initialEdges} />
      </main>
    </div>
  );
}

export default App;
