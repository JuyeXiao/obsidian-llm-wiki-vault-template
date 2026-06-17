// open_note.js — QuickAdd UserScript: open a given file (no plugin dependency)
// Usage: add this script as a UserScript inside a QuickAdd macro, then set its
//   "File path" setting to the target path, e.g. "HUB/Mail Box.md".
//   Bind a hotkey to that macro (choice) for one-press navigation.
// To add more navigation keys: clone a macro and change its "File path".
module.exports = {
  entry: async (params, settings) => {
    const path = ((settings && settings["File path"]) || "").trim();
    if (!path) {
      new Notice("open_note: please set \"File path\" in this QuickAdd macro's settings");
      return;
    }
    await params.app.workspace.openLinkText(path, "", false);
  },
  settings: {
    name: "Open Note",
    author: "vault",
    options: {
      "File path": {
        type: "text",
        defaultValue: "",
        placeholder: "HUB/Mail Box.md",
      },
    },
  },
};
