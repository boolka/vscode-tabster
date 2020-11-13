import { Command, Mutex } from "../../../core";
import { TabsterDataProvider } from "../../tabster";
import { TabsterHot } from "../classes/TabsterHot";
import { TABSTER_HOT_REFRESH_TREE_VIEW_COMMAND } from "../consts";

@Mutex(["execute"])
export class RefreshHotTreeView extends Command {
    constructor(
        private tabster: TabsterHot,
        private tabsterDataProvider: TabsterDataProvider,
    ) {
        super(TABSTER_HOT_REFRESH_TREE_VIEW_COMMAND);
    }

    async execute() {
        this.tabster.sortLabels();
        this.tabsterDataProvider.treeViewRefresh();
    }
}
