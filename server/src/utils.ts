import { Context } from "./types";
import { isAbsolute } from "path";
import { TextDocument } from "vscode-languageserver-textdocument";

export async function getWorkspaceFolder(context: Context, uri: string) {
  return (await context.connection?.workspace.getWorkspaceFolders())
    ?.map((folder) => folder.uri)
    .filter((uriFolder) => uri.startsWith(uriFolder))?.[0];
}

export async function resolveDenoConfig(
  context: Context,
  document: TextDocument,
  denoConfig: string,
) {
  if (isAbsolute(denoConfig)) {
    return denoConfig;
  }

  const baseUri = await getWorkspaceFolder(context, document.uri);
  if (!baseUri) {
    return null;
  }
  return (new URL(denoConfig, `${baseUri}/`)).pathname;
}

const notHTML = [
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact",
];

export function isHTML(languageId: string) {
  return !notHTML.includes(languageId);
}
