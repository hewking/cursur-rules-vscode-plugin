# VSCode Cursor Rules Manager

VSCode 插件，用于管理和生成 .cursorrules 文件，支持多种项目类型的光标规则快速切换和配置。

## 功能特性

- 📝 预设多种项目类型的规则模板（React、Vue、Angular、Node.js）
- 🎨 可视化规则编辑器
- 🔄 实时规则预览
- 📊 拖拽排序规则优先级
- 🚀 状态栏快速切换规则
- 💾 自定义模板保存与管理

## 安装

1. 打开 VSCode
2. 按下 `Ctrl+P` / `Cmd+P`
3. 输入 `ext install cursor-rules-manager`
4. 点击安装

## 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/your-username/vscode-cursor-rules-manager.git

# 安装依赖
cd vscode-cursor-rules-manager
npm install

# 编译
npm run compile

# 运行测试
npm test
```

## 使用方法

### 1. 创建新规则

1. 打开命令面板 (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. 输入 `Cursor Rules: Create New Rules`
3. 在可视化编辑器中配置规则：
   - 输入正则表达式模式
   - 选择颜色
   - 设置优先级
4. 点击保存生成 `.cursorrules` 文件

### 2. 使用模板

1. 打开命令面板
2. 输入 `Cursor Rules: Load Template`
3. 从列表中选择预设模板
4. 根据需要修改规则
5. 保存应用

### 3. 保存自定义模板

1. 配置好当前规则
2. 打开命令面板
3. 输入 `Cursor Rules: Save as Template`
4. 输入模板名称和类型
5. 确认保存

### 4. 快速切换规则

方式一：通过状态栏
- 点击右下角的光标规则图标
- 从弹出菜单选择规则集

方式二：通过命令
1. 打开命令面板
2. 输入 `Cursor Rules: Switch Rules`
3. 选择目标规则集

## 配置选项

```json
{
  "cursorrules.templates.path": {
    "type": "string",
    "default": "",
    "description": "模板存储路径"
  },
  "cursorrules.templates.autoLoad": {
    "type": "boolean",
    "default": true,
    "description": "启动时自动加载模板"
  },
  "cursorrules.defaultRules": {
    "type": "string",
    "default": "",
    "description": "默认模板名称"
  },
  "cursorrules.statusBarEnabled": {
    "type": "boolean",
    "default": true,
    "description": "显示状态栏图标"
  }
}
```

## 规则文件格式

`.cursorrules` 文件格式示例：

```json
{
  "name": "React Components",
  "type": "react",
  "rules": [
    {
      "pattern": "function.*Component",
      "flags": "g",
      "color": "#ff0000",
      "priority": 1
    },
    {
      "pattern": "useState|useEffect",
      "flags": "g",
      "color": "#00ff00",
      "priority": 2
    }
  ]
}
```

## 常见问题

### 规则不生效？

1. 确认 `.cursorrules` 文件在工作区根目录
2. 检查规则语法是否正确
3. 重新加载 VSCode 窗口

### 模板无法加载？

1. 检查模板路径配置是否正确
2. 确认模板文件格式符合要求
3. 查看 VSCode 输出面板中的错误信息

## 调试

1. 按 `F5` 启动调试实例
2. 在调试控制台查看日志
3. 使用 VSCode 的开发者工具检查 Webview

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

## 更新日志

### [1.0.0] - 2024-XX-XX
- 初始版本发布
- 基础规则管理功能
- 预设模板支持
- 可视化编辑器

### [1.1.0] - 计划中
- 高级编辑器功能
- 规则导入导出
- 社区模板分享

## 联系方式

- 问题反馈：[GitHub Issues](https://github.com/your-username/vscode-cursor-rules-manager/issues)
- 邮件：your-email@example.com

## 致谢

- VSCode Extension API
- 所有贡献者 