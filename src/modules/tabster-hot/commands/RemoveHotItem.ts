import { Command, Mutex, TreeNode } from "../../../core";
import { TabsterDataProvider, TTabsterTree } from "../../tabster";
import { TabsterHot } from "../classes/TabsterHot";
import { TABSTER_HOT_REMOVE_ITEM_COMMAND } from "../consts";

@Mutex(["execute"])
export class RemoveHotItem extends Command {
    constructor(
        private tabster: TabsterHot,
        private tabsterDataProvider: TabsterDataProvider,
    ) {
        super(TABSTER_HOT_REMOVE_ITEM_COMMAND);
    }

    async execute(tabsItem: TreeNode<TTabsterTree>) {
        if (tabsItem == null) {
            return;
        }

        await this.tabster.removeItem(tabsItem.id);
        this.tabsterDataProvider.treeViewRefresh();
    }
}
