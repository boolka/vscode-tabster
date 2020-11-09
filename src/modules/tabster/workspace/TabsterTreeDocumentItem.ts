import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { TabsterTreeViewContext } from "../../../core";

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

    constructor(
        public docId: string,
        public label: string,
        public collapsibleState?: TreeItemCollapsibleState,
    ) {
        super(label, collapsibleState);

        this.tooltip = label;
        this.contextValue = TabsterTreeViewContext.Item;
    }
}
