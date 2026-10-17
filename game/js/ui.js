/**
 * FORZA PORSCHE DRIVING - UI SYSTEM
 * FPS Counter & S.T.Z Display in Top Right Corner
 */

class UIManager {
    constructor() {
        // UI Elements
        this.fpsCounter = document.getElementById('fps-counter');
        this.stzDisplay = document.getElementById('stz-display');
        this.speedDisplay = document.getElementById('speed-value');
        this.speedUnit = document.getElementById('speed-unit');
        this.gearDisplay = document.getElementById('gear-display');
        this.boostBtn = document.getElementById('boostBtn');
        
        // State
        this.lastFpsUpdate = 0;
        this.frameCount = 0;
        this.currentFps = 0;
        this.lastTime = performance.now();
        
        // Start time tracking
        this.startTime = Date.now();
        this.playTime = 0;
        
        // Initialize
        this.init();
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    init() {
        // Set initial values
        this.updateFPS();
        this.updateSTZ();
        this.updateSpeed();
        this.updateGear();
        this.updateBoost();
        
        // Start FPS counter
        this.startFpsCounter();
        
        // Start time tracking
        this.startTimeTracking();
    }
    
    // ============================================
    // START FPS COUNTER
    // ============================================
    startFpsCounter() {
        this.fpsInterval = setInterval(() => {
            this.updateFPS();
        }, 1000);
    }
    
    // ============================================
    // START TIME TRACKING
    // ============================================
    startTimeTracking() {
        this.timeInterval = setInterval(() => {
            this.updateSTZ();
            this.updateSpeed();
            this.updateGear();
            this.updateBoost();
        }, 100);
    }
    
    // ============================================
    // UPDATE FPS
    // ============================================
    updateFPS() {
        if (!this.fpsCounter) return;
        
        const now = performance.now();
        const delta = (now - this.lastTime) / 1000;
        
        // Calculate FPS
        this.currentFps = Math.round(1 / delta);
        
        // Update display
        this.fpsCounter.textContent = this.currentFps;
        
        // Color code based on FPS
        if (this.currentFps >= 60) {
            this.fpsCounter.style.color = '#00ff00';
        } else if (this.currentFps >= 45) {
            this.fpsCounter.style.color = '#ffff00';
        } else if (this.currentFps >= 30) {
            this.fpsCounter.style.color = '#ffaa00';
        } else {
            this.fpsCounter.style.color = '#ff0000';
        }
        
        // Reset counter
        this.frameCount = 0;
        this.lastTime = now;
        
        GAME_STATE.fps = this.currentFps;
    }
    
    // ============================================
    // UPDATE STZ (Speed, Time, Zone)
    // ============================================
    updateSTZ() {
        if (!this.stzDisplay) return;
        
        // Get current state
        const speed = Math.round(GAME_STATE.speed * 3.6);
        const playTime = this.formatTime(GAME_STATE.playTime);
        const zone = GAME_STATE.currentZone || 'START';
        
        // Update display
        this.stzDisplay.textContent = `${speed} / ${playTime} / ${zone}`;
    }
    
    // ============================================
    // UPDATE SPEED
    // ============================================
    updateSpeed() {
        if (!this.speedDisplay || !this.speedUnit) return;
        
        const speed = Math.abs(GAME_STATE.speed * 3.6);
        const roundedSpeed = Math.round(speed);
        
        // Update display
        this.speedDisplay.textContent = roundedSpeed;
        
        // Add pulse effect when accelerating
        if (GAME_STATE.acceleration > 0 && roundedSpeed % 10 === 0) {
            this.speedDisplay.classList.add('pulse');
            setTimeout(() => {
                this.speedDisplay.classList.remove('pulse');
            }, 300);
        }
        
        // Update unit
        this.speedUnit.textContent = UI_CONFIG.units.speed;
    }
    
    // ============================================
    // UPDATE GEAR
    // ============================================
    updateGear() {
        if (!this.gearDisplay) return;
        
        const gear = GAME_STATE.gear || 'P';
        this.gearDisplay.textContent = gear;
        
        // Color based on gear
        if (gear === 'P') {
            this.gearDisplay.style.color = '#888888';
        } else if (gear === 'R') {
            this.gearDisplay.style.color = '#ff0000';
        } else {
            this.gearDisplay.style.color = '#ff0000';
        }
    }
    
    // ============================================
    // UPDATE BOOST
    // ============================================
    updateBoost() {
        if (!this.boostBtn) return;
        
        const boostCharge = Math.floor(GAME_STATE.boostCharge || 0);
        
        if (boostCharge < 20) {
            this.boostBtn.disabled = true;
            this.boostBtn.textContent = `NITRO (${boostCharge}%)`;
        } else {
            this.boostBtn.disabled = false;
            this.boostBtn.textContent = 'NITRO';
        }
    }
    
    // ============================================
    // FORMAT TIME
    // ============================================
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // ============================================
    // SHOW LOADING PROGRESS
    // ============================================
    showLoadingProgress(progress) {
        const loading = document.getElementById('loading');
        const progressFill = document.querySelector('.progress-fill');
        
        if (progressFill) {
            progressFill.style.width = `${progress * 100}%`;
        }
        
        if (progress >= 1.0) {
            this.hideLoading();
        }
    }
    
    // ============================================
    // HIDE LOADING
    // ============================================
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
            setTimeout(() => {
                loading.style.display = 'none';
            }, 500);
        }
    }
    
    // ============================================
    // SHOW MESSAGE
    // ============================================
    showMessage(message, duration = 3000) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'game-message';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: #00ffaa;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 24px;
            font-weight: bold;
            z-index: 10000;
            animation: fadeInOut 0.5s ease;
            pointer-events: none;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, duration);
    }
    
    // ============================================
    // UPDATE HUD VISIBILITY
    // ============================================
    updateHudVisibility() {
        const hudConfig = UI_CONFIG.hud;
        
        // Speed display
        const speedDisplay = document.getElementById('speed-display');
        if (speedDisplay) {
            speedDisplay.style.display = hudConfig.speed ? 'flex' : 'none';
        }
        
        // Gear display
        const gearDisplay = document.getElementById('gear-display');
        if (gearDisplay) {
            gearDisplay.style.display = hudConfig.gear ? 'block' : 'none';
        }
        
        // FPS counter
        const hudTopRight = document.getElementById('hud-top-right');
        if (hudTopRight) {
            const fpsPanel = hudTopRight.querySelector('.hud-panel:first-child');
            if (fpsPanel) {
                fpsPanel.style.display = hudConfig.fps ? 'block' : 'none';
            }
        }
        
        // STZ display
        if (hudTopRight) {
            const stzPanel = hudTopRight.querySelector('.hud-panel:last-child');
            if (stzPanel) {
                stzPanel.style.display = hudConfig.stz ? 'block' : 'none';
            }
        }
        
        // Controls
        const controlsLeft = document.getElementById('controls-left');
        if (controlsLeft) {
            controlsLeft.style.display = hudConfig.controls ? 'flex' : 'none';
        }
    }
    
    // ============================================
    // TOGGLE HUD
    // ============================================
    toggleHud() {
        UI_CONFIG.hud.speed = !UI_CONFIG.hud.speed;
        UI_CONFIG.hud.gear = !UI_CONFIG.hud.gear;
        UI_CONFIG.hud.fps = !UI_CONFIG.hud.fps;
        UI_CONFIG.hud.stz = !UI_CONFIG.hud.stz;
        UI_CONFIG.hud.controls = !UI_CONFIG.hud.controls;
        
        this.updateHudVisibility();
    }
    
    // ============================================
    // INCREMENT FRAME COUNTER
    // ============================================
    incrementFrame() {
        this.frameCount++;
    }
    
    // ============================================
    // GET UI STATE
    // ============================================
    getState() {
        return {
            fps: this.currentFps,
            playTime: this.playTime,
            speed: GAME_STATE.speed,
            gear: GAME_STATE.gear,
            zone: GAME_STATE.currentZone
        };
    }
    
    // ============================================
    // CLEANUP
    // ============================================
    cleanup() {
        // Clear intervals
        if (this.fpsInterval) {
            clearInterval(this.fpsInterval);
        }
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
        
        // Reset state
        this.frameCount = 0;
        this.currentFps = 0;
        this.playTime = 0;
    }
}

// ============================================
// SINGLETON INSTANCE
// ============================================
const uiManager = new UIManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = uiManager;
}
