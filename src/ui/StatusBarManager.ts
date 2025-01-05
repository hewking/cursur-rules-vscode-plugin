import * as vscode from "vscode";

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;

  constructor(context: vscode.ExtensionContext) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right
    );

    this.statusBarItem.command = "cursorrules.switchRules";
    context.subscriptions.push(this.statusBarItem);

    this.updateStatusBar();
  }

  updateStatusBar(templateName?: string) {
    if (
      !vscode.workspace.getConfiguration("cursorrules").get("statusBarEnabled")
    ) {
      this.statusBarItem.hide();
      return;
    }

    this.statusBarItem.text = `$(symbol-ruler) ${
      templateName || "Cursor Rules"
    }`;
    this.statusBarItem.show();
  }
}
