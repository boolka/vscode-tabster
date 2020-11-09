import { TextDocument, window } from "vscode";
import { TabsterConfigFetchMethod } from "../consts";
import { TTabsterConfigFetchMethod } from "../models";
import { isEqualDocuments } from "../utils/assert";
import { AsyncErrorBoundary } from "../utils/error";
import { Logger } from "../utils/Logger";
import { Singleton } from "../utils/Singleton";
import { WorkbenchEditorIterator } from "./WorkbenchEditorIterator";

const logger = new Logger();

@AsyncErrorBoundary(["init", "load", "getDocuments"])
export class WorkspaceActiveDocuments extends Singleton {
    private documents: TextDocument[] = [];
    private fetchMethod: TTabsterConfigFetchMethod;

    constructor() {
        super(WorkspaceActiveDocuments);
    }

    private indexOf(document: TextDocument) {
        for (let i = 0; i < this.documents.length; ++i) {
            if (isEqualDocuments(this.documents[i], document)) {
                return i;
            }
        }

        return -1;
    }

    private async add(document: TextDocument) {
        const indexOfDocument = this.indexOf(document);

        if (indexOfDocument === -1) {
            this.documents.push(document);
        }
    }

    private clear() {
        this.documents = [];
    }

    async init(fetchMethod: TTabsterConfigFetchMethod) {
        this.fetchMethod = fetchMethod;
    }

    async load() {
        const currentTextEditor = window.activeTextEditor;

        this.clear();

        for await (const editor of new WorkbenchEditorIterator()) {
            await this.add(editor.document);
        }

        if (currentTextEditor != null) {
            await window.showTextDocument(currentTextEditor.document, {
                preview: false,
            });
        }
    }

    public async getDocuments() {
        switch (this.fetchMethod) {
            case TabsterConfigFetchMethod.Iteration:
            default: {
                await this.load();
                break;
            }
        }

        logger.debug(
            `${
                WorkspaceActiveDocuments.name
            }#getDocuments: ${this.documents.reduce(
                (acc, doc) => acc + `\n${doc.uri.toString(true)}`,
                "",
            )}`,
        );

        return this.documents;
    }
}
