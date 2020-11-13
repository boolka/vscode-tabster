import { ProgressLocation, window } from "vscode";
import { TreeNode, Command, Mutex } from "../../../core";
import { TabsterCommon } from "../classes/TabsterCommon";
import { TABSTER_ACTIVATE_COMMAND } from "../consts";
import {
    TTabsterTreeItem,
    TabsterDataProvider,
    LOADING_MSG,
} from "../../tabster";

@Mutex(["execute"])
export class ActivateTabs extends Command {
    constructor(
        private tabster: TabsterCommon,
        private tabsterDataProvider: TabsterDataProvider,
    ) {
        super(TABSTER_ACTIVATE_COMMAND);
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
