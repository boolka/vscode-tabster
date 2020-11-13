import { TextDocument, TextEditor, Uri } from "vscode";

export function isEqualUris(uri1: Uri, uri2: Uri) {
    if (uri1.toString(true) !== uri2.toString(true)) {
        return false;
    }

    return true;
}

export function isEqualDocuments(doc1: TextDocument, doc2: TextDocument) {
    if (!isEqualUris(doc1.uri, doc2.uri)) {
        return false;
    }

    return true;
}

export function isEqualEditors(editor1: TextEditor, editor2: TextEditor) {
    if (
        !isEqualDocuments(editor1.document, editor2.document) ||
        editor1.viewColumn !== editor2.viewColumn
    ) {
        return false;
    }

    return true;
}
