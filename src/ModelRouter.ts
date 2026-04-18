export class ModelRouter {
  private reasoningModel: string = '';
  private codingModel: string = '';

  public setReasoningModel(model: string) {
    this.reasoningModel = model;
  }

  public getReasoningModel(): string {
    return this.reasoningModel;
  }

  public setCodingModel(model: string) {
    this.codingModel = model;
  }

  public getCodingModel(): string {
    return this.codingModel;
  }
}
