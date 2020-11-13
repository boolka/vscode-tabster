import { TextEditor, ViewColumn, window } from "vscode";
import { TabsterConfigFetchMethod } from "../consts";
import { TTabsterConfigFetchMethod } from "../models";
import { isEqualEditors } from "../utils/assert";
import { AsyncErrorBoundary } from "../utils/error";
import { Logger } from "../utils/Logger";
import { Singleton } from "../utils/Singleton";
import { WorkbenchEditorIterator } from "./WorkbenchEditorIterator";

const logger = new Logger();

@AsyncErrorBoundary(["init", "load", "getDocuments"])
export class WorkspaceActiveEditors extends Singleton {
    private editors: TextEditor[] = [];
    private fetchMethod: TTabsterConfigFetchMethod;

    constructor() {
        super(WorkspaceActiveEditors);
    }

    private indexOf(editor: TextEditor) {
        for (let i = 0; i < this.editors.length; ++i) {
            if (isEqualEditors(this.editors[i], editor)) {
                return i;
            }
        }

        return -1;
    }

    private async add(editor: TextEditor) {
        const indexOfDocument = this.indexOf(editor);

        if (indexOfDocument === -1) {
            this.editors.push(editor);
        }
    }

    private clear() {
        this.editors = [];
    }

    async init(fetchMethod: TTabsterConfigFetchMethod) {
        this.fetchMethod = fetchMethod;
    }

    async load() {
        const currentTextEditor = window.activeTextEditor;

        this.clear();

        for await (const editor of new WorkbenchEditorIterator()) {
            await this.add(editor);
        }

        if (currentTextEditor != null) {
            await window.showTextDocument(currentTextEditor.document, {
                preview: false,
            });
        }
    }

    public async getEditors() {
        switch (this.fetchMethod) {
            case TabsterConfigFetchMethod.Iteration:
            default: {
                await this.load();
                break;
            }
        }

        logger.debug(
            `${WorkspaceActiveEditors.name}#getEditors: ${this.editors.reduce(
                (acc, editor) =>
                    acc +
                    `\n${editor.document.uri.toString(true)}: viewColumn is ${
                        ViewColumn[editor.viewColumn]
                    }`,
                "",
            )}`,
        );

        return this.editors;
    }
}
