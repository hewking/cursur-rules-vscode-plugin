import * as vscode from "vscode";
import { Rule, WebviewMessage } from "../types";
import { getNonce } from "../utils";

export class WebviewManager {
  private context: vscode.ExtensionContext;
  private panel: vscode.WebviewPanel | undefined;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  async showRulesEditor(currentRules?: Rule[]) {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      "cursorRulesEditor",
      "Cursor Rules Editor",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this.context.extensionUri, "media"),
        ],
      }
    );

    this.panel.webview.html = this.getWebviewContent();
    this.setupMessageHandling();

    // 初始化编辑器内容
    if (currentRules?.length) {
      this.panel.webview.postMessage({
        command: 'initializeRules',
        rules: currentRules
      });
    }

    // 处理面板关闭事件
    this.panel.onDidDispose(
      () => {
        this.panel = undefined;
      },
      null,
      this.context.subscriptions
    );
  }

  private setupMessageHandling() {
    if (!this.panel) {
      return;
    }

    this.panel.webview.onDidReceiveMessage(
      async (message: WebviewMessage) => {
        switch (message.command) {
          case "saveRules":
            try {
              // 获取当前所有规则
              const allRules = await this.getAllRulesFromWebview();
              // 保存到文件
              await vscode.commands.executeCommand(
                'cursorrules.saveRulesToFile',
                allRules
              );
              vscode.window.showInformationMessage("Rules saved successfully");
            } catch (error) {
              vscode.window.showErrorMessage(
                `Failed to save rules: ${error instanceof Error ? error.message : 'Unknown error'}`
              );
            }
            break;
          case "previewRule":
            // 处理规则预览
            break;
        }
      },
      undefined,
      this.context.subscriptions
    );
  }

  private async getAllRulesFromWebview(): Promise<Rule[]> {
    return new Promise((resolve) => {
      this.panel?.webview.postMessage({ command: 'getRules' });
      
      const messageListener = this.panel?.webview.onDidReceiveMessage(
        (message: { command: string; rules: Rule[] }) => {
          if (message.command === 'returnRules') {
            messageListener?.dispose();
            resolve(message.rules);
          }
        }
      );
    });
  }

  private getWebviewContent() {
    const nonce = getNonce();

    // 获取 webview 的本地资源路径
    const styleUri = this.panel!.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "styles.css")
    );
    const scriptUri = this.panel!.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "main.js")
    );

    return `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${
                      this.panel!.webview.cspSource
                    } 'unsafe-inline'; script-src 'nonce-${nonce}';">
                    <title>Cursor Rules Editor</title>
                    <link href="${styleUri}" rel="stylesheet">
                </head>
                <body>
                    <div class="container">
                        <div class="rules-list">
                            <!-- 规则列表将通过 JavaScript 动态生成 -->
                        </div>
                        <div class="rule-editor">
                            <h2>Edit Rule</h2>
                            <div class="form-group">
                                <label for="pattern">Pattern:</label>
                                <input type="text" id="pattern" />
                            </div>
                            <div class="form-group">
                                <label for="flags">Flags:</label>
                                <input type="text" id="flags" />
                            </div>
                            <div class="form-group">
                                <label for="color">Color:</label>
                                <input type="color" id="color" />
                            </div>
                            <div class="form-group">
                                <label for="priority">Priority:</label>
                                <input type="number" id="priority" min="1" />
                            </div>
                            <div class="buttons">
                                <button id="saveRule">Save Rule</button>
                                <button id="previewRule">Preview</button>
                            </div>
                        </div>
                    </div>
                    <script nonce="${nonce}" src="${scriptUri}"></script>
                </body>
            </html>
        `;
  }
}
