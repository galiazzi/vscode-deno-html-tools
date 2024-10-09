import { TextDocument } from "vscode-languageserver-textdocument";
import { TextEdit } from "vscode-languageserver";
import { denoFormat, DenoOptions, getExtFromLanguageId } from "./deno";
import { WorkspaceConfiguration } from "vscode";
import { Settings } from "./types";

export async function format(
  settings: Settings,
  document: TextDocument,
  _config: WorkspaceConfiguration,
): Promise<[TextEdit] | null> {
  const denoOptions: DenoOptions = {};
  if (settings.denoConfig) {
    denoOptions.config = settings.denoConfig;
  }

  resolveOriginalDenoUsed(denoOptions, settings, document);

  const newText = await denoFormat(
    document.getText(),
    denoOptions,
  );

  return [{
    range: {
      start: document.positionAt(0),
      end: document.positionAt(document.getText().length),
    },
    newText,
  }];
}

function resolveOriginalDenoUsed(
  denoOptions: DenoOptions,
  settings: Settings,
  document: TextDocument,
) {
  if (document.languageId === "html") {
    if (settings.useDenoOriginalHTMLFormatting) {
      denoOptions.original = true;
      denoOptions.ext = getExtFromLanguageId(document.languageId);
    }
    return;
  }

  if (document.languageId === "vue") {
    if (settings.useDenoOriginalComponentFormatting) {
      denoOptions.original = true;
      denoOptions.ext = getExtFromLanguageId(document.languageId);
    }
    return;
  }

  denoOptions.original = true;
  denoOptions.ext = getExtFromLanguageId(document.languageId);
}
