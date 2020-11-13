import {
    Memento,
    TreeItemCollapsibleState,
    Uri,
    ViewColumn,
    window,
    workspace,
} from "vscode";
import { Logger, Tree, TreeNode, WorkspaceActiveEditors } from "../../../core";
import { THotLabel } from "../../tabster-hot";
import { IDocumentInfo, TTabsterTree, TTabsterTreeItem } from "../models";
import { TabsterTreeDocumentItem } from "../workspace/TabsterTreeDocumentItem";
import { TabsterTreeTabsItem } from "../workspace/TabsterTreeTabsItem";

const logger = new Logger();

export abstract class Tabster {
    public viewTree: TTabsterTree;

    constructor(
        private workspaceActiveDocuments: WorkspaceActiveEditors,
        protected memento: Memento,
        private mementoKey: string,
        private saveTabsOrder: boolean,
    ) {}

    private sortByEditorGroups(docs: IDocumentInfo[]) {
        const res: IDocumentInfo[] = [];

        for (let i = 0; i < docs.length; ++i) {
            res.push(Object.assign({}, docs[i]));
        }

        res.sort((a, b) => a.viewColumn - b.viewColumn);

        return res;
    }

    async saveView() {
        await this.memento.update(this.mementoKey, this.viewTree);
    }

    loadView() {
        const savedViewTree = this.memento.get<TTabsterTree>(this.mementoKey);
        const viewTree = new Tree(savedViewTree);

        // Rescue saved data
        viewTree.traverse((item: TreeNode<TTabsterTreeItem>) => {
            if (TabsterTreeDocumentItem.isInstance(item.data)) {
                item.data = new TabsterTreeDocumentItem(item.data.label, {
                    docId: item.data.info.docId,
                    viewColumn: item.data.info.viewColumn,
                });
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

    async getEditors() {
        return await this.workspaceActiveDocuments.getEditors();
    }

    private async showDocument(doc: IDocumentInfo, showBeside: boolean) {
        return new Promise<Uri>(async (resolve) => {
            const docId = doc.docId;
            const uri = Uri.parse(docId);
            let document;

            try {
                document = await workspace.openTextDocument(uri);

                if (document != null) {
                    try {
                        await window.showTextDocument(document, {
                            preserveFocus: showBeside ? false : true,
                            viewColumn: showBeside
                                ? ViewColumn.Beside
                                : ViewColumn.Active,
                            preview: false,
                        });

                        logger.debug(
                            `Document ${docId}(viewColumn: ${
                                ViewColumn[doc.viewColumn]
                            }) is shown in ${
                                showBeside ? "beside" : "active"
                            } column`,
                        );
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

    async showDocuments(docs: IDocumentInfo[]) {
        const sortedDocs = this.sortByEditorGroups(docs);

        let prevViewColumn = ViewColumn.Active;

        for (let i = 0; i < sortedDocs.length; ++i) {
            const doc = sortedDocs[i];

            if (doc.viewColumn != null) {
                prevViewColumn = doc.viewColumn;
                break;
            }
        }

        if (this.saveTabsOrder) {
            for (let i = 0; i < sortedDocs.length; ++i) {
                const doc = sortedDocs[i];
                let showBeside = false;

                if (doc.viewColumn != null) {
                    showBeside = prevViewColumn !== doc.viewColumn;
                }

                await this.showDocument(doc, showBeside);

                if (doc.viewColumn != null) {
                    prevViewColumn = doc.viewColumn;
                }
            }
        } else {
            const promises: Array<Promise<Uri>> = sortedDocs.map<Promise<Uri>>(
                (doc) => {
                    const showBeside = prevViewColumn !== doc.viewColumn;
                    const docPromise = this.showDocument(doc, showBeside);

                    prevViewColumn = doc.viewColumn;

                    return docPromise;
                },
            );
            return Promise.all(promises);
        }
    }
}
