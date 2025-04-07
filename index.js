(function () {
    console.log('[MichaelToneSwitcher] 初始化開始');

    // 取得 SillyTavern 的上下文
    const context = SillyTavern.getContext();

    // 等待 DOM 就緒後，嘗試插入 UI
    $(document).ready(() => {
        // 優先找 extensions_settings，找不到就用 extensionsMenu
        const container = document.getElementById('extensions_settings') || document.getElementById('extensionsMenu');
        if (container) {
            const statusBox = document.createElement('div');
            statusBox.id = 'michaelToneStatus';
            statusBox.textContent = '目前人格：未偵測';
            container.appendChild(statusBox);
            console.log('[MichaelToneSwitcher] UI 插入成功');
        } else {
            console.warn('[MichaelToneSwitcher] 無法找到 UI 容器');
        }
    });

    // 嘗試用 context.eventSource.makeLast() 綁定 MESSAGE_SENT 事件
    if (context.eventSource && context.eventTypes && context.eventTypes.MESSAGE_SENT) {
        context.eventSource.makeLast(context.eventTypes.MESSAGE_SENT, (data) => {
            const userMessage = data.message?.trim?.();
            if (!userMessage) return;
            console.log(`[MichaelToneSwitcher] 使用者訊息: ${userMessage}`);
            processUserMessage(userMessage);
        });
    } else {
        console.error('[MichaelToneSwitcher] 無法取得 MESSAGE_SENT 事件，使用 fallback 方式');
        // fallback 方式：使用舊的 $(document).on('messageSent')
        $(document).on('messageSent', (event, message) => {
            if (!message) return;
            const userMessage = message.trim();
            console.log(`[MichaelToneSwitcher] 使用者訊息 (fallback): ${userMessage}`);
            processUserMessage(userMessage);
        });
    }

    // 處理訊息，依據關鍵字判斷並更新提示詞與 UI 狀態
    function processUserMessage(userMessage) {
        let prompt = getContext();
        let tone = '';

        if (/想你|抱抱|好累|想撒嬌|奶油泡芙/.test(userMessage)) {
            prompt = activateTone(prompt, '輕鬆日常');
            prompt = deactivateTone(prompt, ['支配向', '心理壓迫']);
            tone = '輕鬆日常';
        } else if (/不要停|弄我|再快點|想被你操|舒服|想要|求你/.test(userMessage)) {
            prompt = activateTone(prompt, '支配向');
            prompt = deactivateTone(prompt, ['輕鬆日常', '心理壓迫']);
            tone = '支配向';
        } else if (/怕|害怕|不要這樣|錯了|對不起/.test(userMessage)) {
            prompt = activateTone(prompt, '心理壓迫');
            prompt = deactivateTone(prompt, ['輕鬆日常', '支配向']);
            tone = '心理壓迫';
        } else {
            prompt = activateTone(prompt, '輕鬆日常');
            prompt = deactivateTone(prompt, ['支配向', '心理壓迫']);
            tone = '輕鬆日常';
        }
        setContext(prompt);
        updateToneStatus(tone);
    }

    // 輔助函數：啟用指定語氣（移除 ((disabled)) 標記）
    function activateTone(prompt, toneName) {
        const regex = new RegExp(`\\[${toneName}\\](.*?)\\[/${toneName}\\]`, 'gs');
        return prompt.replace(regex, (match, p1) => `[${toneName}]${p1.replace(/\(\(disabled\)\)\s*/g, '')}[/${toneName}]`);
    }

    // 輔助函數：停用指定語氣（加上 ((disabled)) 標記）
    function deactivateTone(prompt, toneNames) {
        toneNames.forEach(toneName => {
            const regex = new RegExp(`\\[${toneName}\\](.*?)\\[/${toneName}\\]`, 'gs');
            prompt = prompt.replace(regex, (match, p1) => `[${toneName}]((disabled)) ${p1.replace(/\(\(disabled\)\)\s*/g, '')}[/${toneName}]`);
        });
        return prompt;
    }

    // 取得主提示詞內容
    function getContext() {
        return document.getElementById('mainPrompt')?.value ?? '';
    }

    // 更新主提示詞內容
    function setContext(updatedPrompt) {
        const mainPrompt = document.getElementById('mainPrompt');
        if (mainPrompt) {
            mainPrompt.value = updatedPrompt;
            mainPrompt.dispatchEvent(new Event('input'));
        }
    }

    // 更新 UI 狀態顯示目前語氣
    function updateToneStatus(tone) {
        const box = document.getElementById('michaelToneStatus');
        if (box) {
            box.textContent = `目前人格：${tone}`;
        }
    }
})();
