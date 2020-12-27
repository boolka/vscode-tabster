import { commands, Disposable, TextEditor, window } from "vscode";
import { isEqualDocuments } from "../utils/assert";
import { Logger } from "../utils/Logger";
import { Command } from "./Command";

const logger = new Logger();

export class WorkbenchEditorIterator
    extends Disposable
    implements AsyncIterable<TextEditor> {
    private disposable: Disposable;
    private currentTextEditor?: TextEditor;

    static NEXT_SWITCH_TRIES_MAX = 50;

    private onDidChangeActiveTextEditor(textEditor?: TextEditor) {
        this.currentTextEditor = textEditor;
    }

    constructor() {
        super(() => this.dispose());

        this.disposable = window.onDidChangeActiveTextEditor(
            this.onDidChangeActiveTextEditor.bind(this),
        );
    }

    async switchNextEditor() {
        let i = 0;

        do {
            ++i;
            await commands.executeCommand(Command.NEXT_EDITOR);
        } while (
            this.currentTextEditor == null &&
            i < WorkbenchEditorIterator.NEXT_SWITCH_TRIES_MAX
        );

        return this.currentTextEditor;
    }

    async *[Symbol.asyncIterator]() {
        await commands.executeCommand<TextEditor>(Command.FIRST_EDITOR);
        let firstTextEditor =
            window.activeTextEditor || (await this.switchNextEditor());

        // No one editor is open
        if (firstTextEditor == null) {
            return;
        }

        this.currentTextEditor = firstTextEditor;

        do {
            logger.debug(
                `${
                    WorkbenchEditorIterator.name
                }#generator: document path: "${this.currentTextEditor.document.uri.toString(
                    true,
                )}"`,
            );

            yield this.currentTextEditor;

            await this.switchNextEditor();
        } while (
            this.currentTextEditor != null &&
            !isEqualDocuments(
                firstTextEditor.document,
                this.currentTextEditor.document,
            )
        );
    }

    dispose() {
        this.disposable.dispose();
    }
}
