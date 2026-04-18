"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRouter = void 0;
class ModelRouter {
    reasoningModel = '';
    codingModel = '';
    setReasoningModel(model) {
        this.reasoningModel = model;
    }
    getReasoningModel() {
        return this.reasoningModel;
    }
    setCodingModel(model) {
        this.codingModel = model;
    }
    getCodingModel() {
        return this.codingModel;
    }
}
exports.ModelRouter = ModelRouter;
//# sourceMappingURL=ModelRouter.js.map