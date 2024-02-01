# theme-to-zed

Export VSCode themes to Zed.

⚠️ Zed works for just Mac at the moment. So this extension is only useful for Mac users.

Marketplace link: [degreat.theme-to-zed](https://marketplace.visualstudio.com/items?itemName=degreat.theme-to-zed)

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

⚠️ Note that, not all themes may work properly. The `theme_importer` is still under development. You may need to update periodically.

🌵 The installation of `theme_importer` will only happen once.
