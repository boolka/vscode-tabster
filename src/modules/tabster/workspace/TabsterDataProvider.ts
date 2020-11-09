import { TreeDataProvider, EventEmitter } from "vscode";
import { TreeNode } from "../../../core";
import { Tabster } from "../classes/Tabster";
import { TTabsterTreeItem } from "../models";

export class TabsterDataProvider
    implements TreeDataProvider<TreeNode<TTabsterTreeItem>> {
    private treeViewUpdateEventEmitter = new EventEmitter<void>();

    constructor(private tabster: Tabster) {}

    getTreeItem(element: TreeNode<TTabsterTreeItem>) {
        return element.data;
    }

    getChildren(element?: TreeNode<TTabsterTreeItem>) {
        if (element == null) {
            return this.tabster.viewTree.root;
        }

        return element.childrens;
    }

    get onDidChangeTreeData() {
        return this.treeViewUpdateEventEmitter.event;
    }

    treeViewRefresh() {
        this.treeViewUpdateEventEmitter.fire(null);
    }
}
