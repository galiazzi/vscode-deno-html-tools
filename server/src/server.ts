import {
  createConnection,
  DidChangeConfigurationNotification,
  InitializeParams,
  InitializeResult,
  ProposedFeatures,
  TextDocuments,
  TextDocumentSyncKind,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
import {
  context,
  formatDocument,
  loadSettings,
  validateTextDocument,
} from "./core";

const connection = createConnection(ProposedFeatures.all);
context.connection = connection;
context.documents = new TextDocuments(TextDocument);

connection.onInitialize((_params: InitializeParams) => {
  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      documentFormattingProvider: true,
      documentRangeFormattingProvider: true,
    },
  };

  return result;
});

connection.onInitialized(() => {
  connection.client.register(
    DidChangeConfigurationNotification.type,
    undefined,
  );
  loadSettings();
  console.log("server is running");
});

connection.onDidChangeConfiguration((_change) => {
  loadSettings();
  // Revalidate all open text documents
  // documents.all().forEach(validateTextDocument);
});

connection.onDocumentFormatting(formatDocument);
connection.onDocumentRangeFormatting(formatDocument);

connection.onDidChangeWatchedFiles((_change) => {
  connection.console.log("We received an file change event");
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
context.documents.onDidChangeContent((change) => {
  !context.settings.lintOnSave && validateTextDocument(change.document);
});
context.documents.onDidOpen((evt) => {
  context.settings.lintOnSave && validateTextDocument(evt.document);
});
context.documents.onDidSave((evt) => {
  context.settings.lintOnSave && validateTextDocument(evt.document);
});

// Make the text document manager listen on the connection
// for open, change and close text document events
context.documents.listen(connection);

// Listen on the connection
connection.listen();
