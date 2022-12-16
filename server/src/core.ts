import {
  Connection,
  DocumentFormattingParams,
  TextDocuments,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { lint } from "./lint";
import { format } from "./format";

export interface Context {
  settings: Settings;
  documents?: TextDocuments<TextDocument>;
  connection?: Connection;
}

export interface Settings {
  lintOnSave: boolean;
}

export const defaultSettings: Settings = { lintOnSave: false };

export const context: Context = {
  settings: defaultSettings,
};

export async function validateTextDocument(
  textDocument: TextDocument,
): Promise<void> {
  const diagnostics = await lint(textDocument);
  context.connection?.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

export async function loadSettings() {
  const cfg = await context.connection?.workspace.getConfiguration({
    section: "denoHTMLTools",
  });
  context.settings = cfg;
}

export async function formatDocument(params: DocumentFormattingParams) {
  const document = context.documents?.get(params.textDocument.uri);
  if (!document) {
    return;
  }
  const cfg = await context.connection?.workspace.getConfiguration();
  return format(document, cfg);
}
