/**
 * FORZA PORSCHE DRIVING - WORLD SYSTEM
 * Ultra HD Open World with Forza Horizon 6 Scale
 * Optimized for Exynos 1330 & 1080p
 */

class World {
    constructor(scene) {
        this.scene = scene;
        this.group = null;
        this.road = null;
        this.environment = [];
        this.trees = [];
        this.buildings = [];
        this.zones = [];
        this.currentZone = 'START';
        
        // World boundaries
        this.boundaries = {
            minX: -WORLD_CONFIG.size.width / 2,
            maxX: WORLD_CONFIG.size.width / 2,
            minZ: -WORLD_CONFIG.size.depth / 2,
            maxZ: WORLD_CONFIG.size.depth / 2
        };
        
        // Zone definitions
        this.zoneDefinitions = [
            { name: 'START', minZ: -500, maxZ: 50, color: 0x00ff00 },
            { name: 'ZONE 1', minZ: 50, maxZ: 350, color: 0xffff00 },
            { name: 'ZONE 2', minZ: 350, maxZ: 650, color: 0xff00ff },
            { name: 'ZONE 3', minZ: 650, maxZ: 950, color: 0x00ffff },
            { name: 'FINISH', minZ: 950, maxZ: 1000, color: 0xff0000 }
        ];
        
        // Create world
        this.create();
    }
    
    // ============================================
    // CREATE WORLD
    // ============================================
    create() {
        this.group = new THREE.Group();
        this.group.name = 'world';
        
        // Create ground
        this.createGround();
        
        // Create road
        this.createRoad();
        
        // Create environment
        this.createEnvironment();
        
        // Create zones
        this.createZones();
        
        // Create sky
        this.createSky();
        
        // Create lighting
        this.createLighting();
        
        // Add to scene
        this.scene.add(this.group);
        
        // Add fog
        this.scene.fog = new THREE.Fog(
            WORLD_CONFIG.lighting.fog.color,
            WORLD_CONFIG.lighting.fog.near,
            WORLD_CONFIG.lighting.fog.far
        );
        
        // Add background
        this.scene.background = new THREE.Color(0x001122);
    }
    
    // ============================================
    // CREATE GROUND
    // ============================================
    createGround() {
        const size = WORLD_CONFIG.size;
        const geometry = new THREE.PlaneGeometry(size.width, size.depth, 100, 100);
        
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x1A1A1A),
            roughness: 0.95,
            metalness: 0.05,
            side: THREE.DoubleSide
        });
        
        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.name = 'ground';
        this.group.add(ground);
        
        // Add subtle noise texture using vertex colors
        const colors = [];
        const position = geometry.attributes.position;
        for (let i = 0; i < position.count; i++) {
            const noise = Math.random() * 0.1 - 0.05;
            colors.push(0.1 + noise, 0.1 + noise, 0.1 + noise);
        }
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        material.vertexColors = true;
    }
    
    // ============================================
    // CREATE ROAD
    // ============================================
    createRoad() {
        this.road = new THREE.Group();
        this.road.name = 'road';
        
        const length = WORLD_CONFIG.road.length;
        const width = WORLD_CONFIG.road.width;
        const segments = WORLD_CONFIG.road.segments;
        
        // Main road surface
        const roadGeometry = new THREE.PlaneGeometry(length, width, segments, 10);
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x2A2A2A),
            roughness: 0.8,
            metalness: 0.15
        });
        const roadSurface = new THREE.Mesh(roadGeometry, roadMaterial);
        roadSurface.rotation.x = -Math.PI / 2;
        roadSurface.receiveShadow = true;
        roadSurface.name = 'road_surface';
        this.road.add(roadSurface);
        
        // Road markings
        this.createRoadMarkings(length, width);
        
        // Road edges
        this.createRoadEdges(length, width);
        
        // Road shoulders
        this.createRoadShoulders(length, width);
        
        this.group.add(this.road);
    }
    
    createRoadMarkings(length, width) {
        const spacing = WORLD_CONFIG.road.markings.spacing;
        const lineWidth = 0.3;
        const lineLength = 5;
        
        // Center dashed line
        if (WORLD_CONFIG.road.markings.centerLine) {
            for (let i = -length/2; i < length/2; i += spacing * 2) {
                const lineGeometry = new THREE.BoxGeometry(lineLength, 0.1, lineWidth, 1, 1, 1);
                const lineMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(0xFFFFFF),
                    emissive: new THREE.Color(0xFFFFFF),
                    emissiveIntensity: 0.5
                });
                const line = new THREE.Mesh(lineGeometry, lineMaterial);
                line.position.set(i + lineLength/2, 0.01, 0);
                line.rotation.x = Math.PI / 2;
                line.name = 'road_marking';
                this.road.add(line);
            }
        }
        
        // Edge lines
        if (WORLD_CONFIG.road.markings.edgeLines) {
            const edgeGeometry = new THREE.BoxGeometry(length, 0.1, 0.2, segments, 1, 1);
            const edgeMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(0xFFFFFF),
                emissive: new THREE.Color(0xFFFFFF),
                emissiveIntensity: 0.3
            });
            
            const leftEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
            leftEdge.position.set(0, 0.01, width / 2 - 0.2);
            leftEdge.rotation.x = Math.PI / 2;
            leftEdge.name = 'road_edge';
            this.road.add(leftEdge);
            
            const rightEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
            rightEdge.position.set(0, 0.01, -width / 2 + 0.2);
            rightEdge.rotation.x = Math.PI / 2;
            rightEdge.name = 'road_edge';
            this.road.add(rightEdge);
        }
    }
    
    createRoadEdges(length, width) {
        // This is handled in road markings
    }
    
    createRoadShoulders(length, width) {
        const shoulderWidth = 3;
        const shoulderGeometry = new THREE.PlaneGeometry(length, shoulderWidth, segments, 1);
        const shoulderMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x3A3A3A),
            roughness: 0.95,
            metalness: 0.05
        });
        
        const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        leftShoulder.position.set(0, -0.01, width / 2 + shoulderWidth / 2);
        leftShoulder.rotation.x = -Math.PI / 2;
        leftShoulder.receiveShadow = true;
        leftShoulder.name = 'shoulder';
        this.road.add(leftShoulder);
        
        const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        rightShoulder.position.set(0, -0.01, -width / 2 - shoulderWidth / 2);
        rightShoulder.rotation.x = -Math.PI / 2;
        rightShoulder.receiveShadow = true;
        rightShoulder.name = 'shoulder';
        this.road.add(rightShoulder);
    }
    
    // ============================================
    // CREATE ENVIRONMENT
    // ============================================
    createEnvironment() {
        // Mountains
        this.createMountains();
        
        // Trees
        this.createTrees();
        
        // Buildings
        this.createBuildings();
        
        // Decorative elements
        this.createDecorativeElements();
    }
    
    createMountains() {
        const mountainGeometry = new THREE.ConeGeometry(300, 200, 64, 64);
        const mountainMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x3A4A5A),
            roughness: 0.95,
            metalness: 0.05
        });
        
        const mountainPositions = [
            { x: -600, z: -800, rotation: Math.PI / 4 },
            { x: 600, z: -900, rotation: -Math.PI / 3 },
            { x: -800, z: -1200, rotation: Math.PI / 6 },
            { x: 800, z: -1300, rotation: -Math.PI / 6 },
            { x: 0, z: -1500, rotation: 0 }
        ];
        
        mountainPositions.forEach(pos => {
            const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
            mountain.position.set(pos.x, -50, pos.z);
            mountain.rotation.y = pos.rotation;
            mountain.castShadow = true;
            mountain.receiveShadow = true;
            mountain.name = 'mountain';
            this.group.add(mountain);
            this.environment.push(mountain);
        });
    }
    
    createTrees() {
        const treeCount = WORLD_CONFIG.environment.trees.count;
        const treeDensity = WORLD_CONFIG.environment.trees.density;
        
        for (let i = 0; i < treeCount; i++) {
            if (Math.random() > treeDensity) continue;
            
            const tree = this.createTree();
            
            // Position tree away from road
            const side = Math.random() > 0.5 ? 1 : -1;
            const distanceFromRoad = 20 + Math.random() * 50;
            const zPos = (Math.random() - 0.5) * WORLD_CONFIG.size.depth * 0.9;
            const xPos = side * distanceFromRoad + (Math.random() - 0.5) * 10;
            
            tree.position.set(xPos, 0, zPos);
            tree.rotation.y = Math.random() * Math.PI * 2;
            tree.castShadow = true;
            tree.receiveShadow = false;
            tree.name = 'tree';
            
            this.group.add(tree);
            this.trees.push(tree);
            this.environment.push(tree);
        }
    }
    
    createTree() {
        const treeGroup = new THREE.Group();
        
        // Trunk
        const trunkHeight = 3 + Math.random() * 4;
        const trunkGeometry = new THREE.CylinderGeometry(
            0.3 + Math.random() * 0.4,
            0.5 + Math.random() * 0.4,
            trunkHeight,
            32, 32
        );
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x8B4513),
            roughness: 0.8,
            metalness: 0.05
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Leaves
        const leavesRadius = 1.5 + Math.random() * 2;
        const leavesHeight = 3 + Math.random() * 3;
        const leavesGeometry = new THREE.ConeGeometry(
            leavesRadius,
            leavesHeight,
            48, 48
        );
        const leavesMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x228B22),
            roughness: 0.95,
            metalness: 0.02
        });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = trunkHeight + leavesHeight / 2;
        leaves.rotation.y = Math.random() * Math.PI * 2;
        leaves.castShadow = true;
        treeGroup.add(leaves);
        
        // Add some branches
        for (let i = 0; i < 3; i++) {
            const branchHeight = trunkHeight * (0.3 + Math.random() * 0.5);
            const branchLength = 0.5 + Math.random() * 1;
            const branchAngle = Math.random() * Math.PI * 2;
            
            const branchGeometry = new THREE.CylinderGeometry(
                0.05, 0.02, branchLength, 16, 16
            );
            const branch = new THREE.Mesh(branchGeometry, trunkMaterial);
            branch.position.y = branchHeight;
            branch.rotation.z = branchAngle;
            branch.position.x = Math.cos(branchAngle) * branchLength / 2;
            branch.position.z = Math.sin(branchAngle) * branchLength / 2;
            branch.castShadow = true;
            treeGroup.add(branch);
        }
        
        return treeGroup;
    }
    
    createBuildings() {
        const buildingCount = WORLD_CONFIG.environment.buildings.count;
        const buildingDensity = WORLD_CONFIG.environment.buildings.density;
        
        for (let i = 0; i < buildingCount; i++) {
            if (Math.random() > buildingDensity) continue;
            
            const building = this.createBuilding();
            
            // Position building away from road
            const side = Math.random() > 0.5 ? 1 : -1;
            const distanceFromRoad = 50 + Math.random() * 100;
            const zPos = (Math.random() - 0.5) * WORLD_CONFIG.size.depth * 0.8;
            const xPos = side * distanceFromRoad + (Math.random() - 0.5) * 30;
            
            building.position.set(xPos, 0, zPos);
            building.rotation.y = Math.random() * Math.PI * 2;
            building.castShadow = true;
            building.receiveShadow = true;
            building.name = 'building';
            
            this.group.add(building);
            this.buildings.push(building);
            this.environment.push(building);
        }
    }
    
    createBuilding() {
        const buildingGroup = new THREE.Group();
        
        const width = 10 + Math.random() * 40;
        const height = 5 + Math.random() * 50;
        const depth = 10 + Math.random() * 40;
        const floors = Math.max(1, Math.floor(height / 5));
        
        // Main building
        const geometry = new THREE.BoxGeometry(width, height, depth, 32, floors * 2, 32);
        const colors = [0x444444, 0x555555, 0x666666, 0x333333, 0x222222];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            roughness: 0.7,
            metalness: 0.1
        });
        
        const building = new THREE.Mesh(geometry, material);
        building.position.y = height / 2;
        building.castShadow = true;
        buildingGroup.add(building);
        
        // Windows
        const windowCount = Math.min(20, Math.floor(width * depth / 10));
        for (let i = 0; i < windowCount; i++) {
            if (Math.random() > 0.7) continue;
            
            const windowWidth = 1 + Math.random() * 3;
            const windowHeight = 1 + Math.random() * 3;
            
            const windowGeometry = new THREE.BoxGeometry(
                windowWidth, windowHeight, 0.1
            );
            const windowMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x88CCEE),
                transparent: true,
                opacity: 0.6,
                emissive: new THREE.Color(0x88CCEE),
                emissiveIntensity: 0.1 + Math.random() * 0.2
            });
            
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(
                (Math.random() - 0.5) * width * 0.9,
                (Math.random() - 0.5) * height * 0.9,
                depth / 2 + 0.05
            );
            buildingGroup.add(window);
        }
        
        // Roof
        const roofHeight = height * 0.05;
        const roofGeometry = new THREE.BoxGeometry(
            width * 1.1, roofHeight, depth * 1.1, 16, 16, 16
        );
        const roofMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x333333),
            roughness: 0.8,
            metalness: 0.1
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = height + roofHeight / 2;
        roof.castShadow = true;
        buildingGroup.add(roof);
        
        // Door
        const doorGeometry = new THREE.BoxGeometry(2, 3, 0.2, 8, 8, 8);
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x555555),
            roughness: 0.6,
            metalness: 0.2
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, -height / 2 + 1.5, depth / 2 + 0.1);
        buildingGroup.add(door);
        
        return buildingGroup;
    }
    
    createDecorativeElements() {
        // Street lights
        for (let i = 0; i < 20; i++) {
            const light = this.createStreetLight();
            const side = Math.random() > 0.5 ? 1 : -1;
            const distanceFromRoad = 15 + Math.random() * 10;
            const zPos = (Math.random() - 0.5) * WORLD_CONFIG.size.depth * 0.8;
            const xPos = side * distanceFromRoad;
            
            light.position.set(xPos, 0, zPos);
            light.rotation.y = Math.random() * Math.PI * 2;
            light.castShadow = true;
            light.name = 'street_light';
            
            this.group.add(light);
            this.environment.push(light);
        }
        
        // Billboards
        for (let i = 0; i < 10; i++) {
            const billboard = this.createBillboard();
            const side = Math.random() > 0.5 ? 1 : -1;
            const distanceFromRoad = 30 + Math.random() * 20;
            const zPos = (Math.random() - 0.5) * WORLD_CONFIG.size.depth * 0.8;
            const xPos = side * distanceFromRoad;
            
            billboard.position.set(xPos, 0, zPos);
            billboard.rotation.y = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
            billboard.castShadow = true;
            billboard.name = 'billboard';
            
            this.group.add(billboard);
            this.environment.push(billboard);
        }
    }
    
    createStreetLight() {
        const lightGroup = new THREE.Group();
        
        // Pole
        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 8, 16, 16);
        const poleMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x444444),
            metalness: 0.8,
            roughness: 0.3
        });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 4;
        pole.castShadow = true;
        lightGroup.add(pole);
        
        // Light
        const lightGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const lightMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0xFFFF88),
            emissive: new THREE.Color(0xFFFF88),
            emissiveIntensity: 0.8
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.y = 8;
        light.castShadow = true;
        lightGroup.add(light);
        
        // Add point light
        const pointLight = new THREE.PointLight(0xFFFF88, 0.5, 20);
        pointLight.position.y = 8;
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.width = 512;
        pointLight.shadow.mapSize.height = 512;
        lightGroup.add(pointLight);
        
        return lightGroup;
    }
    
    createBillboard() {
        const billboardGroup = new THREE.Group();
        
        // Frame
        const frameGeometry = new THREE.BoxGeometry(4, 2, 0.2, 8, 8, 8);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x333333),
            metalness: 0.6,
            roughness: 0.4
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = 1;
        frame.castShadow = true;
        billboardGroup.add(frame);
        
        // Billboard face
        const faceGeometry = new THREE.BoxGeometry(3.8, 1.8, 0.1, 8, 8, 8);
        const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF];
        const faceMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(colors[Math.floor(Math.random() * colors.length)]),
            roughness: 0.8
        });
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.y = 1;
        face.position.z = 0.1;
        billboardGroup.add(face);
        
        return billboardGroup;
    }
    
    // ============================================
    // CREATE ZONES
    // ============================================
    createZones() {
        this.zoneDefinitions.forEach((zoneDef, index) => {
            const zoneGroup = new THREE.Group();
            zoneGroup.name = `zone_${zoneDef.name}`;
            
            // Zone trigger (invisible)
            const triggerGeometry = new THREE.BoxGeometry(
                WORLD_CONFIG.road.width * 2,
                10,
                (zoneDef.maxZ - zoneDef.minZ),
                1, 1, 1
            );
            const triggerMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(zoneDef.color),
                transparent: true,
                opacity: 0.0
            });
            const trigger = new THREE.Mesh(triggerGeometry, triggerMaterial);
            trigger.position.set(0, 5, (zoneDef.minZ + zoneDef.maxZ) / 2);
            trigger.name = `zone_trigger_${zoneDef.name}`;
            zoneGroup.add(trigger);
            
            // Zone marker (visible)
            const markerGeometry = new THREE.PlaneGeometry(10, 1, 1, 1);
            const markerMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(zoneDef.color),
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.set(0, 10, zoneDef.minZ);
            marker.rotation.x = Math.PI / 2;
            marker.name = `zone_marker_${zoneDef.name}`;
            zoneGroup.add(marker);
            
            // Zone text
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, 256, 64);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(zoneDef.name, 128, 32);
            
            const texture = new THREE.CanvasTexture(canvas);
            const textGeometry = new THREE.PlaneGeometry(10, 2.5, 1, 1);
            const textMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
            });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.set(0, 12, zoneDef.minZ);
            textMesh.rotation.x = Math.PI / 2;
            textMesh.name = `zone_text_${zoneDef.name}`;
            zoneGroup.add(textMesh);
            
            this.group.add(zoneGroup);
            this.zones.push({
                name: zoneDef.name,
                minZ: zoneDef.minZ,
                maxZ: zoneDef.maxZ,
                color: zoneDef.color,
                group: zoneGroup
            });
        });
    }
    
    // ============================================
    // CREATE SKY
    // ============================================
    createSky() {
        // Sky sphere
        const skyGeometry = new THREE.SphereGeometry(1000, 64, 64);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0x001122),
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        sky.name = 'sky';
        this.group.add(sky);
        
        // Stars
        for (let i = 0; i < 1000; i++) {
            const starGeometry = new THREE.SphereGeometry(0.1, 4, 4);
            const starMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(0xFFFFFF),
                emissive: new THREE.Color(0xFFFFFF),
                emissiveIntensity: 0.5 + Math.random() * 0.5
            });
            const star = new THREE.Mesh(starGeometry, starMaterial);
            
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 2;
            const distance = 800 + Math.random() * 200;
            
            star.position.x = Math.sin(phi) * Math.cos(theta) * distance;
            star.position.y = Math.sin(phi) * Math.sin(theta) * distance;
            star.position.z = Math.cos(phi) * distance;
            
            star.name = 'star';
            this.group.add(star);
        }
        
        // Sun
        const sunGeometry = new THREE.SphereGeometry(30, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0xFFDD44),
            emissive: new THREE.Color(0xFFDD44),
            emissiveIntensity: 0.8
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.set(500, 300, -500);
        sun.name = 'sun';
        this.group.add(sun);
        
        // Add point light for sun
        const sunLight = new THREE.PointLight(0xFFDD44, 0.3, 1000);
        sunLight.position.set(500, 300, -500);
        sunLight.name = 'sun_light';
        this.group.add(sunLight);
    }
    
    // ============================================
    // CREATE LIGHTING
    // ============================================
    createLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(
            WORLD_CONFIG.lighting.ambient.color,
            WORLD_CONFIG.lighting.ambient.intensity
        );
        ambientLight.name = 'ambient_light';
        this.group.add(ambientLight);
        
        // Directional light (main sun light)
        const directionalLight = new THREE.DirectionalLight(
            WORLD_CONFIG.lighting.directional.color,
            WORLD_CONFIG.lighting.directional.intensity
        );
        directionalLight.position.set(
            WORLD_CONFIG.lighting.directional.position.x,
            WORLD_CONFIG.lighting.directional.position.y,
            WORLD_CONFIG.lighting.directional.position.z
        );
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = RENDER_CONFIG.shadowMapSize;
        directionalLight.shadow.mapSize.height = RENDER_CONFIG.shadowMapSize;
        directionalLight.shadow.camera.left = -500;
        directionalLight.shadow.camera.right = 500;
        directionalLight.shadow.camera.top = 500;
        directionalLight.shadow.camera.bottom = -500;
        directionalLight.shadow.camera.near = 1;
        directionalLight.shadow.camera.far = 2000;
        directionalLight.name = 'directional_light';
        this.group.add(directionalLight);
        
        // Hemisphere light
        const hemisphereLight = new THREE.HemisphereLight(
            WORLD_CONFIG.lighting.hemisphere.skyColor,
            WORLD_CONFIG.lighting.hemisphere.groundColor,
            WORLD_CONFIG.lighting.hemisphere.intensity
        );
        hemisphereLight.name = 'hemisphere_light';
        this.group.add(hemisphereLight);
        
        // Store light references
        this.lights = {
            ambient: ambientLight,
            directional: directionalLight,
            hemisphere: hemisphereLight,
            sun: this.group.getObjectByName('sun_light')
        };
    }
    
    // ============================================
    // UPDATE WORLD
    // ============================================
    update(carPosition) {
        // Update current zone
        this.updateCurrentZone(carPosition.z);
        
        // Update environment based on zone
        this.updateEnvironmentForZone();
        
        // Cull distant objects for performance
        this.cullDistantObjects(carPosition);
    }
    
    updateCurrentZone(carZ) {
        for (const zone of this.zones) {
            if (carZ >= zone.minZ && carZ <= zone.maxZ) {
                if (this.currentZone !== zone.name) {
                    this.currentZone = zone.name;
                    GAME_STATE.currentZone = zone.name;
                    console.log(`Entered zone: ${zone.name}`);
                    
                    // Trigger zone change event
                    if (window.zoneChangeCallback) {
                        window.zoneChangeCallback(zone.name);
                    }
                }
                break;
            }
        }
    }
    
    updateEnvironmentForZone() {
        // Change fog color based on zone
        const zone = this.zones.find(z => z.name === this.currentZone);
        if (zone) {
            const fogColor = new THREE.Color(zone.color);
            fogColor.multiplyScalar(0.1);
            this.scene.fog.color.set(fogColor);
        }
    }
    
    cullDistantObjects(carPosition) {
        const cullingDistance = PERFORMANCE.culling;
        
        // Cull trees
        this.trees.forEach(tree => {
            const distance = tree.position.distanceTo(carPosition);
            tree.visible = distance < cullingDistance.trees;
        });
        
        // Cull buildings
        this.buildings.forEach(building => {
            const distance = building.position.distanceTo(carPosition);
            building.visible = distance < cullingDistance.buildings;
        });
        
        // Cull environment objects
        this.environment.forEach(obj => {
            if (obj.name && !obj.name.startsWith('road') && !obj.name.startsWith('zone')) {
                const distance = obj.position.distanceTo(carPosition);
                obj.visible = distance < cullingDistance.environment;
            }
        });
    }
    
    // ============================================
    // GET ZONE INFO
    // ============================================
    getZoneInfo() {
        return {
            currentZone: this.currentZone,
            zones: this.zones.map(z => z.name),
            zoneDefinitions: this.zoneDefinitions
        };
    }
    
    // ============================================
    // GET WORLD STATE
    // ============================================
    getState() {
        return {
            currentZone: this.currentZone,
            boundaries: this.boundaries,
            size: WORLD_CONFIG.size
        };
    }
    
    // ============================================
    // CLEANUP
    // ============================================
    cleanup() {
        if (this.group && this.group.parent) {
            this.group.parent.remove(this.group);
        }
        
        this.group = null;
        this.road = null;
        this.environment = [];
        this.trees = [];
        this.buildings = [];
        this.zones = [];
        this.lights = {};
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = World;
}
