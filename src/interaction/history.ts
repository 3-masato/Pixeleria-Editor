export class History<T> {
  private undoStack: T[] = [];
  private redoStack: T[] = [];

  constructor() {}

  push(state: T) {
    this.undoStack.push(state);
    this.redoStack = [];
  }

  canUndo(): boolean {
    return this.undoStack.length > 1;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  undo(): T | undefined {
    if (!this.canUndo()) {
      return undefined;
    }

    const previousState = this.undoStack.at(-2);
    const currentState = this.undoStack.pop();
    if (typeof currentState === "undefined" || typeof previousState === "undefined") {
      throw new Error("Cannot undo, no more actions to undo.");
    }
    this.redoStack.push(currentState);
    return previousState;
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
