import {
    commands,
    Memento,
    TextDocument,
    TextEditor,
    TreeItemCollapsibleState,
    Uri,
} from "vscode";
import {
    Command,
    ErrorBoundary,
    AsyncErrorBoundary,
    TabsterConfigActivateBehavior,
    WorkspaceActiveEditors,
    getDocId,
    getDocLabel,
} from "../../../core";
import {
    ITabsterOptions,
    Tabster,
    TabsterTreeDocumentItem,
    TabsterTreeTabsItem,
} from "../../tabster";
import { IDocumentInfo } from "../../tabster/models";
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
        workspaceActiveDocuments: WorkspaceActiveEditors,
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

        const editors: TextEditor[] = await this.getEditors();

        if (editors.length === 0) {
            this.viewTree.removeById(label);
        } else {
            const item = new TabsterTreeTabsItem(
                label,
                TreeItemCollapsibleState.Collapsed,
            );
            const node = this.viewTree.searchById(label);
            let resultingNode;

            if (node != null) {
                resultingNode = node;
                this.viewTree.updateById(node.id, item);
                this.viewTree.removeChildrensById(node.id);
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
                        parentId: resultingNode.id,
                    },
                );
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
