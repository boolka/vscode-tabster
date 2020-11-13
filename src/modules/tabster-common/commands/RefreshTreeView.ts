import { Command, Mutex } from "../../../core";
import { TabsterDataProvider } from "../../tabster";
import { TabsterCommon } from "../classes/TabsterCommon";
import { TABSTER_REFRESH_TREE_VIEW_COMMAND } from "../consts";

@Mutex(["execute"])
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
