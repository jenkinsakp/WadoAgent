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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const OllamaService_1 = require("./OllamaService");
const ModelRouter_1 = require("./ModelRouter");
const ToolExecutor_1 = require("./ToolExecutor");
const ChatWebviewProvider_1 = require("./ChatWebviewProvider");
function activate(context) {
    const ollamaService = new OllamaService_1.OllamaService();
    const modelRouter = new ModelRouter_1.ModelRouter();
    const workspaceRoot = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
    const toolExecutor = new ToolExecutor_1.ToolExecutor(workspaceRoot);
    const provider = new ChatWebviewProvider_1.ChatWebviewProvider(context.extensionUri, ollamaService, modelRouter, toolExecutor);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(ChatWebviewProvider_1.ChatWebviewProvider.viewType, provider));
    const startCmd = vscode.commands.registerCommand('wadoagent.start', () => {
        vscode.commands.executeCommand('workbench.view.extension.wadoagent-sidebar');
    });
    context.subscriptions.push(startCmd);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map