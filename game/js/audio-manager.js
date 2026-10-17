/**
 * FORZA PORSCHE DRIVING - AUDIO MANAGER
 * Opus Audio Support for High Quality, Low Latency
 */

class AudioManager {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.sources = {};
        this.buffers = {};
        this.isMuted = false;
        this.isInitialized = false;
        this.audioContextSuspended = true;
        
        // Audio nodes for different sound types
        this.engineGain = null;
        this.boostGain = null;
        this.tireGain = null;
        this.ambientGain = null;
        this.uiGain = null;
        
        // Engine sound state
        this.engineRpm = 0;
        this.enginePitch = 0.5;
        this.lastEngineUpdate = 0;
        
        // Crossfade for gear shifts
        this.crossfadeNode = null;
        this.currentEngineSource = null;
        this.nextEngineSource = null;
        
        this.init();
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    async init() {
        try {
            // Create audio context with Opus-optimized settings
            this.context = new (window.AudioContext || window.webkitAudioContext)({
                latencyHint: AUDIO_CONFIG.audioContext.latencyHint,
                sampleRate: AUDIO_CONFIG.audioContext.sampleRate
            });
            
            // Create master gain node
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = AUDIO_CONFIG.volume.master;
            this.masterGain.connect(this.context.destination);
            
            // Create category gain nodes
            this.engineGain = this.context.createGain();
            this.engineGain.gain.value = AUDIO_CONFIG.volume.engine;
            this.engineGain.connect(this.masterGain);
            
            this.boostGain = this.context.createGain();
            this.boostGain.gain.value = AUDIO_CONFIG.volume.boost;
            this.boostGain.connect(this.masterGain);
            
            this.tireGain = this.context.createGain();
            this.tireGain.gain.value = AUDIO_CONFIG.volume.tireScreech;
            this.tireGain.connect(this.masterGain);
            
            this.ambientGain = this.context.createGain();
            this.ambientGain.gain.value = AUDIO_CONFIG.volume.ambient;
            this.ambientGain.connect(this.masterGain);
            
            this.uiGain = this.context.createGain();
            this.uiGain.gain.value = AUDIO_CONFIG.volume.ui;
            this.uiGain.connect(this.masterGain);
            
            // Create crossfade node
            this.crossfadeNode = this.context.createGain();
            this.crossfadeNode.connect(this.engineGain);
            
            // Load audio files
            await this.loadAudioFiles();
            
            this.isInitialized = true;
            console.log('Audio Manager initialized with Opus support');
            
            // Resume audio context on user interaction
            this.setupUserInteraction();
            
        } catch (error) {
            console.error('Audio Manager initialization failed:', error);
            this.isInitialized = false;
        }
    }
    
    // ============================================
    // LOAD AUDIO FILES (Opus Format)
    // ============================================
    async loadAudioFiles() {
        const audioPaths = AUDIO_CONFIG.paths;
        
        // Check for Opus support
        const opusSupported = this.isOpusSupported();
        const extension = opusSupported ? '.opus' : '.mp3';
        
        const loadPromises = [];
        
        for (const [name, path] of Object.entries(audioPaths)) {
            const audioPath = `assets/audio/${name}${extension}`;
            loadPromises.push(
                this.loadAudioBuffer(audioPath).then(buffer => {
                    this.buffers[name] = buffer;
                }).catch(error => {
                    console.warn(`Failed to load ${name}:`, error);
                    // Fallback to placeholder
                    this.buffers[name] = this.createPlaceholderBuffer();
                })
            );
        }
        
        await Promise.all(loadPromises);
    }
    
    // ============================================
    // LOAD AUDIO BUFFER
    // ============================================
    async loadAudioBuffer(url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return this.context.decodeAudioData(arrayBuffer);
    }
    
    // ============================================
    // CHECK OPUS SUPPORT
    // ============================================
    isOpusSupported() {
        const audio = document.createElement('audio');
        return audio.canPlayType('audio/opus; codecs=opus') !== '';
    }
    
    // ============================================
    // CREATE PLACEHOLDER BUFFER (Fallback)
    // ============================================
    createPlaceholderBuffer() {
        const sampleRate = this.context.sampleRate;
        const duration = 0.1; // 100ms
        const length = Math.floor(sampleRate * duration);
        
        const buffer = this.context.createBuffer(2, length, sampleRate);
        const dataL = buffer.getChannelData(0);
        const dataR = buffer.getChannelData(1);
        
        for (let i = 0; i < length; i++) {
            dataL[i] = Math.random() * 0.1 - 0.05;
            dataR[i] = Math.random() * 0.1 - 0.05;
        }
        
        return buffer;
    }
    
    // ============================================
    // SETUP USER INTERACTION
    // ============================================
    setupUserInteraction() {
        const resumeAudio = async () => {
            if (this.audioContextSuspended && this.context) {
                try {
                    await this.context.resume();
                    this.audioContextSuspended = false;
                    console.log('Audio context resumed');
                } catch (error) {
                    console.error('Failed to resume audio context:', error);
                }
            }
        };
        
        // Listen for any user interaction
        const interactions = ['click', 'touchstart', 'keydown', 'mousedown'];
        interactions.forEach(event => {
            document.addEventListener(event, resumeAudio, { once: true, passive: true });
        });
    }
    
    // ============================================
    // PLAY SOUND
    // ============================================
    playSound(name, options = {}) {
        if (!this.isInitialized || this.isMuted) return null;
        
        if (!this.buffers[name]) {
            console.warn(`Sound ${name} not loaded`);
            return null;
        }
        
        try {
            const source = this.context.createBufferSource();
            source.buffer = this.buffers[name];
            
            // Set loop if specified
            if (options.loop) {
                source.loop = true;
                source.loopStart = options.loopStart || 0;
                source.loopEnd = options.loopEnd || source.buffer.duration;
            }
            
            // Set playback rate
            if (options.playbackRate) {
                source.playbackRate.value = options.playbackRate;
            }
            
            // Set detune
            if (options.detune) {
                source.detune.value = options.detune;
            }
            
            // Connect to appropriate gain node
            let gainNode = this.masterGain;
            switch (options.category) {
                case 'engine':
                    gainNode = this.engineGain;
                    break;
                case 'boost':
                    gainNode = this.boostGain;
                    break;
                case 'tire':
                    gainNode = this.tireGain;
                    break;
                case 'ambient':
                    gainNode = this.ambientGain;
                    break;
                case 'ui':
                    gainNode = this.uiGain;
                    break;
            }
            
            source.connect(gainNode);
            
            // Start playback
            if (this.audioContextSuspended) {
                // If suspended, try to resume and play
                this.context.resume().then(() => {
                    source.start(0, options.offset || 0);
                }).catch(() => {
                    // Fallback: play anyway
                    source.start(0, options.offset || 0);
                });
            } else {
                source.start(0, options.offset || 0);
            }
            
            // Store source for later control
            this.sources[name] = source;
            
            return source;
        } catch (error) {
            console.error(`Failed to play sound ${name}:`, error);
            return null;
        }
    }
    
    // ============================================
    // STOP SOUND
    // ============================================
    stopSound(name, fadeOut = 0) {
        if (!this.sources[name]) return;
        
        if (fadeOut > 0) {
            const source = this.sources[name];
            const gainNode = this.context.createGain();
            gainNode.gain.value = 1;
            
            // Disconnect and reconnect through gain node
            source.disconnect();
            source.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Fade out
            const startTime = this.context.currentTime;
            gainNode.gain.linearRampToValueAtTime(0, startTime + fadeOut);
            
            // Stop after fade
            source.stop(startTime + fadeOut);
        } else {
            this.sources[name].stop();
        }
        
        delete this.sources[name];
    }
    
    // ============================================
    // ENGINE SOUND SYSTEM
    // ============================================
    updateEngineSound(rpm, throttle, gear) {
        if (!this.isInitialized || this.isMuted) return;
        
        const now = performance.now();
        const deltaTime = (now - this.lastEngineUpdate) / 1000;
        this.lastEngineUpdate = now;
        
        // Calculate target pitch based on RPM (0.5 - 2.0)
        const targetPitch = 0.5 + (rpm / 8000) * 1.5;
        
        // Smooth pitch transition
        this.enginePitch += (targetPitch - this.enginePitch) * deltaTime * 10;
        this.enginePitch = Math.max(0.1, Math.min(2.0, this.enginePitch));
        
        // Calculate volume based on throttle and RPM
        const volume = throttle * (0.3 + (rpm / 8000) * 0.7);
        
        // Update existing engine sound
        if (this.sources.engine) {
            this.sources.engine.playbackRate.value = this.enginePitch;
            this.engineGain.gain.value = volume * AUDIO_CONFIG.volume.engine;
        } else {
            // Start engine sound
            this.playSound('engine', {
                category: 'engine',
                loop: true,
                playbackRate: this.enginePitch
            });
        }
        
        // Gear shift sound
        if (this.lastGear !== gear && gear !== 'P') {
            this.playSound('gearShift', { category: 'ui' });
            this.lastGear = gear;
        }
    }
    
    // ============================================
    // BOOST SOUND
    // ============================================
    playBoostSound(active) {
        if (!this.isInitialized || this.isMuted) return;
        
        if (active) {
            if (!this.sources.boost) {
                this.playSound('boost', {
                    category: 'boost',
                    loop: true
                });
            }
        } else {
            this.stopSound('boost', 0.2);
        }
    }
    
    // ============================================
    // TIRE SCREECH SOUND
    // ============================================
    playTireScreech(steering, speed, handbrake) {
        if (!this.isInitialized || this.isMuted) return;
        
        const screechIntensity = Math.min(1, Math.abs(steering) * (speed / 50) * (handbrake ? 2 : 1));
        
        if (screechIntensity > 0.1) {
            if (!this.sources.tireScreech) {
                this.playSound('tireScreech', {
                    category: 'tire',
                    loop: true,
                    playbackRate: 0.8 + (speed / 100)
                });
            }
            
            this.tireGain.gain.value = Math.min(1, screechIntensity * 2) * AUDIO_CONFIG.volume.tireScreech;
        } else {
            this.stopSound('tireScreech', 0.1);
        }
    }
    
    // ============================================
    // HANDBRAKE SOUND
    // ============================================
    playHandbrakeSound(active) {
        if (!this.isInitialized || this.isMuted) return;
        
        if (active) {
            if (!this.sources.handbrake) {
                this.playSound('handbrake', { category: 'tire' });
            }
        }
    }
    
    // ============================================
    // AMBIENT SOUND
    // ============================================
    playAmbientSound() {
        if (!this.isInitialized || this.isMuted) return;
        
        if (!this.sources.ambient) {
            this.playSound('ambient', {
                category: 'ambient',
                loop: true,
                playbackRate: 0.8
            });
        }
    }
    
    // ============================================
    // MUTE TOGGLE
    // ============================================
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.masterGain.gain.value = 0;
        } else {
            this.masterGain.gain.value = AUDIO_CONFIG.volume.master;
        }
        
        // Update UI
        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) {
            muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
            muteBtn.classList.toggle('muted', this.isMuted);
        }
        
        return this.isMuted;
    }
    
    // ============================================
    // SET VOLUME
    // ============================================
    setVolume(category, value) {
        if (!this.isInitialized) return;
        
        value = Math.max(0, Math.min(1, value));
        
        switch (category) {
            case 'master':
                this.masterGain.gain.value = value;
                AUDIO_CONFIG.volume.master = value;
                break;
            case 'engine':
                this.engineGain.gain.value = value;
                AUDIO_CONFIG.volume.engine = value;
                break;
            case 'boost':
                this.boostGain.gain.value = value;
                AUDIO_CONFIG.volume.boost = value;
                break;
            case 'tire':
                this.tireGain.gain.value = value;
                AUDIO_CONFIG.volume.tireScreech = value;
                break;
            case 'ambient':
                this.ambientGain.gain.value = value;
                AUDIO_CONFIG.volume.ambient = value;
                break;
            case 'ui':
                this.uiGain.gain.value = value;
                AUDIO_CONFIG.volume.ui = value;
                break;
        }
    }
    
    // ============================================
    // CLEANUP
    // ============================================
    cleanup() {
        // Stop all sounds
        Object.keys(this.sources).forEach(name => {
            this.stopSound(name);
        });
        
        // Clear buffers
        this.buffers = {};
        this.sources = {};
        
        // Close audio context
        if (this.context) {
            this.context.close().catch(() => {});
            this.context = null;
        }
        
        this.isInitialized = false;
        console.log('Audio Manager cleaned up');
    }
    
    // ============================================
    // RESUME AUDIO CONTEXT
    // ============================================
    async resume() {
        if (this.context && this.audioContextSuspended) {
            try {
                await this.context.resume();
                this.audioContextSuspended = false;
                return true;
            } catch (error) {
                console.error('Failed to resume audio context:', error);
                return false;
            }
        }
        return true;
    }
    
    // ============================================
    // SUSPEND AUDIO CONTEXT
    // ============================================
    async suspend() {
        if (this.context && !this.audioContextSuspended) {
            try {
                await this.context.suspend();
                this.audioContextSuspended = true;
                return true;
            } catch (error) {
                console.error('Failed to suspend audio context:', error);
                return false;
            }
        }
        return true;
    }
}

// ============================================
// SINGLETON INSTANCE
// ============================================
const audioManager = new AudioManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = audioManager;
}
