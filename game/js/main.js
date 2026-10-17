/**
 * FORZA PORSCHE DRIVING - MAIN GAME
 * Ultra HD Open World Driving Game
 * Optimized for Exynos 1330 & 1080p
 */

// ============================================
// GAME INITIALIZATION
// ============================================

// Global references
let scene, camera, renderer, car, world, physics, controls, audioManager, uiManager;
let clock = new THREE.Clock();
let deltaTime = 0;
let lastFrameTime = 0;
let isGameRunning = false;

// Fix for THREE not being defined
if (typeof THREE === 'undefined') {
    console.error('Three.js not loaded!');
}

// ============================================
// INITIALIZE GAME
// ============================================

async function initGame() {
    console.log('Initializing Forza Porsche Driving Game...');
    console.log(`Quality Preset: ${SELECTED_QUALITY}`);
    console.log(`Device: ${DEVICE.isMobile ? 'Mobile' : 'Desktop'}`);
    console.log(`Exynos: ${DEVICE.isExynos ? 'Yes' : 'No'}`);
    console.log(`1080p: ${DEVICE.is1080p ? 'Yes' : 'No'}`);
    
    // Show loading progress
    uiManager.showLoadingProgress(0.1);
    
    // Create scene
    scene = new THREE.Scene();
    scene.name = 'game_scene';
    
    uiManager.showLoadingProgress(0.2);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(
        WORLD_CONFIG.camera.fov,
        window.innerWidth / window.innerHeight,
        WORLD_CONFIG.camera.near,
        WORLD_CONFIG.camera.far
    );
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);
    camera.name = 'main_camera';
    
    uiManager.showLoadingProgress(0.3);
    
    // Create renderer with ultra HD settings
    renderer = new THREE.WebGLRenderer({
        antialias: RENDER_CONFIG.antialias,
        powerPreference: EXYNOS_OPTIMIZATIONS.gpu.powerPreference,
        precision: EXYNOS_OPTIMIZATIONS.gpu.precision,
        failIfMajorPerformanceCaveat: EXYNOS_OPTIMIZATIONS.gpu.failIfMajorPerformanceCaveat
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(RENDER_CONFIG.pixelRatio);
    renderer.shadowMap.enabled = PERFORMANCE.shadows.enabled;
    renderer.shadowMap.type = RENDER_CONFIG.shadowMapType;
    renderer.toneMapping = RENDER_CONFIG.toneMapping;
    renderer.toneMappingExposure = RENDER_CONFIG.toneMappingExposure;
    renderer.physicallyCorrectLights = RENDER_CONFIG.physicallyCorrectLights;
    renderer.maxLights = RENDER_CONFIG.maxLights;
    
    // Add renderer to DOM
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
        canvas.appendChild(renderer.domElement);
    } else {
        document.body.appendChild(renderer.domElement);
    }
    
    uiManager.showLoadingProgress(0.4);
    
    // Initialize audio manager
    audioManager = window.audioManager || new AudioManager();
    
    uiManager.showLoadingProgress(0.5);
    
    // Create world
    world = new World(scene);
    
    uiManager.showLoadingProgress(0.6);
    
    // Create car
    car = new Car(scene);
    car.reset(new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0));
    
    uiManager.showLoadingProgress(0.7);
    
    // Create physics engine
    physics = new PhysicsEngine(car, world);
    
    // Initialize controls
    controls = window.controls || new Controls();
    
    uiManager.showLoadingProgress(0.8);
    
    // Initialize UI
    uiManager = window.uiManager || new UIManager();
    
    // Setup event listeners
    setupEventListeners();
    
    uiManager.showLoadingProgress(0.9);
    
    // Start ambient sound
    audioManager.playAmbientSound();
    
    // Hide loading screen
    uiManager.hideLoading();
    
    // Start game loop
    isGameRunning = true;
    animate();
    
    console.log('Game initialized successfully!');
    console.log(`Renderer: ${renderer.getContext().constructor.name}`);
    console.log(`WebGL Version: ${renderer.getContext().getParameter(renderer.getContext().VERSION)}`);
}

// ============================================
// SETUP EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Window resize
    window.addEventListener('resize', onWindowResize);
    
    // Keyboard events (handled by Controls class)
    
    // Visibility change
    document.addEventListener('visibilitychange', onVisibilityChange);
    
    // Before unload
    window.addEventListener('beforeunload', onBeforeUnload);
    
    // Zone change callback
    window.zoneChangeCallback = onZoneChange;
}

// ============================================
// EVENT HANDLERS
// ============================================

function onWindowResize() {
    if (!camera || !renderer) return;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    console.log(`Window resized to ${window.innerWidth}x${window.innerHeight}`);
}

function onVisibilityChange() {
    if (document.hidden) {
        // Pause game when tab is hidden
        if (audioManager) {
            audioManager.suspend();
        }
    } else {
        // Resume game when tab is visible
        if (audioManager) {
            audioManager.resume();
        }
    }
}

function onBeforeUnload() {
    // Cleanup
    if (audioManager) {
        audioManager.cleanup();
    }
    if (controls) {
        controls.cleanup();
    }
    if (uiManager) {
        uiManager.cleanup();
    }
}

function onZoneChange(zoneName) {
    console.log(`Zone changed to: ${zoneName}`);
    
    // Play zone change sound
    if (audioManager) {
        audioManager.playSound('gearShift', { category: 'ui' });
    }
    
    // Show message
    uiManager.showMessage(`Entered ${zoneName}`, 2000);
}

// ============================================
// ANIMATION LOOP
// ============================================

function animate() {
    if (!isGameRunning) return;
    
    requestAnimationFrame(animate);
    
    // Calculate delta time
    deltaTime = clock.getDelta();
    
    // Update controls
    if (controls) {
        controls.update();
    }
    
    // Update physics
    if (physics) {
        physics.update(deltaTime, controls);
    }
    
    // Update car
    if (car) {
        const throttle = controls.getThrottle();
        const brake = controls.getBrake();
        const steering = controls.getSteering();
        const handbrake = controls.getHandbrake();
        const boost = controls.getBoost();
        
        car.update(deltaTime, throttle, brake, steering, handbrake, boost);
        
        // Update audio based on car state
        if (audioManager) {
            audioManager.updateEngineSound(car.rpm, throttle, GAME_STATE.gear);
            audioManager.playBoostSound(boost);
            audioManager.playTireScreech(steering, car.speed, handbrake);
            audioManager.playHandbrakeSound(handbrake);
        }
    }
    
    // Update world
    if (world && car) {
        world.update(car.position);
    }
    
    // Update camera
    updateCamera();
    
    // Update UI
    if (uiManager) {
        uiManager.incrementFrame();
    }
    
    // Render scene
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
    
    // Update frame time
    const now = performance.now();
    GAME_STATE.frameTime = now - lastFrameTime;
    GAME_STATE.lastFrameTime = now;
    lastFrameTime = now;
}

// ============================================
// CAMERA UPDATE
// ============================================

function updateCamera() {
    if (!camera || !car) return;
    
    const cameraOffset = new THREE.Vector3(
        Math.sin(car.group.rotation.y) * -WORLD_CONFIG.camera.followDistance,
        WORLD_CONFIG.camera.followHeight + Math.abs(car.speed) * 0.1,
        Math.cos(car.group.rotation.y) * -WORLD_CONFIG.camera.followDistance
    );
    
    const targetCameraPosition = car.group.position.clone().add(cameraOffset);
    
    // Smooth camera movement
    camera.position.lerp(targetCameraPosition, deltaTime * 5);
    
    // Look at car with slight offset
    const lookAtPosition = car.group.position.clone().add(
        new THREE.Vector3(
            Math.sin(car.group.rotation.y) * WORLD_CONFIG.camera.lookAhead,
            1,
            Math.cos(car.group.rotation.y) * WORLD_CONFIG.camera.lookAhead
        )
    );
    
    camera.lookAt(lookAtPosition);
    
    // Add slight camera shake based on speed
    if (car.speed > 50) {
        const shakeIntensity = Math.min(0.1, (car.speed - 50) / 200);
        camera.position.x += (Math.random() - 0.5) * shakeIntensity;
        camera.position.y += (Math.random() - 0.5) * shakeIntensity;
    }
}

// ============================================
// GAME STATE MANAGEMENT
// ============================================

function startEngine() {
    GAME_STATE.isEngineOn = true;
    GAME_STATE.gear = 'D';
    
    if (audioManager) {
        audioManager.playSound('engine', { category: 'engine', loop: true });
    }
}

function stopEngine() {
    GAME_STATE.isEngineOn = false;
    GAME_STATE.gear = 'P';
    
    if (audioManager) {
        audioManager.stopSound('engine');
    }
}

function resetGame() {
    if (physics) {
        physics.reset();
    }
    
    if (car) {
        car.reset(new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0));
    }
    
    if (camera) {
        camera.position.set(0, 5, 15);
        camera.lookAt(0, 0, 0);
    }
    
    GAME_STATE.isEngineOn = false;
    GAME_STATE.gear = 'P';
    GAME_STATE.speed = 0;
    GAME_STATE.rpm = 0;
    GAME_STATE.boostCharge = PHYSICS_CONFIG.maxBoostCharge;
    GAME_STATE.playTime = 0;
    GAME_STATE.currentZone = 'START';
    
    uiManager.showMessage('GAME RESET', 2000);
}

// ============================================
// QUALITY SETTINGS
// ============================================

function setQuality(quality) {
    const preset = QUALITY_PRESETS[quality];
    if (!preset) return;
    
    // Apply preset
    applyQualityPreset(quality);
    
    // Update renderer settings
    if (renderer) {
        renderer.shadowMap.enabled = preset.shadows.enabled;
        renderer.shadowMap.type = RENDER_CONFIG.shadowMapType;
    }
    
    console.log(`Quality set to: ${quality}`);
    uiManager.showMessage(`Quality: ${quality}`, 2000);
}

// ============================================
// START GAME
// ============================================

function startGame() {
    resetGame();
    startEngine();
    isGameRunning = true;
    animate();
}

// ============================================
// PAUSE GAME
// ============================================

function pauseGame() {
    isGameRunning = false;
    if (audioManager) {
        audioManager.suspend();
    }
    uiManager.showMessage('PAUSED', 1000);
}

function resumeGame() {
    isGameRunning = true;
    if (audioManager) {
        audioManager.resume();
    }
    animate();
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

// Add keyboard shortcuts for quality and debug
document.addEventListener('keydown', (e) => {
    // Quality presets
    if (e.key === '1') setQuality('LOW');
    if (e.key === '2') setQuality('MEDIUM');
    if (e.key === '3') setQuality('HIGH');
    if (e.key === '4') setQuality('ULTRA');
    
    // Reset game
    if (e.key === 'r' || e.key === 'R') {
        resetGame();
    }
    
    // Toggle HUD
    if (e.key === 'h' || e.key === 'H') {
        uiManager.toggleHud();
    }
    
    // Start engine
    if (e.key === 'e' || e.key === 'E') {
        startEngine();
    }
    
    // Stop engine
    if (e.key === 'q' || e.key === 'Q') {
        stopEngine();
    }
});

// ============================================
// INITIALIZE ON DOM LOAD
// ============================================

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initGame();
} else {
    document.addEventListener('DOMContentLoaded', initGame);
}

// ============================================
// EXPORT FOR MODULE USAGE
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initGame,
        startGame,
        pauseGame,
        resumeGame,
        resetGame,
        setQuality,
        startEngine,
        stopEngine
    };
}
