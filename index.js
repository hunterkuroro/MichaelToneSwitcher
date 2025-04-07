(function () {
    console.log('[MichaelToneSwitcher] 正在初始化（No Import 版）');

    window.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('extensions_settings');
        if (container) {
            const statusBox = document.createElement('div');
            statusBox.id = 'michaelToneStatus';
            statusBox.textContent = '目前人格：未偵測';
            container.appendChild(statusBox);
        }
    });

    const eventSource = window.eventSource;
    const event_types = window.event_types;

    if (!eventSource || !event_types) {
        console.error('[MichaelToneSwitcher] 無法取得事件來源，模組無效');
        return;
    }

    eventSource.on(event_types.MESSAGE_SENT, (data) => {
        const userMessage = data.message?.trim?.();
        if (!userMessage) return;

        console.log(`[MichaelToneSwitcher] 使用者訊息: ${userMessage}`);

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
    });

    function activateTone(prompt, toneName) {
        const regex = new RegExp(`\[${toneName}\](.*?)\[/${toneName}\]`, 'gs');
        return prompt.replace(regex, (match, p1) => `[${toneName}]${p1.replace(/\(\(disabled\)\)\s*/g, '')}[/${toneName}]`);
    }

    function deactivateTone(prompt, toneNames) {
        toneNames.forEach(toneName => {
            const regex = new RegExp(`\[${toneName}\](.*?)\[/${toneName}\]`, 'gs');
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
            box.textContent = `目前人格：${tone}`;
        }
    }
})();