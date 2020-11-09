import {
    commands,
    Memento,
    TextDocument,
    TreeItemCollapsibleState,
    Uri,
    window,
    workspace,
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
import { TABSTER_REFRESH_TREE_VIEW_COMMAND } from "../consts";

@ErrorBoundary(["loadView"])
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
export class TabsterCommon extends Tabster {
    public static readonly MEMENTO_KEY = "TabsterCommon";

    constructor(
        workspaceActiveDocuments: WorkspaceActiveDocuments,
        memento: Memento,
        private options: ITabsterOptions,
    ) {
        super(
            workspaceActiveDocuments,
            memento,
            TabsterCommon.MEMENTO_KEY,
            options.saveTabsOrder,
        );
        this.loadView();
    }

    async addTab(label?: string) {
        const documents: TextDocument[] = await this.getDocuments();

        if (documents.length === 0) {
            return;
        }

        const item = new TabsterTreeTabsItem(
            label ?? `Set in ${new Date().toLocaleString()}`,
            TreeItemCollapsibleState.Collapsed,
        );
        const node = this.viewTree.add(item);

        for (const document of documents) {
            const docId = getDocId(document);
            const label = getDocLabel(document);

            this.viewTree.add(new TabsterTreeDocumentItem(docId, label), {
                customId: docId,
                parentId: node.id,
            });
        }

        await this.saveView();

        return node.id;
    }

    async activateTab(key: string) {
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
            commands.executeCommand(TABSTER_REFRESH_TREE_VIEW_COMMAND);
        }

        return false;
    }

    async removeTab(key: string) {
        this.viewTree.removeById(key);
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
