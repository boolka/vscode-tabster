import { Command } from "../../../core";
import { TabsterDataProvider } from "../../tabster";
import { TabsterHot } from "../classes/TabsterHot";
import { TABSTER_HOT_CLEAR_TREE_VIEW_COMMAND } from "../consts";

export class ClearHotTreeView extends Command {
    constructor(
        private tabster: TabsterHot,
        private tabsterDataProvider: TabsterDataProvider,
    ) {
        super(TABSTER_HOT_CLEAR_TREE_VIEW_COMMAND);
    }

    async execute() {
        await this.tabster.clearView();
        this.tabsterDataProvider.treeViewRefresh();
    }
}
