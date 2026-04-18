"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatWebviewProvider = void 0;
const AgentLoop_1 = require("./AgentLoop");
class ChatWebviewProvider {
    _extensionUri;
    ollamaService;
    modelRouter;
    toolExecutor;
    static viewType = 'wadoagent.chatView';
    _view;
    constructor(_extensionUri, ollamaService, modelRouter, toolExecutor) {
        this._extensionUri = _extensionUri;
        this.ollamaService = ollamaService;
        this.modelRouter = modelRouter;
        this.toolExecutor = toolExecutor;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview();
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'fetchModels':
                    {
                        const models = await this.ollamaService.getModels();
                        // Default to first models if none selected
                        if (models.length > 0) {
                            if (!this.modelRouter.getReasoningModel()) {
                                this.modelRouter.setReasoningModel(models[0].name);
                            }
                            if (!this.modelRouter.getCodingModel()) {
                                this.modelRouter.setCodingModel(models[0].name);
                            }
                        }
                        webviewView.webview.postMessage({
                            type: 'updateModels',
                            models: models.map(m => m.name),
                            reasoning: this.modelRouter.getReasoningModel(),
                            coding: this.modelRouter.getCodingModel()
                        });
                        break;
                    }
                case 'setModel':
                    {
                        if (data.layer === 'reasoning')
                            this.modelRouter.setReasoningModel(data.model);
                        if (data.layer === 'coding')
                            this.modelRouter.setCodingModel(data.model);
                        break;
                    }
                case 'startAgent':
                    {
                        const agentLoop = new AgentLoop_1.AgentLoop(this.ollamaService, this.modelRouter, this.toolExecutor);
                        this.logToUI(`Task: ${data.task}`);
                        await agentLoop.run(data.task, (msg) => this.logToUI(msg));
                        break;
                    }
            }
        });
    }
    logToUI(msg) {
        if (this._view) {
            this._view.webview.postMessage({ type: 'log', message: msg });
        }
    }
    _getHtmlForWebview() {
        return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WadoAgent</title>
      <style>
        body { font-family: var(--vscode-font-family); background-color: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 10px; }
        select, input, button { width: 100%; margin-bottom: 10px; padding: 5px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); }
        button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); cursor: pointer; border: none; padding: 8px; }
        button:hover { background: var(--vscode-button-hoverBackground); }
        #logs { margin-top: 10px; padding: 10px; background: var(--vscode-editor-inactiveSelectionBackground); white-space: pre-wrap; font-family: monospace; font-size: 12px; height: 300px; overflow-y: auto;}
      </style>
    </head>
    <body>
      <label>🧠 Reasoning Model</label>
      <select id="reasoningSelect"></select>

      <label>💻 Coding Model</label>
      <select id="codingSelect"></select>

      <input type="text" id="taskInput" placeholder="Enter task..." />
      <button id="startBtn">START AGENT</button>
      <button id="refreshBtn">Refresh Models</button>

      <div id="logs"></div>

      <script>
        const vscode = acquireVsCodeApi();
        
        document.getElementById('refreshBtn').addEventListener('click', () => {
           vscode.postMessage({ type: 'fetchModels' });
        });

        document.getElementById('startBtn').addEventListener('click', () => {
           const task = document.getElementById('taskInput').value;
           if (task) {
             document.getElementById('logs').innerHTML = '';
             vscode.postMessage({ type: 'startAgent', task });
           }
        });

        document.getElementById('reasoningSelect').addEventListener('change', (e) => {
           vscode.postMessage({ type: 'setModel', layer: 'reasoning', model: e.target.value });
        });

        document.getElementById('codingSelect').addEventListener('change', (e) => {
           vscode.postMessage({ type: 'setModel', layer: 'coding', model: e.target.value });
        });

        window.addEventListener('message', event => {
          const message = event.data;
          if (message.type === 'updateModels') {
             const rSelect = document.getElementById('reasoningSelect');
             const cSelect = document.getElementById('codingSelect');
             rSelect.innerHTML = message.models.map(m => \`<option value="\${m}">\${m}</option>\`).join('');
             cSelect.innerHTML = message.models.map(m => \`<option value="\${m}">\${m}</option>\`).join('');
             rSelect.value = message.reasoning || '';
             cSelect.value = message.coding || '';
          } else if (message.type === 'log') {
             const logs = document.getElementById('logs');
             logs.innerText += message.message + '\\n';
             logs.scrollTop = logs.scrollHeight;
          }
        });

        // Initial fetch
        vscode.postMessage({ type: 'fetchModels' });
      </script>
    </body>
    </html>`;
    }
}
exports.ChatWebviewProvider = ChatWebviewProvider;
//# sourceMappingURL=ChatWebviewProvider.js.map