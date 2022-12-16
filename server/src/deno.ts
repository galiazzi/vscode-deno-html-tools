import { Readable } from "stream";

const execa = require("execa");

export interface DenoDiagnostic {
  range: {
    start: {
      line: number;
      col: number;
      bytePos: number;
    };
    end: {
      line: number;
      col: number;
      bytePos: number;
    };
  };
  filename: string;
  message: string;
  code: string;
  hint: string | null;
}

export interface DenoError {
  file_path: string;
  message: string;
}

export interface DenoLint {
  diagnostics: DenoDiagnostic[];
  errors: DenoError[];
}

export async function denoLint(code: string): Promise<DenoLint> {
  return JSON.parse(await denoExec("lint", code));
}

export function denoFormat(code: string) {
  return denoExec("fmt", code);
}

export function denoExec(
  cmd: "lint" | "fmt",
  stdin: string,
): Promise<string> {
  const reader = Readable.from([stdin]);

  const subprocess = execa(
    "deno",
    [
      "run",
      "-A",
      "https://raw.githubusercontent.com/galiazzi/deno-html-tools/v0.1.5/src/index.ts",
      cmd,
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
