/**
 * Audio System - Sound effects using Web Audio API
 * No external audio files needed - all sounds generated programmatically
 */
const Sound = {
    ctx: null,
    enabled: true,

    init() {
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('Audio not supported');
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            try { this.ctx.resume().catch(()=>{}); } catch(e) {}
        }
    },

    // Play a simple tone
    tone(freq, duration, type = 'sine', volume = 0.15) {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
            // Disconnect for cleanup (prevents memory leaks in Safari)
            osc.onended = function(){ try{osc.disconnect();gain.disconnect();}catch(e){} };
        } catch(e) { /* AudioContext may be closed after tab suspension */ }
    },

    // Play a sequence of tones
    sequence(notes, gap = 0.1) {
        if (!this.enabled || !this.ctx) return;
        notes.forEach((note, i) => {
            setTimeout(() => {
                this.tone(note.freq, note.dur || 0.2, note.type || 'sine', note.vol || 0.15);
            }, i * gap * 1000);
        });
    },

    // Correct answer sound - happy ascending notes
    correct() {
        this.sequence([
            { freq: 523, dur: 0.15 },  // C5
            { freq: 659, dur: 0.15 },  // E5
            { freq: 784, dur: 0.25 },  // G5
        ], 0.1);
    },

    // Wrong answer sound - gentle descending (not harsh)
    wrong() {
        this.sequence([
            { freq: 392, dur: 0.2, type: 'triangle' },  // G4
            { freq: 330, dur: 0.3, type: 'triangle' },  // E4
        ], 0.12);
    },

    // Click / pick up sound
    click() {
        this.tone(800, 0.05, 'sine', 0.08);
    },

    // Drop sound
    drop() {
        this.tone(400, 0.08, 'sine', 0.1);
    },

    // Counting sound - short beep per item
    count() {
        this.tone(600, 0.08, 'sine', 0.1);
    },

    // Celebration fanfare
    celebrate() {
        this.sequence([
            { freq: 523, dur: 0.12 },  // C5
            { freq: 659, dur: 0.12 },  // E5
            { freq: 784, dur: 0.12 },  // G5
            { freq: 1047, dur: 0.3 },  // C6
            { freq: 784, dur: 0.12 },  // G5
            { freq: 1047, dur: 0.4 },  // C6
        ], 0.1);
    },

    // Star earned sound - sparkle
    star() {
        this.sequence([
            { freq: 1318, dur: 0.08, type: 'sine' },  // E6
            { freq: 1568, dur: 0.08, type: 'sine' },  // G6
            { freq: 2093, dur: 0.15, type: 'sine' },  // C7
        ], 0.06);
    },

    // Train whistle
    whistle() {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.15);
            osc.frequency.linearRampToValueAtTime(400, this.ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.4);
            osc.onended = function(){ try{osc.disconnect();gain.disconnect();}catch(e){} };
        } catch(e) {}
    },

    // Pop sound
    pop() {
        this.tone(300, 0.06, 'square', 0.06);
    },

    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) this.init();
        return this.enabled;
    }
};
