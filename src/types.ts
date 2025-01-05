import * as vscode from "vscode";

// 基础规则类型
export interface Rule {
  name: string;    // 规则名称
  type: string;    // 规则类型
  content: string; // 规则内容
}

// 模板类型
export interface Template {
  name: string;
  type: string;
  rules: Rule[];
}

// 服务类型定义
export interface RulesManager {
  loadTemplates(): Promise<void>;
  saveRules(rules: Rule[]): Promise<void>;
  getTemplates(): Promise<Map<string, Template>>;
  saveTemplate(template: Template): Promise<void>;
  deleteTemplate(name: string): Promise<void>;
}

export interface StatusBarManager {
  updateStatusBar(templateName?: string): void;
}

export interface WebviewManager {
  showRulesEditor(currentRules?: Rule[]): Promise<void>;
}

// Webview 消息类型
export interface WebviewMessage {
  command: "saveRules" | "previewRule" | "getRules" | "returnRules" | "showInfo";
  rule?: Rule;
  rules?: Rule[];
  message?: string;
}

// 配置类型
export interface CursorRulesConfig {
  "templates.path": string;
  "templates.autoLoad": boolean;
  defaultRules: string;
  statusBarEnabled: boolean;
}

// 错误类型
export class CursorRulesError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "CursorRulesError";
  }
}

// 错误代码枚举
export enum ErrorCode {
  NO_WORKSPACE = "NO_WORKSPACE",
  INVALID_RULES = "INVALID_RULES",
  TEMPLATE_NOT_FOUND = "TEMPLATE_NOT_FOUND",
  INVALID_PATH = "INVALID_PATH",
}

// 事件类型
export interface RuleChangeEvent {
  type: "add" | "update" | "delete" | "reorder";
  rule: Rule;
  previousPriority?: number;
}

// 模板类型枚举
export enum ProjectType {
  React = "react",
  Vue = "vue",
  Angular = "angular",
  NodeJS = "nodejs",
  Custom = "custom",
}

// 规则验证器类型
export interface RuleValidator {
  validatePattern(pattern: string): boolean;
  validateFlags(flags: string): boolean;
  validateColor(color: string): boolean;
  validatePriority(priority: number): boolean;
}

// 模板提供者接口
export interface TemplateProvider {
  getDefaultTemplates(): Template[];
  getCustomTemplates(): Promise<Template[]>;
  saveCustomTemplate(template: Template): Promise<void>;
  deleteCustomTemplate(templateName: string): Promise<void>;
}

// 规则转换器接口
export interface RuleTransformer {
  toVSCodeFormat(rule: Rule): vscode.DecorationRenderOptions;
  fromVSCodeFormat(decoration: vscode.DecorationRenderOptions): Rule;
}

// 状态类型
export interface CursorRulesState {
  activeTemplate?: Template;
  currentRules: Rule[];
  isEditing: boolean;
  isDirty: boolean;
}

// 命令处理器类型
export type CommandHandler = (...args: any[]) => Promise<void>;

// 命令注册表
export interface CommandRegistry {
  [key: string]: CommandHandler;
}
