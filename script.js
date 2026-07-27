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
        let finalResult = "";
        if (isEncrypting) {
            finalResult = CryptoJS[algo].encrypt(text, key).toString();
            updateStats(text.length, 0, algo);
        } else {
            const decrypted = CryptoJS[algo].decrypt(text, key);
            finalResult = decrypted.toString(CryptoJS.enc.Utf8);
            if (!finalResult) throw new Error("Invalid sequence");
            updateStats(0, finalResult.length, algo);
        }
        animateScramble(finalResult, outputText);
    } catch (error) {
        outputText.value = "Error: Decryption failed. Invalid cipher payload, incorrect key, or wrong algorithm.";
    }
}

function handleProcessing(button, isEncrypting) {
    playSound('click');
    button.classList.add('loading');
    
    setTimeout(() => {
        processCrypto(isEncrypting);
        button.classList.remove('loading');
        playSound('success');
    }, 600);
}

btnEncrypt.addEventListener('click', function() { handleProcessing(this, true); });
btnDecrypt.addEventListener('click', function() { handleProcessing(this, false); });

const toastContainer = document.getElementById('toastContainer');

function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.innerHTML = `<i class="fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i> ${message}`;
    
    toastContainer.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

btnPaste.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (!text) throw new Error("Clipboard is empty");
        inputText.value = text;
        
        const originalHtml = btnPaste.innerHTML;
        btnPaste.innerHTML = '<i class="fa-solid fa-check"></i> Pasted';
        showToast("Payload pasted from clipboard");
        setTimeout(() => btnPaste.innerHTML = originalHtml, 1500);
    } catch (err) {
        showToast("Clipboard permission denied or empty.", true);
    }
});

btnCopy.addEventListener('click', async () => {
    if (!outputText.value || outputText.value.startsWith("Error:")) return;
    
    try {
        await navigator.clipboard.writeText(outputText.value);
        
        const originalHtml = btnCopy.innerHTML;
        btnCopy.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
        showToast("Payload copied to clipboard");
        setTimeout(() => btnCopy.innerHTML = originalHtml, 1500);
    } catch (err) {
        showToast("Failed to copy to clipboard.", true);
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

function updateClock() {
    const now = new Date();
    
    now.setTime(now.getTime() + (60 * 60 * 1000));
    
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

function animateScramble(finalText, element) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const iterations = 15;
    let currentIteration = 0;
    
    const interval = setInterval(() => {
        let scrambled = "";
        for (let i = 0; i < finalText.length; i++) {
            if (i < (currentIteration / iterations) * finalText.length) {
                scrambled += finalText[i];
            } else {
                scrambled += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        element.value = scrambled;
        
        currentIteration++;
        if (currentIteration > iterations) {
            clearInterval(interval);
            element.value = finalText;
        }
    }, 30);
}

particlesJS("particles-js", {
    particles: {
        number: { value: 60, density: { enable: true, value_area: 800 } },
        color: { value: "#6366f1" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: false },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: "#ec4899", opacity: 0.4, width: 1 },
        move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out", bounce: false }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: { enable: true, mode: "grab" },
            onclick: { enable: true, mode: "push" },
            resize: true
        },
        modes: {
            grab: { distance: 140, line_linked: { opacity: 1 } },
            push: { particles_nb: 4 }
        }
    },
    retina_detect: true
});

const glassPanel = document.getElementById('glassPanel');

glassPanel.addEventListener('mousemove', (e) => {
    const rect = glassPanel.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    glassPanel.style.setProperty('--mouse-x', `${x}px`);
    glassPanel.style.setProperty('--mouse-y', `${y}px`);
});

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'click') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'success') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2);
    }
}

// Phase 3: Live Input Validation
secretKey.addEventListener('input', () => {
    const val = secretKey.value;
    if (val.length === 0) {
        secretKey.classList.remove('valid-key', 'invalid-key');
    } else if (val.length >= 8 && /[0-9]/.test(val) && /[^a-zA-Z0-9]/.test(val)) {
        secretKey.classList.add('valid-key');
        secretKey.classList.remove('invalid-key');
    } else {
        secretKey.classList.add('invalid-key');
        secretKey.classList.remove('valid-key');
    }
});