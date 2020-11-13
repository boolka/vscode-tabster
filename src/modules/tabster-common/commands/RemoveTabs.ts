import { Command, Mutex, TreeNode } from "../../../core";
import { TabsterDataProvider, TabsterTreeDocumentItem } from "../../tabster";
import { TabsterCommon } from "../classes/TabsterCommon";
import { TABSTER_REMOVE_TABS_COMMAND } from "../consts";

@Mutex(["execute"])
export class RemoveTabs extends Command {
    constructor(
        private tabster: TabsterCommon,
        private tabsterDataProvider: TabsterDataProvider,
    ) {
        super(TABSTER_REMOVE_TABS_COMMAND);
    }

    async execute(tabsItem: TreeNode<TabsterTreeDocumentItem>) {
        if (tabsItem == null) {
            return;
        }

        await this.tabster.removeTab(tabsItem.id);
        this.tabsterDataProvider.treeViewRefresh();
    }
}
