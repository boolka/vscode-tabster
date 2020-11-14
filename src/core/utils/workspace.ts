import { TextDocument, Uri, workspace } from "vscode";
import * as path from "path";
import { platform } from "os";

export function getDocId(document: TextDocument) {
    return getUriId(document.uri);
}

export function getUriId(uri: Uri) {
    return uri.toString(true);
}

export function getDocLabel(document: TextDocument) {
    if (document.uri.scheme === "file") {
        for (let i = 0; i < workspace.workspaceFolders.length; ++i) {
            const workspacePath = workspace.workspaceFolders[i].uri.fsPath;

            let fileName;
            let dirPath;

            if (platform() === "win32") {
                fileName = path.win32.normalize(document.uri.fsPath);
                dirPath = path.win32.normalize(workspacePath);
            } else {
                fileName = path.normalize(document.uri.fsPath);
                dirPath = path.normalize(workspacePath);
            }

            if (fileName.startsWith(dirPath)) {
                return fileName.slice(dirPath.length + 1);
            }
        }
    }

    return document.uri.path;
}
