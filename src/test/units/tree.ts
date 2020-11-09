import * as assert from "assert";
import { Tree, TreeIterator } from "../../core/utils/Tree";

interface IData {
    data: string;
}

const data1 = {
    data: "data1",
};

const data2 = {
    data: "data2",
};

const data1_1 = {
    data: "data1_1",
};

const data1_1_1 = {
    data: "data1_1_1",
};

const data_custom = {
    data: "custom",
};

describe("Tree structure", () => {
    const checkList = [data1, data2, data1_1, data1_1_1];

    it("Adds, updates, searches and remove nodes", () => {
        const tree = new Tree<IData>();

        assert.notStrictEqual(tree, null);

        const node1_id = tree.add(data1).id;
        tree.add(data_custom, { customId: "custom_id" });
        tree.add(data2);

        const node1_1_id = tree.add(data1_1, { parentId: node1_id }).id;
        const node1_1_1_id = tree.add(data1_1_1, { parentId: node1_1_id }).id;

        let found_node_1 = tree.searchById(node1_id);
        let found_node_1_1 = tree.searchById(node1_1_id);
        let found_node_1_1_1 = tree.searchById(node1_1_1_id);

        assert.deepStrictEqual(found_node_1.data, data1);
        assert.deepStrictEqual(found_node_1_1.data, data1_1);
        assert.deepStrictEqual(found_node_1_1_1.data, data1_1_1);

        found_node_1 = tree.search(data1);
        found_node_1_1 = tree.search(data1_1);
        found_node_1_1_1 = tree.search(data1_1_1);

        assert.deepStrictEqual(found_node_1.data, data1);
        assert.deepStrictEqual(found_node_1_1.data, data1_1);
        assert.deepStrictEqual(found_node_1_1_1.data, data1_1_1);

        tree.updateById(node1_1_1_id, {
            data: "updated data 1_1_1",
        });
        tree.update(data1_1, {
            data: "updated data 1_1",
        });

        assert.strictEqual(
            tree.searchById(node1_1_1_id).data.data,
            "updated data 1_1_1",
        );
        assert.strictEqual(tree.search(data1_1), null);
        assert.strictEqual(
            tree.search({
                data: "updated data 1_1",
            }).data.data,
            "updated data 1_1",
        );

        tree.removeById(node1_1_1_id);

        assert.strictEqual(tree.searchById(node1_1_1_id), null);

        tree.remove(data1_1);

        assert.strictEqual(tree.search(data1_1), null);
    });

    it("Traverses tree structure", () => {
        const tree = new Tree<IData>();

        const node1_id = tree.add(data1).id;
        tree.add(data2);
        const node1_1_id = tree.add(data1_1, { parentId: node1_id }).id;
        tree.add(data1_1_1, { parentId: node1_1_id });

        let a = 0;

        tree.traverse((node) => {
            ++a;
            assert.ok(checkList.includes(node.data));
        });

        assert.strictEqual(a, 4);

        let b = 0;

        tree.traverseFromId(node1_1_id, (node) => {
            ++b;
            assert.ok(checkList.includes(node.data));
        });

        assert.strictEqual(b, 2);
    });

    it("Iterate over tree", () => {
        const tree = new Tree<IData>();

        const node1_id = tree.add(data1).id;
        tree.add(data2);
        const node1_1_id = tree.add(data1_1, { parentId: node1_id }).id;
        tree.add(data1_1_1, { parentId: node1_1_id });

        const treeIter = new TreeIterator<IData>(tree);

        let a = 0;

        for (const node of treeIter) {
            ++a;
            assert.ok(checkList.includes(node.data));
        }

        assert.strictEqual(a, 4);
    });

    it("Rescues tree", () => {
        const tree = new Tree<IData>();

        const node1_id = tree.add(data1).id;
        tree.add(data2);
        const node1_1_id = tree.add(data1_1, { parentId: node1_id }).id;
        tree.add(data1_1_1, { parentId: node1_1_id });

        const rescuedTree = new Tree<IData>(JSON.parse(JSON.stringify(tree)));
        const treeIter = new TreeIterator<IData>(rescuedTree);

        let a = 0;

        for (const node of treeIter) {
            ++a;

            assert.ok(
                checkList.filter((checkItem) => {
                    return (
                        JSON.stringify(checkItem) === JSON.stringify(node.data)
                    );
                }).length !== 0,
            );
        }

        assert.strictEqual(a, 4);
    });
});
