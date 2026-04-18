import { OllamaService, ChatMessage } from './OllamaService';
import { ModelRouter } from './ModelRouter';
import { ToolExecutor, ToolCommand } from './ToolExecutor';
import * as vscode from 'vscode';

export class AgentLoop {
  private reasoningMessages: ChatMessage[] = [];
  private codingMessages: ChatMessage[] = [];

  constructor(
    private ollamaService: OllamaService,
    private modelRouter: ModelRouter,
    private toolExecutor: ToolExecutor
  ) {}

  public async run(task: string, logCallback: (msg: string) => void): Promise<void> {
    const reasoningModel = this.modelRouter.getReasoningModel();
    const codingModel = this.modelRouter.getCodingModel();

    if (!reasoningModel || !codingModel) {
      logCallback('Error: Models not fully selected in the UI.');
      return;
    }

    logCallback(`Starting AgentLoop w/ Reasoning: ${reasoningModel}, Coding: ${codingModel}`);

    this.reasoningMessages = [
      { role: 'system', content: `ROLE: PLANNING ENGINE\nTASK: Understand user request, break into structured steps, decide tools. DO NOT write code.\nOUTPUT FORMAT:\nGOAL: ...\nPLAN: ...\nTOOLS: ...\nNEXT STEP: ...` },
      { role: 'user', content: task }
    ];

    this.codingMessages = [
      { role: 'system', content: `ROLE: EXECUTION ENGINE\nYou implement steps from reasoning model.\nRULES: DO NOT plan, DO NOT explain, ONLY execute.\nOUTPUT FORMAT MUST BE VALID JSON: { "tool": "write_file", "path": "...", "content": "..." }` }
    ];

    let maxIters = 5;
    for (let i = 0; i < maxIters; i++) {
      logCallback(`\n--- Iteration ${i + 1}/${maxIters} ---`);
      
      // STEP 1 & 2: Reasoning Model
      logCallback('Thinking (Reasoning Model)...');
      let planJson = '';
      try {
        const plan = await this.ollamaService.sendMessage(reasoningModel, this.reasoningMessages);
        logCallback(`Plan Output:\n${plan}`);
        this.reasoningMessages.push({ role: 'assistant', content: plan });
      } catch (e: any) {
        logCallback(`Reasoning error: ${e.message}`);
        break;
      }

      // Extract the NEXT STEP from the plan, or just feed the plan to the coding model
      this.codingMessages.push({ role: 'user', content: `Execute the following plan: ${this.reasoningMessages[this.reasoningMessages.length - 1].content}` });

      // STEP 3: Coding Model
      logCallback('Generating Code (Coding Model)...');
      let toolExecutionRequest = '';
      try {
        toolExecutionRequest = await this.ollamaService.sendMessage(codingModel, this.codingMessages);
        logCallback(`Coding Output:\n${toolExecutionRequest}`);
        this.codingMessages.push({ role: 'assistant', content: toolExecutionRequest });
      } catch (e: any) {
         logCallback(`Coding error: ${e.message}`);
         break;
      }

      // Parse JSON from coding output (simple extraction)
      let parsedTool: ToolCommand | null = null;
      try {
        // try to find JSON block
        const match = toolExecutionRequest.match(/\{[\s\S]*\}/);
        if (match) {
           parsedTool = JSON.parse(match[0]);
        } else {
           // fallback parsing
           parsedTool = JSON.parse(toolExecutionRequest);
        }
      } catch (e) {
        logCallback(`Failed to parse tool JSON from coding output.`);
        // Stop condition or feed back error
        this.reasoningMessages.push({ role: 'user', content: 'The coding model failed to output valid JSON for tool execution. Please refine the instructions.' });
        continue;
      }

      // STEP 4 & 5: Execute Tool
      if (parsedTool) {
        logCallback(`Executing Tool: ${parsedTool.tool}...`);
        const result = await this.toolExecutor.execute(parsedTool);
        logCallback(`Tool Result:\n${result}`);
        
        // Feed result back
        this.reasoningMessages.push({ role: 'user', content: `Tool execution result: ${result}\nIf the task is complete, reply with "TASK_COMPLETE" as the NEXT STEP.` });
        
        // Stop condition string matching
        const lastReasoning = this.reasoningMessages[this.reasoningMessages.length - 1].content || '';
        if (lastReasoning.includes('TASK_COMPLETE')) {
           logCallback('Task finished by agent.');
           break;
        }
      }

      if (i === maxIters - 1) {
        logCallback('Max iterations reached.');
      }
    }
  }
}
