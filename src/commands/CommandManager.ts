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
      ),
      vscode.commands.registerCommand(
        "cursorrules.editTemplate",
        this.editTemplate.bind(this)
      ),
      vscode.commands.registerCommand(
        "cursorrules.deleteTemplate",
        this.deleteTemplate.bind(this)
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
    // 获取规则名称
    const name = await vscode.window.showInputBox({
        prompt: "Enter rule name",
        placeHolder: "e.g., TODO Rule",
    });

    if (!name) {
        return;
    }

    // 获取规则类型
    const type = await vscode.window.showInputBox({
        prompt: "Enter rule type",
        placeHolder: "e.g., TODO, FIXME, NOTE",
    });

    if (!type) {
        return;
    }

    // 获取规则内容
    const content = await vscode.window.showInputBox({
        prompt: "Enter content to match",
        placeHolder: "e.g., TODO, FIXME, NOTE",
    });

    if (!content) {
        return;
    }

    return {
        name,
        type,
        content
    };
  }

  private async loadTemplate() {
    try {
        const templates = await this.rulesManager.getTemplates();
        if (templates.size === 0) {
            vscode.window.showInformationMessage("No templates available");
            return;
        }

        const items = Array.from(templates.values()).map((t) => ({
            label: t.name,
            description: t.type,
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: "Select a template",
        });

        if (selected) {
            const template = templates.get(selected.label);
            if (template && template.rules) {
                await this.rulesManager.saveRules(template.rules);
                this.statusBar.updateStatusBar(template.name);
            }
        }
    } catch (error) {
        vscode.window.showErrorMessage(
            `Failed to load template: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
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

    // 获取当前工作区的规则
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage("Please open a workspace first");
        return;
    }

    try {
        const rulesPath = vscode.Uri.joinPath(workspaceFolder.uri, ".cursorrules");
        const content = await vscode.workspace.fs.readFile(rulesPath);
        const ruleContents = content.toString().split('\n').filter(line => line.trim());

        // 创建规则数组
        const rules: Rule[] = ruleContents.map(content => ({
            name: content,
            type: type,
            content: content
        }));

        // 保存模板
        await this.rulesManager.saveTemplate({
            name,
            type,
            rules
        });

        vscode.window.showInformationMessage(
            `Template "${name}" saved successfully`
        );
    } catch (error) {
        vscode.window.showErrorMessage(
            `Failed to save template: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
  }

  private async switchRules() {
    await this.loadTemplate();
  }

  private async editTemplate() {
    try {
        const templates = await this.rulesManager.getTemplates();
        if (templates.size === 0) {
            vscode.window.showInformationMessage("No templates available");
            return;
        }

        const items = Array.from(templates.values()).map((t) => ({
            label: t.name,
            description: t.type,
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: "Select template to edit",
        });

        if (selected) {
            const template = templates.get(selected.label);
            if (template) {
                await this.webview.showRulesEditor(template.rules);
                this.statusBar.updateStatusBar(template.name);
            }
        }
    } catch (error) {
        vscode.window.showErrorMessage(
            `Failed to edit template: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
  }

  private async deleteTemplate() {
    try {
        const templates = await this.rulesManager.getTemplates();
        if (templates.size === 0) {
            vscode.window.showInformationMessage("No templates available");
            return;
        }

        const items = Array.from(templates.values()).map((t) => ({
            label: t.name,
            description: t.type,
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: "Select template to delete",
        });

        if (selected) {
            const confirm = await vscode.window.showWarningMessage(
                `Are you sure you want to delete template "${selected.label}"?`,
                { modal: true },
                "Yes",
                "No"
            );

            if (confirm === "Yes") {
                await this.rulesManager.deleteTemplate(selected.label);
                vscode.window.showInformationMessage(
                    `Template "${selected.label}" deleted successfully`
                );
            }
        }
    } catch (error) {
        vscode.window.showErrorMessage(
            `Failed to delete template: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
  }

  // 其他命令实现...
}
