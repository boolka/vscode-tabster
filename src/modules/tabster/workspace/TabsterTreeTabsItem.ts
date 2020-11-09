import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { TabsterTreeViewContext } from "../../../core";
import { TabsterTreeDocumentItem } from "./TabsterTreeDocumentItem";

export class TabsterTreeTabsItem extends TreeItem {
    public tooltip?: string;

    static isInstance(data: unknown): data is TabsterTreeTabsItem {
        if (
            data != null &&
            typeof data === "object" &&
            (data as TabsterTreeDocumentItem).contextValue ===
                TabsterTreeViewContext.Tabs
        ) {
            return true;
        }

        return false;
    }

    constructor(
        public label: string,
        public collapsibleState?: TreeItemCollapsibleState,
    ) {
        super(label, collapsibleState);

        this.tooltip = label;
        this.contextValue = TabsterTreeViewContext.Tabs;
    }
}
