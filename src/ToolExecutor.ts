import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ToolCommand {
  tool: string;
  path?: string;
  content?: string;
  diff?: string;
  command?: string;
  query?: string;
}

export class ToolExecutor {
  constructor(private workspaceRoot: string | undefined) {}

  public async execute(toolCmd: ToolCommand): Promise<string> {
    if (!this.workspaceRoot) {
      return 'Error: No workspace opened.';
    }

    try {
      switch (toolCmd.tool) {
        case 'read_file':
          if (!toolCmd.path) return 'Error: path required';
          return await fs.readFile(path.join(this.workspaceRoot, toolCmd.path), 'utf-8');

        case 'write_file':
          if (!toolCmd.path || !toolCmd.content) return 'Error: path and content required';
          const fullPath = path.join(this.workspaceRoot, toolCmd.path);
          await fs.mkdir(path.dirname(fullPath), { recursive: true });
          await fs.writeFile(fullPath, toolCmd.content, 'utf-8');
          return `Successfully wrote to ${toolCmd.path}`;

        case 'apply_patch':
           // Simplistic patch application placeholder
           // Properly parsing diffs is complex, for now returning generic mock or asking for replace
          if (!toolCmd.path || !toolCmd.diff) return 'Error: path and diff required';
          return `Successfully applied patch to ${toolCmd.path} (Mocked)`;

        case 'run_terminal':
          if (!toolCmd.command) return 'Error: command required';
          return await this.runCommand(toolCmd.command);

        case 'search_workspace':
          if (!toolCmd.query) return 'Error: query required';
          const files = await vscode.workspace.findFiles(`**/*${toolCmd.query}*`);
          return files.map(f => f.fsPath).join('\n') || 'No files found.';

        default:
          return `Error: Unknown tool ${toolCmd.tool}`;
      }
    } catch (e: any) {
      return `Error executing tool: ${e.message}`;
    }
  }

  private runCommand(cmd: string): Promise<string> {
    return new Promise((resolve) => {
      vscode.window.showInformationMessage(`Agent wants to run: ${cmd}`, 'Allow', 'Deny')
        .then(selection => {
          if (selection === 'Allow') {
            const terminal = vscode.window.createTerminal('WadoAgent');
            terminal.show();
            terminal.sendText(cmd);
            resolve(`Started task in terminal: ${cmd}. (Background execution)`);
          } else {
            resolve(`User denied terminal execution for: ${cmd}`);
          }
        });
    });
  }
}
