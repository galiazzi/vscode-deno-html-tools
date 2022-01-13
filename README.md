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

## Requirements

Must have [deno](https://deno.land) installed
