/**
 * FORZA PORSCHE DRIVING - CONFIGURATION
 * Optimized for Exynos 1330 & 1080p Ultra HD
 */

// ============================================
// FORZA HORIZON 6 SCALE CONFIGURATION
// ============================================
const FORZA_SCALE = {
    carWidth: 2.0,        // Porsche 911 width ~1.9m
    carLength: 4.5,       // Porsche 911 length ~4.5m
    carHeight: 1.3,       // Porsche 911 height ~1.3m
    roadWidth: 12.0,      // Standard 2-lane road
    worldScale: 1.0,
    wheelRadius: 0.35,
    wheelThickness: 0.15
};

// ============================================
// RENDERING CONFIGURATION (Ultra HD)
// ============================================
const RENDER_CONFIG = {
    resolution: {
        width: 1920,
        height: 1080
    },
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    antialias: true,
    shadowMapSize: 2048,
    shadowMapType: 'PCFSoftShadowMap',
    toneMapping: 'ACESFilmicToneMapping',
    toneMappingExposure: 1.0,
    physicallyCorrectLights: true,
    maxLights: 10
};

// ============================================
// PERFORMANCE SETTINGS (Exynos 1330 Optimized)
// ============================================
const PERFORMANCE = {
    // Quality levels: LOW, MEDIUM, HIGH, ULTRA
    quality: 'ULTRA',
    
    // LOD (Level of Detail) distances
    lodDistances: {
        high: 50,
        medium: 150,
        low: 300
    },
    
    // Culling distances
    culling: {
        trees: 500,
        buildings: 800,
        environment: 1000
    },
    
    // Shadow settings
    shadows: {
        enabled: true,
        resolution: 2048,
        cascades: 3
    },
    
    // Reflection settings
    reflections: {
        enabled: true,
        resolution: 512,
        clipBias: 0.003
    },
    
    // Post-processing
    postProcessing: {
        enabled: true,
        bloom: true,
        ssao: false, // Disabled for Exynos 1330 performance
        fxaa: true
    },
    
    // Particle effects
    particles: {
        enabled: true,
        maxCount: 500
    },
    
    // Texture settings
    textures: {
        anisotropy: 4,
        compression: 'ETC1', // Best for mobile
        maxSize: 2048
    }
};

// ============================================
// PHYSICS CONFIGURATION
// ============================================
const PHYSICS_CONFIG = {
    // Car physics
    maxSpeed: 300,           // km/h
    accelerationRate: 0.08,
    decelerationRate: 0.15,
    brakeForce: 0.3,
    handbrakeForce: 0.5,
    steeringSensitivity: 0.025,
    maxSteeringAngle: Math.PI / 12,
    traction: 0.98,
    driftTraction: 0.75,
    airResistance: 0.0015,
    rollingResistance: 0.008,
    
    // Boost system
    boostMultiplier: 3.0,
    boostConsumption: 8,
    boostRegeneration: 2,
    maxBoostCharge: 100,
    
    // Gear ratios (Forza-style)
    gearRatios: [
        { minSpeed: 0, maxSpeed: 60, ratio: 3.8 },
        { minSpeed: 40, maxSpeed: 100, ratio: 2.8 },
        { minSpeed: 70, maxSpeed: 150, ratio: 2.0 },
        { minSpeed: 120, maxSpeed: 200, ratio: 1.5 },
        { minSpeed: 170, maxSpeed: 250, ratio: 1.2 },
        { minSpeed: 220, maxSpeed: 300, ratio: 1.0 }
    ],
    
    // Suspension
    suspension: {
        stiffness: 30,
        damping: 5,
        restLength: 0.3
    },
    
    // Collision
    collision: {
        enabled: true,
        bounce: 0.2,
        friction: 0.8
    }
};

// ============================================
// AUDIO CONFIGURATION (Opus Support)
// ============================================
const AUDIO_CONFIG = {
    format: 'opus',         // Use Opus codec
    sampleRate: 48000,      // 48kHz for high quality
    bitrate: 128,           // 128kbps Opus
    channels: 2,           // Stereo
    
    // Volume levels (0.0 - 1.0)
    volume: {
        master: 0.8,
        engine: 0.7,
        boost: 0.6,
        tireScreech: 0.8,
        ambient: 0.5,
        ui: 0.7
    },
    
    // Audio file paths
    paths: {
        engine: 'assets/audio/engine.opus',
        boost: 'assets/audio/boost.opus',
        tireScreech: 'assets/audio/tire_screech.opus',
        handbrake: 'assets/audio/handbrake.opus',
        gearShift: 'assets/audio/gear_shift.opus',
        ambient: 'assets/audio/ambient.opus'
    },
    
    // Audio context settings
    audioContext: {
        latencyHint: 'interactive',
        sampleRate: 48000
    }
};

// ============================================
// WORLD CONFIGURATION
// ============================================
const WORLD_CONFIG = {
    size: {
        width: 2000,
        height: 2000,
        depth: 2000
    },
    
    road: {
        length: 1000,
        width: FORZA_SCALE.roadWidth,
        segments: 40,
        markings: {
            centerLine: true,
            edgeLines: true,
            spacing: 10
        }
    },
    
    environment: {
        trees: {
            count: 200,
            density: 0.05,
            types: ['pine', 'oak', 'palm']
        },
        buildings: {
            count: 50,
            density: 0.02,
            maxFloors: 8
        },
        mountains: {
            count: 8,
            maxHeight: 300
        }
    },
    
    // Lighting
    lighting: {
        ambient: { color: 0x404040, intensity: 0.4 },
        directional: { 
            color: 0xFFFFFF, 
            intensity: 1.0,
            position: { x: 500, y: 300, z: -500 }
        },
        hemisphere: { 
            skyColor: 0x87CEEB, 
            groundColor: 0x333333, 
            intensity: 0.3
        },
        fog: {
            color: 0x001122,
            near: 1,
            far: 1500
        }
    },
    
    // Camera settings
    camera: {
        fov: 60,
        near: 0.1,
        far: 2000,
        followDistance: 12,
        followHeight: 4,
        lookAhead: 5
    }
};

// ============================================
// UI CONFIGURATION
// ============================================
const UI_CONFIG = {
    // Display units
    units: {
        speed: 'km/h',
        distance: 'm',
        time: 'mm:ss'
    },
    
    // HUD visibility
    hud: {
        speed: true,
        gear: true,
        fps: true,
        stz: true,
        controls: true
    },
    
    // Colors
    colors: {
        primary: 0x00ffaa,
        secondary: 0x00aaff,
        danger: 0xff0000,
        warning: 0xffaa00,
        success: 0x00ff00,
        info: 0xffffff
    },
    
    // Fonts
    fonts: {
        primary: 'Courier New, monospace',
        secondary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
};

// ============================================
// GAME STATE INITIALIZATION
// ============================================
const GAME_STATE = {
    // Car state
    speed: 0,
    maxSpeed: PHYSICS_CONFIG.maxSpeed,
    acceleration: 0,
    steering: 0,
    handbrakeActive: false,
    boostActive: false,
    gear: 'P',
    rpm: 0,
    boostCharge: AUDIO_CONFIG.volume.maxBoostCharge,
    
    // Game state
    isEngineOn: false,
    isPaused: false,
    isGameOver: false,
    
    // Time tracking
    playTime: 0,
    lapTime: 0,
    bestLapTime: Infinity,
    
    // Position tracking
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    
    // Zone tracking
    currentZone: 'START',
    zones: ['START', 'ZONE 1', 'ZONE 2', 'ZONE 3', 'FINISH'],
    
    // Performance
    fps: 0,
    frameTime: 0,
    lastFrameTime: 0
};

// ============================================
// EXYNOS 1330 OPTIMIZATION SETTINGS
// ============================================
const EXYNOS_OPTIMIZATIONS = {
    // GPU optimizations
    gpu: {
        powerPreference: 'high-performance',
        precision: 'highp',
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false
    },
    
    // Memory management
    memory: {
        texturePoolSize: 50,
        geometryPoolSize: 100,
        materialPoolSize: 50,
        cleanupInterval: 5000 // ms
    },
    
    // Rendering optimizations
    rendering: {
        frustumCulling: true,
        sortObjects: true,
        autoClear: true,
        clearColor: 0x000000,
        clearAlpha: 1.0
    },
    
    // Battery optimizations
    battery: {
        reduceQualityOnLowBattery: true,
        lowBatteryThreshold: 0.20,
        lowQualityThreshold: 0.10
    }
};

// ============================================
// DEVICE DETECTION
// ============================================
const DEVICE = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isExynos: navigator.userAgent.includes('Exynos') || navigator.platform.includes('Samsung'),
    is1080p: window.screen.width <= 1920 && window.screen.height <= 1080,
    isUltraHD: window.screen.width > 1920 || window.screen.height > 1080,
    
    // Get device capabilities
    getCapabilities: function() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        return {
            webgl2: !!gl && gl instanceof WebGL2RenderingContext,
            webgl: !!gl,
            maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 0,
            maxAnisotropy: gl ? gl.getExtension('EXT_texture_filter_anisotropic') : null,
            precision: gl ? gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision : 0
        };
    }
};

// ============================================
// QUALITY PRESETS
// ============================================
const QUALITY_PRESETS = {
    LOW: {
        shadows: { enabled: false },
        reflections: { enabled: false },
        postProcessing: { enabled: false },
        particles: { enabled: false, maxCount: 100 },
        textures: { anisotropy: 1, maxSize: 1024 },
        lodDistances: { high: 20, medium: 80, low: 200 }
    },
    MEDIUM: {
        shadows: { enabled: true, resolution: 1024 },
        reflections: { enabled: false },
        postProcessing: { enabled: true, bloom: true, ssao: false },
        particles: { enabled: true, maxCount: 300 },
        textures: { anisotropy: 2, maxSize: 1024 },
        lodDistances: { high: 30, medium: 100, low: 250 }
    },
    HIGH: {
        shadows: { enabled: true, resolution: 2048 },
        reflections: { enabled: true, resolution: 256 },
        postProcessing: { enabled: true, bloom: true, ssao: false },
        particles: { enabled: true, maxCount: 500 },
        textures: { anisotropy: 4, maxSize: 2048 },
        lodDistances: { high: 40, medium: 120, low: 300 }
    },
    ULTRA: {
        shadows: { enabled: true, resolution: 2048 },
        reflections: { enabled: true, resolution: 512 },
        postProcessing: { enabled: true, bloom: true, ssao: false },
        particles: { enabled: true, maxCount: 1000 },
        textures: { anisotropy: 8, maxSize: 2048 },
        lodDistances: { high: 50, medium: 150, low: 400 }
    }
};

// ============================================
// AUTO-QUALITY SELECTION
// ============================================
function selectQualityPreset() {
    const capabilities = DEVICE.getCapabilities();
    
    // If Exynos 1330 detected
    if (DEVICE.isExynos) {
        // Exynos 1330 can handle Ultra quality at 1080p
        if (DEVICE.is1080p) {
            return 'ULTRA';
        }
        return 'HIGH';
    }
    
    // Mobile devices
    if (DEVICE.isMobile) {
        if (capabilities.webgl2 && capabilities.maxTextureSize >= 2048) {
            return 'HIGH';
        }
        return 'MEDIUM';
    }
    
    // Desktop
    if (capabilities.webgl2 && capabilities.maxTextureSize >= 4096) {
        return 'ULTRA';
    }
    
    return 'HIGH';
}

// Apply quality preset
function applyQualityPreset(preset) {
    const quality = QUALITY_PRESETS[preset] || QUALITY_PRESETS.HIGH;
    
    // Merge with base config
    Object.keys(quality).forEach(key => {
        if (PERFORMANCE[key]) {
            Object.assign(PERFORMANCE[key], quality[key]);
        }
    });
    
    console.log(`Applied quality preset: ${preset}`);
}

// Initialize quality on load
const SELECTED_QUALITY = selectQualityPreset();
applyQualityPreset(SELECTED_QUALITY);

// ============================================
// EXPORT CONFIGURATION
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FORZA_SCALE,
        RENDER_CONFIG,
        PERFORMANCE,
        PHYSICS_CONFIG,
        AUDIO_CONFIG,
        WORLD_CONFIG,
        UI_CONFIG,
        GAME_STATE,
        EXYNOS_OPTIMIZATIONS,
        DEVICE,
        QUALITY_PRESETS,
        SELECTED_QUALITY
    };
}
