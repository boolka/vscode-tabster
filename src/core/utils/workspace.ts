import { TextDocument, Uri, workspace } from "vscode";

export function getDocId(document: TextDocument) {
    return getUriId(document.uri);
}

export function getUriId(uri: Uri) {
    return uri.toString(true);
}

export function getDocLabel(document: TextDocument) {
    if (document.uri.scheme === "file") {
        for (let i = 0; i < workspace.workspaceFolders.length; ++i) {
            const workspaceFolder = workspace.workspaceFolders[i];
            const workspacePath = workspaceFolder.uri.path;

            if (document.fileName.startsWith(workspacePath)) {
                return document.fileName.slice(workspacePath.length + 1);
            }
        }
    } else {
        return `${document.uri.scheme}:${document.fileName}`;
    }

    return null;
}
