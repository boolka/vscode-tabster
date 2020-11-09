import { Command } from "../../../core";
import { TabsterDataProvider } from "../../tabster";
import { TabsterCommon } from "../classes/TabsterCommon";
import { TABSTER_REFRESH_TREE_VIEW_COMMAND } from "../consts";

export class RefreshTreeView extends Command {
    constructor(
        private tabster: TabsterCommon,
        private tabsterDataProvider: TabsterDataProvider,
    ) {
        super(TABSTER_REFRESH_TREE_VIEW_COMMAND);
    }

    async execute() {
        this.tabsterDataProvider.treeViewRefresh();
    }
}
