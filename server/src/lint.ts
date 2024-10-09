import { TextDocument } from "vscode-languageserver-textdocument";
import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver/node";
import { denoLint, DenoOptions, getExtFromLanguageId } from "./deno";
import { Settings } from "./types";
import { isHTML } from "./utils";

export async function lint(settings: Settings, document: TextDocument) {
  const diagnostics: Diagnostic[] = [];

  const denoOptions: DenoOptions = {};
  if (settings.denoConfig) {
    denoOptions.config = settings.denoConfig;
  }

  if (!isHTML(document.languageId)) {
    denoOptions.original = true;
  }

  if (["javascriptreact", "typescriptreact"].includes(document.languageId)) {
    denoOptions.ext = getExtFromLanguageId(document.languageId);
  }

  const lintResult = await denoLint(document.getText(), denoOptions);

  for (const d of lintResult?.diagnostics) {
    const diagnostic: Diagnostic = {
      severity: DiagnosticSeverity.Warning,
      range: {
        start: {
          line: d.range.start.line - 1,
          character: d.range.start.col,
        },
        end: {
          line: d.range.end.line - 1,
          character: d.range.end.col,
        },
      },
      message: d.message,
      code: d.code,
      source: "deno-html-tools",
    };
    diagnostics.push(diagnostic);
  }
  return diagnostics;
}
