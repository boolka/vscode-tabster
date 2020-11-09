import { isDeepStrictEqual } from "util";

export interface TreeNode<NodeData = any> {
    id: string;
    create: number;
    parentId: string;
    data: NodeData;
    childrens: TreeNode<NodeData>[];
}

interface IAddOptions<NodeData = any> {
    parentData?: NodeData;
    customId?: string;
    parentId?: string;
}

interface ITraverseCallback<NodeData = any> {
    (data: TreeNode<NodeData>): Promise<void> | void;
}

export class Tree<NodeData = any> {
    public root: TreeNode<NodeData>[] = [];

    constructor(tree?: Tree<NodeData>) {
        if (tree != null) {
            this.root = tree.root;
        }
    }

    search(data: NodeData): TreeNode<NodeData> | null {
        for (let i = 0; i < this.root.length; ++i) {
            const node = this.root[i];
            const result = Tree.recursiveSearchByContent(node, data);

            if (result != null) {
                return result;
            }
        }

        return null;
    }

    searchById(id: string): TreeNode<NodeData> | null {
        for (let i = 0; i < this.root.length; ++i) {
            const node = this.root[i];
            const result = Tree.recursiveSearchById(node, id);

            if (result != null) {
                return result;
            }
        }

        return null;
    }

    add(
        data: NodeData,
        options: IAddOptions<NodeData> = {},
    ): TreeNode<NodeData> | null {
        const { customId, parentData, parentId } = options;
        const newNode = this.createNode(data, customId);

        if (parentData == null && parentId == null) {
            this.root.push(newNode);
        } else {
            let parentNode;

            if (parentId != null) {
                parentNode = this.searchById(parentId);
            } else if (parentData != null) {
                parentNode = this.search(parentData);
            }

            if (parentNode != null) {
                newNode.parentId = parentNode.id;
                parentNode.childrens.push(newNode);
            } else {
                return null;
            }
        }

        return newNode;
    }

    update(data: NodeData, newData: NodeData) {
        const foundNode = this.search(data);

        if (foundNode != null) {
            foundNode.data = newData;
        }
    }

    updateById(id: string, newData: NodeData) {
        const foundNode = this.searchById(id);

        if (foundNode != null) {
            foundNode.data = newData;
        }
    }

    remove(data: NodeData): TreeNode<NodeData> | null {
        const removedNode = this.search(data);

        return this.removeNode(removedNode);
    }

    removeById(id: string): TreeNode<NodeData> | null {
        const removedNode = this.searchById(id);

        return this.removeNode(removedNode);
    }

    removeChildrens(data: NodeData) {
        const node = this.search(data);

        if (node != null) {
            node.childrens = [];
        }
    }

    removeChildrensById(id: string) {
        const node = this.searchById(id);

        if (node != null) {
            node.childrens = [];
        }
    }

    traverse(callback: ITraverseCallback<NodeData>) {
        for (let i = 0; i < this.root.length; ++i) {
            const node = this.root[i];

            Tree.recursiveTraverse(node, callback);
        }
    }

    async asyncTraverse(callback: ITraverseCallback<NodeData>) {
        for (let i = 0; i < this.root.length; ++i) {
            const node = this.root[i];

            await Tree.asyncRecursiveTraverse(node, callback);
        }
    }

    traverseFrom(data: NodeData, callback: ITraverseCallback<NodeData>) {
        const node = this.search(data);

        if (node != null) {
            Tree.recursiveTraverse(this.search(data), callback);
        }
    }

    traverseFromId(id: string, callback: ITraverseCallback<NodeData>) {
        const node = this.searchById(id);

        if (node != null) {
            Tree.recursiveTraverse(this.searchById(id), callback);
        }
    }

    private createNode(data: NodeData, id?: string): TreeNode<NodeData> {
        return {
            id: id ?? Math.random().toString(36).slice(2),
            create: Date.now(),
            parentId: null,
            data,
            childrens: [],
        };
    }

    private removeNode(removedNode: TreeNode<NodeData>) {
        if (removedNode != null && removedNode.parentId != null) {
            const parentNode = this.searchById(removedNode.parentId);

            if (parentNode != null) {
                // Remove from parent
                const removedNodeIndex = parentNode.childrens.indexOf(
                    removedNode,
                );

                if (removedNodeIndex !== -1) {
                    return parentNode.childrens.splice(removedNodeIndex, 1)[0];
                }
            }
        } else {
            // Remove from root
            const removedNodeIndex = this.root.indexOf(removedNode);

            if (removedNodeIndex !== -1) {
                return this.root.splice(removedNodeIndex, 1)[0];
            }
        }

        // Not found
        return null;
    }

    static recursiveSearchById<NodeData>(
        node: TreeNode<NodeData>,
        id: string,
    ): TreeNode<NodeData> | null {
        if (node.id === id) {
            return node;
        }

        for (let i = 0; i < node.childrens.length; ++i) {
            const res = Tree.recursiveSearchById(node.childrens[i], id);

            if (res != null) {
                return res;
            }
        }

        return null;
    }

    static recursiveSearchByContent<NodeData>(
        node: TreeNode<NodeData>,
        data: NodeData,
    ): TreeNode<NodeData> | null {
        if (isDeepStrictEqual(node.data, data)) {
            return node;
        }

        for (let i = 0; i < node.childrens.length; ++i) {
            return Tree.recursiveSearchByContent(node.childrens[i], data);
        }

        return null;
    }

    static recursiveTraverse<NodeData>(
        node: TreeNode<NodeData>,
        callback: ITraverseCallback,
    ) {
        callback(node);

        for (let i = 0; i < node.childrens.length; ++i) {
            Tree.recursiveTraverse(node.childrens[i], callback);
        }
    }

    static async asyncRecursiveTraverse<NodeData>(
        node: TreeNode<NodeData>,
        callback: ITraverseCallback,
    ) {
        await callback(node);

        for (let i = 0; i < node.childrens.length; ++i) {
            await Tree.asyncRecursiveTraverse(node.childrens[i], callback);
        }
    }
}

export class TreeIterator<NodeData = any> {
    private index = 0;
    private items: TreeNode<NodeData>[] = [];

    constructor(tree: Tree<NodeData>, nodeId?: string) {
        let startNode: TreeNode<NodeData>;

        if (nodeId != null) {
            startNode = tree.searchById(nodeId);

            if (startNode == null) {
                throw new TypeError(`Wrong nodeId: ${nodeId}`);
            }

            Tree.recursiveTraverse<NodeData>(startNode, (node) => {
                this.items.push(node);
            });
        } else {
            for (let i = 0; i < tree.root.length; ++i) {
                Tree.recursiveTraverse<NodeData>(tree.root[i], (node) => {
                    this.items.push(node);
                });
            }
        }
    }

    isDone(): boolean {
        return this.index === this.items.length;
    }

    get hasNext() {
        return !this.isDone();
    }

    next(): IteratorResult<TreeNode<NodeData>> {
        const done = this.isDone();
        const value = this.items[this.index++];

        return {
            done,
            value,
        };
    }

    [Symbol.iterator]() {
        return this;
    }
}
