import { Uri, ViewColumn, window, workspace } from "vscode";
import { Command, Logger, Mutex } from "../../../core";
import { TABSTER_OPEN_ITEM_COMMAND } from "../consts";

const logger = new Logger();

@Mutex(["execute"])
export class OpenItem extends Command {
    constructor() {
        super(TABSTER_OPEN_ITEM_COMMAND);
    }

    async execute(docId: string) {
        if (docId == null) {
            return;
        }

        const uri = Uri.parse(docId);

        try {
            const document = await workspace.openTextDocument(uri);

            if (document != null) {
                try {
                    await window.showTextDocument(document, {
                        preserveFocus: false,
                        viewColumn: ViewColumn.Active,
                        preview: false,
                    });

                    logger.debug(`Document ${docId} is shown in active column`);
                } catch (err) {}
            }
        } catch (err) {
            window.showWarningMessage(`Document ${docId} is not available`);
        }
    }
}
