import * as vscode from "vscode";
import { Rule, Template, CursorRulesError } from "../types";
import path from "path";

export class RulesManager {
  private context: vscode.ExtensionContext;
  private templates: Map<string, Template>;
  private storageUri: vscode.Uri;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.templates = new Map();
    // 使用 globalStoragePath 作为模板存储位置
    this.storageUri = vscode.Uri.joinPath(
      context.globalStorageUri,
      "templates"
    );
    this.loadTemplates();
  }

  async loadTemplates() {
    try {
      // 确保存储目录存在
      await vscode.workspace.fs.createDirectory(this.storageUri);

      // 加载内置模板
      await this.loadBuiltinTemplates();

      // 加载用户保存的模板
      await this.loadUserTemplates();
    } catch (error) {
      console.error("Failed to initialize templates:", error);
    }
  }

  private async loadBuiltinTemplates() {
    // 内置模板定义
    const builtinTemplates: Template[] = [
      {
        name: "React Components",
        type: "react",
        rules: [
          {
            pattern: "function.*Component",
            flags: "g",
            color: "#ff0000",
            priority: 1,
          },
        ],
      },
      // 可以添加更多内置模板
    ];

    // 加载内置模板到内存
    builtinTemplates.forEach((template) => {
      this.templates.set(template.name, template);
    });
  }

  private async loadUserTemplates() {
    try {
      const files = await vscode.workspace.fs.readDirectory(this.storageUri);

      for (const [file] of files) {
        if (path.extname(file) === ".json") {
          const fileUri = vscode.Uri.joinPath(this.storageUri, file);
          const content = await vscode.workspace.fs.readFile(fileUri);
          try {
            const template = JSON.parse(content.toString()) as Template;
            this.templates.set(template.name, template);
          } catch (e) {
            console.error(`Failed to parse template file: ${file}`, e);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load user templates:", error);
    }
  }

  async saveTemplate(template: Partial<Template>) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new CursorRulesError("No workspace folder found", "NO_WORKSPACE");
    }

    const currentRules = await this.getCurrentRules();

    const newTemplate: Template = {
      name: template.name || "Unnamed Template",
      type: template.type || "custom",
      rules: currentRules,
    };

    // 保存到内存
    this.templates.set(newTemplate.name, newTemplate);

    // 保存到全局存储
    try {
      const templateUri = vscode.Uri.joinPath(
        this.storageUri,
        `${newTemplate.name.toLowerCase().replace(/\s+/g, "-")}.json`
      );

      await vscode.workspace.fs.writeFile(
        templateUri,
        Buffer.from(JSON.stringify(newTemplate, null, 2))
      );

      vscode.window.showInformationMessage(
        `Template "${newTemplate.name}" saved successfully`
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to save template: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }
  }

  async saveRules(rules: Rule[]) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new CursorRulesError("No workspace folder found", "NO_WORKSPACE");
    }

    try {
      // 验证规则
      if (!this.validateRules(rules)) {
        throw new CursorRulesError("Invalid rules format", "INVALID_RULES");
      }

      // 创建完整的规则文件内容
      const ruleFileContent = {
        name: "Custom Rules",
        type: "custom",
        rules: rules.sort((a, b) => a.priority - b.priority), // 按优先级排序
      };

      const rulesPath = vscode.Uri.joinPath(
        workspaceFolder.uri,
        ".cursorrules"
      );

      await vscode.workspace.fs.writeFile(
        rulesPath,
        Buffer.from(JSON.stringify(ruleFileContent, null, 2))
      );

      // 保存成功后通知
      vscode.window.showInformationMessage("Rules saved successfully");
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to save rules: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }
  }

  private validateRules(rules: Rule[]): boolean {
    return rules.every(
      (rule) =>
        rule.pattern &&
        typeof rule.pattern === "string" &&
        rule.flags &&
        typeof rule.flags === "string" &&
        rule.color &&
        typeof rule.color === "string" &&
        typeof rule.priority === "number" &&
        rule.priority >= 1 &&
        rule.priority <= 100
    );
  }

  async getTemplates(): Promise<Map<string, Template>> {
    return this.templates;
  }

  private async getCurrentRules(): Promise<Rule[]> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return [];
    }

    const rulesPath = vscode.Uri.joinPath(workspaceFolder.uri, ".cursorrules");

    try {
      const content = await vscode.workspace.fs.readFile(rulesPath);
      return JSON.parse(content.toString());
    } catch {
      return [];
    }
  }
}
