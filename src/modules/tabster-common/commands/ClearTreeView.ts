import { Command } from "../../../core";
import { TabsterDataProvider } from "../../tabster";
import { TabsterCommon } from "../classes/TabsterCommon";
import { TABSTER_CLEAR_TREE_VIEW_COMMAND } from "../consts";

export class ClearTreeView extends Command {
    constructor(
        private tabster: TabsterCommon,
        private tabsterDataProvider: TabsterDataProvider,
    ) {
        super(TABSTER_CLEAR_TREE_VIEW_COMMAND);
    }

    async execute() {
        await this.tabster.clearView();
        this.tabsterDataProvider.treeViewRefresh();
    }
}
