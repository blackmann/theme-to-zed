import * as vscode from "vscode";
import fs from "fs";
import { execSync } from "child_process";

interface ThemeDefinition {
	name: string;
	path: string;
	filename: string;
}

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand(
		"theme-to-zed.export",
		exportTheme,
	);

	context.subscriptions.push(disposable);
}

function exportTheme() {
	const themeExtensions = vscode.extensions.all.filter((ext) =>
		ext.packageJSON?.categories?.includes("Themes"),
	);

	const themes: ThemeDefinition[] = [];

	for (const it of themeExtensions) {
		const extPath = `${it.extensionPath}/themes`;
		try {
			const themeFiles = fs.readdirSync(extPath, { withFileTypes: true });
			for (const file of themeFiles) {
				if (!file.isFile()) {
					return;
				}

				const themePath = `${extPath}/${file.name}`;
				const { name } = JSON.parse(fs.readFileSync(themePath, "utf8"));

				themes.push({
					name: name || it.packageJSON?.displayName,
					path: themePath,
					filename: file.name,
				});
			}
		} catch (err) {}
	}

	type PickTheme = vscode.QuickPickItem & { theme: ThemeDefinition };

	const quickPick = vscode.window.createQuickPick<PickTheme>();
	quickPick.items = themes.map((theme) => ({
		label: theme.name,
		theme,
	}));

	quickPick.onDidAccept(() => {
		const { theme } = quickPick.selectedItems[0];
		installTheme(theme);
		quickPick.hide();
	});

	quickPick.show();
}

function installTheme(theme: ThemeDefinition) {
	const { filename, path } = theme;
	const zedThemePath = `${process.env.HOME}/.config/zed/themes`;
	const zedThemeFile = `${zedThemePath}/${filename}`;

	const themeImporterBin =
		(vscode.workspace.getConfiguration().get("theme-to-zed.theme_importer") as
			| string
			| undefined) || "/opt/homebrew/bin/theme_importer";

	if (!checkBin(themeImporterBin)) {
		return;
	}

	try {
		const themeOut = clean(
			execSync(`${themeImporterBin} "${path}"`).toString(),
		);

		const themeExport = {
			name: theme.name,
			author: "",
			themes: [{ ...JSON.parse(themeOut), name: theme.name }],
		};

		fs.mkdirSync(zedThemePath, { recursive: true });
		fs.writeFileSync(zedThemeFile, JSON.stringify(themeExport, null, 2));

		vscode.window.showInformationMessage(
			`Theme ${theme.name} successfully exported`,
		);
	} catch (err) {
		vscode.window.showErrorMessage(
			`Failed to export theme: ${theme.name} (${err})`,
		);
	}
}

function checkBin(bin: string) {
	try {
		execSync(`which ${bin}`);
		return true;
	} catch (err) {
		vscode.window
			.showErrorMessage(
				'Theme importer not found. Please install it with "brew install blackmann/zed-theme-importer".',
				"Install",
				"Cancel",
			)
			.then((value) => {
				if (value === "Install") {
					const terminal = vscode.window.createTerminal();
					terminal.sendText("brew install blackmann/zed-theme-importer");
					terminal.show();
				}
			});
	}
}

function clean(output: string) {
	const lines = output.split("\n");
	const cleaned: string[] = [];

	let t = "{";
	let push = false;

	for (const line of lines) {
		if (line.startsWith(t)) {
			cleaned.push(line);

			if (t === "}") {
				break;
			}

			t = "}";
			push = true;
			continue;
		}

		if (push) {
			cleaned.push(line);
		}
	}

	return cleaned.join("\n");
}

// This method is called when your extension is deactivated
export function deactivate() {}
