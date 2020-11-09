# Tabster

This extension can help you to manage your tabs.

## Preview

When you install the Tabster extension in your activity bar will be available new icon. The extension main view frame is simple two-piece view for common and hot group tabs.

![preview](images/preview.gif)

## Features

You can save and load groups of tabs arranged by common and hot category.

## Usage

### Save active open editors (tabs) by either

- `Save tabs` command. Will save tabs to common view.
- `Save tabs set [0-9]` commands set. Will save tabs to hot view.

### Activate previously saved tabs

- By click on play icon after the tabs group label in tabs roup view.
- `Activate tabs set [0-9]` to load previously saved hot tabs group.

## Hot keys

- `ctrl+alt+S` (mac `cmd+ctrl+S`): save common tabs group
- `ctrl+alt+[0-9]` (mac `cmd+ctrl+[0-9]`): save hot tabs group
- `alt+[0-9]` (mac `cmd+[0-9]`): activate hot tabs group

## Extension Settings

- `tabster.activateBehavior`: [`replace`|`append`]. `replace` - default. Means that on tabs activating all previous tabs will be closed. `append` - means that tabs will be appended to exist ones.
- `tabster.saveTabsOrder`(boolean): `true` - default. Save tabs order on load (slow). You can turn off this option to speed up tabs activation process.

## Known Issues

- Tabs order does not guaranteed to be preserved.
- Not all tabs can be saved (some media files).
- Saving tabs group takes long time to go.

At all there is no explicit api in vscode to work with editors. Look for this topic for more details [https://github.com/microsoft/vscode/issues/15178]

## Release Notes

### [0.0.1] - 2020-11-10

Initial release
