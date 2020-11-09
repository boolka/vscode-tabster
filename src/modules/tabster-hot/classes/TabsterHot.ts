import {
    commands,
    Memento,
    TextDocument,
    TreeItemCollapsibleState,
    Uri,
    window,
} from "vscode";
import {
    Command,
    ErrorBoundary,
    AsyncErrorBoundary,
    TabsterConfigActivateBehavior,
    WorkspaceActiveDocuments,
    getDocId,
    getDocLabel,
} from "../../../core";
import {
    ITabsterOptions,
    Tabster,
    TabsterTreeDocumentItem,
    TabsterTreeTabsItem,
} from "../../tabster";
import { TABSTER_HOT_REFRESH_TREE_VIEW_COMMAND } from "../consts";
import { THotLabel } from "../models";
import { getLabelSortOrder, isHotLabel } from "../utils";

@ErrorBoundary(["loadView", "sortLabels"])
@AsyncErrorBoundary([
    "saveView",
    "clearView",
    "getDocuments",
    "showDocuments",
    "addTab",
    "activateTab",
    "removeTab",
    "removeFile",
])
export class TabsterHot extends Tabster {
    protected readonly HOT_TABS_KEY = "HOT_TABS_KEY";

    public static readonly MEMENTO_KEY = "TabsterHot";
    public static readonly HOT_TABS_LABEL = "hot tabs";

    constructor(
        workspaceActiveDocuments: WorkspaceActiveDocuments,
        memento: Memento,
        private options: ITabsterOptions,
    ) {
        super(
            workspaceActiveDocuments,
            memento,
            TabsterHot.MEMENTO_KEY,
            options.saveTabsOrder,
        );
        this.loadView();
    }

    async addTab(label: THotLabel | string) {
        let nodeId;

        if (!isHotLabel(label)) {
            return;
        }

        const documents: TextDocument[] = await this.getDocuments();

        if (documents.length === 0) {
            this.viewTree.removeById(label);
        } else {
            const item = new TabsterTreeTabsItem(
                label,
                TreeItemCollapsibleState.Collapsed,
            );
            const node = this.viewTree.searchById(label);
            let parentNode;

            if (node != null) {
                parentNode = node;
                this.viewTree.updateById(node.id, item);
                this.viewTree.removeChildrensById(node.id);
            } else {
                parentNode = this.viewTree.add(item, {
                    customId: label,
                });
            }

            nodeId = parentNode.id;

            for (const document of documents) {
                const docId = getDocId(document);
                const label = getDocLabel(document);

                this.viewTree.add(new TabsterTreeDocumentItem(docId, label), {
                    customId: docId,
                    parentId: parentNode.id,
                });
            }
        }

        await this.saveView();

        return nodeId;
    }

    sortLabels() {
        if (this.viewTree.root.length === 0) {
            return;
        }

        this.viewTree.root.sort(
            (a, b) =>
                getLabelSortOrder(a.id as THotLabel) -
                getLabelSortOrder(b.id as THotLabel),
        );
    }

    async activateTab(key: THotLabel | string) {
        let uris: Uri[];

        const foundNode = this.viewTree.searchById(key);

        if (foundNode != null) {
            uris = foundNode.childrens.map((children) =>
                Uri.parse(children.data.docId),
            );
        }

        if (uris != null) {
            if (
                this.options.activateBehavior ===
                TabsterConfigActivateBehavior.Replace
            ) {
                await commands.executeCommand(Command.CLOSE_ALL_EDITORS);
            }

            await this.showDocuments(uris);
            await commands.executeCommand(Command.FIRST_EDITOR);
            commands.executeCommand(TABSTER_HOT_REFRESH_TREE_VIEW_COMMAND);
        }

        return false;
    }

    async removeTab(key: string) {
        await this.viewTree.removeById(key);
        await this.saveView();
    }

    async removeItem(key: string) {
        const node = this.viewTree.searchById(key);
        this.viewTree.removeById(key);

        if (node != null && node.parentId != null) {
            const parentNode = this.viewTree.searchById(node.parentId);

            if (parentNode != null && parentNode.childrens.length === 0) {
                this.viewTree.removeById(parentNode.id);
            }
        }

        await this.saveView();
    }
}
