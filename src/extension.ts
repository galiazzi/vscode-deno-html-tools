import * as vscode from "vscode";
import { Readable } from "stream";
import optionsFromVSCode from "./optionsFromVSCode";

const beautifyHtml = require("js-beautify").html;
const execa = require("execa");

export function activate(_context: vscode.ExtensionContext) {
  console.log("vscode-deno-html-tools active");

  vscode.languages.registerDocumentRangeFormattingEditProvider("html", {
    async provideDocumentRangeFormattingEdits(document: vscode.TextDocument) {
      if (document.isUntitled) {
        return;
      }

      let code: string;
      try {
        code = await format(document.getText());
      } catch (err) {
        vscode.window.showErrorMessage(`Deno fmt error: ${err}`);
        return;
      }

      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(document.getText().length),
      );
      return [new vscode.TextEdit(fullRange, code)];
    },
  });
}

export function deactivate() {}

async function format(code: string): Promise<string> {
  const config = vscode.workspace.getConfiguration();
  const options = optionsFromVSCode(config);
  return await denoFmt(beautifyHtml(code, options));
}

function denoFmt(code: string): Promise<string> {
  const reader = Readable.from([code]);

  const subprocess = execa(
    "deno",
    [
      "run",
      "-A",
      "--no-check",
      "https://raw.githubusercontent.com/galiazzi/deno-html-tools/v0.1.0/src/index.ts",
      "fmt",
      "-",
    ],
    {
      stdout: "pipe",
      stderr: "pipe",
      stdin: "pipe",
    },
  );

  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    subprocess.on("exit", (exitCode: number) => {
      if (exitCode !== 0) {
        reject(new Error(stderr));
      } else {
        resolve(stdout);
      }
    });
    subprocess.on("error", (err: Error) => {
      reject(err);
    });
    subprocess.stdout?.on("data", (data: Buffer) => {
      stdout += data;
    });

    subprocess.stderr?.on("data", (data: Buffer) => {
      stderr += data;
    });

    subprocess.stdin && reader.pipe(subprocess.stdin);
  });
}
