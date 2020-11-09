import { ProgressLocation, window } from "vscode";
import { Command } from "../../../core";
import { SAVING_MSG, TabsterDataProvider } from "../../tabster";
import { TabsterCommon } from "../classes/TabsterCommon";
import { TABSTER_SAVE_COMMAND } from "../consts";

export class SaveTabs extends Command {
    constructor(
        private tabster: TabsterCommon,
        private tabsterDataProvider: TabsterDataProvider,
    ) {
        super(TABSTER_SAVE_COMMAND);
    }

    async execute() {
        let label = await window.showInputBox();

        if (label === "") {
            label = undefined;
        }

        await window.withProgress(
            {
                location: ProgressLocation.Notification,
                cancellable: false,
                title: SAVING_MSG,
            },
            async () => {
                await this.tabster.addTab(label);
                this.tabsterDataProvider.treeViewRefresh();
            },
        );
    }
}
