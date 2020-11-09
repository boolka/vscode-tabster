import { ExtensionMode, OutputChannel } from "vscode";
import { Singleton } from "./Singleton";

type TChannelType = "default" | "debug";

interface IMsg {
    type: TChannelType;
    text: string;
}

export class Logger extends Singleton {
    private isInit: boolean = false;
    private queue: IMsg[] = [];
    private tabsterOutputChannel: OutputChannel;
    private extensionMode: ExtensionMode;

    constructor() {
        super(Logger);
    }

    private outputLine(msg: IMsg) {
        if (!this.isInit) {
            this.queue.push(msg);
        } else {
            if (this.queue.length !== 0) {
                this.queue.forEach((queuedMsg) => {
                    if (
                        queuedMsg.type === "debug" &&
                        this.extensionMode === ExtensionMode.Production
                    ) {
                        return;
                    }

                    if (queuedMsg.type === "debug") {
                        this.tabsterOutputChannel.append("(debug)");
                    }

                    this.tabsterOutputChannel.appendLine(queuedMsg.text);
                });

                this.queue = [];
            }

            this.tabsterOutputChannel.appendLine(msg.text);
        }
    }

    init(tabsterOutputChannel: OutputChannel, extensionMode: ExtensionMode) {
        this.tabsterOutputChannel = tabsterOutputChannel;
        this.extensionMode = extensionMode;
        this.isInit = true;
    }

    log(text: string) {
        this.outputLine({
            type: "default",
            text,
        });
    }

    debug(text: string) {
        this.outputLine({
            type: "debug",
            text,
        });
    }
}
