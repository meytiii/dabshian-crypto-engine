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
const clockTime = document.getElementById('clockTime');
const clockDate = document.getElementById('clockDate');
const statEncrypted = document.getElementById('statEncrypted');
const statDecrypted = document.getElementById('statDecrypted');
const statTopAlgo = document.getElementById('statTopAlgo');
const copyrightYear = document.getElementById('copyrightYear');

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
            updateStats(text.length, 0, algo);
        } else {
            const decrypted = CryptoJS[algo].decrypt(text, key);
            const originalText = decrypted.toString(CryptoJS.enc.Utf8);
            if (!originalText) throw new Error("Invalid sequence");
            outputText.value = originalText;
            updateStats(0, originalText.length, algo);
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

inputText.addEventListener('input', () => {
    const len = inputText.value.length;
    charCount.textContent = `${len} char${len === 1 ? '' : 's'}`;
});

toggleKey.addEventListener('click', () => {
    const isPassword = secretKey.type === 'password';
    secretKey.type = isPassword ? 'text' : 'password';
    toggleKey.innerHTML = isPassword ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
});

btnClear.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
    charCount.textContent = '0 chars';
});

btnSwap.addEventListener('click', () => {
    if (!outputText.value || outputText.value.startsWith("Error:")) return;
    inputText.value = outputText.value;
    outputText.value = '';
    charCount.textContent = `${inputText.value.length} chars`;
});

// Live Clock & Date
function updateClock() {
    const now = new Date();
    
    const timeOptions = { timeZone: 'Asia/Tehran', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const dateOptions = { timeZone: 'Asia/Tehran', month: 'short', day: 'numeric', year: 'numeric' };
    
    clockTime.textContent = now.toLocaleTimeString('en-US', timeOptions);
    clockDate.textContent = now.toLocaleDateString('en-US', dateOptions);
}
setInterval(updateClock, 1000);
updateClock();

copyrightYear.textContent = new Date().getFullYear();

let stats = JSON.parse(localStorage.getItem('dabshian_crypto_stats')) || {
    encrypted: 0,
    decrypted: 0,
    algos: {}
};

function renderStats() {
    statEncrypted.textContent = stats.encrypted.toLocaleString();
    statDecrypted.textContent = stats.decrypted.toLocaleString();
    
    let topAlgo = 'N/A';
    let max = 0;
    for (const [algo, count] of Object.entries(stats.algos)) {
        if (count > max) {
            max = count;
            topAlgo = algo;
        }
    }
    statTopAlgo.textContent = topAlgo;
}

function updateStats(encCount, decCount, algo) {
    stats.encrypted += encCount;
    stats.decrypted += decCount;
    stats.algos[algo] = (stats.algos[algo] || 0) + 1;
    
    localStorage.setItem('dabshian_crypto_stats', JSON.stringify(stats));
    renderStats();
}

renderStats();