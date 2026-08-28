/**
 * Dabshian Crypto Engine - Core Script
 * Professional Client-Side Cryptographic Interface
 */

// DOM Elements
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const algorithm = document.getElementById('algorithm');
const algoBadge = document.getElementById('algoBadge');
const secretKey = document.getElementById('secretKey');
const keyStrengthText = document.getElementById('keyStrengthText');
const strengthMeterBar = document.getElementById('strengthMeterBar');
const btnGenerateKey = document.getElementById('btnGenerateKey');
const toggleKey = document.getElementById('toggleKey');
const btnEncrypt = document.getElementById('btnEncrypt');
const btnDecrypt = document.getElementById('btnDecrypt');
const btnPaste = document.getElementById('btnPaste');
const btnSample = document.getElementById('btnSample');
const btnClear = document.getElementById('btnClear');
const btnSwap = document.getElementById('btnSwap');
const btnCopy = document.getElementById('btnCopy');
const btnDownload = document.getElementById('btnDownload');
const charCount = document.getElementById('charCount');
const byteCount = document.getElementById('byteCount');
const clockTime = document.getElementById('clockTime');
const clockDate = document.getElementById('clockDate');
const statEncrypted = document.getElementById('statEncrypted');
const statDecrypted = document.getElementById('statDecrypted');
const statTopAlgo = document.getElementById('statTopAlgo');
const outputStatus = document.getElementById('outputStatus');
const toastContainer = document.getElementById('toastContainer');
const glassPanel = document.getElementById('glassPanel');
const textareaWrapper = document.querySelector('.textarea-wrapper');
const copyrightYear = document.getElementById('copyrightYear');

// Algorithm Badges Mapping
const ALGO_CONFIG = {
    AES: { badge: 'AES-256 CBC', desc: 'Military Grade Block Cipher' },
    TripleDES: { badge: '3DES 168-bit', desc: 'Triple Data Encryption' },
    Rabbit: { badge: 'Rabbit Stream', desc: '128-bit Fast Stream Cipher' },
    RC4: { badge: 'RC4 Stream', desc: 'High-speed Stream Cipher' },
    DES: { badge: 'DES 56-bit', desc: 'Legacy Standard Cipher' }
};

// Sample Payloads for Instant Testing
const SAMPLES = [
    "Secure communication protocol established. Payload verified and ready for end-to-end encryption across distributed nodes.",
    "System security matrix: Zero-knowledge client-side encryption initialized. Timestamp: " + new Date().toISOString(),
    "Confidential Transmission: Top-secret operational data with 256-bit entropy safeguard."
];

// Web Audio API Synthesis Engine
let audioCtx = null;
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSound(type) {
    try {
        initAudio();
        const now = audioCtx.currentTime;
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (type === 'click') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.exponentialRampToValueAtTime(350, now + 0.06);
            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
            oscillator.start(now);
            oscillator.stop(now + 0.06);
        } else if (type === 'success') {
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(523.25, now); // C5
            oscillator.frequency.setValueAtTime(659.25, now + 0.08); // E5
            oscillator.frequency.setValueAtTime(783.99, now + 0.16); // G5
            gainNode.gain.setValueAtTime(0.07, now);
            gainNode.gain.linearRampToValueAtTime(0.001, now + 0.28);
            oscillator.start(now);
            oscillator.stop(now + 0.28);
        } else if (type === 'error') {
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(220, now);
            oscillator.frequency.exponentialRampToValueAtTime(110, now + 0.18);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            oscillator.start(now);
            oscillator.stop(now + 0.18);
        } else if (type === 'swish') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(300, now);
            oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
            gainNode.gain.setValueAtTime(0.04, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            oscillator.start(now);
            oscillator.stop(now + 0.12);
        }
    } catch (e) {
        // Fallback silently if audio context is blocked
    }
}

// Toast Notification Engine
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.innerHTML = `
        <i class="fa-solid ${isError ? 'fa-triangle-exclamation' : 'fa-circle-check'}" aria-hidden="true"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 350);
    }, 3200);
}

// Dynamic Auto-Expanding Textarea Engine
function autoResize(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
}

// Update Text Counters (Characters & Byte Size)
function updateCounters() {
    const text = inputText.value;
    const len = text.length;
    const bytes = new Blob([text]).size;
    
    charCount.textContent = `${len.toLocaleString()} char${len === 1 ? '' : 's'}`;
    byteCount.textContent = `(${formatBytes(bytes)})`;
    autoResize(inputText);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 bytes';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Algorithm Selector Change Listener
algorithm.addEventListener('change', () => {
    const algo = algorithm.value;
    if (ALGO_CONFIG[algo] && algoBadge) {
        algoBadge.textContent = ALGO_CONFIG[algo].badge;
    }
    playSound('click');
});

// Calculate Password Entropy & Strength
function assessKeyStrength(key) {
    if (!key || key.length === 0) {
        keyStrengthText.textContent = 'Awaiting key';
        keyStrengthText.style.color = 'var(--text-dim)';
        strengthMeterBar.className = 'strength-meter-bar';
        return;
    }

    let score = 0;
    if (key.length >= 8) score++;
    if (key.length >= 14) score++;
    if (/[A-Z]/.test(key) && /[a-z]/.test(key)) score++;
    if (/[0-9]/.test(key)) score++;
    if (/[^A-Za-z0-9]/.test(key)) score++;

    strengthMeterBar.className = 'strength-meter-bar';

    if (score <= 1) {
        keyStrengthText.textContent = 'Weak Key (Vulnerable)';
        keyStrengthText.style.color = 'var(--primary-rose)';
        strengthMeterBar.classList.add('weak');
    } else if (score === 2 || score === 3) {
        keyStrengthText.textContent = 'Fair Key';
        keyStrengthText.style.color = 'var(--accent-amber)';
        strengthMeterBar.classList.add('fair');
    } else if (score === 4) {
        keyStrengthText.textContent = 'Good Strength';
        keyStrengthText.style.color = '#38bdf8';
        strengthMeterBar.classList.add('good');
    } else {
        keyStrengthText.textContent = 'Cryptographic Grade';
        keyStrengthText.style.color = 'var(--accent-emerald)';
        strengthMeterBar.classList.add('strong');
    }
}

secretKey.addEventListener('input', () => {
    assessKeyStrength(secretKey.value);
});

// CSPRNG Secure Key Generator (True Randomness)
btnGenerateKey.addEventListener('click', () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~|}{[]:;?><,./-=';
    const keyLength = 18;
    const randomBuffer = new Uint8Array(keyLength);
    window.crypto.getRandomValues(randomBuffer);
    
    let generatedKey = '';
    for (let i = 0; i < keyLength; i++) {
        generatedKey += charset[randomBuffer[i] % charset.length];
    }
    
    secretKey.type = 'text';
    toggleKey.innerHTML = '<i class="fa-solid fa-eye-slash" aria-hidden="true"></i>';
    secretKey.value = generatedKey;
    assessKeyStrength(generatedKey);
    
    playSound('swish');
    showToast("Cryptographic 18-char key generated");
});

// Toggle Key Visibility
toggleKey.addEventListener('click', () => {
    const isPassword = secretKey.type === 'password';
    secretKey.type = isPassword ? 'text' : 'password';
    toggleKey.innerHTML = isPassword 
        ? '<i class="fa-solid fa-eye-slash" aria-hidden="true"></i>' 
        : '<i class="fa-solid fa-eye" aria-hidden="true"></i>';
    playSound('click');
});

// Primary Cryptographic Execution
function processCrypto(isEncrypting) {
    const text = inputText.value.trim();
    const key = secretKey.value;
    const algo = algorithm.value;

    if (!text) {
        outputText.value = "Error: Input Data payload cannot be empty.";
        outputStatus.textContent = "Error";
        outputStatus.className = "output-status-chip";
        autoResize(outputText);
        playSound('error');
        showToast("Please enter or paste input data.", true);
        return;
    }

    if (!key) {
        outputText.value = "Error: Secret Key is required for cryptographic operations.";
        outputStatus.textContent = "Error";
        outputStatus.className = "output-status-chip";
        autoResize(outputText);
        playSound('error');
        showToast("Secret key is missing.", true);
        secretKey.focus();
        return;
    }

    try {
        let finalResult = "";
        if (isEncrypting) {
            finalResult = CryptoJS[algo].encrypt(text, key).toString();
            updateStats(text.length, 0, algo);
            outputStatus.textContent = "Encrypted (" + algo + ")";
            outputStatus.className = "output-status-chip ready";
        } else {
            const decrypted = CryptoJS[algo].decrypt(text, key);
            finalResult = decrypted.toString(CryptoJS.enc.Utf8);
            if (!finalResult) {
                throw new Error("Invalid decryption key or corrupt payload");
            }
            updateStats(0, finalResult.length, algo);
            outputStatus.textContent = "Decrypted Plaintext";
            outputStatus.className = "output-status-chip ready";
        }
        
        animateScramble(finalResult, outputText);
        playSound('success');
        showToast(isEncrypting ? "Payload encrypted successfully" : "Payload decrypted successfully");
    } catch (error) {
        outputText.value = "Error: Decryption failed. Invalid cipher payload, incorrect key, or mismatched algorithm.";
        outputStatus.textContent = "Decryption Failed";
        outputStatus.className = "output-status-chip";
        autoResize(outputText);
        playSound('error');
        showToast("Decryption failed: check key and cipher payload", true);
    }
}

function handleProcessing(button, isEncrypting) {
    playSound('click');
    button.classList.add('loading');
    outputStatus.textContent = "Processing...";
    outputStatus.className = "output-status-chip active";
    
    setTimeout(() => {
        processCrypto(isEncrypting);
        button.classList.remove('loading');
    }, 450);
}

btnEncrypt.addEventListener('click', function() { handleProcessing(this, true); });
btnDecrypt.addEventListener('click', function() { handleProcessing(this, false); });

// Text Matrix Scramble Animation
function animateScramble(finalText, element) {
    const chars = 'ABCDEF0123456789$#@%!&*/<>{}[]';
    const iterations = Math.min(18, Math.max(8, Math.floor(finalText.length / 5)));
    let currentIteration = 0;
    
    const interval = setInterval(() => {
        let scrambled = "";
        for (let i = 0; i < finalText.length; i++) {
            if (i < (currentIteration / iterations) * finalText.length) {
                scrambled += finalText[i];
            } else if (finalText[i] === '\n' || finalText[i] === ' ') {
                scrambled += finalText[i];
            } else {
                scrambled += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        element.value = scrambled;
        autoResize(element);
        
        currentIteration++;
        if (currentIteration > iterations) {
            clearInterval(interval);
            element.value = finalText;
            autoResize(element);
        }
    }, 25);
}

// Sample Payload Loader
if (btnSample) {
    btnSample.addEventListener('click', () => {
        const randomSample = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
        inputText.value = randomSample;
        updateCounters();
        autoResize(inputText);
        playSound('click');
        showToast("Sample text payload loaded");
    });
}

// Paste Handler
btnPaste.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (!text) throw new Error("Clipboard is empty");
        inputText.value = text;
        updateCounters();
        autoResize(inputText);
        
        const originalHtml = btnPaste.innerHTML;
        btnPaste.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Pasted';
        playSound('click');
        showToast("Pasted from clipboard");
        setTimeout(() => btnPaste.innerHTML = originalHtml, 1500);
    } catch (err) {
        showToast("Clipboard access denied or empty.", true);
    }
});

// Copy Output Handler
btnCopy.addEventListener('click', async () => {
    if (!outputText.value || outputText.value.startsWith("Error:")) {
        showToast("No valid output to copy.", true);
        return;
    }
    
    try {
        await navigator.clipboard.writeText(outputText.value);
        const originalHtml = btnCopy.innerHTML;
        btnCopy.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Copied';
        playSound('click');
        showToast("Output copied to clipboard");
        setTimeout(() => btnCopy.innerHTML = originalHtml, 1500);
    } catch (err) {
        showToast("Failed to copy to clipboard.", true);
    }
});

// Clear All Handler
btnClear.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
    outputStatus.textContent = 'Idle';
    outputStatus.className = 'output-status-chip';
    updateCounters();
    autoResize(inputText);
    autoResize(outputText);
    playSound('click');
    showToast("Cleared input and output");
});

// Move Output to Input (Swap)
btnSwap.addEventListener('click', () => {
    if (!outputText.value || outputText.value.startsWith("Error:")) {
        showToast("No valid output to transfer.", true);
        return;
    }
    inputText.value = outputText.value;
    outputText.value = '';
    outputStatus.textContent = 'Idle';
    outputStatus.className = 'output-status-chip';
    updateCounters();
    autoResize(inputText);
    autoResize(outputText);
    playSound('swish');
    showToast("Payload moved to input");
});

// Download Output as .txt File
btnDownload.addEventListener('click', () => {
    const text = outputText.value;
    if (!text || text.startsWith("Error:")) {
        showToast("Nothing to export", true);
        return;
    }
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `crypto_payload_${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    playSound('click');
    showToast("Payload downloaded as .txt");
});

// Live Input Event Listeners
inputText.addEventListener('input', updateCounters);

// Keyboard Shortcuts: Ctrl+Enter (Encrypt), Ctrl+Shift+Enter (Decrypt)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
            btnDecrypt.click();
        } else {
            btnEncrypt.click();
        }
    }
});

// Live Iran Standard Time Clock & Date
function updateClock() {
    const now = new Date();
    const timeOptions = { timeZone: 'Asia/Tehran', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const dateOptions = { timeZone: 'Asia/Tehran', month: 'short', day: 'numeric', year: 'numeric' };
    
    clockTime.textContent = now.toLocaleTimeString('en-US', timeOptions);
    clockDate.textContent = now.toLocaleDateString('en-US', dateOptions);
}
setInterval(updateClock, 1000);
updateClock();

if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
}

// Telemetry & Usage Analytics
let stats = JSON.parse(localStorage.getItem('dabshian_crypto_stats')) || {
    encrypted: 0,
    decrypted: 0,
    algos: {}
};

function renderStats() {
    statEncrypted.textContent = stats.encrypted.toLocaleString();
    statDecrypted.textContent = stats.decrypted.toLocaleString();
    
    let topAlgo = 'AES';
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

// Interactive Glass Spotlight
if (glassPanel) {
    glassPanel.addEventListener('mousemove', (e) => {
        const rect = glassPanel.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        glassPanel.style.setProperty('--mouse-x', `${x}px`);
        glassPanel.style.setProperty('--mouse-y', `${y}px`);
    });
}

// Drag and Drop Text File Loading
if (textareaWrapper) {
    ['dragenter', 'dragover'].forEach(eventName => {
        textareaWrapper.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            textareaWrapper.classList.add('drag-active');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        textareaWrapper.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            textareaWrapper.classList.remove('drag-active');
        });
    });

    textareaWrapper.addEventListener('drop', (e) => {
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            
            if (file.type.match('text.*') || file.name.endsWith('.txt') || file.name.endsWith('.json') || file.name.endsWith('.md')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    inputText.value = event.target.result;
                    updateCounters();
                    autoResize(inputText);
                    playSound('success');
                    showToast(`Loaded ${file.name} (${formatBytes(file.size)})`);
                };
                reader.onerror = () => {
                    showToast("Error reading file", true);
                };
                reader.readAsText(file);
            } else {
                playSound('error');
                showToast("Please drop a valid text file (.txt, .json, .md)", true);
            }
        }
    });
}

// Background Particle Network
if (typeof particlesJS !== 'undefined') {
    particlesJS("particles-js", {
        particles: {
            number: { value: 50, density: { enable: true, value_area: 850 } },
            color: { value: ["#6366f1", "#06b6d4", "#ec4899"] },
            shape: { type: "circle" },
            opacity: { value: 0.45, random: true },
            size: { value: 2.5, random: true },
            line_linked: { enable: true, distance: 140, color: "#818cf8", opacity: 0.28, width: 1 },
            move: { enable: true, speed: 1.6, direction: "none", random: false, straight: false, out_mode: "out", bounce: false }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "grab" },
                onclick: { enable: true, mode: "push" },
                resize: true
            },
            modes: {
                grab: { distance: 130, line_linked: { opacity: 0.8 } },
                push: { particles_nb: 3 }
            }
        },
        retina_detect: true
    });
}

// Window resize listener to recalculate auto-expansion on viewport changes
window.addEventListener('resize', () => {
    autoResize(inputText);
    autoResize(outputText);
});

// Initialize dynamic sizing on load
autoResize(inputText);
autoResize(outputText);