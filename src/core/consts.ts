export const TABSTER_ERROR_PREFIX = "Tabster error!";
export const TABSTER_OUTPUT_CHANNEL = "Tabster";
export const TABSTER_CONFIG_NS = "tabster";
export const TABSTER_CONFIG_FETCH_METHOD = "fetchMethod";
export const TABSTER_CONFIG_ACTIVATE_BEHAVIOR = "activateBehavior";
export const TABSTER_CONFIG_SAVE_TABS_ORDER = "saveTabsOrder";

export enum TabsterView {
    Common = 1,
    Hot = 2,
}

export enum TabsterTreeViewContext {
    Tabs = "tabs",
    Item = "item",
}

export enum TabsterConfigFetchMethod {
    Iteration = "iteration",
}

export enum TabsterConfigActivateBehavior {
    Append = "append",
    Replace = "replace",
}
