import { TreeItem, TreeItemCollapsibleState, ViewColumn } from "vscode";
import * as path from "path";
import { platform } from "os";
import { TabsterTreeViewContext } from "../../../core";
import { TABSTER_OPEN_ITEM_COMMAND } from "../consts";
import { IDocumentInfo } from "../models";

export class TabsterTreeDocumentItem extends TreeItem {
    public tooltip?: string;

    static isInstance(data: unknown): data is TabsterTreeDocumentItem {
        if (
            data != null &&
            typeof data === "object" &&
            (data as TabsterTreeDocumentItem).contextValue ===
                TabsterTreeViewContext.Item
        ) {
            return true;
        }

        return false;
    }

    private getViewLocationDesc(viewColumn: ViewColumn) {
        switch (viewColumn) {
            case ViewColumn.Two: {
                return "Second column";
            }
            case ViewColumn.Three: {
                return "Third column";
            }
            case ViewColumn.Four: {
                return "Fourth column";
            }
            case ViewColumn.Five: {
                return "Fifth column";
            }
            case ViewColumn.Six: {
                return "Sixth column";
            }
            case ViewColumn.Seven: {
                return "Seventh column";
            }
            case ViewColumn.Eight: {
                return "Eighth column";
            }
            case ViewColumn.Nine: {
                return "Ninth column";
            }
            default: {
                return null;
            }
        }
    }

    constructor(
        public label: string,
        public info: IDocumentInfo,
        public collapsibleState?: TreeItemCollapsibleState,
    ) {
        super(label, collapsibleState);

        let shortLabel;

        if (platform() === "win32") {
            shortLabel = path.win32.basename(label);
        } else {
            shortLabel = path.basename(label);
        }

        const locationDesc = this.getViewLocationDesc(this.info.viewColumn);

        this.label = shortLabel;

        if (locationDesc != null) {
            this.tooltip = `${label} (${locationDesc})`;
            this.description = locationDesc;
        } else {
            this.tooltip = label;
        }

        this.contextValue = TabsterTreeViewContext.Item;
        this.collapsibleState = collapsibleState;

        this.command = {
            title: "open document",
            command: TABSTER_OPEN_ITEM_COMMAND,
            arguments: [this.info.docId],
        };
    }
}
