import { Command, Mutex, TreeNode } from "../../../core";
import { TabsterDataProvider, TTabsterTree } from "../../tabster";
import { TabsterHot } from "../classes/TabsterHot";
import { TABSTER_HOT_REMOVE_TABS_COMMAND } from "../consts";

@Mutex(["execute"])
export class RemoveHotTabs extends Command {
    constructor(
        private tabster: TabsterHot,
        private tabsterDataProvider: TabsterDataProvider,
    ) {
        super(TABSTER_HOT_REMOVE_TABS_COMMAND);
    }

    async execute(tabsItem: TreeNode<TTabsterTree>) {
        if (tabsItem == null) {
            return;
        }

        await this.tabster.removeTab(tabsItem.id);
        this.tabsterDataProvider.treeViewRefresh();
    }
}
