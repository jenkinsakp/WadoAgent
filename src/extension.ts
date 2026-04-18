import * as vscode from 'vscode';
import { OllamaService } from './OllamaService';
import { ModelRouter } from './ModelRouter';
import { ToolExecutor } from './ToolExecutor';
import { ChatWebviewProvider } from './ChatWebviewProvider';

export function activate(context: vscode.ExtensionContext) {
  const ollamaService = new OllamaService();
  const modelRouter = new ModelRouter();
  const workspaceRoot = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
  const toolExecutor = new ToolExecutor(workspaceRoot);

  const provider = new ChatWebviewProvider(context.extensionUri, ollamaService, modelRouter, toolExecutor);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ChatWebviewProvider.viewType, provider)
  );

  const startCmd = vscode.commands.registerCommand('wadoagent.start', () => {
    vscode.commands.executeCommand('workbench.view.extension.wadoagent-sidebar');
  });

  context.subscriptions.push(startCmd);
}

export function deactivate() {}
