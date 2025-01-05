(function() {
    const vscode = acquireVsCodeApi();
    let currentRules = [];

    // 处理来自扩展的消息
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'initializeRules':
                currentRules = message.rules;
                updateRulesList();
                break;
            case 'getRules':
                // 返回当前所有规则
                vscode.postMessage({
                    command: 'returnRules',
                    rules: currentRules
                });
                break;
        }
    });

    function updateRulesList() {
        const rulesList = document.querySelector('.rules-list');
        rulesList.innerHTML = currentRules.map((rule, index) => `
            <div class="rule-item" data-index="${index}">
                <div class="rule-pattern">${rule.pattern}</div>
                <div class="rule-color" style="background-color: ${rule.color}"></div>
                <div class="rule-priority">${rule.priority}</div>
            </div>
        `).join('');

        // 添加点击事件处理
        document.querySelectorAll('.rule-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                const rule = currentRules[index];
                document.getElementById('pattern').value = rule.pattern;
                document.getElementById('flags').value = rule.flags;
                document.getElementById('color').value = rule.color;
                document.getElementById('priority').value = rule.priority;
            });
        });
    }

    // 初始化代码...
    
    document.getElementById('saveRule').addEventListener('click', () => {
        const rule = {
            pattern: document.getElementById('pattern').value,
            flags: document.getElementById('flags').value,
            color: document.getElementById('color').value,
            priority: parseInt(document.getElementById('priority').value, 10)
        };

        // 添加或更新规则
        const existingIndex = currentRules.findIndex(r => r.pattern === rule.pattern);
        if (existingIndex >= 0) {
            currentRules[existingIndex] = rule;
        } else {
            currentRules.push(rule);
        }

        // 更新列表显示
        updateRulesList();

        // 保存所有规则
        vscode.postMessage({
            command: 'saveRules',
            rules: currentRules
        });
    });

    document.getElementById('previewRule').addEventListener('click', () => {
        const rule = {
            pattern: document.getElementById('pattern').value,
            flags: document.getElementById('flags').value,
            color: document.getElementById('color').value,
            priority: parseInt(document.getElementById('priority').value, 10)
        };

        vscode.postMessage({
            command: 'previewRule',
            rule
        });
    });
})(); 