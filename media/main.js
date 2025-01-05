(function() {
    const vscode = acquireVsCodeApi();
    let currentRules = [];
    let selectedRuleIndex = -1;

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
                <div class="rule-content">
                    <div class="rule-name">${rule.name}</div>
                    <div class="rule-type">${rule.type}</div>
                    <div class="rule-text">${rule.content}</div>
                </div>
                <button class="delete-btn" data-index="${index}">×</button>
            </div>
        `).join('');

        // 添加点击事件处理
        document.querySelectorAll('.rule-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // 如果点击的是删除按钮，不执行选择操作
                if (e.target.classList.contains('delete-btn')) {
                    return;
                }

                const index = parseInt(item.dataset.index);
                selectedRuleIndex = index;
                const rule = currentRules[index];
                
                document.getElementById('name').value = rule.name;
                document.getElementById('type').value = rule.type;
                document.getElementById('content').value = rule.content;
                
                // 显示删除按钮
                document.getElementById('deleteRule').style.display = 'inline-block';
            });
        });

        // 添加删除按钮事件
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                deleteRule(index);
            });
        });
    }

    function deleteRule(index) {
        if (index >= 0 && index < currentRules.length) {
            const ruleName = currentRules[index].name;
            currentRules.splice(index, selectedRuleIndex);
            updateRulesList();
            
            // 清空编辑器
            if (selectedRuleIndex === index) {
                clearEditor();
            }

            // 保存更改
            vscode.postMessage({
                command: 'saveRules',
                rules: currentRules
            });

            // 通知删除成功
            vscode.postMessage({
                command: 'showInfo',
                message: `Rule "${ruleName}" deleted successfully`
            });
        }
    }

    function clearEditor() {
        document.getElementById('name').value = '';
        document.getElementById('type').value = '';
        document.getElementById('content').value = '';
        document.getElementById('deleteRule').style.display = 'none';
        selectedRuleIndex = -1;
    }

    // 添加删除按钮事件监听
    document.getElementById('deleteRule').addEventListener('click', () => {
        if (selectedRuleIndex >= 0) {
            deleteRule(selectedRuleIndex);
        }
    });

    // 初始化代码...
    
    document.getElementById('saveRule').addEventListener('click', () => {
        const rule = {
            name: document.getElementById('name').value,
            type: document.getElementById('type').value,
            content: document.getElementById('content').value
        };

        // 添加或更新规则
        const existingIndex = currentRules.findIndex(r => r.name === rule.name);
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