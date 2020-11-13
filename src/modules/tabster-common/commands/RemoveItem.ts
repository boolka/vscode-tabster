import { Command, Mutex, TreeNode } from "../../../core";
import { TabsterDataProvider, TabsterTreeDocumentItem } from "../../tabster";
import { TabsterCommon } from "../classes/TabsterCommon";
import { TABSTER_REMOVE_ITEM_COMMAND } from "../consts";

@Mutex(["execute"])
export class RemoveItem extends Command {
    constructor(
        private tabster: TabsterCommon,
        private tabsterDataProvider: TabsterDataProvider,
    ) {
        super(TABSTER_REMOVE_ITEM_COMMAND);
    }

    async execute(tabsItem: TreeNode<TabsterTreeDocumentItem>) {
        if (tabsItem == null) {
            return;
        }

        await this.tabster.removeItem(tabsItem.id);
        this.tabsterDataProvider.treeViewRefresh();
    }
}
