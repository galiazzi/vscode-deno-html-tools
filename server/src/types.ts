import { Connection, TextDocuments } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

export interface Context {
  settings: Settings;
  documentSettings: Map<string, Promise<Settings>>;
  documents?: TextDocuments<TextDocument>;
  connection?: Connection;
}

export interface Settings {
  lint: boolean;
  lintOnSave: boolean;
  denoConfig?: string;
}
