export class History<T> {
  private undoStack: T[] = [];
  private redoStack: T[] = [];

  constructor() {}

  push(state: T) {
    this.undoStack.push(state);
    this.redoStack = [];
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  undo(): T | undefined {
    if (!this.canUndo()) {
      return undefined;
    }

    const currentState = this.undoStack.pop();
    if (typeof currentState === "undefined") {
      throw new Error("Cannot undo, no more actions to undo.");
    }
    this.redoStack.push(currentState);
    return currentState;
  }

  redo(): T | undefined {
    if (!this.canRedo()) {
      return undefined;
    }

    const currentState = this.redoStack.pop();
    if (typeof currentState === "undefined") {
      throw new Error("Cannot redo, no more actions to redo.");
    }
    this.undoStack.push(currentState);
    return currentState;
  }
}
