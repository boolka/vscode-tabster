import { Command, TreeNode } from "../../../core";
import { TabsterDataProvider, TabsterTreeDocumentItem } from "../../tabster";
import { TabsterCommon } from "../classes/TabsterCommon";
import { TABSTER_REMOVE_TABS_COMMAND } from "../consts";

export class RemoveTabs extends Command {
    constructor(
        private tabster: TabsterCommon,
        private tabsterDataProvider: TabsterDataProvider,
    ) {
        super(TABSTER_REMOVE_TABS_COMMAND);
    }

    async execute(tabsItem: TreeNode<TabsterTreeDocumentItem>) {
        await this.tabster.removeTab(tabsItem.id);
        this.tabsterDataProvider.treeViewRefresh();
    }
}
