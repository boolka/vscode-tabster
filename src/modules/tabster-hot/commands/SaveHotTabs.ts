import { ProgressLocation, window } from "vscode";
import { Command, Mutex } from "../../../core";
import { SAVING_MSG, TabsterDataProvider } from "../../tabster";
import { TabsterHot } from "../classes/TabsterHot";
import { THotLabel } from "../models";

@Mutex(["execute"])
export class SaveHotTabs extends Command {
    constructor(
        private tabster: TabsterHot,
        private tabsterHotDataProvider: TabsterDataProvider,
        hotSaveCommand: string,
        private hotSetLabel: THotLabel,
    ) {
        super(hotSaveCommand);
    }

    async execute() {
        await window.withProgress(
            {
                location: ProgressLocation.Notification,
                cancellable: false,
                title: SAVING_MSG,
            },
            async () => {
                await this.tabster.addTab(this.hotSetLabel);
                this.tabster.sortLabels();
                this.tabsterHotDataProvider.treeViewRefresh();
            },
        );
    }
}
