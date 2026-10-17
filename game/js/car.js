/**
 * FORZA PORSCHE DRIVING - CAR SYSTEM
 * High Poly Porsche 911 Model with Forza Horizon 6 Scale
 */

class Car {
    constructor(scene) {
        this.scene = scene;
        this.group = null;
        this.wheels = [];
        this.headlights = [];
        this.taillights = [];
        this.velocity = new THREE.Vector3();
        this.angularVelocity = 0;
        this.position = new THREE.Vector3();
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        
        // Car state
        this.speed = 0;
        this.rpm = 0;
        this.steeringAngle = 0;
        this.wheelRotation = 0;
        this.isDrifting = false;
        this.suspensionTravel = [0, 0, 0, 0]; // Front left, front right, rear left, rear right
        
        // Create car
        this.create();
    }
    
    // ============================================
    // CREATE PORSCHE 911 (High Poly)
    // ============================================
    create() {
        this.group = new THREE.Group();
        this.group.position.set(0, 0, 0);
        this.group.castShadow = true;
        this.group.receiveShadow = false;
        
        // Car dimensions based on Forza Horizon 6 scale
        const width = FORZA_SCALE.carWidth;
        const length = FORZA_SCALE.carLength;
        const height = FORZA_SCALE.carHeight;
        
        // Porsche signature colors
        const bodyColor = new THREE.Color(0xC8102E); // Guards Red
        const roofColor = new THREE.Color(0x000000);
        const glassColor = new THREE.Color(0x4A90E2);
        const chromeColor = new THREE.Color(0xC0C0C0);
        const wheelColor = new THREE.Color(0x1A1A1A);
        const tireColor = new THREE.Color(0x000000);
        const brakeColor = new THREE.Color(0xFF0000);
        const lightColor = new THREE.Color(0xFFFF00);
        
        // Create materials with high quality settings
        const bodyMaterial = new THREE.MeshPhysicalMaterial({
            color: bodyColor,
            metalness: 0.8,
            roughness: 0.2,
            clearcoat: 0.5,
            clearcoatRoughness: 0.1,
            reflectivity: 0.9,
            envMapIntensity: 0.5
        });
        
        const roofMaterial = new THREE.MeshPhysicalMaterial({
            color: roofColor,
            metalness: 0.1,
            roughness: 0.8
        });
        
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: glassColor,
            transparent: true,
            opacity: 0.3,
            metalness: 0.1,
            roughness: 0.1,
            transmission: 0.8,
            ior: 1.5,
            thickness: 0.1
        });
        
        const chromeMaterial = new THREE.MeshPhysicalMaterial({
            color: chromeColor,
            metalness: 1.0,
            roughness: 0.1,
            envMapIntensity: 0.8
        });
        
        const tireMaterial = new THREE.MeshPhysicalMaterial({
            color: tireColor,
            metalness: 0.0,
            roughness: 0.9
        });
        
        const wheelMaterial = new THREE.MeshPhysicalMaterial({
            color: chromeColor,
            metalness: 0.9,
            roughness: 0.2
        });
        
        // ============================================
        // BODY
        // ============================================
        const bodyGroup = new THREE.Group();
        
        // Main body (high poly)
        const bodyGeometry = new THREE.BoxGeometry(
            width * 0.8, 
            height * 0.6, 
            length * 0.4, 
            64, 64, 64
        );
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = height * 0.3;
        body.castShadow = true;
        body.receiveShadow = true;
        bodyGroup.add(body);
        
        // Front bumper
        const frontBumperGeometry = new THREE.BoxGeometry(
            width * 0.9, 
            height * 0.2, 
            length * 0.15, 
            32, 32, 32
        );
        const frontBumper = new THREE.Mesh(frontBumperGeometry, bodyMaterial);
        frontBumper.position.set(0, height * 0.15, length * 0.25);
        frontBumper.castShadow = true;
        bodyGroup.add(frontBumper);
        
        // Rear bumper with exhaust
        const rearBumperGeometry = new THREE.BoxGeometry(
            width * 0.9, 
            height * 0.2, 
            length * 0.1, 
            32, 32, 32
        );
        const rearBumper = new THREE.Mesh(rearBumperGeometry, bodyMaterial);
        rearBumper.position.set(0, height * 0.15, -length * 0.25);
        rearBumper.castShadow = true;
        bodyGroup.add(rearBumper);
        
        // Exhaust pipes
        const exhaustGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 32, 32);
        const exhaustMaterial = chromeMaterial.clone();
        exhaustMaterial.emissive = new THREE.Color(0x333333);
        exhaustMaterial.emissiveIntensity = 0.2;
        
        const leftExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
        leftExhaust.position.set(-width * 0.2, height * 0.15, -length * 0.28);
        leftExhaust.rotation.x = Math.PI / 2;
        leftExhaust.castShadow = true;
        bodyGroup.add(leftExhaust);
        
        const rightExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
        rightExhaust.position.set(width * 0.2, height * 0.15, -length * 0.28);
        rightExhaust.rotation.x = Math.PI / 2;
        rightExhaust.castShadow = true;
        bodyGroup.add(rightExhaust);
        
        this.group.add(bodyGroup);
        
        // ============================================
        // ROOF
        // ============================================
        const roofGeometry = new THREE.BoxGeometry(
            width * 0.7, 
            height * 0.2, 
            length * 0.5, 
            48, 48, 48
        );
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = height * 0.75;
        roof.castShadow = true;
        this.group.add(roof);
        
        // ============================================
        // WINDOWS
        // ============================================
        // Windshield
        const windshieldGeometry = new THREE.BoxGeometry(
            width * 0.65, 
            height * 0.35, 
            length * 0.05, 
            32, 32, 32
        );
        const windshield = new THREE.Mesh(windshieldGeometry, glassMaterial);
        windshield.position.set(0, height * 0.65, length * 0.18);
        windshield.castShadow = true;
        this.group.add(windshield);
        
        // Rear window
        const rearWindow = new THREE.Mesh(windshieldGeometry, glassMaterial);
        rearWindow.position.set(0, height * 0.65, -length * 0.18);
        rearWindow.castShadow = true;
        this.group.add(rearWindow);
        
        // Side windows
        const sideWindowGeometry = new THREE.BoxGeometry(
            width * 0.03, 
            height * 0.3, 
            length * 0.4, 
            24, 24, 24
        );
        const leftWindow = new THREE.Mesh(sideWindowGeometry, glassMaterial);
        leftWindow.position.set(-width * 0.38, height * 0.6, 0);
        leftWindow.castShadow = true;
        this.group.add(leftWindow);
        
        const rightWindow = new THREE.Mesh(sideWindowGeometry, glassMaterial);
        rightWindow.position.set(width * 0.38, height * 0.6, 0);
        rightWindow.castShadow = true;
        this.group.add(rightWindow);
        
        // ============================================
        // LIGHTS
        // ============================================
        // Headlights
        const headlightGeometry = new THREE.SphereGeometry(0.08, 32, 32);
        const headlightMaterial = chromeMaterial.clone();
        headlightMaterial.emissive = lightColor;
        headlightMaterial.emissiveIntensity = 0.3;
        
        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-width * 0.35, height * 0.2, length * 0.25);
        leftHeadlight.castShadow = true;
        this.group.add(leftHeadlight);
        this.headlights.push(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(width * 0.35, height * 0.2, length * 0.25);
        rightHeadlight.castShadow = true;
        this.group.add(rightHeadlight);
        this.headlights.push(rightHeadlight);
        
        // Taillights
        const taillightMaterial = chromeMaterial.clone();
        taillightMaterial.emissive = brakeColor;
        taillightMaterial.emissiveIntensity = 0.5;
        
        const leftTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
        leftTaillight.position.set(-width * 0.35, height * 0.2, -length * 0.25);
        leftTaillight.castShadow = true;
        this.group.add(leftTaillight);
        this.taillights.push(leftTaillight);
        
        const rightTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
        rightTaillight.position.set(width * 0.35, height * 0.2, -length * 0.25);
        rightTaillight.castShadow = true;
        this.group.add(rightTaillight);
        this.taillights.push(rightTaillight);
        
        // Brake lights (separate from taillights)
        const brakeLightMaterial = new THREE.MeshBasicMaterial({
            color: brakeColor,
            emissive: brakeColor,
            emissiveIntensity: 0
        });
        
        const leftBrakeLight = new THREE.Mesh(headlightGeometry, brakeLightMaterial);
        leftBrakeLight.position.set(-width * 0.32, height * 0.18, -length * 0.26);
        this.group.add(leftBrakeLight);
        this.taillights.push(leftBrakeLight);
        
        const rightBrakeLight = new THREE.Mesh(headlightGeometry, brakeLightMaterial);
        rightBrakeLight.position.set(width * 0.32, height * 0.18, -length * 0.26);
        this.group.add(rightBrakeLight);
        this.taillights.push(rightBrakeLight);
        
        // ============================================
        // SIDE MIRRORS
        // ============================================
        const mirrorGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.3, 16, 16, 16);
        const mirrorMaterial = chromeMaterial;
        
        const leftMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
        leftMirror.position.set(-width * 0.45, height * 0.55, length * 0.1);
        leftMirror.rotation.y = Math.PI / 4;
        leftMirror.castShadow = true;
        this.group.add(leftMirror);
        
        const rightMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
        rightMirror.position.set(width * 0.45, height * 0.55, length * 0.1);
        rightMirror.rotation.y = -Math.PI / 4;
        rightMirror.castShadow = true;
        this.group.add(rightMirror);
        
        // ============================================
        // WHEELS (High Poly with Rims)
        // ============================================
        const wheelRadius = FORZA_SCALE.wheelRadius;
        const wheelThickness = FORZA_SCALE.wheelThickness;
        
        const createWheel = (x, z, isFront = false) => {
            const wheelGroup = new THREE.Group();
            
            // Tire
            const tireGeometry = new THREE.CylinderGeometry(
                wheelRadius, 
                wheelRadius, 
                wheelThickness, 
                64, 64
            );
            const tire = new THREE.Mesh(tireGeometry, tireMaterial);
            tire.rotation.x = Math.PI / 2;
            tire.castShadow = true;
            wheelGroup.add(tire);
            
            // Rim
            const rimGeometry = new THREE.CylinderGeometry(
                wheelRadius * 0.8, 
                wheelRadius * 0.8, 
                wheelThickness * 1.1, 
                64, 64
            );
            const rim = new THREE.Mesh(rimGeometry, wheelMaterial);
            rim.rotation.x = Math.PI / 2;
            rim.castShadow = true;
            wheelGroup.add(rim);
            
            // Rim spokes (5 spokes)
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                const spokeGeometry = new THREE.BoxGeometry(
                    wheelRadius * 0.6, 
                    wheelThickness * 0.1, 
                    wheelThickness * 0.1, 
                    16, 16, 16
                );
                const spoke = new THREE.Mesh(spokeGeometry, wheelMaterial);
                spoke.rotation.x = Math.PI / 2;
                spoke.position.x = Math.cos(angle) * wheelRadius * 0.4;
                spoke.position.z = Math.sin(angle) * wheelRadius * 0.4;
                spoke.castShadow = true;
                wheelGroup.add(spoke);
            }
            
            // Rim center cap
            const capGeometry = new THREE.CylinderGeometry(
                wheelRadius * 0.3, 
                wheelRadius * 0.3, 
                wheelThickness * 0.2, 
                32, 32
            );
            const cap = new THREE.Mesh(capGeometry, chromeMaterial);
            cap.rotation.x = Math.PI / 2;
            cap.position.z = wheelThickness * 0.55;
            cap.castShadow = true;
            wheelGroup.add(cap);
            
            wheelGroup.position.set(x, height * 0.25, z);
            wheelGroup.userData = { isFront: isFront };
            
            return wheelGroup;
        };
        
        const frontLeftWheel = createWheel(-width * 0.3, length * 0.15, true);
        const frontRightWheel = createWheel(width * 0.3, length * 0.15, true);
        const rearLeftWheel = createWheel(-width * 0.3, -length * 0.15, false);
        const rearRightWheel = createWheel(width * 0.3, -length * 0.15, false);
        
        this.wheels = [frontLeftWheel, frontRightWheel, rearLeftWheel, rearRightWheel];
        this.wheels.forEach(wheel => this.group.add(wheel));
        
        // ============================================
        // PORSCHE LOGO
        // ============================================
        const logoGeometry = new THREE.TorusGeometry(0.1, 0.03, 16, 64);
        const logo = new THREE.Mesh(logoGeometry, chromeMaterial);
        logo.position.set(0, height * 0.8, length * 0.15);
        logo.rotation.x = Math.PI / 2;
        logo.castShadow = true;
        this.group.add(logo);
        
        // ============================================
        // SPOILER
        // ============================================
        const spoilerGeometry = new THREE.BoxGeometry(
            width * 0.6, 
            height * 0.05, 
            length * 0.1, 
            32, 32, 32
        );
        const spoiler = new THREE.Mesh(spoilerGeometry, bodyMaterial);
        spoiler.position.set(0, height * 0.85, -length * 0.25);
        spoiler.castShadow = true;
        this.group.add(spoiler);
        
        // ============================================
        // DOOR HANDLES
        // ============================================
        const handleGeometry = new THREE.BoxGeometry(0.05, 0.03, 0.1, 8, 8, 8);
        const handleMaterial = chromeMaterial;
        
        const leftHandle = new THREE.Mesh(handleGeometry, handleMaterial);
        leftHandle.position.set(-width * 0.4, height * 0.35, 0);
        leftHandle.castShadow = true;
        this.group.add(leftHandle);
        
        const rightHandle = new THREE.Mesh(handleGeometry, handleMaterial);
        rightHandle.position.set(width * 0.4, height * 0.35, 0);
        rightHandle.castShadow = true;
        this.group.add(rightHandle);
        
        // ============================================
        // GRILLE
        // ============================================
        const grilleGeometry = new THREE.BoxGeometry(
            width * 0.3, 
            height * 0.15, 
            length * 0.03, 
            24, 24, 24
        );
        const grilleMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x222222),
            metalness: 0.8,
            roughness: 0.3
        });
        
        const grille = new THREE.Mesh(grilleGeometry, grilleMaterial);
        grille.position.set(0, height * 0.25, length * 0.28);
        grille.castShadow = true;
        this.group.add(grille);
        
        // Grille vertical slats
        for (let i = -2; i <= 2; i++) {
            const slatGeometry = new THREE.BoxGeometry(
                width * 0.01, 
                height * 0.12, 
                length * 0.04, 
                8, 8, 8
            );
            const slat = new THREE.Mesh(slatGeometry, chromeMaterial);
            slat.position.set(i * (width * 0.07), height * 0.25, length * 0.29);
            slat.castShadow = true;
            this.group.add(slat);
        }
        
        // Add car to scene
        this.scene.add(this.group);
        
        // Store references
        this.group.userData = {
            car: this,
            body: body,
            wheels: this.wheels,
            headlights: this.headlights,
            taillights: this.taillights
        };
    }
    
    // ============================================
    // UPDATE CAR
    // ============================================
    update(deltaTime, throttle, brake, steering, handbrake, boost) {
        // Update speed and RPM
        this.speed = this.velocity.length();
        this.rpm = Math.min(8000, 1000 + Math.abs(this.speed) * 100 * throttle);
        
        // Update wheel rotation based on speed
        const wheelRotationSpeed = this.speed * 10;
        this.wheelRotation += wheelRotationSpeed * deltaTime * 60;
        
        // Animate wheels
        this.wheels.forEach(wheel => {
            wheel.rotation.x = this.wheelRotation;
            
            // Steering for front wheels
            if (wheel.userData.isFront) {
                wheel.rotation.y = -steering * PHYSICS_CONFIG.maxSteeringAngle * 0.8;
            }
        });
        
        // Update steering angle
        this.steeringAngle = steering * PHYSICS_CONFIG.maxSteeringAngle;
        
        // Update headlight intensity based on speed
        const headlightIntensity = Math.min(1, this.speed / 20);
        this.headlights.forEach(light => {
            if (light.material && light.material.emissiveIntensity !== undefined) {
                light.material.emissiveIntensity = headlightIntensity;
            }
        });
        
        // Update taillight intensity based on braking
        const isBraking = brake > 0 || handbrake;
        this.taillights.forEach((light, index) => {
            if (light.material) {
                if (index >= 4) { // Brake lights
                    light.material.emissiveIntensity = isBraking ? 1.0 : 0;
                } else {
                    light.material.emissiveIntensity = isBraking ? 1.0 : 0.5;
                }
            }
        });
        
        // Update suspension based on speed and steering
        this.updateSuspension(deltaTime, steering, brake, handbrake);
        
        // Update drift state
        this.isDrifting = handbrake && Math.abs(steering) > 0.5 && this.speed > 10;
    }
    
    // ============================================
    // UPDATE SUSPENSION
    // ============================================
    updateSuspension(deltaTime, steering, brake, handbrake) {
        const stiffness = PHYSICS_CONFIG.suspension.stiffness;
        const damping = PHYSICS_CONFIG.suspension.damping;
        const restLength = PHYSICS_CONFIG.suspension.restLength;
        
        // Calculate suspension compression based on G-forces
        const gForce = Math.min(1, this.speed / 50);
        const steeringForce = Math.abs(steering) * 0.3;
        const brakeForce = brake * 0.5;
        const handbrakeForce = handbrake ? 0.7 : 0;
        
        // Front left suspension
        this.suspensionTravel[0] += (
            -restLength + 
            gForce * 0.2 + 
            steeringForce * (steering > 0 ? 0.5 : -0.5) + 
            brakeForce * 0.3 + 
            handbrakeForce * 0.4
        ) * deltaTime * stiffness - this.suspensionTravel[0] * damping * deltaTime;
        
        // Front right suspension
        this.suspensionTravel[1] += (
            -restLength + 
            gForce * 0.2 + 
            steeringForce * (steering < 0 ? 0.5 : -0.5) + 
            brakeForce * 0.3 + 
            handbrakeForce * 0.4
        ) * deltaTime * stiffness - this.suspensionTravel[1] * damping * deltaTime;
        
        // Rear left suspension
        this.suspensionTravel[2] += (
            -restLength + 
            gForce * 0.3 + 
            brakeForce * 0.7 + 
            handbrakeForce * 0.8
        ) * deltaTime * stiffness - this.suspensionTravel[2] * damping * deltaTime;
        
        // Rear right suspension
        this.suspensionTravel[3] += (
            -restLength + 
            gForce * 0.3 + 
            brakeForce * 0.7 + 
            handbrakeForce * 0.8
        ) * deltaTime * stiffness - this.suspensionTravel[3] * damping * deltaTime;
        
        // Apply suspension to wheels
        this.wheels[0].position.y = 0.25 + this.suspensionTravel[0]; // Front left
        this.wheels[1].position.y = 0.25 + this.suspensionTravel[1]; // Front right
        this.wheels[2].position.y = 0.25 + this.suspensionTravel[2]; // Rear left
        this.wheels[3].position.y = 0.25 + this.suspensionTravel[3]; // Rear right
    }
    
    // ============================================
    // APPLY FORCES
    // ============================================
    applyForces(accelerationForce, steering, brake, handbrake, boost, deltaTime) {
        const traction = handbrake ? PHYSICS_CONFIG.driftTraction : PHYSICS_CONFIG.traction;
        
        // Get forward vector
        const forwardVector = new THREE.Vector3(
            Math.sin(this.group.rotation.y),
            0,
            Math.cos(this.group.rotation.y)
        );
        
        // Apply acceleration in car's forward direction
        this.velocity.x += forwardVector.x * accelerationForce * deltaTime * 60;
        this.velocity.z += forwardVector.z * accelerationForce * deltaTime * 60;
        
        // Apply steering rotation
        this.angularVelocity = steering * PHYSICS_CONFIG.steeringSensitivity * 
            (1 + Math.abs(this.speed) * 0.01) * (handbrake ? 1.5 : 1);
        
        this.group.rotation.y += this.angularVelocity * deltaTime * 60;
        
        // Apply air resistance
        const speed = this.velocity.length();
        const dragForce = speed * PHYSICS_CONFIG.airResistance;
        
        if (speed > 0) {
            const dragVector = this.velocity.clone().normalize().multiplyScalar(-dragForce);
            this.velocity.add(dragVector);
        }
        
        // Apply rolling resistance
        const rollingDrag = speed * PHYSICS_CONFIG.rollingResistance;
        this.velocity.x *= (1 - rollingDrag * deltaTime);
        this.velocity.z *= (1 - rollingDrag * deltaTime);
        
        // Apply natural deceleration
        this.velocity.x *= (1 - PHYSICS_CONFIG.decelerationRate * deltaTime);
        this.velocity.z *= (1 - PHYSICS_CONFIG.decelerationRate * deltaTime);
        
        // Limit maximum speed
        const maxSpeed = boost ? PHYSICS_CONFIG.maxSpeed * 1.2 : PHYSICS_CONFIG.maxSpeed;
        if (speed > maxSpeed / 3.6) {
            this.velocity.clampLength(0, maxSpeed / 3.6);
        }
        
        // Update position
        this.group.position.x += this.velocity.x * deltaTime * 60;
        this.group.position.z += this.velocity.z * deltaTime * 60;
        
        // Update internal position
        this.position.copy(this.group.position);
        this.rotation.copy(this.group.rotation);
    }
    
    // ============================================
    // GET CAR STATE
    // ============================================
    getState() {
        return {
            position: this.position.clone(),
            rotation: this.rotation.clone(),
            velocity: this.velocity.clone(),
            speed: this.speed,
            rpm: this.rpm,
            steeringAngle: this.steeringAngle,
            isDrifting: this.isDrifting,
            suspensionTravel: [...this.suspensionTravel]
        };
    }
    
    // ============================================
    // RESET CAR
    // ============================================
    reset(position = new THREE.Vector3(0, 0, 0), rotation = new THREE.Euler(0, 0, 0)) {
        this.group.position.copy(position);
        this.group.rotation.copy(rotation);
        this.velocity.set(0, 0, 0);
        this.angularVelocity = 0;
        this.speed = 0;
        this.rpm = 0;
        this.steeringAngle = 0;
        this.wheelRotation = 0;
        this.suspensionTravel = [0, 0, 0, 0];
        this.isDrifting = false;
        
        this.wheels.forEach(wheel => {
            wheel.rotation.x = 0;
            wheel.rotation.y = 0;
            wheel.position.y = 0.25;
        });
    }
    
    // ============================================
    // CLEANUP
    // ============================================
    cleanup() {
        if (this.group && this.group.parent) {
            this.group.parent.remove(this.group);
        }
        
        this.group = null;
        this.wheels = [];
        this.headlights = [];
        this.taillights = [];
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Car;
}
