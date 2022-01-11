import * as vscode from "vscode";

export default function (config: vscode.WorkspaceConfiguration) {
  let extraLinersVal;
  if (typeof config.html.format.extraLiners === "string") {
    extraLinersVal = config.html.format.extraLiners
      .split(",")
      .map((s: string) => s.trim());
  } else {
    extraLinersVal = config.html.format.extraLiners;
  }

  let contentUnformattedVal;
  if (typeof config.html.format.contentUnformatted === "string") {
    contentUnformattedVal = config.html.format.contentUnformatted
      .split(",")
      .map((s: string) => s.trim());
  } else {
    contentUnformattedVal = config.html.format.contentUnformatted;
  }

  let indentTabs;
  if (config.editor.insertSpaces === true) {
    indentTabs = false;
  } else {
    indentTabs = true;
  }

  const options = {
    indent_with_tabs: indentTabs,
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
