const MichaelToneSwitcher = {
    name: 'MichaelToneSwitcher',
    init: function () {
        console.log('[MichaelToneSwitcher] 已啟動');

        $(document).on('messageSent', async function (event, message) {
            const userMessage = message.trim();

            console.log(`[MichaelToneSwitcher] 使用者訊息: ${userMessage}`);

            let prompt = getContext();

            if (/想你|抱抱|好累|想撒嬌|奶油泡芙/.test(userMessage)) {
                prompt = activateTone(prompt, '輕鬆日常');
                prompt = deactivateTone(prompt, ['支配向', '心理壓迫']);
            } else if (/不要停|弄我|再快點|想被你操|舒服|想要|求你/.test(userMessage)) {
                prompt = activateTone(prompt, '支配向');
                prompt = deactivateTone(prompt, ['輕鬆日常', '心理壓迫']);
            } else if (/怕|害怕|不要這樣|錯了|對不起/.test(userMessage)) {
                prompt = activateTone(prompt, '心理壓迫');
                prompt = deactivateTone(prompt, ['輕鬆日常', '支配向']);
            } else {
                prompt = activateTone(prompt, '輕鬆日常');
                prompt = deactivateTone(prompt, ['支配向', '心理壓迫']);
            }

            setContext(prompt);
        });

        toastr.success('MichaelToneSwitcher模組已成功啟動！');
    }
};

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
    return $('#mainPrompt').val();
}

function setContext(updatedPrompt) {
    $('#mainPrompt').val(updatedPrompt).trigger('input');
}

window.Extensions.register(MichaelToneSwitcher);