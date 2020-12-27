import {
    commands,
    Memento,
    TextEditor,
    TreeItemCollapsibleState,
} from "vscode";
import {
    Command,
    ErrorBoundary,
    AsyncErrorBoundary,
    TabsterConfigActivateBehavior,
    WorkspaceActiveEditors,
    getDocId,
    getDocLabel,
    Mutex,
} from "../../../core";
import {
    ITabsterOptions,
    Tabster,
    TabsterTreeDocumentItem,
    TabsterTreeTabsItem,
} from "../../tabster";
import { IDocumentInfo } from "../../tabster/models";
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
@Mutex(["addTab"])
export class TabsterCommon extends Tabster {
    public static readonly MEMENTO_KEY = "TabsterCommon";

    constructor(
        workspaceActiveDocuments: WorkspaceActiveEditors,
        memento: Memento,
        private options: ITabsterOptions,
    ) {
        super(
            workspaceActiveDocuments,
            memento,
            TabsterCommon.MEMENTO_KEY,
            options.saveTabsOrder,
            options.skipPinnedTabs,
        );
        this.loadView();
    }

    async addTab(label: string = `Group (${new Date().toLocaleString()})`) {
        const editors: TextEditor[] = await this.getEditors();
        let nodeId;

        if (editors.length === 0) {
            return;
        }

        const item = new TabsterTreeTabsItem(
            label,
            TreeItemCollapsibleState.Collapsed,
        );

        const node = this.viewTree.searchById(label);
        let resultingNode;

        if (node != null) {
            this.viewTree.updateById(node.id, item);
            this.viewTree.removeChildrensById(node.id);
            resultingNode = node;
        } else {
            resultingNode = this.viewTree.add(item, {
                customId: label,
            });
        }

        nodeId = resultingNode.id;

        for (const editor of editors) {
            const docId = getDocId(editor.document);
            const label = getDocLabel(editor.document);

            this.viewTree.add(
                new TabsterTreeDocumentItem(label, {
                    docId,
                    viewColumn: editor.viewColumn,
                }),
                {
                    customId: docId,
                    parentId: nodeId,
                },
            );
        }

        await this.saveView();

        return nodeId;
    }

    async activateTab(key: string) {
        let docsInfo: IDocumentInfo[];

        const foundNode = this.viewTree.searchById(key);

        if (foundNode != null) {
            docsInfo = foundNode.childrens.map(
                (children) => children.data.info,
            );
        }

        if (docsInfo != null) {
            if (
                this.options.activateBehavior ===
                TabsterConfigActivateBehavior.Replace
            ) {
                await commands.executeCommand(Command.CLOSE_ALL_EDITORS);
            }

            await this.showDocuments(docsInfo);
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
