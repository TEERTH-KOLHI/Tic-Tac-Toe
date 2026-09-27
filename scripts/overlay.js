// ==========================================
// Web Audio Sound Engine (Synthesized, No External Assets)
// ==========================================
class SoundFX {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    playMove(isX) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = isX ? 'sine' : 'triangle';
        const startFreq = isX ? 480 : 360;
        const endFreq = isX ? 620 : 420;

        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.13);
    }

    playWin() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const now = this.ctx.currentTime;

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + idx * 0.1;
            const duration = 0.28;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.25, startTime + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
        });
    }

    playTie() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const notes = [440, 392, 349.23]; // A4, G4, F4
        const now = this.ctx.currentTime;

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + idx * 0.12;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.18, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.22);
        });
    }

    playClick() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    }
}

const sounds = new SoundFX();

// ==========================================
// High Performance Canvas Confetti
// ==========================================
class ConfettiCannon {
    constructor() {
        this.canvas = document.getElementById('confettiCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.particles = [];
        this.animationId = null;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    burst(colors = ['#2563eb', '#3b82f6', '#e11d48', '#f59e0b', '#10b981', '#6366f1']) {
        if (!this.canvas || !this.ctx) return;
        this.particles = [];
        const count = 120;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height * 0.4;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 4 + Math.random() * 8;
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 3,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 12,
                alpha: 1,
                decay: 0.008 + Math.random() * 0.012
            });
        }

        if (!this.animationId) {
            this.render();
        }
    }

    render() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let active = 0;
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            if (p.alpha <= 0) continue;
            active++;

            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.22; // gravity
            p.vx *= 0.98; // air drag
            p.rotation += p.rotationSpeed;
            p.alpha -= p.decay;

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
            this.ctx.restore();
        }

        if (active > 0) {
            this.animationId = requestAnimationFrame(() => this.render());
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.animationId = null;
        }
    }

    clear() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.particles = [];
    }
}

const confetti = new ConfettiCannon();

// ==========================================
// Overlay Modal Controller
// ==========================================
const overlayModal = document.getElementById("overlayModal");
const overlayBackdrop = document.getElementById("overlayBackdrop");
const overlayHeader = document.getElementById("overlayHeader");
const overlayBody = document.getElementById("overlayBody");
const modalIcon = document.getElementById("modalIcon");
const modalBadge = document.getElementById("modalBadge");
const closeOverlayBtn = document.getElementById("closeOverlayBtn");

function gameDone(winner) {
    const isTie = winner === "Tied";
    
    if (isTie) {
        modalBadge.className = "modal-icon-badge tie-icon";
        modalIcon.className = "fa-solid fa-handshake";
        overlayHeader.innerText = "ROUND TIED!";
        overlayBody.innerHTML = "A closely fought battle! No marks left on the board.";
        sounds.playTie();
    } else {
        modalBadge.className = "modal-icon-badge";
        modalIcon.className = "fa-solid fa-trophy";
        overlayHeader.innerText = "VICTORY!";
        overlayBody.innerHTML = `<strong>${winner}</strong> dominates the arena and claims the win!`;
        sounds.playWin();
        confetti.burst();
    }

    overlayModal.classList.add("overlay-active");
    overlayBackdrop.classList.add("backchanger-active");
}

function closeOverlay() {
    overlayModal.classList.remove("overlay-active");
    overlayBackdrop.classList.remove("backchanger-active");
}

if (closeOverlayBtn) {
    closeOverlayBtn.addEventListener("click", () => {
        sounds.playClick();
        closeOverlay();
    });
}

// Sound toggle button in header
const soundToggle = document.getElementById("soundToggle");
const soundIcon = document.getElementById("soundIcon");
if (soundToggle && soundIcon) {
    soundToggle.addEventListener("click", () => {
        const isEnabled = sounds.toggle();
        if (isEnabled) {
            soundIcon.className = "fa-solid fa-volume-high";
            sounds.playClick();
        } else {
            soundIcon.className = "fa-solid fa-volume-xmark";
        }
    });
}