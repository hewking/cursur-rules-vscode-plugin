import * as vscode from "vscode";
import { Rule, RulesManager, StatusBarManager, WebviewManager } from "../types";

export class CommandManager {
  private context: vscode.ExtensionContext;
  private rulesManager: RulesManager;
  private statusBar: StatusBarManager;
  private webview: WebviewManager;

  constructor(
    context: vscode.ExtensionContext,
    services: {
      rulesManager: RulesManager;
      statusBar: StatusBarManager;
      webview: WebviewManager;
    }
  ) {
    this.context = context;
    this.rulesManager = services.rulesManager;
    this.statusBar = services.statusBar;
    this.webview = services.webview;
  }

  registerCommands() {
    this.context.subscriptions.push(
      vscode.commands.registerCommand(
        "cursorrules.createNew",
        this.createNewRules.bind(this)
      ),
      vscode.commands.registerCommand(
        "cursorrules.loadTemplate",
        this.loadTemplate.bind(this)
      ),
      vscode.commands.registerCommand(
        "cursorrules.saveAsTemplate",
        this.saveAsTemplate.bind(this)
      ),
      vscode.commands.registerCommand(
        "cursorrules.switchRules",
        this.switchRules.bind(this)
      ),
      vscode.commands.registerCommand(
        'cursorrules.saveRulesToFile',
        async (rules: Rule[]) => {
          await this.rulesManager.saveRules(rules);
        }
      )
    );
  }

  private async createNewRules() {
    // 检查是否有工作区
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage("Please open a workspace first");
      return;
    }

    // 创建初始规则
    const initialRule = await this.createInitialRule();
    if (!initialRule) {
      return;
    }

    // 保存规则并打开编辑器
    await this.rulesManager.saveRules([initialRule]);
    await this.webview.showRulesEditor([initialRule]);
    this.statusBar.updateStatusBar("Custom Rules");
  }

  private async createInitialRule(): Promise<Rule | undefined> {
    // 获取规则模式
    const pattern = await vscode.window.showInputBox({
      prompt: "Enter regex pattern",
      placeHolder: "e.g., function.*Component|useEffect",
    });

    if (!pattern) {
      return;
    }

    // 获取规则标志
    const flags = await vscode.window.showInputBox({
      prompt: "Enter regex flags",
      placeHolder: "e.g., g, gi, m",
      value: "g",
    });

    if (flags === undefined) {
      return;
    }

    // 获取颜色
    const colors = ["Red", "Green", "Blue", "Yellow", "Purple", "Orange"];
    const colorChoice = await vscode.window.showQuickPick(colors, {
      placeHolder: "Select highlight color",
    });

    if (!colorChoice) {
      return;
    }

    const colorMap = {
      Red: "#ff0000",
      Green: "#00ff00",
      Blue: "#0000ff",
      Yellow: "#ffff00",
      Purple: "#800080",
      Orange: "#ffa500",
    };

    // 获取优先级
    const priority = await vscode.window.showInputBox({
      prompt: "Enter priority (1-100)",
      placeHolder: "1",
      value: "1",
      validateInput: (value) => {
        const num = parseInt(value);
        return !isNaN(num) && num >= 1 && num <= 100
          ? null
          : "Please enter a number between 1 and 100";
      },
    });

    if (!priority) {
      return;
    }

    return {
      pattern,
      flags,
      color: colorMap[colorChoice as keyof typeof colorMap],
      priority: parseInt(priority),
    };
  }

  private async loadTemplate() {
    const templates = await this.rulesManager.getTemplates();
    const items = Array.from(templates.values()).map((t) => ({
      label: t.name,
      description: t.type,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Select a template",
    });

    if (selected) {
      const template = templates.get(selected.label);
      if (template) {
        await this.rulesManager.saveRules(template.rules);
        this.statusBar.updateStatusBar(template.name);
      }
    }
  }

  private async saveAsTemplate() {
    const name = await vscode.window.showInputBox({
      placeHolder: "Enter template name",
    });

    if (!name) {
      return;
    }

    const type = await vscode.window.showInputBox({
      placeHolder: "Enter template type (e.g., react, vue)",
    });

    if (!type) {
      return;
    }

    await this.rulesManager.saveTemplate({ name, type });
    vscode.window.showInformationMessage(
      `Template "${name}" saved successfully`
    );
  }

  private async switchRules() {
    await this.loadTemplate();
  }

  // 其他命令实现...
}
