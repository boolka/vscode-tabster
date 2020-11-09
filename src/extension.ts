import { Disposable, ExtensionContext, workspace, window } from "vscode";
import {
    Logger,
    TABSTER_CONFIG_ACTIVATE_BEHAVIOR,
    TABSTER_CONFIG_NS,
    TABSTER_CONFIG_FETCH_METHOD,
    TABSTER_OUTPUT_CHANNEL,
    TTabsterConfigActivateBehavior,
    TTabsterConfigFetchMethod,
    WorkspaceActiveDocuments,
    TABSTER_CONFIG_SAVE_TABS_ORDER,
} from "./core";
import { TabsterDataProvider, WORKSPACE_ERR_MSG } from "./modules/tabster";
import {
    ActivateTabs,
    ClearTreeView,
    EditTabsLabel,
    RefreshTreeView,
    RemoveItem,
    RemoveTabs,
    SaveTabs,
    TabsterCommon,
} from "./modules/tabster-common";
import {
    ActivateHotTabs,
    ActivateHotTabsMenu,
    ClearHotTreeView,
    HOT_SET_LABELS,
    RefreshHotTreeView,
    RemoveHotItem,
    RemoveHotTabs,
    SaveHotTabs,
    TabsterHot,
    TABSTER_HOT_ACTIVATE_COMMANDS,
    TABSTER_HOT_SAVE_COMMANDS,
} from "./modules/tabster-hot";

let tabsterCommon: TabsterCommon;
let tabsterHot: TabsterHot;

export async function activate(context: ExtensionContext) {
    const disposes: Disposable[] = [];
    const { workspaceState, subscriptions, extensionMode } = context;

    if (workspace.workspaceFolders == null) {
        window.showErrorMessage(WORKSPACE_ERR_MSG);
        return;
    }

    const tabsterOutputChannel = window.createOutputChannel(
        TABSTER_OUTPUT_CHANNEL,
    );
    const logger = new Logger();
    logger.init(tabsterOutputChannel, extensionMode);

    const tabsterConfigs = workspace.getConfiguration(TABSTER_CONFIG_NS);
    const tabsterFetchMethodSetting = tabsterConfigs.get<
        TTabsterConfigFetchMethod
    >(TABSTER_CONFIG_FETCH_METHOD);
    const tabsterActivateBehavior = tabsterConfigs.get<
        TTabsterConfigActivateBehavior
    >(TABSTER_CONFIG_ACTIVATE_BEHAVIOR);
    const saveTabsOrder = tabsterConfigs.get<boolean>(
        TABSTER_CONFIG_SAVE_TABS_ORDER,
    );

    const onDidChangeConfigurationDispose = workspace.onDidChangeConfiguration(
        (section) => {
            if (section.affectsConfiguration(TABSTER_CONFIG_NS)) {
                const newTabsterFetchMethodSetting = tabsterConfigs.get<
                    TTabsterConfigFetchMethod
                >(TABSTER_CONFIG_FETCH_METHOD);

                workspaceActiveDocuments.init(newTabsterFetchMethodSetting);
            }
        },
    );
    disposes.push(onDidChangeConfigurationDispose);

    const workspaceActiveDocuments = new WorkspaceActiveDocuments();

    workspaceActiveDocuments.init(tabsterFetchMethodSetting);

    tabsterCommon = new TabsterCommon(
        workspaceActiveDocuments,
        workspaceState,
        {
            activateBehavior: tabsterActivateBehavior,
            saveTabsOrder,
        },
    );
    tabsterHot = new TabsterHot(workspaceActiveDocuments, workspaceState, {
        activateBehavior: tabsterActivateBehavior,
        saveTabsOrder,
    });
    const tabsterCommonDataProvider = new TabsterDataProvider(tabsterCommon);
    const tabsterHotDataProvider = new TabsterDataProvider(tabsterHot);

    // Common tabs
    const commonTabsProviderDisposable = window.registerTreeDataProvider(
        "tabster",
        tabsterCommonDataProvider,
    );
    disposes.push(commonTabsProviderDisposable);

    // Hot tabs
    const hotTabsProviderDisposable = window.registerTreeDataProvider(
        "tabsterHot",
        tabsterHotDataProvider,
    );
    disposes.push(hotTabsProviderDisposable);

    const refreshTreeView = new RefreshTreeView(
        tabsterCommon,
        tabsterCommonDataProvider,
    );
    const refreshHotTreeView = new RefreshHotTreeView(
        tabsterHot,
        tabsterHotDataProvider,
    );

    const clearTreeView = new ClearTreeView(
        tabsterCommon,
        tabsterCommonDataProvider,
    );
    const clearHotTreeView = new ClearHotTreeView(
        tabsterHot,
        tabsterHotDataProvider,
    );
    const editTabsLabel = new EditTabsLabel(
        tabsterCommon,
        tabsterCommonDataProvider,
    );
    const removeTabs = new RemoveTabs(tabsterCommon, tabsterCommonDataProvider);
    const removeFile = new RemoveItem(tabsterCommon, tabsterCommonDataProvider);
    const removeHotTabs = new RemoveHotTabs(tabsterHot, tabsterHotDataProvider);
    const removeHotFile = new RemoveHotItem(tabsterHot, tabsterHotDataProvider);
    const saveTabs = new SaveTabs(tabsterCommon, tabsterCommonDataProvider);
    const activateTabs = new ActivateTabs(
        tabsterCommon,
        tabsterCommonDataProvider,
    );
    const activateHotTabsMenu = new ActivateHotTabsMenu(
        tabsterHot,
        tabsterHotDataProvider,
    );

    for (let i = 0; i < 10; ++i) {
        const saveCommand = TABSTER_HOT_SAVE_COMMANDS[i];
        const activeCommand = TABSTER_HOT_ACTIVATE_COMMANDS[i];
        const label = HOT_SET_LABELS[i];

        const saveHotTabs = new SaveHotTabs(
            tabsterHot,
            tabsterHotDataProvider,
            saveCommand,
            label,
        );

        const activateHotTabs = new ActivateHotTabs(
            tabsterHot,
            tabsterHotDataProvider,
            activeCommand,
            label,
        );

        disposes.push(saveHotTabs);
        disposes.push(activateHotTabs);
    }

    await refreshTreeView.execute();
    await refreshHotTreeView.execute();

    disposes.push(refreshTreeView);
    disposes.push(refreshHotTreeView);
    disposes.push(clearTreeView);
    disposes.push(clearHotTreeView);
    disposes.push(editTabsLabel);
    disposes.push(removeTabs);
    disposes.push(removeFile);
    disposes.push(removeHotTabs);
    disposes.push(removeHotFile);
    disposes.push(saveTabs);
    disposes.push(activateTabs);
    disposes.push(activateHotTabsMenu);

    disposes.forEach((disposable) => subscriptions.push(disposable));
}

export async function deactivate() {}
