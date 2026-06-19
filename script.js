/* ==========================================================================
   🔒 LOCK SCREEN — Password Gate (runs first, before everything else)
   ========================================================================== */

(function () {
    'use strict';

    const CORRECT_PASSWORD = '112233';

    const lockScreen = document.getElementById('lock-screen');
    const lockInput  = document.getElementById('lock-input');
    const lockBtn    = document.getElementById('lock-btn');
    const lockError  = document.getElementById('lock-error');

    // Guard: if elements don't exist, skip
    if (!lockScreen || !lockInput || !lockBtn) return;

    /* ── Helpers ──────────────────────────────────────────────────── */
    function showError(msg) {
        // Reset animation so it replays each wrong attempt
        lockError.classList.remove('visible');
        lockInput.classList.remove('lock-input-shake');

        // Force reflow to restart animations
        void lockError.offsetWidth;
        void lockInput.offsetWidth;

        lockError.textContent = msg;
        lockError.classList.add('visible');
        lockInput.classList.add('lock-input-shake');

        // Clear shake class after animation ends
        lockInput.addEventListener('animationend', () => {
            lockInput.classList.remove('lock-input-shake');
        }, { once: true });
    }

    function unlockAndEnter() {
        // 1. Fade out the lock screen smoothly
        lockScreen.classList.add('fade-out');

        // 2. After transition ends, hide it completely
        lockScreen.addEventListener('transitionend', () => {
            lockScreen.style.display = 'none';
            lockInput.value = '';
        }, { once: true });
    }

    function handleSubmit() {
        const entered = lockInput.value.trim();

        if (entered === CORRECT_PASSWORD) {
            unlockAndEnter();
        } else {
            showError('❌ ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।');
            lockInput.value = '';
            lockInput.focus();
        }
    }

    /* ── Event listeners ──────────────────────────────────────────── */
    // Button click
    lockBtn.addEventListener('click', handleSubmit);

    // Enter key in input field
    lockInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    });

    // Auto-focus input on load
    window.addEventListener('load', () => lockInput.focus());

})();

/* ==========================================================================
   Premium Love Letter App JavaScript
   ========================================================================== */

// Screen Transition Logic
function showScreen(fromId, toId) {
    const fromScreen = document.getElementById(fromId);
    const toScreen = document.getElementById(toId);
    
    if (fromScreen) {
        fromScreen.classList.remove('active');
        fromScreen.classList.add('hidden');
    }
    
    if (toScreen) {
        // Remove hidden immediately, add active on next frame for transition
        toScreen.classList.remove('hidden');
        // Force reflow
        toScreen.offsetHeight;
        toScreen.classList.add('active');
    }
}

// Set Current Date on the Love Letter
const currentDateSpan = document.getElementById('current-date');
if (currentDateSpan) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    currentDateSpan.innerText = new Date().toLocaleDateString('bn-BD', options);
}

/* ==========================================================================
   Web Audio API Procedural Ambient Music
   ========================================================================== */
let audioCtx = null;
let mainGain = null;
let isMuted = false;
let chordTimeout = null;
let chimeTimeout = null;

function initAudio() {
    if (audioCtx) return;
    
    try {
        // Create context
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Master gain for smooth volume control/muting
        mainGain = audioCtx.createGain();
        mainGain.gain.setValueAtTime(0.08, audioCtx.currentTime); // Soft volume level
        mainGain.connect(audioCtx.destination);
        
        // Lowpass filter for warm, cozy synth tone
        const lowpass = audioCtx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(550, audioCtx.currentTime); // Cut high frequencies
        lowpass.connect(mainGain);
        
        // Start loops
        playNextChord(lowpass);
        playRandomChimes();
        
        // Reveal music widget
        const musicWidget = document.getElementById('music-control');
        if (musicWidget) {
            musicWidget.classList.remove('hidden');
        }
    } catch (e) {
        console.warn('Audio Context could not initialize:', e);
    }
}

function playNextChord(destinationNode) {
    if (!audioCtx || isMuted) {
        chordTimeout = setTimeout(() => playNextChord(destinationNode), 5000);
        return;
    }
    
    // Soothing chords in F Major / D Minor Pentatonic (Fmaj7 - Bbmaj7 - Csus4 - Dm7)
    const progressions = [
        [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
        [233.08, 293.66, 349.23, 440.00], // Bbmaj7 (Bb3, D4, F4, A4)
        [130.81, 196.00, 261.63, 349.23], // Csus4 (C3, G3, C4, F4)
        [146.83, 220.00, 261.63, 349.23]  // Dm7 (D3, A3, C4, F4)
    ];
    
    // Choose random chord
    const chord = progressions[Math.floor(Math.random() * progressions.length)];
    const duration = 7.0; // Chord length in seconds
    const now = audioCtx.currentTime;
    
    chord.forEach(freq => {
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        
        // Triangle wave is soft and organic
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        
        // Fade in and out envelope
        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(0.015, now + 1.5); // slow attack
        oscGain.gain.setValueAtTime(0.015, now + duration - 1.5);
        oscGain.gain.linearRampToValueAtTime(0, now + duration); // slow release
        
        osc.connect(oscGain);
        oscGain.connect(destinationNode);
        
        osc.start(now);
        osc.stop(now + duration);
    });
    
    chordTimeout = setTimeout(() => {
        playNextChord(destinationNode);
    }, (duration - 0.1) * 1000);
}

function playRandomChimes() {
    if (!audioCtx || isMuted) {
        chimeTimeout = setTimeout(playRandomChimes, 2000);
        return;
    }
    
    const now = audioCtx.currentTime;
    
    // High-pitched crystal bells (F Major Pentatonic Scale)
    const chimes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
    const freq = chimes[Math.floor(Math.random() * chimes.length)];
    
    const osc = audioCtx.createOscillator();
    const chimeGain = audioCtx.createGain();
    
    // Pure sine waves represent chime bells
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    
    // Fast attack, long exponential release
    chimeGain.gain.setValueAtTime(0, now);
    chimeGain.gain.linearRampToValueAtTime(0.03, now + 0.04);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
    
    osc.connect(chimeGain);
    chimeGain.connect(mainGain);
    
    osc.start(now);
    osc.stop(now + 2.6);
    
    // Schedule next chime randomly between 1.5 and 4.5 seconds
    chimeTimeout = setTimeout(playRandomChimes, 1500 + Math.random() * 3000);
}

// Mute Toggle Logic
const btnMute = document.getElementById('btn-mute');
const musicWidget = document.getElementById('music-control');
if (btnMute && musicWidget) {
    btnMute.addEventListener('click', () => {
        isMuted = !isMuted;
        
        if (isMuted) {
            musicWidget.classList.add('muted');
            if (mainGain) {
                mainGain.gain.setValueAtTime(mainGain.gain.value, audioCtx.currentTime);
                mainGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
            }
        } else {
            musicWidget.classList.remove('muted');
            if (mainGain) {
                mainGain.gain.setValueAtTime(mainGain.gain.value, audioCtx.currentTime);
                mainGain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.5);
            }
            
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        }
    });
}

// Start button starts audio and moves to verification screen
const btnStart = document.getElementById('btn-start');
if (btnStart) {
    btnStart.addEventListener('click', () => {
        initAudio();
        showScreen('screen-welcome', 'screen-challenge');
    });
}

/* ==========================================================================
   Runaway "No" Button Interaction
   ========================================================================== */
const btnNo = document.getElementById('btn-no');
const btnYes = document.getElementById('btn-yes');

function moveNoButton() {
    const btnWidth = btnNo.offsetWidth;
    const btnHeight = btnNo.offsetHeight;
    
    // Stay safe inside window borders
    const padding = 30;
    const maxX = window.innerWidth - btnWidth - padding;
    const maxY = window.innerHeight - btnHeight - padding;
    
    // Choose random coords
    let randomX = padding + Math.random() * (maxX - padding);
    let randomY = padding + Math.random() * (maxY - padding);
    
    // Shift position to fixed so it detaches from normal flex layout
    btnNo.style.position = 'fixed';
    btnNo.style.left = `${randomX}px`;
    btnNo.style.top = `${randomY}px`;
    btnNo.style.zIndex = '999';
}

if (btnNo) {
    // Evasion on cursor hovering
    btnNo.addEventListener('mouseover', moveNoButton);
    btnNo.addEventListener('mouseenter', moveNoButton);
    
    // Touch event evasion for smartphones
    btnNo.addEventListener('touchstart', (e) => {
        e.preventDefault(); // stop button click trigger
        moveNoButton();
    });
}

// Distance checking mouse move listener for extra runaway challenge
document.addEventListener('mousemove', (e) => {
    const challengeScreen = document.getElementById('screen-challenge');
    if (!challengeScreen || !challengeScreen.classList.contains('active') || !btnNo) return;
    
    const rect = btnNo.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
    
    // Move the button away if cursor gets within 85px
    if (dist < 85) {
        moveNoButton();
    }
});

// Proceed to envelope screen on YES click
if (btnYes) {
    btnYes.addEventListener('click', () => {
        showScreen('screen-challenge', 'screen-envelope');
    });
}

/* ==========================================================================
   Interactive Envelope Opening
   ========================================================================== */
const envelopeWrapper = document.getElementById('envelope-wrapper');
const btnReadLetter = document.getElementById('btn-read-letter');
const letterContainer = document.querySelector('.letter');

if (envelopeWrapper) {
    envelopeWrapper.addEventListener('click', () => {
        if (!envelopeWrapper.classList.contains('open')) {
            envelopeWrapper.classList.add('open');
            
            // Show "Read Letter" button after opening animation completes
            setTimeout(() => {
                if (btnReadLetter) {
                    btnReadLetter.classList.remove('hidden');
                    // force reflow
                    btnReadLetter.offsetHeight;
                    btnReadLetter.classList.add('active');
                }
            }, 800);
        }
    });
}

if (btnReadLetter) {
    btnReadLetter.addEventListener('click', () => {
        showScreen('screen-envelope', 'screen-letter');
    });
}

if (letterContainer) {
    letterContainer.addEventListener('click', (e) => {
        // If envelope is open, clicking the letter itself transitions to fullscreen
        if (envelopeWrapper && envelopeWrapper.classList.contains('open')) {
            e.stopPropagation(); // prevent envelope re-click handler
            showScreen('screen-envelope', 'screen-letter');
        }
    });
}

/* ==========================================================================
   Love Letter Interactive Features (Screen 4)
   ========================================================================== */

// 1. Cycle "Reasons to Love" list
const reasons = [
    "আমার সবচেয়ে কঠিন দিনগুলোতেও তুমি আমার মুখে হাসি ফোটাও। ☀️",
    "তোমার দয়া ও সরলতা আমার চলার পথের আলো। 🌟",
    "যেভাবে তুমি মনোযোগ দিয়ে আমার সব বোকা বোকা গল্প শোনো। 🥺",
    "পুরো মহাবিশ্বের সবচেয়ে নরম আর উষ্ণ হৃদয়টি তোমার। 🧸",
    "তুমি যেভাবে আছ, ঠিক সেভাবেই আমার জন্য একদম পারফেক্ট। 🌸",
    "তোমার সাথে কাটানো প্রতিটি মুহূর্ত একটা সুন্দর স্বপ্নের মতো মনে হয়। ✨",
    "প্রতিটি দিন আমার মনের সবথেকে মিষ্টি অনুভূতিটি হলে তুমি। 🧸"
];

let currentReasonIndex = -1;
const reasonText = document.getElementById('reason-text');
const btnNextReason = document.getElementById('btn-next-reason');

function cycleReason() {
    if (!reasonText) return;
    
    currentReasonIndex = (currentReasonIndex + 1) % reasons.length;
    
    // Soft fade transition
    reasonText.style.opacity = 0;
    setTimeout(() => {
        reasonText.innerText = reasons[currentReasonIndex];
        reasonText.style.opacity = 1;
    }, 250);
}

// Initial cycle on script load
cycleReason();

if (btnNextReason) {
    btnNextReason.addEventListener('click', cycleReason);
}

// 2. Custom Heart Shower Physics Explosion
const btnShower = document.getElementById('btn-shower');
if (btnShower) {
    btnShower.addEventListener('click', () => {
        const emojis = ['💖', '💕', '❤️', '🌸', '✨', '🥰', '💝', '🌹'];
        const heartCount = 35;
        
        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div');
            heart.classList.add('shower-heart');
            heart.innerText = emojis[Math.floor(Math.random() * emojis.length)];
            
            // Get position of the click/button to emerge from
            const rect = btnShower.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
            heart.style.left = `${startX}px`;
            heart.style.top = `${startY}px`;
            
            // Vector variables passed to CSS transition calculations
            const dx = (Math.random() - 0.5) * 450;           // Horizontal splash breadth
            const dyPeak = -120 - Math.random() * 160;       // Vertical peak height
            const dxEnd = dx + (Math.random() - 0.5) * 120;   // Final drift drift
            const dyEnd = 250 + Math.random() * 250;          // Drop down bounds
            
            const rotMid = (Math.random() - 0.5) * 360;       // Rotation at peak
            const rotEnd = rotMid + (Math.random() - 0.5) * 360; // Final rotation
            
            heart.style.setProperty('--dx', `${dx}px`);
            heart.style.setProperty('--dy-peak', `${dyPeak}px`);
            heart.style.setProperty('--dx-end', `${dxEnd}px`);
            heart.style.setProperty('--dy-end', `${dyEnd}px`);
            heart.style.setProperty('--rot-mid', `${rotMid}deg`);
            heart.style.setProperty('--rot-end', `${rotEnd}deg`);
            
            // Font sizes
            heart.style.fontSize = `${14 + Math.random() * 22}px`;
            
            document.body.appendChild(heart);
            
            // Clean up node after animation ends (3000ms duration)
            setTimeout(() => {
                heart.remove();
            }, 3000);
        }
    });
}

/* ==========================================================================
   Glacial Drift Dot Background
   — Hundreds of soft glowing dots drifting slowly in all directions
     like ice floating on a calm glacier lake.
   ========================================================================== */
const canvas = document.getElementById('particle-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let dots = [];
    let mouse = { x: null, y: null };

    // Canvas Resizer
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initDots();
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Capture Mouse Position (for gentle repulsion)
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    });
    window.addEventListener('touchend', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Glacial color palette — soft purples, pinks, lavenders, whites
    const PALETTE = [
        [320, 80, 80],   // soft pink
        [280, 70, 85],   // lavender
        [340, 75, 78],   // rose
        [260, 60, 88],   // light purple
        [300, 65, 82],   // orchid
        [200, 55, 90],   // ice blue
        [0,   0,  98],   // near white
    ];

    class GlacialDot {
        constructor(scatterX, scatterY) {
            this.init(scatterX, scatterY);
        }

        init(forceX, forceY) {
            // Position — randomly across entire canvas
            this.x = forceX !== undefined ? forceX : Math.random() * canvas.width;
            this.y = forceY !== undefined ? forceY : Math.random() * canvas.height;

            // Size — mostly tiny dots, some slightly bigger
            this.radius = 1.2 + Math.random() * 3.8;

            // Glacial drift speed — very slow, all directions
            const speed = 0.08 + Math.random() * 0.28;
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;

            // Slight sinusoidal wander (glacier meander)
            this.wanderAngle = Math.random() * Math.PI * 2;
            this.wanderSpeed = 0.003 + Math.random() * 0.007;
            this.wanderStrength = 0.04 + Math.random() * 0.12;

            // Color from palette
            const col = PALETTE[Math.floor(Math.random() * PALETTE.length)];
            this.h = col[0];
            this.s = col[1];
            this.l = col[2];

            // Alpha pulse
            this.alpha = 0.08 + Math.random() * 0.55;
            this.alphaBase = this.alpha;
            this.alphaPhase = Math.random() * Math.PI * 2;
            this.alphaSpeed = 0.008 + Math.random() * 0.018;
        }

        update() {
            // Meander drift
            this.wanderAngle += this.wanderSpeed;
            this.x += this.vx + Math.cos(this.wanderAngle) * this.wanderStrength;
            this.y += this.vy + Math.sin(this.wanderAngle) * this.wanderStrength;

            // Alpha pulse (gentle breathe)
            this.alphaPhase += this.alphaSpeed;
            this.alpha = this.alphaBase * (0.55 + 0.45 * Math.sin(this.alphaPhase));

            // Gentle cursor repulsion — like ice parting for a finger
            if (mouse.x !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.hypot(dx, dy);
                const repelRadius = 80;
                if (dist < repelRadius && dist > 0) {
                    const force = (repelRadius - dist) / repelRadius;
                    this.x += (dx / dist) * force * 1.6;
                    this.y += (dy / dist) * force * 1.6;
                }
            }

            // Wrap around edges seamlessly (glacier loops)
            const margin = 10;
            if (this.x < -margin)  this.x = canvas.width  + margin;
            if (this.x > canvas.width  + margin) this.x = -margin;
            if (this.y < -margin)  this.y = canvas.height + margin;
            if (this.y > canvas.height + margin) this.y = -margin;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));

            // Soft glow halo
            const grd = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.radius * 3
            );
            grd.addColorStop(0,   `hsla(${this.h}, ${this.s}%, ${this.l}%, 1)`);
            grd.addColorStop(0.4, `hsla(${this.h}, ${this.s}%, ${this.l}%, 0.5)`);
            grd.addColorStop(1,   `hsla(${this.h}, ${this.s}%, ${this.l}%, 0)`);

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();

            // Core bright dot
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${this.h}, ${this.s}%, ${Math.min(100, this.l + 8)}%)`;
            ctx.fill();

            ctx.restore();
        }
    }

    function initDots() {
        dots = [];
        // Dense glacial field — roughly 1 dot per 5000 px²
        const area = canvas.width * canvas.height;
        const count = Math.min(280, Math.max(80, Math.floor(area / 5000)));
        for (let i = 0; i < count; i++) {
            dots.push(new GlacialDot());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dots.forEach(d => {
            d.update();
            d.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();
}
