# VSCode Cursor Rules Manager 产品需求文档

## 1. 产品概述

一个用于管理和生成 .cursorrules 文件的 VSCode 插件，帮助开发者在不同项目类型中快速配置和切换光标规则。

## 2. 核心功能

### 2.1 规则模板管理

- 预设常用项目类型的规则模板（React、Vue、Angular、Node.js 等）
- 支持自定义模板创建和保存
- 模板分类管理

### 2.2 规则配置界面

- 通过 VSCode Webview 提供可视化配置界面
- 支持拖拽排序规则优先级
- 实时预览规则效果

### 2.3 快捷操作

- 命令面板集成（Command Palette）
- 右键菜单集成
- 状态栏快捷切换当前规则集

## 3. 功能详细说明

### 3.1 命令列表

- `cursorrules.createNew`: 创建新规则文件
- `cursorrules.loadTemplate`: 加载模板
- `cursorrules.saveAsTemplate`: 保存当前规则为模板
- `cursorrules.switchRules`: 切换规则集

### 3.2 配置项

```json
{
  "cursorrules.templates": {
    "path": "string",
    "autoLoad": "boolean"
  },
  "cursorrules.defaultRules": "string",
  "cursorrules.statusBarEnabled": "boolean"
}
```

### 3.3 规则模板格式

```json
{
  "name": "Template Name",
  "type": "project-type",
  "rules": [
    {
      "pattern": "string",
      "flags": "string",
      "color": "string",
      "priority": "number"
    }
  ]
}
```

## 4. 用户界面

### 4.1 主要视图

- 模板列表视图
- 规则编辑器视图
- 快速预览视图

### 4.2 交互流程

1. 用户打开项目
2. 通过命令面板或右键菜单启动插件
3. 选择/创建规则模板
4. 配置具体规则
5. 保存生成 .cursorrules 文件

## 5. 技术要求

### 5.1 开发环境

- VSCode Extension API
- TypeScript
- Webview API

### 5.2 性能要求

- 规则切换响应时间 < 100ms
- 模板加载时间 < 500ms
- 内存占用 < 50MB

## 6. 发布计划

### 6.1 v1.0

- 基础规则管理
- 预设模板
- 简单配置界面

### 6.2 v1.1

- 高级编辑器
- 规则导入导出
- 社区模板分享

### 6.3 v1.2

- 项目类型自动识别
- 智能规则推荐
- 多工作区支持

## 7. 成功指标

- 插件商店评分 > 4.5
- 月活用户 > 1000
- 用户规则模板分享数 > 100

这个 PRD 涵盖了插件的主要功能和开发要求。需要我详细展开某个部分吗？
