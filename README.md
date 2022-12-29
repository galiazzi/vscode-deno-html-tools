# vscode-deno-html-tools

![ci](https://github.com/galiazzi/vscode-deno-html-tools/actions/workflows/ci.yaml/badge.svg)

Using `deno` formatter in html-like files.

For the html and css parts
[js-beatify](https://github.com/beautify-web/js-beautify) is used.

Config default formatter in `.vscode/settings.json` file:

```json
{
  "[html]": {
    "editor.defaultFormatter": "dayan.vscode-deno-html-tools"
  }
}
```

You associate another file extension with `files.associations` config:

```json
{
  "files.associations": {
    "*.tt": "html"
  }
}
```

## Requirements

Must have [deno](https://deno.land) installed

## Configuration

You can control the settings for this extension through your VS Code settings
page. You can open the settings page using the `Ctrl+,` keyboard shortcut. The
extension has the following configuration options:

- `denoHTMLTools.lint`: Enable diagnostics. _boolean, default `false`_

- `denoHTMLTools.lintOnSave`: If true, diagnostics will made only on file save.
  _boolean, default `false`_

- `denoHTMLTools.denoConfig`: The file path to a deno configuration file. The
  path can be either be relative to the workspace, or an absolute path. _string,
  default `null`_
