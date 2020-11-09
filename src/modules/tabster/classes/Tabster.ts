import {
    Memento,
    TreeItemCollapsibleState,
    Uri,
    window,
    workspace,
} from "vscode";
import {
    getUriId,
    Tree,
    TreeNode,
    WorkspaceActiveDocuments,
} from "../../../core";
import { THotLabel } from "../../tabster-hot";
import { TTabsterTree, TTabsterTreeItem } from "../models";
import { TabsterTreeDocumentItem } from "../workspace/TabsterTreeDocumentItem";
import { TabsterTreeTabsItem } from "../workspace/TabsterTreeTabsItem";

export abstract class Tabster {
    public viewTree: TTabsterTree;

    constructor(
        private workspaceActiveDocuments: WorkspaceActiveDocuments,
        protected memento: Memento,
        private mementoKey: string,
        private saveTabsOrder: boolean,
    ) {}

    async saveView() {
        await this.memento.update(this.mementoKey, this.viewTree);
    }

    loadView() {
        const savedViewTree = this.memento.get<TTabsterTree>(this.mementoKey);
        const viewTree = new Tree(savedViewTree);

        // Rescue saved data
        viewTree.traverse((item: TreeNode<TTabsterTreeItem>) => {
            if (TabsterTreeDocumentItem.isInstance(item.data)) {
                item.data = new TabsterTreeDocumentItem(
                    item.data.docId,
                    item.data.label,
                );
            } else if (TabsterTreeTabsItem.isInstance(item.data)) {
                item.data = new TabsterTreeTabsItem(
                    item.data.label,
                    TreeItemCollapsibleState.Collapsed,
                );
            }
        });

        this.viewTree = viewTree;
    }

    async clearView() {
        this.viewTree = new Tree();
        await this.memento.update(this.mementoKey, null);
    }

    abstract async addTab(label?: THotLabel | string): Promise<void | string>;
    abstract async activateTab(key: THotLabel | string): Promise<boolean>;
    abstract async removeTab(key: string): Promise<void>;
    abstract async removeItem(key: string): Promise<void>;

    async getDocuments() {
        return await this.workspaceActiveDocuments.getDocuments();
    }

    private async showDocument(uri: Uri) {
        return new Promise<Uri>(async (resolve) => {
            const docId = getUriId(uri);
            let document;

            try {
                document = await workspace.openTextDocument(uri);

                if (document != null) {
                    try {
                        await window.showTextDocument(document, {
                            preserveFocus: true,
                            preview: false,
                        });
                    } catch (err) {}
                }

                resolve(uri);
            } catch (err) {
                const item = await window.showErrorMessage(
                    `${docId} is not available`,
                    "remove",
                );

                if (item === "remove") {
                    this.removeItem(docId);
                }

                resolve(uri);
            }
        });
    }

    async showDocuments(uris: Uri[]) {
        if (this.saveTabsOrder) {
            for (let i = 0; i < uris.length; ++i) {
                const uri = uris[i];

                await this.showDocument(uri);
            }
        } else {
            const promises: Array<Promise<Uri>> = uris.map<Promise<Uri>>(
                (uri) => this.showDocument(uri),
            );
            return Promise.all(promises);
        }
    }
}
