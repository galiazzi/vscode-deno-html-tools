import { Readable } from "stream";

const execa = require("execa");

export const DENO_HTML_TOOLS_VERSION = "v0.1.10";

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

export interface DenoOptions {
  config?: string;
  original?: boolean;
  ext?: string;
}

export interface DenoLint {
  diagnostics: DenoDiagnostic[];
  errors: DenoError[];
}

export async function denoLint(
  code: string,
  options: DenoOptions,
): Promise<DenoLint> {
  return JSON.parse(await denoExec("lint", code, options));
}

export function denoFormat(code: string, options: DenoOptions) {
  return denoExec("fmt", code, options);
}

export function denoExec(
  cmd: "lint" | "fmt",
  stdin: string,
  options: DenoOptions,
): Promise<string> {
  const reader = Readable.from([stdin]);

  const cmdParts = options.original ? [cmd, "-"] : [
    "run",
    "-A",
    `https://raw.githubusercontent.com/galiazzi/deno-html-tools/${DENO_HTML_TOOLS_VERSION}/src/index.ts`,
    cmd,
    "-",
  ];

  if (options.original) {
    if (cmd === "lint") {
      cmdParts.splice(1, 0, "--json");
    } else {
      if (options.ext && options.ext === "vue") {
        cmdParts.push("--unstable-component");
      }
    }

    if (options.ext) {
      cmdParts.push(`--ext=${options.ext}`);
    }
  }

  if (options.config) {
    cmdParts.push(`--config=${options.config}`);
  }

  const subprocess = execa(
    "deno",
    cmdParts,
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
      if (options.original && cmd === "lint") {
        resolve(stdout);
        return;
      }
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

export function getExtFromLanguageId(languageId: string) {
  if (languageId === "javascript") {
    return "js";
  }
  if (languageId === "javascriptreact") {
    return "jsx";
  }
  if (languageId === "typescript") {
    return "ts";
  }
  if (languageId === "typescriptreact") {
    return "tsx";
  }
  if (languageId === "markdown") {
    return "md";
  }
  return languageId;
}
