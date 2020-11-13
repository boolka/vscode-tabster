import { ProgressLocation, window } from "vscode";
import { Command, Mutex, TreeNode } from "../../../core";
import {
    LOADING_MSG,
    TabsterDataProvider,
    TTabsterTreeItem,
} from "../../tabster";
import { TabsterHot } from "../classes/TabsterHot";
import { TABSTER_HOT_ACTIVATE_COMMAND } from "../consts";

@Mutex(["execute"])
export class ActivateHotTabsMenu extends Command {
    constructor(
        private tabster: TabsterHot,
        private tabsterDataProvider: TabsterDataProvider,
    ) {
        super(TABSTER_HOT_ACTIVATE_COMMAND);
    }

    async execute(tabsItem: TreeNode<TTabsterTreeItem>) {
        if (tabsItem == null) {
            return;
        }

        await window.withProgress(
            {
                location: ProgressLocation.Notification,
                cancellable: false,
                title: LOADING_MSG,
            },
            async () => {
                await this.tabster.activateTab(tabsItem.id);
                this.tabsterDataProvider.treeViewRefresh();
            },
        );
    }
}
