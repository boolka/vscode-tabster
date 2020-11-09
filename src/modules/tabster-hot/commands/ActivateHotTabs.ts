import { ProgressLocation, window } from "vscode";
import { Command } from "../../../core";
import { THotLabel, THotSaveCommand } from "../models";
import { TabsterDataProvider } from "../../tabster/workspace/TabsterDataProvider";
import { TabsterHot } from "../classes/TabsterHot";
import { LOADING_MSG } from "../../tabster";

export class ActivateHotTabs extends Command {
    constructor(
        private tabster: TabsterHot,
        private tabsterDataProvider: TabsterDataProvider,
        hotActiveCommand: THotSaveCommand,
        private hotSetLabel: THotLabel,
    ) {
        super(hotActiveCommand);
    }

    async execute() {
        await window.withProgress(
            {
                location: ProgressLocation.Notification,
                cancellable: false,
                title: LOADING_MSG,
            },
            async () => {
                await this.tabster.activateTab(this.hotSetLabel);
                this.tabsterDataProvider.treeViewRefresh();
            },
        );
    }
}
