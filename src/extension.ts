import * as vscode from 'vscode';
import { RulesManager } from './rules/RulesManager';
import { StatusBarManager } from './ui/StatusBarManager';
import { WebviewManager } from './ui/WebviewManager';
import { CommandManager } from './commands/CommandManager';

export function activate(context: vscode.ExtensionContext) {
    console.log('Cursor Rules Manager is now active!');
    console.log('Extension path:', context.extensionPath);

    // 初始化核心管理器
    const rulesManager = new RulesManager(context);
    const statusBar = new StatusBarManager(context);
    const webview = new WebviewManager(context);
    const commandManager = new CommandManager(context, {
        rulesManager,
        statusBar,
        webview
    });

    // 注册命令
    commandManager.registerCommands();
}

export function deactivate() {} 