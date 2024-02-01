# theme-to-zed

Export VSCode themes to Zed.

## How to use

After installing from the Marketplace, run the command `Export Theme to Zed` from the command palette.

Restart Zed (Preview) to see the theme.

If you're on an Intel Mac, you may need to supply the path to `theme_importer` in `settings.json`.

```json
{
  ...,
  "theme-to-zed.theme_importer": "/usr/local/bin/theme_importer"
}
```
