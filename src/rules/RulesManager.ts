import * as vscode from "vscode";
import { Rule, Template, CursorRulesError } from "../types";
import path from "path";

export class RulesManager {
  private templates: Map<string, Template>;
  private storageUri: vscode.Uri;

  constructor(context: vscode.ExtensionContext) {
    this.templates = new Map();
    this.storageUri = vscode.Uri.joinPath(context.globalStorageUri, "templates");
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
    const builtinTemplates: Template[] = [
        {
            name: "Basic Text",
            type: "text",
            rules: [
                {
                    name: "TODO",
                    type: "TODO",
                    content: "TODO"
                },
                {
                    name: "FIXME",
                    type: "FIXME",
                    content: "FIXME"
                },
                {
                    name: "NOTE",
                    type: "NOTE",
                    content: "NOTE"
                }
            ]
        }
    ];

    builtinTemplates.forEach(template => {
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

  async saveTemplate(template: Template) {
    try {
      // 检查是否存在同名模板
      if (this.templates.has(template.name)) {
        // 如果存在，直接更新内存中的模板
        this.templates.set(template.name, template);
      } else {
        // 如果不存在，添加新模板
        this.templates.set(template.name, template);
      }

      // 保存到全局存储
      const templateUri = vscode.Uri.joinPath(
        this.storageUri,
        `${template.name.toLowerCase().replace(/\s+/g, "-")}.json`
      );

      await vscode.workspace.fs.writeFile(
        templateUri,
        Buffer.from(JSON.stringify(template, null, 2))
      );

      vscode.window.showInformationMessage(
        `Template "${template.name}" ${this.templates.has(template.name) ? 'updated' : 'saved'} successfully`
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
        // 只保存 content 到 .cursorrules 文件，每行一个内容
        const ruleContents = rules.map(rule => rule.content).join('\n');
        
        const rulesPath = vscode.Uri.joinPath(
            workspaceFolder.uri,
            ".cursorrules"
        );

        await vscode.workspace.fs.writeFile(
            rulesPath,
            Buffer.from(ruleContents)  // 直接使用文本内容，不用 JSON.stringify
        );

        // 同时保存完整信息到模板
        await this.saveTemplate({
            name: rules[0]?.name || "Default",
            type: rules[0]?.type || "custom",
            rules: rules
        });

        vscode.window.showInformationMessage("Rules saved successfully");
    } catch (error) {
        vscode.window.showErrorMessage(
            `Failed to save rules: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        throw error;
    }
  }

  async loadTemplate(name: string): Promise<Rule[]> {
    const template = this.templates.get(name);
    if (!template) {
      throw new CursorRulesError("Template not found", "TEMPLATE_NOT_FOUND");
    }
    return template.rules || []; // 确保返回数组，即使是空数组
  }

  async getTemplates(): Promise<Map<string, Template>> {
    return this.templates;
  }

  async deleteTemplate(name: string): Promise<void> {
    try {
        // 检查模板是否存在
        if (!this.templates.has(name)) {
            throw new CursorRulesError("Template not found", "TEMPLATE_NOT_FOUND");
        }

        // 从内存中删除
        this.templates.delete(name);

        // 从存储中删除
        const templateUri = vscode.Uri.joinPath(
            this.storageUri,
            `${name.toLowerCase().replace(/\s+/g, "-")}.json`
        );

        try {
            await vscode.workspace.fs.delete(templateUri);
        } catch (error) {
            console.error(`Failed to delete template file: ${error}`);
        }

    } catch (error) {
        vscode.window.showErrorMessage(
            `Failed to delete template: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
        throw error;
    }
  }
}
