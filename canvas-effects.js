// canvas-effects.js

// Canvas implementation for water effects
class WaterCanvas {
    constructor() {
      // --- START: Hardware Detection ---
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.isLowPerfDevice = this.prefersReducedMotion ||
                             !('requestAnimationFrame' in window) ||
                             (window.navigator.hardwareConcurrency && window.navigator.hardwareConcurrency < 4) ||
                             navigator.userAgent.match(/mobile|android/i);
  
      if (this.isLowPerfDevice) {
          console.log("Canvas Effects: Low performance device or reduced motion detected. Reducing effects.");
      }
      // --- END: Hardware Detection ---
  
      // Create canvas element
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
  
      // Position the canvas
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.zIndex = '-10'; // Use variable from CSS
      this.canvas.style.pointerEvents = 'none';
  
      // Add to DOM before other content
      document.body.prepend(this.canvas);
  
      // Initialize properties
      this.fishImages = {};
      this.fishes = [];
      this.bubbles = [];
      this.mouseTrail = [];
      this.plants = [];
      this.corals = []; // NEW: Array for corals
      this.backgroundFeatures = []; // NEW: Array for rocks/caves
      this.raindrops = [];
      this.waterHeight = 50; // Initial height in vh
      this.wavePoints = [];
      this.lastTimestamp = 0;
      this.animationFrameId = null; // Store animation frame ID
  
      // Frame rate capping
      this.TARGET_FRAME_TIME = 1000 / 30; // Target milliseconds per frame (~30 fps)
      this.timeAccumulator = 0; // Accumulates elapsed time
  
      // Weather state
      this.isRaining = false;
      this.rainIntensity = 0.5;
  
      // Resize handler
      this.resize = this.resize.bind(this); // Bind context for event listener
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleClick = this.handleClick.bind(this);
  
      this.resize(); // Call resize immediately to set initial dimensions and features
      window.addEventListener('resize', this.resize);
  
      // Mouse tracking for trail effect (disable if reduced motion)
      this.mousePos = { x: 0, y: 0 };
      if (!this.prefersReducedMotion) {
          window.addEventListener('mousemove', this.handleMouseMove);
          window.addEventListener('click', this.handleClick);
      }
  
      // Load fish images
      this.loadFishImages();
  
      // Start weather simulation
      this.simulateWeather();
    }
  
    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.initWavePoints();
      // Recreate features on resize
      this.plants = [];
      this.corals = [];
      this.backgroundFeatures = [];
      this.createInitialBackgroundFeatures(); // Create background first
      this.createInitialCorals();
      this.createInitialPlants();
    }
  
    handleMouseMove(e) {
      if (this.prefersReducedMotion) return;
      this.mousePos = { x: e.clientX, y: e.clientY };
      this.addTrailPoint();
    }
  
    handleClick(e) {
       if (this.prefersReducedMotion) return;
       if (e.target.closest('a, button, .button, input, select, textarea, [role="button"]')) return;
       this.createSplash(e.clientX, e.clientY);
  
       // Fish Click Reaction
       const clickRadius = 80;
       const dartSpeedMultiplier = 3;
       const dartDuration = 700;
  
       this.fishes.forEach(fish => {
           if (fish.state === 'nibbling') return;
           const dx = fish.x - e.clientX;
           const dy = fish.y - e.clientY;
           const distance = Math.sqrt(dx * dx + dy * dy);
  
           if (distance < clickRadius + fish.size / 2) {
               fish.state = 'darting';
               fish.stateTimer = dartDuration;
               const angleAway = Math.atan2(dy, dx);
               fish.targetSpeed = fish.baseSpeed * dartSpeedMultiplier;
               fish.targetDirectionAngle = angleAway + (Math.random() - 0.5) * 0.5;
               if (Math.abs(Math.cos(angleAway)) > Math.abs(Math.sin(angleAway))) {
                   fish.direction = (Math.cos(angleAway) > 0) ? 'right' : 'left';
               } else {
                   fish.direction = (fish.x < this.canvas.width / 2) ? 'right' : 'left';
               }
               fish.scaleX = fish.direction === 'left' ? -1 : 1;
               fish.targetY = fish.y + Math.sin(angleAway) * 30 + (Math.random() - 0.5) * 20;
               fish.targetPlant = null;
               fish.targetCoral = null; // NEW: Stop targeting coral too
           }
       });
    }
  
    initWavePoints() {
      this.wavePoints = [];
      const pointCount = Math.ceil(this.canvas.width / (this.isLowPerfDevice ? 40 : 20));
      for (let i = 0; i <= pointCount; i++) {
        this.wavePoints.push({
          x: (this.canvas.width * i) / pointCount, y: 0, originalY: 0,
          speed: 0.1 + Math.random() * 0.2
        });
      }
    }
  
    loadFishImages() {
      if (typeof FISH_IMAGES !== 'undefined') {
        for (const [key, url] of Object.entries(FISH_IMAGES)) {
          const img = new Image();
          img.src = url;
          img.onload = () => {
              this.fishImages[key] = img;
              if (Object.keys(this.fishImages).length >= 3 && this.fishes.length === 0) {
                   this.createInitialFish();
              }
          };
          img.onerror = () => { console.error(`Failed to load fish image: ${key} at ${url}`); };
        }
      } else { console.error("FISH_IMAGES object not found. Cannot load fish images."); }
    }
  
    createInitialFish() {
      const fishCount = this.isLowPerfDevice ? 5 : (window.navigator.hardwareConcurrency >= 8 ? 15 : 10);
      for (let i = 0; i < fishCount; i++) {
        setTimeout(() => this.addFish(), i * (this.isLowPerfDevice ? 700 : 400));
      }
    }
  
    addFish() {
      const keys = Object.keys(this.fishImages);
      if (keys.length === 0) return;
      const maxFish = this.isLowPerfDevice ? 5 : (window.navigator.hardwareConcurrency >= 8 ? 15 : 10);
      if (this.fishes.length >= maxFish) return;
  
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const img = this.fishImages[randomKey];
      if (!img || !img.complete || !img.naturalWidth) {
          setTimeout(() => this.addFish(), 100);
          return;
      }
  
      let size = 30 + Math.random() * 40;
      if (randomKey.includes("Mythic") || randomKey.includes("Legendary") || randomKey.includes("Chimerical") || randomKey.includes("Kraken") || randomKey.includes("Whale")) { size = 65 + Math.random() * 30; }
      else if (randomKey.includes("Rare") || randomKey.includes("Shark") || randomKey.includes("Sturgeon")) { size = 50 + Math.random() * 25; }
      if (this.isLowPerfDevice) size *= 0.8;
  
      const direction = Math.random() > 0.5 ? 'right' : 'left';
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
      const fishHeight = size * (img.naturalHeight / img.naturalWidth);
      const minY = waterLine + fishHeight / 2 + 5;
      const maxY = this.canvas.height - fishHeight / 2 - 5;
      const startY = minY + Math.random() * (maxY - minY);
      const startX = direction === 'right' ? -size / 2 : this.canvas.width + size / 2;
  
      let baseSpeed = (40 - size * 0.3) * 0.05 * (0.8 + Math.random() * 0.4);
      let currentSpeed = baseSpeed * (0.5 + Math.random() * 0.5);
      let targetSpeed = currentSpeed;
      let verticalAmount = Math.random() * 6 + 2;
      let wiggleAmount = Math.random() * 0.3 + 0.2;
  
      if (this.isLowPerfDevice) { baseSpeed *= 0.6; verticalAmount *= 0.5; wiggleAmount *= 0.5; }
      if (this.prefersReducedMotion) { verticalAmount = 0; wiggleAmount = 0; baseSpeed *= 0.5; currentSpeed = baseSpeed; targetSpeed = baseSpeed; }
  
      this.fishes.push({
        img: img, x: startX, y: startY, size: size,
        baseSpeed: baseSpeed,
        currentSpeed: currentSpeed,
        targetSpeed: targetSpeed,
        direction: direction,
        scaleX: direction === 'left' ? -1 : 1,
        targetY: startY,
        verticalAmount: verticalAmount,
        wiggleAmount: wiggleAmount,
        wigglePhase: Math.random() * Math.PI * 2,
        state: 'swimming',
        stateTimer: 2000 + Math.random() * 3000,
        targetDirectionAngle: null,
        avoidanceVector: { x: 0, y: 0 },
        lastInteractionCheck: 0,
        targetPlant: null,
        targetCoral: null, // NEW: Target for coral interaction
        nibbleOffset: 0
      });
    }
  
    addBubble(x, y) {
      if (this.isLowPerfDevice && Math.random() > 0.3) return;
      if (this.prefersReducedMotion) return;
      const size = 5 + Math.random() * 10;
      const speedY = 1 + Math.random() * 2;
      const driftX = (-0.5 + Math.random()) * 0.5;
      this.bubbles.push({
        x: x || Math.random() * this.canvas.width, y: y || this.canvas.height - Math.random() * 50,
        size: size, speedY: speedY, driftX: driftX, opacity: 0.1, maxOpacity: 0.6 + Math.random() * 0.2
      });
    }
  
    addTrailPoint() {
      if (this.prefersReducedMotion) return;
      this.mouseTrail.push({
        x: this.mousePos.x, y: this.mousePos.y, size: 8 + Math.random() * 4,
        opacity: 0.5, age: 0, maxAge: 300 + Math.random() * 200
      });
    }
  
    createSplash(x, y, sizeMultiplier = 1, countMultiplier = 1) {
      if (this.prefersReducedMotion) return;
      const dropletCount = Math.floor((this.isLowPerfDevice ? 4 : 8) * countMultiplier) + Math.floor(Math.random() * 3 * countMultiplier);
      for (let i = 0; i < dropletCount; i++) {
        const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() * 0.5 - 0.25);
        const initialSpeed = (2 + Math.random() * 3) * sizeMultiplier;
        const speedX = Math.cos(angle) * initialSpeed;
        const speedY = Math.sin(angle) * initialSpeed - (1.5 + Math.random() * 1.5) * sizeMultiplier;
        this.mouseTrail.push({
          x: x, y: y, size: (3 + Math.random() * 4) * sizeMultiplier,
          opacity: 0.8, age: 0,
          maxAge: (400 + Math.random() * 200) * sizeMultiplier,
          speedX: speedX, speedY: speedY,
          gravity: 0.15, isSplash: true
        });
      }
    }
  
    // --- START: Plant Methods ---
    createInitialPlants() {
        if (this.prefersReducedMotion) return;
        const plantDensity = this.isLowPerfDevice ? 0.02 : 0.04; // Reduced density slightly
        const plantCount = Math.floor(this.canvas.width * plantDensity);
        for (let i = 0; i < plantCount; i++) {
            this.addPlant();
        }
    }
  
    addPlant() {
        if (this.prefersReducedMotion) return;
        const x = Math.random() * this.canvas.width;
        const baseY = this.canvas.height;
        const maxHeight = 30 + Math.random() * (this.isLowPerfDevice ? 40 : 80);
        const type = Math.random() < 0.5 ? 'seaweed' : (Math.random() < 0.7 ? 'grass' : 'bushy'); // Added grass type
        let color;
        if (type === 'seaweed') {
            color = `rgba(${40 + Math.random() * 40}, ${100 + Math.random() * 60}, ${40 + Math.random() * 40}, ${0.6 + Math.random() * 0.2})`; // Darker greens
        } else if (type === 'grass') {
            color = `rgba(${80 + Math.random() * 50}, ${140 + Math.random() * 60}, ${70 + Math.random() * 50}, ${0.7 + Math.random() * 0.2})`; // Brighter greens
        } else { // Bushy
            color = `rgba(${100 + Math.random() * 50}, ${80 + Math.random() * 50}, ${50 + Math.random() * 30}, ${0.5 + Math.random() * 0.2})`; // Brownish/Reddish
        }
  
        this.plants.push({
            x: x,
            baseY: baseY,
            maxHeight: maxHeight,
            currentHeight: maxHeight * (0.8 + Math.random() * 0.2),
            color: color,
            type: type,
            swayPhase: Math.random() * Math.PI * 2, // Use phase for smoother sway
            swaySpeed: 0.0003 + Math.random() * 0.0004,
            swayAmount: 0.05 + Math.random() * 0.15,
            segments: type === 'seaweed' ? 4 + Math.floor(Math.random() * 4) : (type === 'grass' ? 1 : 5 + Math.floor(Math.random() * 4)),
            isBeingNibbledTimer: 0
        });
    }
  
    updatePlants(delta) {
        if (this.prefersReducedMotion) { this.plants = []; return; }
        const time = performance.now();
        this.plants.forEach(plant => {
            // Swaying motion using phase
            plant.swayPhase += plant.swaySpeed * delta;
            plant.currentSway = Math.sin(plant.swayPhase) * plant.swayAmount;
  
            // Nibbled feedback timer
            if (plant.isBeingNibbledTimer > 0) {
                plant.isBeingNibbledTimer -= delta;
                // Add extra wiggle when nibbled
                plant.currentSway += Math.sin(time * 0.05) * 0.05;
            }
        });
    }
    // --- END: Plant Methods ---
  
    // --- START: Coral Methods ---
    createInitialCorals() {
        if (this.prefersReducedMotion) return;
        const coralDensity = this.isLowPerfDevice ? 0.008 : 0.015; // Corals per 100 pixels
        const coralCount = Math.floor(this.canvas.width * coralDensity);
        for (let i = 0; i < coralCount; i++) {
            this.addCoral();
        }
    }
  
    addCoral() {
        if (this.prefersReducedMotion) return;
        const x = Math.random() * this.canvas.width;
        const y = this.canvas.height - Math.random() * 30; // Place near the bottom
        const type = Math.random() < 0.6 ? 'branching' : (Math.random() < 0.8 ? 'brain' : 'fan');
        const size = 15 + Math.random() * (this.isLowPerfDevice ? 25 : 40);
        let color;
        const randColor = Math.random();
        if (randColor < 0.3) color = `rgba(${255}, ${100 + Math.random() * 50}, ${100 + Math.random() * 50}, ${0.7 + Math.random() * 0.2})`; // Pinks/Reds
        else if (randColor < 0.6) color = `rgba(${255}, ${150 + Math.random() * 50}, ${50 + Math.random() * 50}, ${0.7 + Math.random() * 0.2})`; // Oranges/Yellows
        else color = `rgba(${150 + Math.random() * 50}, ${100 + Math.random() * 50}, ${200 + Math.random() * 55}, ${0.7 + Math.random() * 0.2})`; // Purples/Blues
  
        const coralData = {
            x: x, y: y, size: size, type: type, color: color,
            structure: [], // Store generated points/branches
            swayPhase: Math.random() * Math.PI * 2, // For subtle animation
            swaySpeed: 0.0001 + Math.random() * 0.0002,
            swayAmount: 0.01 + Math.random() * 0.02,
            isBeingNibbledTimer: 0 // NEW: Nibble timer for coral
        };
  
        // Generate structure based on type
        this.generateCoralStructure(coralData);
        this.corals.push(coralData);
    }
  
    generateCoralStructure(coral) {
        coral.structure = []; // Clear previous structure
        const iterations = coral.type === 'branching' ? 4 + Math.floor(Math.random() * 3) : (coral.type === 'brain' ? 1 : 5 + Math.floor(Math.random()*4));
        const baseAngle = -Math.PI / 2; // Start pointing upwards
  
        if (coral.type === 'branching') {
            const generateBranch = (x, y, angle, length, depth, width) => {
                if (depth <= 0 || length < 2) return;
                const endX = x + Math.cos(angle) * length;
                const endY = y + Math.sin(angle) * length;
                coral.structure.push({ x1: x, y1: y, x2: endX, y2: endY, width: width });
  
                // Branch out
                const branches = Math.random() < 0.7 ? 2 : 1; // Chance for 1 or 2 branches
                for (let i = 0; i < branches; i++) {
                    const angleOffset = (Math.random() - 0.5) * (Math.PI / 2.5); // Branch angle variation
                    const lengthMultiplier = 0.6 + Math.random() * 0.3;
                    generateBranch(endX, endY, angle + angleOffset, length * lengthMultiplier, depth - 1, Math.max(1, width * 0.8));
                }
            };
            generateBranch(0, 0, baseAngle, coral.size * 0.6, iterations, Math.max(2, coral.size * 0.1));
        } else if (coral.type === 'brain') {
            const points = [];
            const bumps = 8 + Math.floor(Math.random() * 8);
            for (let i = 0; i < bumps; i++) {
                const angle = (Math.PI * 2 / bumps) * i;
                const radius = coral.size * (0.8 + Math.random() * 0.4); // Vary radius for bumpy shape
                points.push({
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius * 0.7 // Make it slightly flatter
                });
            }
            coral.structure.push({ type: 'brain', points: points }); // Store points for rendering
        } else { // Fan coral (simplified 2D branching)
             const generateFanBranch = (x, y, angle, length, depth, width) => {
                if (depth <= 0 || length < 1) return;
                const endX = x + Math.cos(angle) * length;
                const endY = y + Math.sin(angle) * length;
                coral.structure.push({ x1: x, y1: y, x2: endX, y2: endY, width: width });
  
                const branches = Math.random() < 0.8 ? 2 : 3; // More branching for fans
                for (let i = 0; i < branches; i++) {
                    const angleOffset = (Math.random() - 0.5) * (Math.PI / 3); // Wider branching angle
                    const lengthMultiplier = 0.5 + Math.random() * 0.25;
                    generateFanBranch(endX, endY, angle + angleOffset, length * lengthMultiplier, depth - 1, Math.max(1, width * 0.9));
                }
            };
            generateFanBranch(0, 0, baseAngle, coral.size * 0.5, iterations, Math.max(1, coral.size * 0.05));
        }
    }
  
    updateCorals(delta) {
        if (this.prefersReducedMotion) return; // No animation if reduced motion
        this.corals.forEach(coral => {
            coral.swayPhase += coral.swaySpeed * delta;
            coral.currentSway = Math.sin(coral.swayPhase) * coral.swayAmount;
  
            // Nibbled feedback timer
            if (coral.isBeingNibbledTimer > 0) {
                coral.isBeingNibbledTimer -= delta;
                coral.currentSway += Math.sin(performance.now() * 0.06) * 0.03; // Extra wiggle
            }
        });
    }
    // --- END: Coral Methods ---
  
    // --- START: Background Feature Methods ---
    createInitialBackgroundFeatures() {
        const featureDensity = this.isLowPerfDevice ? 0.004 : 0.008; // Features per 100 pixels
        const featureCount = Math.floor(this.canvas.width * featureDensity);
        for (let i = 0; i < featureCount; i++) {
            this.addBackgroundFeature();
        }
    }
  
    addBackgroundFeature() {
        const x = Math.random() * this.canvas.width;
        const y = this.canvas.height - Math.random() * this.canvas.height * 0.2; // Lower 20% of screen
        const type = Math.random() < 0.7 ? 'rocks' : 'cave';
        const size = 50 + Math.random() * (this.isLowPerfDevice ? 100 : 200);
        const colorValue = 30 + Math.random() * 40; // Dark grays/blues
        const color = `rgba(${colorValue}, ${colorValue + Math.random() * 10}, ${colorValue + Math.random() * 20}, ${0.3 + Math.random() * 0.3})`; // Low opacity
  
        const featureData = {
            x: x, y: y, size: size, type: type, color: color,
            points: [] // Store generated points for the shape
        };
  
        // Generate points for the shape
        const pointCount = 5 + Math.floor(Math.random() * 5);
        let currentAngle = Math.random() * Math.PI * 2;
        for (let i = 0; i < pointCount; i++) {
            const radius = size * (0.6 + Math.random() * 0.8); // Irregular radius
            currentAngle += (Math.PI * 2 / pointCount) * (0.8 + Math.random() * 0.4); // Irregular angle steps
            featureData.points.push({
                x: Math.cos(currentAngle) * radius,
                y: Math.sin(currentAngle) * radius * (0.5 + Math.random() * 0.5) // Make it flatter
            });
        }
  
        // Add cave entrance if type is cave
        if (type === 'cave') {
            const caveDepth = size * (0.2 + Math.random() * 0.3);
            const caveWidth = size * (0.3 + Math.random() * 0.4);
            const caveYOffset = size * (0.1 + Math.random() * 0.2); // Position cave entrance lower
            featureData.cave = { width: caveWidth, height: caveDepth, yOffset: caveYOffset };
        }
  
        this.backgroundFeatures.push(featureData);
    }
    // --- END: Background Feature Methods ---
  
    // --- START: Rain Methods ---
    simulateWeather() {
        setInterval(() => {
            if (this.prefersReducedMotion) {
                this.isRaining = false;
                return;
            }
            if (Math.random() < 0.1) {
                this.isRaining = !this.isRaining;
                if (this.isRaining) {
                    this.rainIntensity = 0.2 + Math.random() * 0.8;
                    console.log(`Weather: Started raining (Intensity: ${this.rainIntensity.toFixed(2)})`);
                } else {
                    console.log("Weather: Stopped raining");
                }
            }
        }, 30000);
    }
  
    addRaindrop() {
        if (this.prefersReducedMotion || !this.isRaining) return;
        if (Math.random() > this.rainIntensity * (this.isLowPerfDevice ? 0.3 : 1)) return;
  
        this.raindrops.push({
            x: Math.random() * this.canvas.width,
            y: -10,
            length: 5 + Math.random() * 10,
            speedY: 8 + Math.random() * 7,
            opacity: 0.3 + Math.random() * 0.4
        });
    }
  
    updateRaindrops(delta) {
        if (this.prefersReducedMotion || !this.isRaining) {
            this.raindrops = [];
            return;
        }
  
        for (let i = this.raindrops.length - 1; i >= 0; i--) {
            const drop = this.raindrops[i];
            drop.y += drop.speedY * (delta / 16.67);
  
            let waveSurfaceY = (100 - this.waterHeight) * this.canvas.height / 100;
            if (this.wavePoints.length > 1) {
                const xRatio = drop.x / this.canvas.width;
                const waveIndex = Math.min(this.wavePoints.length - 1, Math.max(0, Math.floor(xRatio * (this.wavePoints.length - 1))));
                const nextIndex = Math.min(this.wavePoints.length - 1, waveIndex + 1);
                const segmentRatio = (drop.x - this.wavePoints[waveIndex].x) / (this.wavePoints[nextIndex].x - this.wavePoints[waveIndex].x || 1);
                waveSurfaceY = this.wavePoints[waveIndex].y + (this.wavePoints[nextIndex].y - this.wavePoints[waveIndex].y) * segmentRatio;
            }
  
            if (drop.y + drop.length / 2 > waveSurfaceY) {
                this.createSplash(drop.x, waveSurfaceY, 0.3, 0.4);
                this.raindrops.splice(i, 1);
            } else if (drop.y > this.canvas.height) {
                this.raindrops.splice(i, 1);
            }
        }
        this.addRaindrop();
    }
    // --- END: Rain Methods ---
  
  
    updateWaterHeight(targetHeight) {
      const diff = targetHeight - this.waterHeight;
      this.waterHeight += diff * 0.08;
    }
  
    // --- START: Fish Interaction Logic ---
    updateFishInteractions(currentTimestamp) {
        if (this.prefersReducedMotion) return;
  
        const interactionRadius = 60;
        const avoidanceStrength = 0.05;
        const checkInterval = 100;
  
        for (let i = 0; i < this.fishes.length; i++) {
            const fish1 = this.fishes[i];
  
            if (currentTimestamp - fish1.lastInteractionCheck < checkInterval) {
                continue;
            }
            fish1.lastInteractionCheck = currentTimestamp;
            fish1.avoidanceVector = { x: 0, y: 0 };
  
            if (fish1.state === 'darting') continue;
  
            // Fish-to-Fish avoidance
            for (let j = i + 1; j < this.fishes.length; j++) {
                const fish2 = this.fishes[j];
                if (fish2.state === 'darting') continue;
  
                const dx = fish2.x - fish1.x;
                const dy = fish2.y - fish1.y;
                const distanceSq = dx * dx + dy * dy;
                const combinedRadius = (fish1.size / 2 + fish2.size / 2) * 1.5;
  
                if (distanceSq < combinedRadius * combinedRadius) {
                    const distance = Math.sqrt(distanceSq);
                    const overlap = combinedRadius - distance;
                    if (distance > 0.01) {
                        const avoidanceX = -(dx / distance) * overlap * avoidanceStrength;
                        const avoidanceY = -(dy / distance) * overlap * avoidanceStrength;
                        fish1.avoidanceVector.x += avoidanceX;
                        fish1.avoidanceVector.y += avoidanceY;
                        fish2.avoidanceVector.x -= avoidanceX;
                        fish2.avoidanceVector.y -= avoidanceY;
                    }
                }
            }
  
            // Fish-to-Plant/Coral Interaction (Nibbling)
            if (fish1.state === 'swimming') {
                const nibbleChance = 0.003; // Lower chance
                const checkRadius = fish1.size * 1.5;
                const bottomThreshold = this.canvas.height - 150; // Check wider area near bottom
  
                if (fish1.y > bottomThreshold && Math.random() < nibbleChance) {
                    let closestTarget = null;
                    let minDistSq = checkRadius * checkRadius;
                    let targetType = null; // 'plant' or 'coral'
  
                    // Check plants
                    for (const plant of this.plants) {
                        const plantTopY = plant.baseY - plant.currentHeight;
                        const dx = plant.x - fish1.x;
                        const dy = plantTopY - fish1.y;
                        const distSq = dx * dx + dy * dy;
                        if (distSq < minDistSq) {
                            minDistSq = distSq;
                            closestTarget = plant;
                            targetType = 'plant';
                        }
                    }
  
                    // Check corals (only if no closer plant found or randomly prefer coral)
                    if (this.corals.length > 0 && (targetType !== 'plant' || Math.random() < 0.3)) {
                        for (const coral of this.corals) {
                            // Approximate coral center/top for distance check
                            const coralTopY = coral.y - coral.size * 0.5; // Approx top
                            const dx = coral.x - fish1.x;
                            const dy = coralTopY - fish1.y;
                            const distSq = dx * dx + dy * dy;
                            if (distSq < minDistSq) {
                                minDistSq = distSq;
                                closestTarget = coral;
                                targetType = 'coral';
                            }
                        }
                    }
  
  
                    if (closestTarget && targetType) {
                        fish1.state = 'nibbling';
                        fish1.stateTimer = 1500 + Math.random() * 2000;
                        fish1.targetSpeed = fish1.baseSpeed * 0.05;
                        closestTarget.isBeingNibbledTimer = 300; // Visual feedback
  
                        if (targetType === 'plant') {
                            fish1.targetPlant = closestTarget;
                            fish1.targetCoral = null;
                            fish1.targetY = closestTarget.baseY - closestTarget.currentHeight * 0.3;
                            fish1.targetX = closestTarget.x + (Math.random() - 0.5) * 10;
                        } else { // Coral
                            fish1.targetPlant = null;
                            fish1.targetCoral = closestTarget;
                            // Target a point near the top/side of the coral
                            fish1.targetY = closestTarget.y - closestTarget.size * (0.2 + Math.random() * 0.3);
                            fish1.targetX = closestTarget.x + (fish1.x > closestTarget.x ? -1 : 1) * closestTarget.size * (0.1 + Math.random() * 0.2);
                        }
                    }
                }
            }
        }
    }
    // --- END: Fish Interaction Logic ---
  
    update(delta) {
      const currentTimestamp = performance.now();
      this.updateWaves(delta);
      this.updatePlants(delta);
      this.updateCorals(delta); // NEW: Update corals
      this.updateRaindrops(delta);
      if (!this.prefersReducedMotion) {
          this.updateFishInteractions(currentTimestamp);
      }
      this.updateFish(delta);
      if (!this.prefersReducedMotion) { this.updateBubbles(delta); }
      if (!this.prefersReducedMotion) { this.updateMouseTrail(delta); }
  
      if (Math.random() < 0.001 * delta) { this.addBubble(); }
      const maxFish = this.isLowPerfDevice ? 5 : (window.navigator.hardwareConcurrency >= 8 ? 15 : 10);
      if (this.fishes.length < maxFish && Math.random() < 0.0001 * delta) { this.addFish(); }
      if (this.fishes.length > maxFish + 2 && Math.random() < 0.0002 * delta) {
          const fishToRemove = this.fishes[0];
          if (!fishToRemove.fadingOut) {
              fishToRemove.fadingOut = true;
              fishToRemove.stateTimer = 500;
          }
      }
    }
  
    updateWaves(delta) {
      const waveTime = performance.now() * 0.001;
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
      const amplitudeMultiplier = this.isLowPerfDevice ? 0.6 : 1;
      for (let i = 0; i < this.wavePoints.length; i++) {
        const point = this.wavePoints[i];
        const xFactor = i / (this.wavePoints.length -1);
        if (this.prefersReducedMotion) {
             point.y = waterLine + (Math.sin(waveTime * 0.3 + xFactor * 4) * 3 * amplitudeMultiplier);
        } else {
             point.y = waterLine +
                  (Math.sin(waveTime * 0.8 + xFactor * 10) * 4 * amplitudeMultiplier) +
                  (Math.sin(waveTime * 0.5 + xFactor * 6) * 6 * amplitudeMultiplier) +
                  (Math.sin(waveTime * 0.3 + xFactor * 4) * 3 * amplitudeMultiplier);
        }
      }
    }
  
    updateFish(delta) {
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
      const deltaSeconds = delta / 1000;
      const lerpFactor = 0.05;
  
      for (let i = this.fishes.length - 1; i >= 0; i--) {
        const fish = this.fishes[i];
  
        if (fish.fadingOut) {
            fish.stateTimer -= delta;
            fish.opacity = Math.max(0, fish.stateTimer / 500);
            if (fish.stateTimer <= 0) {
                this.fishes.splice(i, 1);
                continue;
            }
        } else {
            fish.opacity = 1.0;
        }
  
        // State Management
        fish.stateTimer -= delta;
        if (fish.stateTimer <= 0) {
            if (fish.state === 'nibbling' || fish.state === 'darting') {
                fish.targetPlant = null;
                fish.targetCoral = null; // Reset coral target too
            }
  
            if (fish.state === 'darting') {
                fish.state = 'swimming';
                fish.targetSpeed = fish.baseSpeed * (0.5 + Math.random() * 0.7);
                fish.stateTimer = 3000 + Math.random() * 4000;
                fish.targetDirectionAngle = null;
            } else if (fish.state === 'nibbling') {
                fish.state = 'swimming';
                fish.targetSpeed = fish.baseSpeed * (0.4 + Math.random() * 0.6);
                fish.stateTimer = 2000 + Math.random() * 3000;
                if (Math.random() < 0.5) {
                    fish.direction = fish.direction === 'right' ? 'left' : 'right';
                    fish.scaleX = fish.direction === 'left' ? -1 : 1;
                }
                const fishHeight = fish.size * (fish.img.naturalHeight / fish.img.naturalWidth);
                const minY = waterLine + fishHeight / 2 + 10;
                const maxY = this.canvas.height - fishHeight / 2 - 10;
                fish.targetY = minY + Math.random() * (maxY - minY);
            } else if (fish.state === 'swimming') {
                if (Math.random() < 0.2 && !this.prefersReducedMotion) {
                    fish.state = 'pausing';
                    fish.targetSpeed = fish.baseSpeed * (0.05 + Math.random() * 0.1);
                    fish.stateTimer = 1000 + Math.random() * 2000;
                } else {
                    fish.targetSpeed = fish.baseSpeed * (0.4 + Math.random() * 0.8);
                    fish.stateTimer = 3000 + Math.random() * 4000;
                    const fishHeight = fish.size * (fish.img.naturalHeight / fish.img.naturalWidth);
                    const minY = waterLine + fishHeight / 2 + 10;
                    const maxY = this.canvas.height - fishHeight / 2 - 10;
                    fish.targetY = minY + Math.random() * (maxY - minY);
                }
            } else if (fish.state === 'pausing') {
                fish.state = 'swimming';
                fish.targetSpeed = fish.baseSpeed * (0.5 + Math.random() * 0.7);
                fish.stateTimer = 3000 + Math.random() * 4000;
                if (Math.random() < 0.3) {
                    fish.direction = fish.direction === 'right' ? 'left' : 'right';
                    fish.scaleX = fish.direction === 'left' ? -1 : 1;
                }
            }
        }
  
        fish.currentSpeed += (fish.targetSpeed - fish.currentSpeed) * lerpFactor;
  
        // Movement Calculation
        const fishWidth = fish.size;
        const fishHeight = fish.img.complete ? fish.size * (fish.img.naturalHeight / fish.img.naturalWidth) : fish.size;
        const horizontalSpeedPx = fish.currentSpeed * this.canvas.width * 0.1;
  
        let moveX = (fish.direction === 'right' ? horizontalSpeedPx * deltaSeconds : -horizontalSpeedPx * deltaSeconds);
        let moveY = 0;
  
        if (!this.prefersReducedMotion && (fish.avoidanceVector.x !== 0 || fish.avoidanceVector.y !== 0)) {
             moveX += fish.avoidanceVector.x * deltaSeconds * 50;
             moveY += fish.avoidanceVector.y * deltaSeconds * 50;
             fish.targetY += fish.avoidanceVector.y * 0.5;
        }
  
        if (fish.state === 'darting' && fish.targetDirectionAngle !== null) {
            const dartSpeedPx = fish.currentSpeed * this.canvas.width * 0.1;
            moveX = Math.cos(fish.targetDirectionAngle) * dartSpeedPx * deltaSeconds;
            moveY = Math.sin(fish.targetDirectionAngle) * dartSpeedPx * deltaSeconds;
        }
  
        // Nibbling Movement
        if (fish.state === 'nibbling') {
            let targetX = fish.x; // Default to current X
            if (fish.targetPlant) {
                targetX = fish.targetPlant.x + (fish.scaleX > 0 ? -fishWidth * 0.4 : fishWidth * 0.4);
            } else if (fish.targetCoral) {
                targetX = fish.targetCoral.x + (fish.scaleX > 0 ? -fish.targetCoral.size * 0.3 : fish.targetCoral.size * 0.3);
            }
            moveX = (targetX - fish.x) * lerpFactor * 0.5; // Slow horizontal adjustment
  
            fish.nibbleOffset = Math.sin(performance.now() * 0.01) * 1.5;
            moveY += fish.nibbleOffset * deltaSeconds * 10;
        } else {
            fish.nibbleOffset = 0;
        }
  
        fish.x += moveX;
        fish.y += moveY;
  
        // Vertical Movement & Boundaries
        const topWaterBoundary = waterLine + fishHeight / 2 + 5;
        const bottomWaterBoundary = this.canvas.height - fishHeight / 2 - 5;
  
        fish.targetY = Math.max(topWaterBoundary, Math.min(bottomWaterBoundary, fish.targetY));
  
        if (!(fish.state === 'darting' && Math.abs(moveY) > 0.1) && fish.state !== 'nibbling') {
             fish.y += (fish.targetY - fish.y) * lerpFactor * 0.5;
        }
  
        if (fish.state !== 'pausing' && fish.state !== 'nibbling' && !this.prefersReducedMotion) {
            fish.wigglePhase += deltaSeconds * (4 + fish.currentSpeed * 2);
            const wiggleOffset = Math.sin(fish.wigglePhase) * fish.wiggleAmount * (fish.size * 0.1);
            fish.y += wiggleOffset;
        }
  
        fish.y = Math.max(topWaterBoundary, Math.min(bottomWaterBoundary, fish.y));
  
        // Horizontal Boundaries & Direction Change
        const leftBoundary = -fishWidth / 2;
        const rightBoundary = this.canvas.width + fishWidth / 2;
  
        if (fish.x <= leftBoundary && fish.direction === 'left') {
            if (fish.state !== 'darting') {
                fish.direction = 'right'; fish.scaleX = 1; fish.x = leftBoundary + 1;
            } else { this.fishes.splice(i, 1); continue; }
        } else if (fish.x >= rightBoundary && fish.direction === 'right') {
             if (fish.state !== 'darting') {
                fish.direction = 'left'; fish.scaleX = -1; fish.x = rightBoundary - 1;
             } else { this.fishes.splice(i, 1); continue; }
        }
  
        if (fish.state === 'swimming' && Math.random() < 0.00005 * delta) {
            fish.direction = fish.direction === 'right' ? 'left' : 'right';
            fish.scaleX = fish.direction === 'left' ? -1 : 1;
        }
      }
    }
  
    updateBubbles(delta) {
      if (this.prefersReducedMotion) { this.bubbles = []; return; }
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
      for (let i = this.bubbles.length - 1; i >= 0; i--) {
        const bubble = this.bubbles[i];
        if (bubble.opacity < bubble.maxOpacity) {
            bubble.opacity += 0.005 * delta;
            bubble.opacity = Math.min(bubble.opacity, bubble.maxOpacity);
        }
        bubble.y -= bubble.speedY * (delta / 16.67);
        bubble.x += bubble.driftX * (delta / 16.67);
  
        if (bubble.y < waterLine - bubble.size || bubble.x < -bubble.size || bubble.x > this.canvas.width + bubble.size) {
          this.bubbles.splice(i, 1);
        }
      }
    }
  
    updateMouseTrail(delta) {
      if (this.prefersReducedMotion) { this.mouseTrail = []; return; }
      for (let i = this.mouseTrail.length - 1; i >= 0; i--) {
        const point = this.mouseTrail[i];
        point.age += delta;
  
        if (point.isSplash) {
          point.speedY += point.gravity * (delta / 16.67);
          point.x += point.speedX * (delta / 16.67);
          point.y += point.speedY * (delta / 16.67);
          point.opacity = Math.max(0, 0.8 * (1 - point.age / point.maxAge));
        } else {
          point.opacity = Math.max(0, 0.5 * (1 - point.age / point.maxAge));
        }
  
        if (point.age >= point.maxAge || point.opacity <= 0) {
          this.mouseTrail.splice(i, 1);
        }
      }
    }
  
    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
  
      // --- Render Background Features (Rocks/Caves) ---
      this.backgroundFeatures.forEach(feature => {
          this.ctx.save();
          this.ctx.translate(feature.x, feature.y);
          this.ctx.fillStyle = feature.color;
          this.ctx.beginPath();
          if (feature.points.length > 2) {
              this.ctx.moveTo(feature.points[0].x, feature.points[0].y);
              for (let i = 1; i < feature.points.length; i++) {
                  // Use quadratic curves for slightly smoother rock shapes
                  const xc = (feature.points[i].x + feature.points[i - 1].x) / 2;
                  const yc = (feature.points[i].y + feature.points[i - 1].y) / 2;
                  this.ctx.quadraticCurveTo(feature.points[i - 1].x, feature.points[i - 1].y, xc, yc);
              }
              // Close the shape
              const xc = (feature.points[0].x + feature.points[feature.points.length - 1].x) / 2;
              const yc = (feature.points[0].y + feature.points[feature.points.length - 1].y) / 2;
              this.ctx.quadraticCurveTo(feature.points[feature.points.length - 1].x, feature.points[feature.points.length - 1].y, xc, yc);
              this.ctx.closePath();
              this.ctx.fill();
  
              // Draw cave entrance if it exists
              if (feature.type === 'cave' && feature.cave) {
                  this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Darker cave color
                  this.ctx.beginPath();
                  this.ctx.ellipse(0, feature.cave.yOffset, feature.cave.width / 2, feature.cave.height / 2, 0, 0, Math.PI * 2);
                  this.ctx.fill();
              }
          }
          this.ctx.restore();
      });
  
  
      // --- Render Water ---
      if (!this.prefersReducedMotion && this.wavePoints.length > 1) {
          this.ctx.beginPath();
          this.ctx.moveTo(0, this.canvas.height);
          this.ctx.lineTo(0, this.wavePoints[0].y);
          for (let i = 1; i < this.wavePoints.length; i++) {
              const xc = (this.wavePoints[i].x + this.wavePoints[i - 1].x) / 2;
              const yc = (this.wavePoints[i].y + this.wavePoints[i - 1].y) / 2;
              this.ctx.quadraticCurveTo(this.wavePoints[i - 1].x, this.wavePoints[i - 1].y, xc, yc);
          }
          this.ctx.quadraticCurveTo(
              this.wavePoints[this.wavePoints.length - 2].x, this.wavePoints[this.wavePoints.length - 2].y,
              this.wavePoints[this.wavePoints.length - 1].x, this.wavePoints[this.wavePoints.length - 1].y
          );
          this.ctx.lineTo(this.canvas.width, this.wavePoints[this.wavePoints.length - 1].y);
          this.ctx.lineTo(this.canvas.width, this.canvas.height);
          this.ctx.closePath();
  
          const gradient = this.ctx.createLinearGradient(0, waterLine, 0, this.canvas.height);
          gradient.addColorStop(0, 'rgba(137, 247, 254, 0.6)');
          gradient.addColorStop(0.5, 'rgba(115, 200, 255, 0.7)');
          gradient.addColorStop(1, 'rgba(102, 166, 255, 0.8)');
          this.ctx.fillStyle = gradient;
          this.ctx.fill();
      } else {
          const gradient = this.ctx.createLinearGradient(0, waterLine, 0, this.canvas.height);
          gradient.addColorStop(0, 'rgba(137, 247, 254, 0.6)');
          gradient.addColorStop(1, 'rgba(102, 166, 255, 0.8)');
          this.ctx.fillStyle = gradient;
          this.ctx.fillRect(0, waterLine, this.canvas.width, this.canvas.height - waterLine);
      }
  
      // --- Render Corals ---
      if (!this.prefersReducedMotion) {
          this.corals.forEach(coral => {
              this.ctx.save();
              this.ctx.translate(coral.x, coral.y);
              this.ctx.rotate(coral.currentSway); // Apply subtle sway
  
              if (coral.type === 'branching' || coral.type === 'fan') {
                  this.ctx.strokeStyle = coral.color;
                  this.ctx.lineCap = 'round';
                  coral.structure.forEach(branch => {
                      this.ctx.lineWidth = branch.width;
                      this.ctx.beginPath();
                      this.ctx.moveTo(branch.x1, branch.y1);
                      this.ctx.lineTo(branch.x2, branch.y2);
                      this.ctx.stroke();
                  });
              } else if (coral.type === 'brain' && coral.structure.length > 0 && coral.structure[0].points) {
                  this.ctx.fillStyle = coral.color;
                  this.ctx.beginPath();
                  const points = coral.structure[0].points;
                  if (points.length > 2) {
                      this.ctx.moveTo(points[0].x, points[0].y);
                      for (let i = 1; i < points.length; i++) {
                          const xc = (points[i].x + points[i - 1].x) / 2;
                          const yc = (points[i].y + points[i - 1].y) / 2;
                          this.ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
                      }
                      // Close the shape
                      const xc = (points[0].x + points[points.length - 1].x) / 2;
                      const yc = (points[0].y + points[points.length - 1].y) / 2;
                      this.ctx.quadraticCurveTo(points[points.length - 1].x, points[points.length - 1].y, xc, yc);
                      this.ctx.closePath();
                      this.ctx.fill();
  
                      // Add simple texture lines
                      this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                      this.ctx.lineWidth = 1;
                      for(let i = 0; i < points.length; i+=2) {
                          this.ctx.beginPath();
                          this.ctx.moveTo(points[i].x * 0.8, points[i].y * 0.8);
                          this.ctx.quadraticCurveTo(points[i].x * 0.3, points[i].y * 0.3, 0, 0);
                          this.ctx.stroke();
                      }
                  }
              }
              this.ctx.restore();
          });
      }
  
      // --- Render Plants (Refined) ---
      if (!this.prefersReducedMotion) {
          this.plants.forEach(plant => {
              this.ctx.save();
              this.ctx.translate(plant.x, plant.baseY);
              this.ctx.rotate(plant.currentSway); // Use calculated sway
  
              if (plant.type === 'seaweed') {
                  this.ctx.strokeStyle = plant.color;
                  this.ctx.lineWidth = 2 + plant.maxHeight * 0.05;
                  this.ctx.lineCap = 'round';
                  this.ctx.beginPath();
                  this.ctx.moveTo(0, 0);
                  let currentY = 0;
                  let currentX = 0;
                  const segmentHeight = plant.currentHeight / plant.segments;
                  const waveFactor = plant.maxHeight * 0.1; // How much it waves internally
                  for (let i = 1; i <= plant.segments; i++) {
                      const progress = i / plant.segments;
                      const nextY = -i * segmentHeight;
                      // Apply sway progressively and add internal wave
                      const swayOffset = Math.sin(plant.swayPhase * 0.5 + progress * Math.PI) * waveFactor * progress;
                      const nextX = swayOffset;
                      // Use bezier curve for smoother seaweed fronds
                      const cp1x = currentX + (nextX - currentX) * 0.3;
                      const cp1y = currentY + (nextY - currentY) * 0.3 - segmentHeight * 0.2; // Curve upwards slightly
                      const cp2x = currentX + (nextX - currentX) * 0.7;
                      const cp2y = currentY + (nextY - currentY) * 0.7 - segmentHeight * 0.1;
                      this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nextX, nextY);
                      currentX = nextX;
                      currentY = nextY;
                  }
                  this.ctx.stroke();
              } else if (plant.type === 'grass') {
                  this.ctx.strokeStyle = plant.color;
                  this.ctx.lineWidth = 1.5 + plant.maxHeight * 0.02; // Thinner grass
                  this.ctx.lineCap = 'round';
                  const blades = 3 + Math.floor(plant.maxHeight / 20); // More blades for taller grass
                  for (let j = 0; j < blades; j++) {
                      this.ctx.beginPath();
                      const bladeOffset = (Math.random() - 0.5) * plant.maxHeight * 0.1;
                      const bladeHeight = plant.currentHeight * (0.7 + Math.random() * 0.3);
                      const controlPointX = bladeOffset + (Math.random() - 0.5) * 10; // Slight curve control
                      const controlPointY = -bladeHeight * 0.5;
                      this.ctx.moveTo(bladeOffset / 2, 0); // Start near base
                      this.ctx.quadraticCurveTo(controlPointX, controlPointY, bladeOffset, -bladeHeight);
                      this.ctx.stroke();
                  }
              } else { // Bushy
                  this.ctx.fillStyle = plant.color;
                  const leafSizeBase = plant.maxHeight * 0.1;
                  const stemPoints = 3; // Simple stem
                  let lastStemX = 0;
                  let lastStemY = 0;
                  // Draw a slightly curved central stem first (optional, subtle)
                  // this.ctx.strokeStyle = `rgba(0,0,0,0.1)`; this.ctx.lineWidth = 2;
                  // this.ctx.beginPath(); this.ctx.moveTo(0,0);
                  // this.ctx.quadraticCurveTo((Math.random()-0.5)*5, -plant.currentHeight*0.5, 0, -plant.currentHeight);
                  // this.ctx.stroke();
  
                  for (let i = 0; i < plant.segments; i++) { // Use segments for leaf count
                      const heightRatio = (0.2 + Math.random() * 0.8); // Place leaves randomly along height
                      const stemY = -plant.currentHeight * heightRatio;
                      const stemX = Math.sin(heightRatio * Math.PI) * plant.maxHeight * 0.05; // Slight stem curve
  
                      const angle = (Math.random() - 0.5) * Math.PI * 0.8; // Random angle for leaf
                      const leafX = stemX + Math.cos(angle) * leafSizeBase * 1.5;
                      const leafY = stemY + Math.sin(angle) * leafSizeBase * 1.5;
                      const leafWidth = leafSizeBase * (0.6 + Math.random() * 0.4);
                      const leafHeight = leafSizeBase * (0.8 + Math.random() * 0.5);
  
                      this.ctx.save();
                      this.ctx.translate(leafX, leafY);
                      this.ctx.rotate(angle + Math.PI / 2); // Rotate leaf
                      this.ctx.beginPath();
                      this.ctx.ellipse(0, 0, leafWidth / 2, leafHeight / 2, 0, 0, Math.PI * 2);
                      this.ctx.fill();
                      this.ctx.restore();
                  }
              }
              this.ctx.restore();
          });
      }
  
  
      // --- Render Fish ---
      for (const fish of this.fishes) {
        if (!fish.img || !fish.img.complete || !fish.img.naturalWidth) continue;
  
        this.ctx.save();
        this.ctx.translate(fish.x, fish.y);
        this.ctx.scale(fish.scaleX, 1);
  
        if (fish.state === 'nibbling') {
            this.ctx.rotate(Math.sin(performance.now() * 0.01) * 0.05);
        }
  
        const aspectRatio = fish.img.naturalHeight / fish.img.naturalWidth;
        const width = fish.size;
        const height = fish.size * aspectRatio;
  
        try {
          this.ctx.globalAlpha = fish.opacity * (this.isLowPerfDevice ? 0.85 : 1.0);
          this.ctx.drawImage(fish.img, -width / 2, -height / 2, width, height);
        } catch (e) {
          console.error("Error drawing fish image:", e, fish.img.src);
        }
        this.ctx.restore();
      }
      this.ctx.globalAlpha = 1.0;
  
      // --- Render Bubbles ---
      if (!this.prefersReducedMotion) {
          this.ctx.fillStyle = `rgba(255, 255, 255, 0.7)`;
          for (const bubble of this.bubbles) {
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, bubble.size / 2, 0, Math.PI * 2);
            this.ctx.globalAlpha = bubble.opacity;
            this.ctx.fill();
          }
          this.ctx.globalAlpha = 1;
      }
  
      // --- Render Mouse Trail ---
      if (!this.prefersReducedMotion) {
          this.ctx.fillStyle = `rgba(137, 247, 254, 1)`;
          for (const point of this.mouseTrail) {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.size / 2, 0, Math.PI * 2);
            this.ctx.globalAlpha = point.opacity;
            this.ctx.fill();
          }
           this.ctx.globalAlpha = 1;
      }
  
      // --- Render Rain ---
      if (!this.prefersReducedMotion && this.isRaining) {
          this.ctx.strokeStyle = 'rgba(180, 210, 230, 0.6)';
          this.ctx.lineWidth = 1.5;
          this.ctx.lineCap = 'round';
          for (const drop of this.raindrops) {
              this.ctx.beginPath();
              this.ctx.moveTo(drop.x, drop.y);
              this.ctx.lineTo(drop.x, drop.y + drop.length);
              this.ctx.globalAlpha = drop.opacity;
              this.ctx.stroke();
          }
          this.ctx.globalAlpha = 1;
      }
    }
  
    animate(timestamp) {
      this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));
  
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const elapsed = timestamp - this.lastTimestamp;
      this.lastTimestamp = timestamp;
  
      this.timeAccumulator += elapsed;
      let updatesProcessed = 0;
      while (this.timeAccumulator >= this.TARGET_FRAME_TIME) {
          this.update(this.TARGET_FRAME_TIME);
          this.timeAccumulator -= this.TARGET_FRAME_TIME;
          updatesProcessed++;
          if (updatesProcessed > 5) {
              this.timeAccumulator = 0;
              console.warn("Canvas falling behind, resetting time accumulator.");
              break;
          }
      }
  
      this.render();
    }
  
    start() {
      if (!this.animationFrameId) {
          console.log("Starting Canvas Animation Loop (Target 30fps Update)");
          this.lastTimestamp = performance.now();
          this.timeAccumulator = 0;
          this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));
      }
    }
  
    stop() {
      if (this.animationFrameId) {
        console.log("Stopping Canvas Animation Loop");
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      if (this.canvas && this.canvas.parentNode) {
          this.canvas.parentNode.removeChild(this.canvas);
      }
      window.removeEventListener('resize', this.resize);
      if (!this.prefersReducedMotion) {
          window.removeEventListener('mousemove', this.handleMouseMove);
          window.removeEventListener('click', this.handleClick);
      }
    }
  }