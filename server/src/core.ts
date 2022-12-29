import { DocumentFormattingParams } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { lint } from "./lint";
import { format } from "./format";
import { Context, Settings } from "./types";
import { resolveDenoConfig } from "./utils";

export const defaultSettings: Settings = { lint: false, lintOnSave: false };

export const context: Context = {
  settings: defaultSettings,
  documentSettings: new Map(),
};

export async function validateTextDocument(
  document: TextDocument,
): Promise<void> {
  const settings = await getDocumentSettings(document);
  const diagnostics = await lint(settings, document);
  context.connection?.sendDiagnostics({ uri: document.uri, diagnostics });
}

export async function loadSettings() {
  const cfg = await context.connection?.workspace.getConfiguration({
    section: "denoHTMLTools",
  });
  context.settings = cfg;
  context.documentSettings.clear();
  if (context.settings.lint && !context.settings.lintOnSave) {
    context.documents?.all().forEach(validateTextDocument);
  }
}

export async function formatDocument(params: DocumentFormattingParams) {
  const document = context.documents?.get(params.textDocument.uri);
  if (!document) {
    return;
  }
  const cfg = await context.connection?.workspace.getConfiguration();
  const settings = await getDocumentSettings(document);
  return format(settings, document, cfg);
}

export async function getDocumentSettings(
  document: TextDocument,
): Promise<Settings> {
  let result = context.documentSettings.get(document.uri);
  if (!result) {
    const config: Settings = Object.assign({}, context.settings);
    if (context.settings.denoConfig) {
      const denoConfig = await resolveDenoConfig(
        context,
        document,
        context.settings.denoConfig,
      );
      if (denoConfig) {
        config.denoConfig = denoConfig;
      }
    }
    result = Promise.resolve(config);
    context.documentSettings.set(document.uri, result);
  }
  return result;
}
