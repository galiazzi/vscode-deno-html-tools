import { TextDocument } from "vscode-languageserver-textdocument";
import { TextEdit } from "vscode-languageserver";
import { denoFormat } from "./deno";
import { WorkspaceConfiguration } from "vscode";

const beautifyHtml = require("js-beautify").html;

export async function format(
  document: TextDocument,
  config: WorkspaceConfiguration,
): Promise<[TextEdit] | null> {
  const options = optionsFromVSCode(config);

  const newText = await denoFormat(beautifyHtml(document.getText(), options));

  return [{
    range: {
      start: document.positionAt(0),
      end: document.positionAt(document.getText().length),
    },
    newText,
  }];
}

function optionsFromVSCode(config: WorkspaceConfiguration) {
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
