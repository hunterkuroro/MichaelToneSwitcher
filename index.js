(function () {
    console.log('[MichaelToneSwitcher] init - final fallback approach');

    // 等頁面 DOM 就緒後嘗試插入 UI
    $(document).ready(() => {
        // 有些版本的設定頁容器是 #extensions_settings，也可能是 #extensionsMenu
        // 我們嘗試找看看
        const container = document.getElementById('extensions_settings') 
                       || document.getElementById('extensionsMenu');

        if (container) {
            const statusBox = document.createElement('div');
            statusBox.id = 'michaelToneStatus';
            statusBox.textContent = '目前人格：未偵測 (messageSent)';
            container.appendChild(statusBox);
            console.log('[MichaelToneSwitcher] UI 已插入 extensions_settings 容器');
        } else {
            console.warn('[MichaelToneSwitcher] 找不到 #extensions_settings 容器，UI 可能無法顯示');
        }
    });

    // 綁定舊事件：messageSent
    // SillyTavern 1.12.13 應該還有這個事件
    $(document).on('messageSent', function (event, message) {
        if (!message) return;
        const userMessage = message.trim();
        console.log(`[MichaelToneSwitcher] 使用者訊息: ${userMessage}`);

        // 取得 mainPrompt
        let prompt = getContext();
        let tone = '';

        // 關鍵字判斷
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

        // 寫回 mainPrompt
        setContext(prompt);

        // 更新 UI 狀態
        updateToneStatus(tone);
    });

    function activateTone(prompt, toneName) {
        const regex = new RegExp(`\\[${toneName}\\](.*?)\\[/${toneName}\\]`, 'gs');
        return prompt.replace(regex, (match, p1) => `[${toneName}]${p1.replace(/\(\(disabled\)\)\s*/g, '')}[/${toneName}]`);
    }

    function deactivateTone(prompt, toneNames) {
        toneNames.forEach(toneName => {
            const regex = new RegExp(`\\[${toneName}\\](.*?)\\[/${toneName}\\]`, 'gs');
            prompt = prompt.replace(regex, (match, p1) => `[${toneName}]((disabled)) ${p1.replace(/\(\(disabled\)\)\s*/g, '')}[/${toneName}]`);
        });
        return prompt;
    }

    function getContext() {
        return document.getElementById('mainPrompt')?.value ?? '';
    }

    function setContext(updatedPrompt) {
        const mainPrompt = document.getElementById('mainPrompt');
        if (mainPrompt) {
            mainPrompt.value = updatedPrompt;
            mainPrompt.dispatchEvent(new Event('input'));
        }
    }

    function updateToneStatus(tone) {
        const box = document.getElementById('michaelToneStatus');
        if (box) {
            box.textContent = `目前人格：${tone} (messageSent)`;
        }
    }
})();
