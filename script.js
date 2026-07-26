const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const algorithm = document.getElementById('algorithm');
const secretKey = document.getElementById('secretKey');
const btnEncrypt = document.getElementById('btnEncrypt');
const btnDecrypt = document.getElementById('btnDecrypt');
const btnPaste = document.getElementById('btnPaste');
const btnCopy = document.getElementById('btnCopy');
const btnClear = document.getElementById('btnClear');
const btnSwap = document.getElementById('btnSwap');
const toggleKey = document.getElementById('toggleKey');
const charCount = document.getElementById('charCount');

function processCrypto(isEncrypting) {
    const text = inputText.value.trim();
    const key = secretKey.value;
    const algo = algorithm.value;

    if (!text || !key) {
        outputText.value = "Error: Input Data and Secret Key are required.";
        return;
    }

    try {
        if (isEncrypting) {
            const encrypted = CryptoJS[algo].encrypt(text, key).toString();
            outputText.value = encrypted;
        } else {
            const decrypted = CryptoJS[algo].decrypt(text, key);
            const originalText = decrypted.toString(CryptoJS.enc.Utf8);
            if (!originalText) throw new Error("Invalid sequence");
            outputText.value = originalText;
        }
    } catch (error) {
        outputText.value = "Error: Decryption failed. Invalid cipher payload, incorrect key, or wrong algorithm.";
    }
}

btnEncrypt.addEventListener('click', () => processCrypto(true));
btnDecrypt.addEventListener('click', () => processCrypto(false));

btnPaste.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        inputText.value = text;
        
        const originalHtml = btnPaste.innerHTML;
        btnPaste.innerHTML = '<i class="fa-solid fa-check"></i> Pasted';
        setTimeout(() => btnPaste.innerHTML = originalHtml, 1500);
    } catch (err) {
        alert("Clipboard permission denied or unavailable.");
    }
});

btnCopy.addEventListener('click', async () => {
    if (!outputText.value || outputText.value.startsWith("Error:")) return;
    
    try {
        await navigator.clipboard.writeText(outputText.value);
        
        const originalHtml = btnCopy.innerHTML;
        btnCopy.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
        setTimeout(() => btnCopy.innerHTML = originalHtml, 1500);
    } catch (err) {
        alert("Failed to copy to clipboard.");
    }
});

// Dynamic Character Counter
inputText.addEventListener('input', () => {
    const len = inputText.value.length;
    charCount.textContent = `${len} char${len === 1 ? '' : 's'}`;
});

// Toggle Secret Key Visibility
toggleKey.addEventListener('click', () => {
    const isPassword = secretKey.type === 'password';
    secretKey.type = isPassword ? 'text' : 'password';
    toggleKey.innerHTML = isPassword ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
});

// Clear Text Areas
btnClear.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
    charCount.textContent = '0 chars';
});

// Move Output Payload to Input Area
btnSwap.addEventListener('click', () => {
    if (!outputText.value || outputText.value.startsWith("Error:")) return;
    inputText.value = outputText.value;
    outputText.value = '';
    charCount.textContent = `${inputText.value.length} chars`;
});