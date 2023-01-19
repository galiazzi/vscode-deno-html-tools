import { ExtensionContext, workspace } from "vscode";
import * as path from "path";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  console.log("vscode-deno-html-tools active");

  // The server is implemented in node
  const serverModule = context.asAbsolutePath(
    path.join("server", "out", "server.js"),
  );

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: "file", language: "html" },
      { scheme: "file", language: "vue" },
      { scheme: "file", language: "javascript" },
      { scheme: "file", language: "javascriptreact" },
      { scheme: "file", language: "typescript" },
      { scheme: "file", language: "typescriptreact" },
    ],

    synchronize: {
      // Notify the server about file changes to '.clientrc files contained in the workspace
      fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
    },
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "deno-html-tools",
    "Deno HTML Tools",
    serverOptions,
    clientOptions,
  );

  // Start the client. This will also launch the server
  client.start();
}

export function deactivate() {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
