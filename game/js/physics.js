/**
 * FORZA PORSCHE DRIVING - PHYSICS SYSTEM
 * Realistic Car Physics Engine
 * Optimized for Exynos 1330
 */

class PhysicsEngine {
    constructor(car, world) {
        this.car = car;
        this.world = world;
        
        // Physics state
        this.gravity = new THREE.Vector3(0, -9.81, 0);
        this.friction = PHYSICS_CONFIG.rollingResistance;
        this.airDensity = 1.225; // kg/m^3
        this.dragCoefficient = 0.3;
        
        // Car physics
        this.mass = 1500; // kg (Porsche 911 weight)
        this.inertia = 1000; // kg*m^2
        this.wheelBase = FORZA_SCALE.carLength * 0.8; // Distance between front and rear axles
        this.trackWidth = FORZA_SCALE.carWidth * 0.8; // Distance between left and right wheels
        
        // Tire physics
        this.tireGrip = 1.0;
        this.tireSlipAngle = 0;
        this.tireLoad = [0, 0, 0, 0]; // Load on each tire
        
        // Suspension physics
        this.suspensionSpringRate = PHYSICS_CONFIG.suspension.stiffness * 1000;
        this.suspensionDampingRate = PHYSICS_CONFIG.suspension.damping * 100;
        
        // Collision detection
        this.collisionObjects = [];
        this.collisionEnabled = PHYSICS_CONFIG.collision.enabled;
    }
    
    // ============================================
    // UPDATE PHYSICS
    // ============================================
    update(deltaTime, controls) {
        if (!this.car || !this.car.group) return;
        
        // Get input from controls
        const throttle = controls.getThrottle();
        const brake = controls.getBrake();
        const steering = controls.getSteering();
        const handbrake = controls.getHandbrake();
        const boost = controls.getBoost();
        
        // Update car physics
        this.updateCarPhysics(deltaTime, throttle, brake, steering, handbrake, boost);
        
        // Update tire physics
        this.updateTirePhysics(deltaTime, steering, brake, handbrake);
        
        // Update collision
        if (this.collisionEnabled) {
            this.updateCollision();
        }
        
        // Keep car on road
        this.keepCarOnRoad();
        
        // Update game state
        this.updateGameState(throttle, brake, steering, handbrake, boost);
    }
    
    // ============================================
    // UPDATE CAR PHYSICS
    // ============================================
    updateCarPhysics(deltaTime, throttle, brake, steering, handbrake, boost) {
        const car = this.car;
        const velocity = car.velocity;
        const speed = velocity.length();
        const speedKmh = speed * 3.6;
        
        // Calculate engine force
        let engineForce = 0;
        
        if (throttle > 0) {
            // Engine power curve based on RPM
            const rpmFactor = Math.min(1, car.rpm / 7000);
            const gearRatio = this.getGearRatio(speedKmh);
            engineForce = throttle * PHYSICS_CONFIG.accelerationRate * rpmFactor * gearRatio * this.mass;
            
            // Apply boost
            if (boost && GAME_STATE.boostCharge > 20) {
                engineForce *= PHYSICS_CONFIG.boostMultiplier;
                GAME_STATE.boostCharge -= PHYSICS_CONFIG.boostConsumption * deltaTime * 60;
            }
        }
        
        // Calculate braking force
        let brakeForce = 0;
        if (brake > 0) {
            brakeForce = brake * PHYSICS_CONFIG.brakeForce * this.mass;
        }
        
        // Calculate handbrake force
        let handbrakeForce = 0;
        if (handbrake) {
            handbrakeForce = PHYSICS_CONFIG.handbrakeForce * this.mass;
        }
        
        // Calculate net force
        const netForce = engineForce - brakeForce - handbrakeForce;
        
        // Calculate traction
        const traction = handbrake ? PHYSICS_CONFIG.driftTraction : PHYSICS_CONFIG.traction;
        
        // Get car direction
        const forwardVector = new THREE.Vector3(
            Math.sin(car.group.rotation.y),
            0,
            Math.cos(car.group.rotation.y)
        );
        const rightVector = new THREE.Vector3(
            Math.sin(car.group.rotation.y + Math.PI / 2),
            0,
            Math.cos(car.group.rotation.y + Math.PI / 2)
        );
        
        // Apply engine force in forward direction
        velocity.x += forwardVector.x * netForce * deltaTime / this.mass;
        velocity.z += forwardVector.z * netForce * deltaTime / this.mass;
        
        // Apply steering force (lateral force)
        const steeringForce = steering * PHYSICS_CONFIG.steeringSensitivity * 
            (1 + Math.abs(speed) * 0.01) * this.mass * (handbrake ? 2 : 1);
        
        // Calculate lateral force based on steering and speed
        const lateralForce = steeringForce * traction;
        velocity.x += rightVector.x * lateralForce * deltaTime / this.mass;
        velocity.z += rightVector.z * lateralForce * deltaTime / this.mass;
        
        // Apply air resistance (drag)
        const dragForce = 0.5 * this.airDensity * this.dragCoefficient * 
            (speed * speed) * Math.PI * FORZA_SCALE.carWidth * FORZA_SCALE.carHeight;
        
        if (speed > 0) {
            const dragVector = velocity.clone().normalize().multiplyScalar(-dragForce);
            velocity.add(dragVector);
        }
        
        // Apply rolling resistance
        const rollingResistance = PHYSICS_CONFIG.rollingResistance * this.mass * 9.81;
        velocity.x *= (1 - rollingResistance * deltaTime / this.mass);
        velocity.z *= (1 - rollingResistance * deltaTime / this.mass);
        
        // Apply natural deceleration
        velocity.x *= (1 - PHYSICS_CONFIG.decelerationRate * deltaTime);
        velocity.z *= (1 - PHYSICS_CONFIG.decelerationRate * deltaTime);
        
        // Limit maximum speed
        const maxSpeed = boost ? PHYSICS_CONFIG.maxSpeed * 1.2 : PHYSICS_CONFIG.maxSpeed;
        if (speedKmh > maxSpeed) {
            velocity.clampLength(0, maxSpeed / 3.6);
        }
        
        // Update angular velocity (rotation)
        car.angularVelocity = steering * PHYSICS_CONFIG.steeringSensitivity * 
            (1 + Math.abs(speed) * 0.02) * (handbrake ? 2.5 : 1);
        
        // Apply angular velocity to rotation
        car.group.rotation.y += car.angularVelocity * deltaTime * 60;
        
        // Update position
        car.group.position.x += velocity.x * deltaTime * 60;
        car.group.position.z += velocity.z * deltaTime * 60;
        
        // Update internal state
        car.velocity.copy(velocity);
        car.speed = speed;
        car.position.copy(car.group.position);
        car.rotation.copy(car.group.rotation);
    }
    
    // ============================================
    // GET GEAR RATIO
    // ============================================
    getGearRatio(speedKmh) {
        for (const gear of PHYSICS_CONFIG.gearRatios) {
            if (speedKmh >= gear.minSpeed && speedKmh <= gear.maxSpeed) {
                return gear.ratio;
            }
        }
        return PHYSICS_CONFIG.gearRatios[0].ratio; // Default to first gear
    }
    
    // ============================================
    // UPDATE TIRE PHYSICS
    // ============================================
    updateTirePhysics(deltaTime, steering, brake, handbrake) {
        const car = this.car;
        const speed = car.speed;
        
        // Calculate load on each tire
        const totalWeight = this.mass * 9.81;
        const frontLoad = totalWeight * 0.45;
        const rearLoad = totalWeight * 0.55;
        
        // Distribute load based on acceleration/deceleration
        const acceleration = car.velocity.clone().sub(car.lastVelocity || new THREE.Vector3()).length() / deltaTime;
        const loadTransfer = acceleration * this.mass * 0.5;
        
        this.tireLoad[0] = frontLoad / 2 + loadTransfer / 2; // Front left
        this.tireLoad[1] = frontLoad / 2 + loadTransfer / 2; // Front right
        this.tireLoad[2] = rearLoad / 2 - loadTransfer / 2; // Rear left
        this.tireLoad[3] = rearLoad / 2 - loadTransfer / 2; // Rear right
        
        // Calculate slip angle based on steering and speed
        this.tireSlipAngle = steering * (speed / 20) * (handbrake ? 2 : 1);
        
        // Calculate tire grip based on load and slip
        this.tireGrip = 1.0 - Math.min(0.7, Math.abs(this.tireSlipAngle) * 0.01);
        
        // Store last velocity for next frame
        car.lastVelocity = car.velocity.clone();
    }
    
    // ============================================
    // UPDATE COLLISION
    // ============================================
    updateCollision() {
        const car = this.car;
        const carPosition = car.group.position;
        const carBoundingBox = new THREE.Box3().setFromObject(car.group);
        
        // Check collision with world boundaries
        const boundaries = this.world.boundaries;
        
        if (carPosition.x < boundaries.minX) {
            carPosition.x = boundaries.minX;
            car.velocity.x *= -PHYSICS_CONFIG.collision.bounce;
        }
        if (carPosition.x > boundaries.maxX) {
            carPosition.x = boundaries.maxX;
            car.velocity.x *= -PHYSICS_CONFIG.collision.bounce;
        }
        if (carPosition.z < boundaries.minZ) {
            carPosition.z = boundaries.minZ;
            car.velocity.z *= -PHYSICS_CONFIG.collision.bounce;
        }
        if (carPosition.z > boundaries.maxZ) {
            carPosition.z = boundaries.maxZ;
            car.velocity.z *= -PHYSICS_CONFIG.collision.bounce;
        }
        
        // Check collision with environment objects
        for (const obj of this.collisionObjects) {
            if (!obj.visible) continue;
            
            const objBoundingBox = new THREE.Box3().setFromObject(obj);
            
            if (carBoundingBox.intersectsBox(objBoundingBox)) {
                // Simple collision response
                const direction = carPosition.clone().sub(obj.position).normalize();
                car.velocity.add(direction.multiplyScalar(5));
                carPosition.add(direction.multiplyScalar(0.5));
            }
        }
    }
    
    // ============================================
    // KEEP CAR ON ROAD
    // ============================================
    keepCarOnRoad() {
        const car = this.car;
        const carPosition = car.group.position;
        const roadHalfWidth = FORZA_SCALE.roadWidth / 2;
        
        // If car is off the road, gently push back
        if (Math.abs(carPosition.x) > roadHalfWidth + 5) {
            const pushBackForce = (Math.abs(carPosition.x) - roadHalfWidth - 5) * 0.05;
            car.velocity.x -= Math.sign(carPosition.x) * pushBackForce;
        }
        
        // Keep car within reasonable bounds
        const boundaries = this.world.boundaries;
        if (carPosition.x < boundaries.minX + 10) {
            carPosition.x = boundaries.minX + 10;
            car.velocity.x *= -0.2;
        }
        if (carPosition.x > boundaries.maxX - 10) {
            carPosition.x = boundaries.maxX - 10;
            car.velocity.x *= -0.2;
        }
        if (carPosition.z < boundaries.minZ + 20) {
            carPosition.z = boundaries.minZ + 20;
            car.velocity.z *= -0.2;
        }
        if (carPosition.z > boundaries.maxZ - 20) {
            carPosition.z = boundaries.maxZ - 20;
            car.velocity.z *= -0.2;
        }
    }
    
    // ============================================
    // UPDATE GAME STATE
    // ============================================
    updateGameState(throttle, brake, steering, handbrake, boost) {
        // Update gear
        this.updateGear();
        
        // Update RPM
        GAME_STATE.rpm = this.car.rpm;
        
        // Update boost
        GAME_STATE.boostActive = boost;
        GAME_STATE.handbrakeActive = handbrake;
        
        // Regenerate boost when not using it
        if (!boost && GAME_STATE.boostCharge < PHYSICS_CONFIG.maxBoostCharge) {
            GAME_STATE.boostCharge += PHYSICS_CONFIG.boostRegeneration * deltaTime * 60;
        }
        
        // Update play time
        GAME_STATE.playTime += deltaTime;
        
        // Update zone from world
        GAME_STATE.currentZone = this.world.currentZone;
    }
    
    // ============================================
    // UPDATE GEAR
    // ============================================
    updateGear() {
        if (!GAME_STATE.isEngineOn) {
            GAME_STATE.gear = 'P';
            return;
        }
        
        const speedKmh = Math.abs(this.car.speed * 3.6);
        
        if (speedKmh < 5) {
            GAME_STATE.gear = '1';
        } else if (speedKmh < 50) {
            GAME_STATE.gear = '2';
        } else if (speedKmh < 90) {
            GAME_STATE.gear = '3';
        } else if (speedKmh < 130) {
            GAME_STATE.gear = '4';
        } else if (speedKmh < 180) {
            GAME_STATE.gear = '5';
        } else if (speedKmh < 250) {
            GAME_STATE.gear = '6';
        } else {
            GAME_STATE.gear = '6';
        }
        
        // Reverse gear
        if (this.car.velocity.z < -0.5) {
            GAME_STATE.gear = 'R';
        }
    }
    
    // ============================================
    // RESET PHYSICS
    // ============================================
    reset() {
        if (this.car) {
            this.car.reset();
        }
        
        GAME_STATE.speed = 0;
        GAME_STATE.rpm = 0;
        GAME_STATE.gear = 'P';
        GAME_STATE.boostCharge = PHYSICS_CONFIG.maxBoostCharge;
        GAME_STATE.playTime = 0;
        GAME_STATE.lapTime = 0;
    }
    
    // ============================================
    // ADD COLLISION OBJECT
    // ============================================
    addCollisionObject(obj) {
        this.collisionObjects.push(obj);
    }
    
    // ============================================
    // REMOVE COLLISION OBJECT
    // ============================================
    removeCollisionObject(obj) {
        const index = this.collisionObjects.indexOf(obj);
        if (index > -1) {
            this.collisionObjects.splice(index, 1);
        }
    }
    
    // ============================================
    // GET PHYSICS STATE
    // ============================================
    getState() {
        return {
            gravity: this.gravity.clone(),
            friction: this.friction,
            tireGrip: this.tireGrip,
            tireSlipAngle: this.tireSlipAngle,
            tireLoad: [...this.tireLoad],
            collisionEnabled: this.collisionEnabled,
            collisionObjects: this.collisionObjects.length
        };
    }
    
    // ============================================
    // CLEANUP
    // ============================================
    cleanup() {
        this.car = null;
        this.world = null;
        this.collisionObjects = [];
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhysicsEngine;
}
