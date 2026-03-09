import * as vscode from 'vscode';
import { ContextSnapshot } from './types';

let extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext) {
  extensionContext = context;

  console.log('Context Snapshot Extension 已激活');

  // 注册捕获命令
  const captureCommand = vscode.commands.registerCommand(
    'context.capture',
    async () => {
      await captureContext();
    }
  );

  // 注册恢复命令
  const restoreCommand = vscode.commands.registerCommand(
    'context.restore',
    async () => {
      await restoreContext();
    }
  );

  // 注册列表命令
  const listCommand = vscode.commands.registerCommand(
    'context.list',
    async () => {
      await listContexts();
    }
  );

  context.subscriptions.push(
    captureCommand,
    restoreCommand,
    listCommand
  );
}

export function deactivate() {
  console.log('Context Snapshot Extension 已停用');
}

// 捕获当前上下文
async function captureContext() {
  try {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage('没有打开的文件');
      return;
    }

    // 获取当前打开的文件
    const files = vscode.workspace.textDocuments.map(doc => doc.uri.fsPath);

    if (files.length === 0) {
      vscode.window.showWarningMessage('没有打开的文件');
      return;
    }

    // 生成快照名称
    const snapshot: ContextSnapshot = {
      id: Date.now().toString(),
      name: `上下文 ${new Date().toLocaleTimeString('zh-CN')}`,
      description: `包含 ${files.length} 个文件`,
      files: files,
      commands: [], // TODO: 捕获终端命令
      notes: '捕获时间: ' + new Date().toLocaleString('zh-CN'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 显示成功消息
    vscode.window.showInformationMessage(`成功捕获上下文: ${snapshot.name}`);

    // TODO: 发送到 Web Dashboard
    console.log('捕获的快照:', snapshot);

  } catch (error) {
    vscode.window.showErrorMessage(`捕获上下文失败: ${error}`);
  }
}

// 恢复上下文
async function restoreContext() {
  try {
    // TODO: 从 Web Dashboard 获取快照列表
    // MVP 阶段: 提示用户选择快照
    const quickPick = vscode.window.createQuickPick();

    quickPick.placeholder = '选择要恢复的上下文';
    quickPick.items = [
      { label: '示例上下文 1', description: '3 个文件' },
      { label: '示例上下文 2', description: '5 个文件' },
    ];

    const selected = await quickPick.show();

    if (selected) {
      vscode.window.showInformationMessage(`恢复上下文: ${selected.label}`);
      // TODO: 打开文件
      console.log('恢复的上下文:', selected);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`恢复上下文失败: ${error}`);
  }
}

// 查看上下文列表
async function listContexts() {
  try {
    // TODO: 从 Web Dashboard 获取快照列表
    vscode.window.showInformationMessage('上下文列表功能开发中...');
  } catch (error) {
    vscode.window.showErrorMessage(`查看上下文失败: ${error}`);
  }
}
