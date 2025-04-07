import { eventSource, event_types } from '../../../../script.js'; 
//  ↑ 這裡路徑請對應你自己檔案所在層級。Objective 就是用這種 import 方式抓 script.js 內的 eventSource

(function () {
    console.log('[MichaelToneSwitcher] init - based on Objective plugin approach');

    // 1. 在 DOM 準備好後插入 UI
    jQuery(() => {
        const container = document.getElementById('extensions_settings') || document.getElementById('extensionsMenu');
        if (container) {
            const statusBox = document.createElement('div');
            statusBox.id = 'michaelToneStatus';
            statusBox.textContent = '目前人格：未偵測 (MESSAGE_RECEIVED)';
            container.appendChild(statusBox);
            console.log('[MichaelToneSwitcher] 已插入 UI');
        } else {
            console.warn('[MichaelToneSwitcher] 找不到 #extensions_settings 或 #extensionsMenu');
        }
    });

    // 2. 監聽 MESSAGE_RECEIVED 事件（Objective 用的就是這個）
    if (eventSource && event_types && event_types.MESSAGE_RECEIVED) {
        eventSource.on(event_types.MESSAGE_RECEIVED, (data) => {
            // data 通常會有 data.message, data.role 等欄位
            const userMessage = data?.message?.trim?.();
            if (!userMessage) return;

            console.log(`[MichaelToneSwitcher] 使用者訊息: ${userMessage}`);
            processUserMessage(userMessage);
        });
    } else {
        console.error('[MichaelToneSwitcher] 無法取得 event_types.MESSAGE_RECEIVED，請確認 SillyTavern 版本或路徑');
    }

    // 核心邏輯：判斷關鍵字，切換提示詞
    function processUserMessage(userMessage) {
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
            // 什麼關鍵字都沒中 → 預設改回「輕鬆日常」
            prompt = activateTone(prompt, '輕鬆日常');
            prompt = deactivateTone(prompt, ['支配向', '心理壓迫']);
            tone = '輕鬆日常';
        }

        setContext(prompt);
        updateToneStatus(tone);
    }

    // 啟用指定語氣：移除 ((disabled)) 標記
    function activateTone(prompt, toneName) {
        const regex = new RegExp(`\\[${toneName}\\](.*?)\\[/${toneName}\\]`, 'gs');
        return prompt.replace(regex, (match, p1) => `[${toneName}]${p1.replace(/\(\(disabled\)\)\s*/g, '')}[/${toneName}]`);
    }

    // 停用指定語氣：加上 ((disabled)) 標記
    function deactivateTone(prompt, toneNames) {
        toneNames.forEach(toneName => {
            const regex = new RegExp(`\\[${toneName}\\](.*?)\\[/${toneName}\\]`, 'gs');
            prompt = prompt.replace(regex, (match, p1) => `[${toneName}]((disabled)) ${p1.replace(/\(\(disabled\)\)\s*/g, '')}[/${toneName}]`);
        });
        return prompt;
    }

    // 取得主提示詞
    function getContext() {
        return document.getElementById('mainPrompt')?.value ?? '';
    }

    // 更新主提示詞
    function setContext(updatedPrompt) {
        const mainPrompt = document.getElementById('mainPrompt');
        if (mainPrompt) {
            mainPrompt.value = updatedPrompt;
            mainPrompt.dispatchEvent(new Event('input'));
        }
    }

    // 更新 UI 顯示
    function updateToneStatus(tone) {
        const box = document.getElementById('michaelToneStatus');
        if (box) {
            box.textContent = `目前人格：${tone} (MESSAGE_RECEIVED)`;
        }
    }
})();
