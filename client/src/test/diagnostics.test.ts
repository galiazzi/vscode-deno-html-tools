import * as vscode from "vscode";
import * as assert from "assert";
import { activate, getDocUri } from "./helper";

suite("Should get diagnostics", () => {
  const docUri = getDocUri("diagnostics.html");

  test("Diagnoses uppercase texts", async () => {
    await testDiagnostics(docUri, [
      {
        message: "`a` is never used",
        range: toRange(1, 6, 1, 7),
        severity: vscode.DiagnosticSeverity.Warning,
        source: "deno-html-tools",
      },
    ]);
  });
});

function toRange(sLine: number, sChar: number, eLine: number, eChar: number) {
  const start = new vscode.Position(sLine, sChar);
  const end = new vscode.Position(eLine, eChar);
  return new vscode.Range(start, end);
}

async function testDiagnostics(
  docUri: vscode.Uri,
  expectedDiagnostics: vscode.Diagnostic[],
) {
  await activate(docUri);
  const actualDiagnostics = vscode.languages.getDiagnostics(docUri);
  assert.equal(actualDiagnostics.length, expectedDiagnostics.length);

  expectedDiagnostics.forEach((expectedDiagnostic, i) => {
    const actualDiagnostic = actualDiagnostics[i];
    assert.equal(actualDiagnostic.message, expectedDiagnostic.message);
    assert.deepEqual(actualDiagnostic.range, expectedDiagnostic.range);
    assert.equal(actualDiagnostic.severity, expectedDiagnostic.severity);
  });
}
