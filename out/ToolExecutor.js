"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolExecutor = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class ToolExecutor {
    workspaceRoot;
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
    }
    async execute(toolCmd) {
        if (!this.workspaceRoot) {
            return 'Error: No workspace opened.';
        }
        try {
            switch (toolCmd.tool) {
                case 'read_file':
                    if (!toolCmd.path)
                        return 'Error: path required';
                    return await fs.readFile(path.join(this.workspaceRoot, toolCmd.path), 'utf-8');
                case 'write_file':
                    if (!toolCmd.path || !toolCmd.content)
                        return 'Error: path and content required';
                    const fullPath = path.join(this.workspaceRoot, toolCmd.path);
                    await fs.mkdir(path.dirname(fullPath), { recursive: true });
                    await fs.writeFile(fullPath, toolCmd.content, 'utf-8');
                    return `Successfully wrote to ${toolCmd.path}`;
                case 'apply_patch':
                    // Simplistic patch application placeholder
                    // Properly parsing diffs is complex, for now returning generic mock or asking for replace
                    if (!toolCmd.path || !toolCmd.diff)
                        return 'Error: path and diff required';
                    return `Successfully applied patch to ${toolCmd.path} (Mocked)`;
                case 'run_terminal':
                    if (!toolCmd.command)
                        return 'Error: command required';
                    return await this.runCommand(toolCmd.command);
                case 'search_workspace':
                    if (!toolCmd.query)
                        return 'Error: query required';
                    const files = await vscode.workspace.findFiles(`**/*${toolCmd.query}*`);
                    return files.map(f => f.fsPath).join('\n') || 'No files found.';
                default:
                    return `Error: Unknown tool ${toolCmd.tool}`;
            }
        }
        catch (e) {
            return `Error executing tool: ${e.message}`;
        }
    }
    runCommand(cmd) {
        return new Promise((resolve) => {
            vscode.window.showInformationMessage(`Agent wants to run: ${cmd}`, 'Allow', 'Deny')
                .then(selection => {
                if (selection === 'Allow') {
                    const terminal = vscode.window.createTerminal('WadoAgent');
                    terminal.show();
                    terminal.sendText(cmd);
                    resolve(`Started task in terminal: ${cmd}. (Background execution)`);
                }
                else {
                    resolve(`User denied terminal execution for: ${cmd}`);
                }
            });
        });
    }
}
exports.ToolExecutor = ToolExecutor;
//# sourceMappingURL=ToolExecutor.js.map