import { TabsterTreeDocumentItem } from "./workspace/TabsterTreeDocumentItem";
import { TabsterTreeTabsItem } from "./workspace/TabsterTreeTabsItem";
import { Tree, TTabsterConfigActivateBehavior } from "../../core";

export type TTabsterTreeItem = Partial<
    TabsterTreeTabsItem & TabsterTreeDocumentItem
>;

export type TTabsterTree = Tree<TTabsterTreeItem>;

export interface ITabsterOptions {
    activateBehavior: TTabsterConfigActivateBehavior;
    saveTabsOrder: boolean;
}
