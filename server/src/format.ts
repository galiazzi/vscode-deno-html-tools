import { TextDocument } from "vscode-languageserver-textdocument";
import { TextEdit } from "vscode-languageserver";
import { denoFormat, DenoOptions, getExtFromLanguageId } from "./deno";
import { WorkspaceConfiguration } from "vscode";
import { Settings } from "./types";
import { isHTML } from "./utils";

// const beautifyHtml = require("js-beautify").html;

export async function format(
  settings: Settings,
  document: TextDocument,
  _config: WorkspaceConfiguration,
): Promise<[TextEdit] | null> {
  // const options = optionsFromVSCode(config);

  const denoOptions: DenoOptions = {};
  if (settings.denoConfig) {
    denoOptions.config = settings.denoConfig;
  }

  if (!isHTML(document.languageId)) {
    denoOptions.original = true;
    denoOptions.ext = getExtFromLanguageId(document.languageId);
  }

  const newText = await denoFormat(
    document.getText(), // beautifyHtml(document.getText(), options),
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

function _optionsFromVSCode(config: WorkspaceConfiguration) {
  const extraLinersVal = (typeof config.html.format.extraLiners === "string")
    ? config.html.format.extraLiners
      .split(",")
      .map((s: string) => s.trim())
    : config.html.format.extraLiners;

  const contentUnformattedVal =
    (typeof config.html.format.contentUnformatted === "string")
      ? config.html.format.contentUnformatted
        .split(",")
        .map((s: string) => s.trim())
      : config.html.format.contentUnformatted;

  const options = {
    indent_with_tabs: !config.editor.insertSpaces,
    indent_size: config.editor.tabSize,
    indent_char: " ",
    extra_liners: extraLinersVal,
    content_unformatted: contentUnformattedVal,
    indent_handlebars: config.html.format.indentHandlebars,
    indent_inner_html: config.html.format.indentInnerHtml,
    max_preserve_newlines: config.html.format.maxPreserveNewLines,
    preserve_newlines: config.html.format.preserveNewLines,
    wrap_line_length: config.html.format.wrapLineLength,
    wrap_attributes: config.html.format.wrapAttributes,
    indent_scripts: "keep",
    html: {
      end_with_newline: config.html.format.endWithNewline,
      js: {
        templating: "auto",
        end_with_newline: false,
      },
    },
  };

  return options;
}
