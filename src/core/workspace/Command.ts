import { Disposable, commands } from "vscode";

export abstract class Command extends Disposable {
    private disposable: Disposable;

    static CLOSE_ALL_EDITORS = "workbench.action.closeAllEditors";
    static NEXT_EDITOR = "workbench.action.nextEditor";
    static FIRST_EDITOR = "workbench.action.firstEditorInGroup";

    constructor(command: string) {
        super(() => this.dispose());
        this.disposable = commands.registerCommand(command, this.execute, this);
    }

    dispose() {
        this.disposable != null && this.disposable.dispose();
    }

    abstract async execute(...args: any[]): Promise<any>;
}
