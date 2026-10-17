/**
 * FORZA PORSCHE DRIVING - CONTROLS SYSTEM
 * Keyboard, Touch, and Gamepad Support
 */

class Controls {
    constructor() {
        // Keyboard state
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            w: false,
            s: false,
            a: false,
            d: false,
            ' ': false,
            Shift: false,
            ShiftLeft: false,
            ShiftRight: false
        };
        
        // Touch state
        this.touch = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            steering: 0,
            throttle: 0,
            brake: 0
        };
        
        // Gamepad state
        this.gamepad = {
            active: false,
            index: null,
            axes: [0, 0, 0, 0],
            buttons: []
        };
        
        // Button states for UI controls
        this.buttons = {
            accelerate: false,
            brake: false,
            boost: false,
            handbrake: false
        };
        
        // Sensitivity settings
        this.sensitivity = {
            steering: 1.0,
            throttle: 1.0,
            touch: {
                steering: 0.01,
                throttle: 0.02
            },
            gamepad: {
                steering: 1.0,
                throttle: 1.0,
                deadzone: 0.1
            }
        };
        
        // Initialize
        this.init();
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    init() {
        this.setupKeyboard();
        this.setupTouch();
        this.setupGamepad();
        this.setupUIButtons();
        this.setupWindowEvents();
    }
    
    // ============================================
    // KEYBOARD SETUP
    // ============================================
    setupKeyboard() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
    }
    
    onKeyDown(event) {
        // Prevent default for game keys
        const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd', ' ', 'Shift'];
        if (gameKeys.includes(event.key)) {
            event.preventDefault();
        }
        
        // Handle Shift key (both left and right)
        if (event.key === 'ShiftLeft' || event.key === 'ShiftRight') {
            this.keys.Shift = true;
            this.keys[event.key] = true;
        }
        
        // Update key state
        if (event.key in this.keys) {
            this.keys[event.key] = true;
        }
        
        // Start engine on first input
        if (!GAME_STATE.isEngineOn) {
            GAME_STATE.isEngineOn = true;
            GAME_STATE.gear = 'D';
        }
    }
    
    onKeyUp(event) {
        // Handle Shift key
        if (event.key === 'ShiftLeft' || event.key === 'ShiftRight') {
            this.keys.Shift = false;
            this.keys[event.key] = false;
        }
        
        // Update key state
        if (event.key in this.keys) {
            this.keys[event.key] = false;
        }
    }
    
    // ============================================
    // TOUCH SETUP
    // ============================================
    setupTouch() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas || !('ontouchstart' in window)) return;
        
        // Touch event handlers
        canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: true });
        canvas.addEventListener('touchcancel', (e) => this.onTouchEnd(e), { passive: true });
        
        // Prevent default touch behavior
        canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }
    
    onTouchStart(event) {
        this.touch.active = true;
        
        const touch = event.touches[0];
        const rect = event.target.getBoundingClientRect();
        
        this.touch.startX = (touch.clientX - rect.left) / rect.width * 2 - 1;
        this.touch.startY = -(touch.clientY - rect.top) / rect.height * 2 + 1;
        this.touch.currentX = this.touch.startX;
        this.touch.currentY = this.touch.startY;
        
        // Start engine on first touch
        if (!GAME_STATE.isEngineOn) {
            GAME_STATE.isEngineOn = true;
            GAME_STATE.gear = 'D';
        }
    }
    
    onTouchMove(event) {
        if (!this.touch.active) return;
        
        const touch = event.touches[0];
        const rect = event.target.getBoundingClientRect();
        
        this.touch.currentX = (touch.clientX - rect.left) / rect.width * 2 - 1;
        this.touch.currentY = -(touch.clientY - rect.top) / rect.height * 2 + 1;
        
        // Calculate steering (left/right)
        const deltaX = this.touch.currentX - this.touch.startX;
        this.touch.steering = Math.max(-1, Math.min(1, deltaX * this.sensitivity.touch.steering));
        
        // Calculate throttle/brake (up/down)
        const deltaY = this.touch.currentY - this.touch.startY;
        if (deltaY < -0.1) {
            this.touch.throttle = Math.min(1, Math.abs(deltaY) * this.sensitivity.touch.throttle);
            this.touch.brake = 0;
        } else if (deltaY > 0.1) {
            this.touch.brake = Math.min(1, deltaY * this.sensitivity.touch.throttle);
            this.touch.throttle = 0;
        } else {
            this.touch.throttle = 0;
            this.touch.brake = 0;
        }
    }
    
    onTouchEnd(event) {
        this.touch.active = false;
        this.touch.steering = 0;
        this.touch.throttle = 0;
        this.touch.brake = 0;
    }
    
    // ============================================
    // GAMEPAD SETUP
    // ============================================
    setupGamepad() {
        if (!navigator.getGamepads) return;
        
        window.addEventListener('gamepadconnected', (e) => this.onGamepadConnected(e));
        window.addEventListener('gamepaddisconnected', (e) => this.onGamepadDisconnected(e));
        
        // Check for existing gamepads
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                this.onGamepadConnected({ gamepad: gamepads[i] });
            }
        }
        
        // Start gamepad polling
        this.gamepadInterval = setInterval(() => this.updateGamepad(), 16);
    }
    
    onGamepadConnected(event) {
        this.gamepad.active = true;
        this.gamepad.index = event.gamepad.index;
        console.log('Gamepad connected:', event.gamepad.id);
    }
    
    onGamepadDisconnected(event) {
        this.gamepad.active = false;
        this.gamepad.index = null;
        console.log('Gamepad disconnected');
    }
    
    updateGamepad() {
        if (!this.gamepad.active) return;
        
        const gamepad = navigator.getGamepads()[this.gamepad.index];
        if (!gamepad) {
            this.gamepad.active = false;
            return;
        }
        
        // Update axes
        for (let i = 0; i < gamepad.axes.length; i++) {
            this.gamepad.axes[i] = gamepad.axes[i];
        }
        
        // Update buttons
        this.gamepad.buttons = [];
        for (let i = 0; i < gamepad.buttons.length; i++) {
            this.gamepad.buttons[i] = {
                pressed: gamepad.buttons[i].pressed,
                value: gamepad.buttons[i].value
            };
        }
        
        // Start engine on first gamepad input
        if (!GAME_STATE.isEngineOn) {
            GAME_STATE.isEngineOn = true;
            GAME_STATE.gear = 'D';
        }
    }
    
    // ============================================
    // UI BUTTONS SETUP
    // ============================================
    setupUIButtons() {
        // Accelerate button
        const accelerateBtn = document.getElementById('accelerateBtn');
        if (accelerateBtn) {
            accelerateBtn.addEventListener('mousedown', () => this.onButtonDown('accelerate'));
            accelerateBtn.addEventListener('mouseup', () => this.onButtonUp('accelerate'));
            accelerateBtn.addEventListener('mouseleave', () => this.onButtonUp('accelerate'));
            accelerateBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.onButtonDown('accelerate'); });
            accelerateBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.onButtonUp('accelerate'); });
        }
        
        // Brake button
        const brakeBtn = document.getElementById('brakeBtn');
        if (brakeBtn) {
            brakeBtn.addEventListener('mousedown', () => this.onButtonDown('brake'));
            brakeBtn.addEventListener('mouseup', () => this.onButtonUp('brake'));
            brakeBtn.addEventListener('mouseleave', () => this.onButtonUp('brake'));
            brakeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.onButtonDown('brake'); });
            brakeBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.onButtonUp('brake'); });
        }
        
        // Boost button
        const boostBtn = document.getElementById('boostBtn');
        if (boostBtn) {
            boostBtn.addEventListener('mousedown', () => this.onButtonDown('boost'));
            boostBtn.addEventListener('mouseup', () => this.onButtonUp('boost'));
            boostBtn.addEventListener('mouseleave', () => this.onButtonUp('boost'));
            boostBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.onButtonDown('boost'); });
            boostBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.onButtonUp('boost'); });
        }
        
        // Handbrake button
        const handbrakeBtn = document.getElementById('handbrakeBtn');
        if (handbrakeBtn) {
            handbrakeBtn.addEventListener('mousedown', () => this.onButtonDown('handbrake'));
            handbrakeBtn.addEventListener('mouseup', () => this.onButtonUp('handbrake'));
            handbrakeBtn.addEventListener('mouseleave', () => this.onButtonUp('handbrake'));
            handbrakeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.onButtonDown('handbrake'); });
            handbrakeBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.onButtonUp('handbrake'); });
        }
        
        // Mute button
        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) {
            muteBtn.addEventListener('click', (e) => { e.preventDefault(); audioManager.toggleMute(); });
        }
    }
    
    onButtonDown(button) {
        this.buttons[button] = true;
        
        // Update UI
        const btn = document.getElementById(`${button}Btn`);
        if (btn && button === 'handbrake') {
            btn.classList.add('active');
        }
    }
    
    onButtonUp(button) {
        this.buttons[button] = false;
        
        // Update UI
        const btn = document.getElementById(`${button}Btn`);
        if (btn && button === 'handbrake') {
            btn.classList.remove('active');
        }
    }
    
    // ============================================
    // WINDOW EVENTS
    // ============================================
    setupWindowEvents() {
        // Blur event - pause game
        window.addEventListener('blur', () => {
            // Pause audio
            audioManager.suspend();
        });
        
        // Focus event - resume game
        window.addEventListener('focus', () => {
            // Resume audio
            audioManager.resume();
        });
    }
    
    // ============================================
    // GET INPUT STATE
    // ============================================
    getThrottle() {
        // Keyboard
        if (this.keys.ArrowUp || this.keys.w || this.buttons.accelerate) return 1;
        
        // Touch
        if (this.touch.throttle > 0) return this.touch.throttle;
        
        // Gamepad
        if (this.gamepad.active) {
            // Right trigger (index 3 for some gamepads)
            if (this.gamepad.buttons[7] && this.gamepad.buttons[7].value > 0.1) {
                return this.gamepad.buttons[7].value * this.sensitivity.gamepad.throttle;
            }
            // Left trigger for reverse
            if (this.gamepad.buttons[6] && this.gamepad.buttons[6].value > 0.1) {
                return -this.gamepad.buttons[6].value * this.sensitivity.gamepad.throttle;
            }
        }
        
        return 0;
    }
    
    getBrake() {
        // Keyboard
        if (this.keys.ArrowDown || this.keys.s || this.buttons.brake) return 1;
        
        // Touch
        if (this.touch.brake > 0) return this.touch.brake;
        
        // Gamepad
        if (this.gamepad.active) {
            // Left trigger (index 2 for some gamepads)
            if (this.gamepad.buttons[6] && this.gamepad.buttons[6].value > 0.1) {
                return this.gamepad.buttons[6].value * this.sensitivity.gamepad.throttle;
            }
        }
        
        return 0;
    }
    
    getSteering() {
        // Keyboard
        let steering = 0;
        if (this.keys.ArrowLeft || this.keys.a) steering -= 1;
        if (this.keys.ArrowRight || this.keys.d) steering += 1;
        if (steering !== 0) return steering;
        
        // Touch
        if (Math.abs(this.touch.steering) > 0.01) return this.touch.steering;
        
        // Gamepad
        if (this.gamepad.active) {
            // Left stick horizontal
            const stickX = this.gamepad.axes[0];
            if (Math.abs(stickX) > this.sensitivity.gamepad.deadzone) {
                return stickX * this.sensitivity.gamepad.steering;
            }
        }
        
        return 0;
    }
    
    getHandbrake() {
        // Keyboard
        if (this.keys[' '] || this.buttons.handbrake) return true;
        
        // Gamepad
        if (this.gamepad.active) {
            // Right shoulder button (index 5)
            if (this.gamepad.buttons[5] && this.gamepad.buttons[5].pressed) return true;
        }
        
        return false;
    }
    
    getBoost() {
        // Keyboard
        if (this.keys.Shift || this.keys.ShiftLeft || this.keys.ShiftRight || this.buttons.boost) return true;
        
        // Gamepad
        if (this.gamepad.active) {
            // Left shoulder button (index 4)
            if (this.gamepad.buttons[4] && this.gamepad.buttons[4].pressed) return true;
        }
        
        return false;
    }
    
    // ============================================
    // UPDATE
    // ============================================
    update() {
        // Update gamepad state
        if (this.gamepad.active) {
            const gamepad = navigator.getGamepads()[this.gamepad.index];
            if (gamepad) {
                for (let i = 0; i < gamepad.axes.length; i++) {
                    this.gamepad.axes[i] = gamepad.axes[i];
                }
                
                for (let i = 0; i < gamepad.buttons.length; i++) {
                    this.gamepad.buttons[i] = {
                        pressed: gamepad.buttons[i].pressed,
                        value: gamepad.buttons[i].value
                    };
                }
            }
        }
    }
    
    // ============================================
    // CLEANUP
    // ============================================
    cleanup() {
        // Clear event listeners
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        
        // Clear gamepad interval
        if (this.gamepadInterval) {
            clearInterval(this.gamepadInterval);
        }
        
        // Reset state
        this.keys = {};
        this.touch = { active: false };
        this.gamepad = { active: false };
        this.buttons = {};
    }
}

// ============================================
// SINGLETON INSTANCE
// ============================================
const controls = new Controls();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = controls;
}
