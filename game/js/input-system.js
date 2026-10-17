/**
 * PORSCHE DRIVING - INPUT SYSTEM
 * User Input Management for Mobile
 * API Key, Settings, and Game Controls
 */

class InputSystem {
    constructor() {
        // Input state
        this.apiKey = '';
        this.apiKeySet = false;
        this.settingsOpen = false;
        this.isMobile = this.detectMobile();
        
        // UI Elements
        this.inputModal = document.getElementById('input-modal');
        this.apiKeyInput = document.getElementById('api-key-input');
        this.saveApiKeyBtn = document.getElementById('save-api-key');
        this.skipApiBtn = document.getElementById('skip-api');
        this.settingsBtn = document.getElementById('settings-btn');
        
        // Initialize
        this.init();
    }
    
    // ============================================
    // DETECT MOBILE
    // ============================================
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.platform.includes('Win') && navigator.userAgent.includes('Touch'));
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    init() {
        // Load saved API key
        this.loadApiKey();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Show input modal if API key not set
        if (!this.apiKeySet && this.apiKeyInput) {
            setTimeout(() => this.showInputModal(), 1000);
        }
    }
    
    // ============================================
    // SETUP EVENT LISTENERS
    // ============================================
    setupEventListeners() {
        // Save API key button
        if (this.saveApiKeyBtn) {
            this.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        }
        
        // Skip API button
        if (this.skipApiBtn) {
            this.skipApiBtn.addEventListener('click', () => this.skipApi());
        }
        
        // API key input (Enter key)
        if (this.apiKeyInput) {
            this.apiKeyInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveApiKey();
                }
            });
        }
        
        // Settings button
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => this.openSettings());
        }
        
        // Close modal on background click
        if (this.inputModal) {
            this.inputModal.addEventListener('click', (e) => {
                if (e.target === this.inputModal) {
                    this.hideInputModal();
                }
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape to close modal
            if (e.key === 'Escape' && this.inputModal && !this.inputModal.classList.contains('hidden')) {
                this.hideInputModal();
            }
            
            // S key to open settings
            if (e.key === 's' || e.key === 'S') {
                this.openSettings();
            }
        });
    }
    
    // ============================================
    // SHOW INPUT MODAL
    // ============================================
    showInputModal() {
        if (this.inputModal) {
            this.inputModal.classList.remove('hidden');
            
            // Focus input field
            if (this.apiKeyInput) {
                setTimeout(() => {
                    this.apiKeyInput.focus();
                }, 100);
            }
            
            // Pause game
            this.pauseGame();
        }
    }
    
    // ============================================
    // HIDE INPUT MODAL
    // ============================================
    hideInputModal() {
        if (this.inputModal) {
            this.inputModal.classList.add('hidden');
            this.resumeGame();
        }
    }
    
    // ============================================
    // SAVE API KEY
    // ============================================
    saveApiKey() {
        if (!this.apiKeyInput) return;
        
        const key = this.apiKeyInput.value.trim();
        
        if (!key) {
            alert('API Key দিন!');
            return;
        }
        
        // Save to localStorage
        this.apiKey = key;
        localStorage.setItem('groq_api_key', key);
        this.apiKeySet = true;
        
        // Update AI Chat Manager
        if (typeof aiChatManager !== 'undefined' && aiChatManager) {
            aiChatManager.setApiKey(key);
        }
        
        // Hide modal
        this.hideInputModal();
        
        // Clear input
        this.apiKeyInput.value = '';
        
        console.log('API Key saved successfully');
    }
    
    // ============================================
    // SKIP API
    // ============================================
    skipApi() {
        this.hideInputModal();
        
        // Mark as skipped (won't show modal again in this session)
        this.apiKeySet = true;
        
        console.log('API Key setup skipped');
    }
    
    // ============================================
    // LOAD API KEY
    // ============================================
    loadApiKey() {
        const savedKey = localStorage.getItem('groq_api_key');
        
        if (savedKey) {
            this.apiKey = savedKey;
            this.apiKeySet = true;
            
            // Update AI Chat Manager
            if (typeof aiChatManager !== 'undefined' && aiChatManager) {
                aiChatManager.setApiKey(savedKey);
            }
            
            console.log('API Key loaded from localStorage');
        }
    }
    
    // ============================================
    // OPEN SETTINGS
    // ============================================
    openSettings() {
        this.settingsOpen = !this.settingsOpen;
        
        if (this.settingsOpen) {
            // Show settings modal
            this.showSettingsModal();
            this.pauseGame();
        } else {
            this.hideSettingsModal();
            this.resumeGame();
        }
    }
    
    // ============================================
    // SHOW SETTINGS MODAL
    // ============================================
    showSettingsModal() {
        // Create settings modal if doesn't exist
        if (!document.getElementById('settings-modal')) {
            this.createSettingsModal();
        }
        
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Update API key display
            const apiKeyDisplay = document.getElementById('settings-api-key');
            if (apiKeyDisplay) {
                apiKeyDisplay.textContent = this.apiKey ? '✓ Set' : '✗ Not Set';
            }
        }
    }
    
    // ============================================
    // HIDE SETTINGS MODAL
    // ============================================
    hideSettingsModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    // ============================================
    // CREATE SETTINGS MODAL
    // ============================================
    createSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.className = 'settings-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2 class="modal-title">Settings</h2>
                <div class="settings-section">
                    <h3>API Configuration</h3>
                    <div class="settings-item">
                        <span>Groq API Key:</span>
                        <span id="settings-api-key">${this.apiKey ? '✓ Set' : '✗ Not Set'}</span>
                    </div>
                    <button id="change-api-key" class="modal-btn secondary">Change API Key</button>
                </div>
                <div class="settings-section">
                    <h3>Game Settings</h3>
                    <div class="settings-item">
                        <span>Quality:</span>
                        <select id="quality-select" class="settings-select">
                            <option value="ULTRA">Ultra (Recommended)</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                    </div>
                    <div class="settings-item">
                        <span>Sound:</span>
                        <label class="switch">
                            <input type="checkbox" id="sound-toggle" ${!audioManager || !audioManager.isMuted ? 'checked' : ''}>
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
                <div class="settings-section">
                    <h3>Controls</h3>
                    <div class="settings-item">
                        <span>Steering Sensitivity:</span>
                        <input type="range" id="steering-sensitivity" min="0.5" max="2" step="0.1" value="1">
                    </div>
                </div>
                <div class="modal-buttons">
                    <button id="save-settings" class="modal-btn primary">Save</button>
                    <button id="close-settings" class="modal-btn secondary">Close</button>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .settings-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                z-index: 30000;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
                backdrop-filter: blur(10px);
            }
            
            .settings-modal.hidden {
                display: none;
            }
            
            .settings-section {
                margin-bottom: 20px;
            }
            
            .settings-section h3 {
                color: #00ffaa;
                font-size: 16px;
                margin-bottom: 10px;
                border-bottom: 1px solid rgba(0, 255, 170, 0.3);
                padding-bottom: 5px;
            }
            
            .settings-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                color: #e0e0e0;
                font-size: 14px;
            }
            
            .settings-select {
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                color: #fff;
                font-size: 14px;
                outline: none;
                cursor: pointer;
            }
            
            .settings-select:focus {
                border-color: #00ffaa;
            }
            
            input[type="range"] {
                width: 150px;
                -webkit-appearance: none;
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                outline: none;
            }
            
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                background: #00ffaa;
                border-radius: 50%;
                cursor: pointer;
            }
            
            /* Switch */
            .switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
            }
            
            .switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(255, 255, 255, 0.1);
                transition: .4s;
                border-radius: 24px;
            }
            
            .slider:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
            }
            
            input:checked + .slider {
                background-color: #00ffaa;
            }
            
            input:checked + .slider:before {
                transform: translateX(26px);
            }
        `;
        
        document.body.appendChild(style);
        document.body.appendChild(modal);
        
        // Set up event listeners
        this.setupSettingsListeners();
    }
    
    // ============================================
    // SETUP SETTINGS LISTENERS
    // ============================================
    setupSettingsListeners() {
        // Close button
        const closeBtn = document.getElementById('close-settings');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideSettingsModal());
        }
        
        // Save button
        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }
        
        // Change API key button
        const changeApiBtn = document.getElementById('change-api-key');
        if (changeApiBtn) {
            changeApiBtn.addEventListener('click', () => {
                this.hideSettingsModal();
                this.showInputModal();
            });
        }
        
        // Sound toggle
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                if (typeof audioManager !== 'undefined' && audioManager) {
                    if (e.target.checked) {
                        audioManager.resume();
                    } else {
                        audioManager.suspend();
                    }
                }
            });
        }
        
        // Quality select
        const qualitySelect = document.getElementById('quality-select');
        if (qualitySelect) {
            qualitySelect.addEventListener('change', (e) => {
                this.setQuality(e.target.value);
            });
        }
        
        // Steering sensitivity
        const steeringSlider = document.getElementById('steering-sensitivity');
        if (steeringSlider) {
            steeringSlider.addEventListener('input', (e) => {
                this.setSteeringSensitivity(parseFloat(e.target.value));
            });
        }
        
        // Close on background click
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    this.hideSettingsModal();
                }
            });
        }
    }
    
    // ============================================
    // SAVE SETTINGS
    // ============================================
    saveSettings() {
        // Save quality
        const qualitySelect = document.getElementById('quality-select');
        if (qualitySelect) {
            const quality = qualitySelect.value;
            localStorage.setItem('game_quality', quality);
            this.setQuality(quality);
        }
        
        // Save sound preference
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            localStorage.setItem('sound_enabled', soundToggle.checked);
        }
        
        // Save steering sensitivity
        const steeringSlider = document.getElementById('steering-sensitivity');
        if (steeringSlider) {
            localStorage.setItem('steering_sensitivity', steeringSlider.value);
        }
        
        this.hideSettingsModal();
        console.log('Settings saved');
    }
    
    // ============================================
    // SET QUALITY
    // ============================================
    setQuality(quality) {
        if (typeof PERFORMANCE !== 'undefined') {
            PERFORMANCE.quality = quality;
        }
        
        if (typeof applyQualityPreset !== 'function') {
            applyQualityPreset(quality);
        }
        
        console.log(`Quality set to: ${quality}`);
    }
    
    // ============================================
    // SET STEERING SENSITIVITY
    // ============================================
    setSteeringSensitivity(sensitivity) {
        if (typeof controls !== 'undefined' && controls) {
            controls.sensitivity.steering = sensitivity;
            controls.sensitivity.touch.steering = sensitivity * 0.01;
        }
        
        console.log(`Steering sensitivity set to: ${sensitivity}`);
    }
    
    // ============================================
    // LOAD SETTINGS
    // ============================================
    loadSettings() {
        // Load quality
        const savedQuality = localStorage.getItem('game_quality');
        if (savedQuality) {
            this.setQuality(savedQuality);
        }
        
        // Load sound preference
        const soundEnabled = localStorage.getItem('sound_enabled');
        if (soundEnabled === 'false' && typeof audioManager !== 'undefined' && audioManager) {
            audioManager.toggleMute();
        }
        
        // Load steering sensitivity
        const steeringSensitivity = localStorage.getItem('steering_sensitivity');
        if (steeringSensitivity) {
            this.setSteeringSensitivity(parseFloat(steeringSensitivity));
        }
    }
    
    // ============================================
    // PAUSE GAME
    // ============================================
    pauseGame() {
        if (typeof isGameRunning !== 'undefined') {
            isGameRunning = false;
        }
        
        if (typeof audioManager !== 'undefined' && audioManager) {
            audioManager.suspend();
        }
    }
    
    // ============================================
    // RESUME GAME
    // ============================================
    resumeGame() {
        if (typeof isGameRunning !== 'undefined') {
            isGameRunning = true;
            if (typeof animate !== 'undefined') {
                animate();
            }
        }
        
        if (typeof audioManager !== 'undefined' && audioManager) {
            audioManager.resume();
        }
    }
    
    // ============================================
    // GET API KEY
    // ============================================
    getApiKey() {
        return this.apiKey;
    }
    
    // ============================================
    // IS API KEY SET
    // ============================================
    isApiKeySet() {
        return this.apiKeySet;
    }
    
    // ============================================
    // CLEANUP
    // ============================================
    cleanup() {
        this.apiKey = '';
        this.apiKeySet = false;
        this.settingsOpen = false;
    }
}

// ============================================
// SINGLETON INSTANCE
// ============================================
const inputSystem = new InputSystem();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = inputSystem;
}
