"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaService = void 0;
const vscode_1 = require("vscode");
class OllamaService {
    baseUrl = 'http://localhost:11434';
    async isAlive() {
        try {
            const response = await fetch(`${this.baseUrl}/`);
            return response.ok;
        }
        catch {
            return false;
        }
    }
    async getModels() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            if (!response.ok) {
                throw new Error('Failed to fetch models');
            }
            const data = await response.json();
            return data.models || [];
        }
        catch (e) {
            console.error('OllamaService getModels error', e);
            return [];
        }
    }
    async sendMessage(model, messages) {
        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    messages,
                    stream: false
                })
            });
            if (!response.ok) {
                throw new Error(`Chat failed: ${response.statusText}`);
            }
            const data = await response.json();
            return data.message.content;
        }
        catch (e) {
            vscode_1.window.showErrorMessage(`Ollama Chat Error: ${e.message}`);
            throw e;
        }
    }
    async *streamMessage(model, messages) {
        const response = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                messages,
                stream: true
            })
        });
        if (!response.ok || !response.body) {
            throw new Error(`Chat streaming failed: ${response.statusText}`);
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim());
            for (const line of lines) {
                try {
                    const parsed = JSON.parse(line);
                    if (parsed.message?.content) {
                        yield parsed.message.content;
                    }
                }
                catch (e) {
                    // ignore parsing error for chunk parts
                }
            }
        }
    }
}
exports.OllamaService = OllamaService;
//# sourceMappingURL=OllamaService.js.map