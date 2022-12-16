import { TextDocument } from "vscode-languageserver-textdocument";
import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver/node";
import { denoLint } from "./deno";

export async function lint(document: TextDocument) {
  const diagnostics: Diagnostic[] = [];

  const lintResult = await denoLint(document.getText());

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
