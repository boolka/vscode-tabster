import { TreeItemCollapsibleState, window } from "vscode";
import { Command, TreeNode } from "../../../core";
import { TabsterDataProvider, TabsterTreeTabsItem } from "../../tabster";
import { TabsterCommon } from "../classes/TabsterCommon";
import { TABSTER_EDIT_TABS_LABEL_COMMAND } from "../consts";

export class EditTabsLabel extends Command {
    constructor(
        private tabster: TabsterCommon,
        private tabsterDataProvider: TabsterDataProvider,
    ) {
        super(TABSTER_EDIT_TABS_LABEL_COMMAND);
    }

    async execute(tabsItem: TreeNode<TabsterTreeTabsItem>) {
        let label = await window.showInputBox();

        if (label === "") {
            label = undefined;
        }

        tabsItem.data = new TabsterTreeTabsItem(
            label ?? `Set in ${new Date().toLocaleString()}`,
            TreeItemCollapsibleState.Collapsed,
        );

        await this.tabster.saveView();
        this.tabsterDataProvider.treeViewRefresh();
    }
}
