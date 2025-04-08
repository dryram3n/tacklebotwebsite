// Canvas implementation for water effects
class WaterCanvas {
    // Class constants
    static TARGET_FPS = 30;
    static FISH_MAX_COUNT = 15;
    static FISH_MIN_COUNT = 5;
    static LERP_FACTOR = 0.08;
    static BUBBLE_MAX_OPACITY = 0.6;
    static WATER_COLOR_TOP = 'rgba(137, 247, 254, 0.6)';
    static WATER_COLOR_BOTTOM = 'rgba(102, 166, 255, 0.8)';
    
    constructor() {
        // Hardware Detect
        this.prefersReducedMotion = false; // Force enable effects for testing
        // window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.isLowPerfDevice = this.prefersReducedMotion ||
                               !('requestAnimationFrame' in window) ||
                               (window.navigator.hardwareConcurrency && window.navigator.hardwareConcurrency < 4) ||
                               navigator.userAgent.match(/mobile|android/i);
  
      if (this.isLowPerfDevice) {
          console.log("Canvas Effects: Low performance device or reduced motion detected. Reducing effects.");
      }

  
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'medium';
  
  
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.zIndex = '-10';
      this.canvas.style.pointerEvents = 'none';
  
      document.body.prepend(this.canvas);
  
      // Properties
      this.fishManager = new FishManager(this.canvas, this.ctx, {
        maxFish: WaterCanvas.FISH_MAX_COUNT,
        minFish: WaterCanvas.FISH_MIN_COUNT,
        isLowPerfDevice: this.isLowPerfDevice,
        prefersReducedMotion: this.prefersReducedMotion,
        lerpFactor: WaterCanvas.LERP_FACTOR
      });
      this.bubbles = []; // Active bubbles list (though pool is primary)
      this.mouseTrail = []; // Active trail points list
      this.plants = [];
      this.corals = [];
      this.backgroundFeatures = [];
      this.raindrops = []; // Active raindrops list
      this.waterHeight = 50;
      this.wavePoints = [];
      this.lastTimestamp = 0;
      this.animationFrameId = null;
      this.TARGET_FRAME_TIME = 1000 / WaterCanvas.TARGET_FPS;
      this.timeAccumulator = 0;
      this.isRaining = false;
      this.rainIntensity = 0.5;
      this.lerpFactor = WaterCanvas.LERP_FACTOR;
  
      // Bubble Pool
      this.bubblePool = [];
      this.maxBubbles = this.isLowPerfDevice ? 30 : 100;
      this.activeBubbles = 0;
      
      // Initialize bubble pool
      for (let i = 0; i < this.maxBubbles; i++) {
        this.bubblePool.push({
          x: 0, y: 0, size: 0, speedY: 0, 
          driftX: 0, opacity: 0, maxOpacity: 0,
          active: false
        });
      }
  
      // Mouse Trail Pool
      this.mouseTrailPool = [];
      this.maxTrailPoints = this.isLowPerfDevice ? 20 : 50;
      this.activeTrailPoints = 0;
      
      // Initialize trail point pool
      for (let i = 0; i < this.maxTrailPoints; i++) {
        this.mouseTrailPool.push({
          x: 0, y: 0, size: 0, opacity: 0, 
          age: 0, maxAge: 0, speedX: 0, 
          speedY: 0, gravity: 0,
          isSplash: false, active: false
        });
      }
      
      // Raindrop Pool
      this.raindropPool = [];
      this.maxRaindrops = this.isLowPerfDevice ? 30 : 100;
      this.activeRaindrops = 0;
      
      // Initialize raindrop pool
      for (let i = 0; i < this.maxRaindrops; i++) {
        this.raindropPool.push({
          x: 0, y: 0, length: 0, speedY: 0, 
          opacity: 0, active: false
        });
      }
  
      // Bind methods
      this.resize = this.resize.bind(this);
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleClick = this.handleClick.bind(this);
  
      this.resize();
      window.addEventListener('resize', this.resize);
  
      // Mouse tracking
      this.mousePos = { x: 0, y: 0 };
      if (!this.prefersReducedMotion) {
          window.addEventListener('mousemove', this.handleMouseMove);
          window.addEventListener('click', this.handleClick);
      }
  
      this.fishManager.loadFishImages();
      this.simulateWeather();
    }
  
    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.initWavePoints();
      
      // Create background canvas for static elements
      this.backgroundCanvas = document.createElement('canvas');
      this.backgroundCanvas.width = this.canvas.width;
      this.backgroundCanvas.height = this.canvas.height;
      this.backgroundCtx = this.backgroundCanvas.getContext('2d');
      
      // Recreate features on resize - Clear existing arrays first
      this.plants = [];
      this.corals = [];
      this.backgroundFeatures = [];
      this.createInitialBackgroundFeatures();
      this.createInitialCorals();
      this.createInitialPlants();
      this.fishManager.updateCanvasSize(this.canvas.width, this.canvas.height); // Inform FishManager
      
      // Pre-render static background elements
      this.renderBackgroundToOffscreenCanvas();
    }
  
    renderBackgroundToOffscreenCanvas() {
      if (!this.backgroundCtx) return;
      
      this.backgroundCtx.clearRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);
      
      // Render background features to offscreen canvas
      this.backgroundFeatures.forEach(feature => {
        this.renderBackgroundFeature(this.backgroundCtx, feature);
      });
    }
  
    renderBackgroundFeature(ctx, feature) {
      // Note: Parallax is now applied when drawing the offscreen canvas in the main render loop
      // This function just draws the feature at its base position on the offscreen canvas
      ctx.save();
      ctx.translate(feature.x, feature.y); // Draw at base position
    
      ctx.fillStyle = feature.color;
      ctx.beginPath();
      if (feature.points.length > 1) {
        // ...existing drawing code for features...
        ctx.moveTo(feature.points[0].x, feature.points[0].y);
        let lastPoint = feature.points[0];
        for (let i = 1; i < feature.points.length; i++) {
          const segment = feature.points[i];
          ctx.bezierCurveTo(segment.cp1.x, segment.cp1.y, segment.cp2.x, segment.cp2.y, segment.end.x, segment.end.y);
          lastPoint = segment.end;
        }
        // Close the shape safely
        if (feature.points.length > 1) {
          const firstSegment = feature.points[1];
          if (firstSegment) {
            ctx.bezierCurveTo(firstSegment.cp2.x, firstSegment.cp2.y, firstSegment.cp1.x, firstSegment.cp1.y, feature.points[0].x, feature.points[0].y);
          } else {
            ctx.lineTo(feature.points[0].x, feature.points[0].y);
          }
        }
        
        ctx.closePath();
        ctx.fill();
    
        if (feature.type === 'cave' && feature.cave) {
          // Darker, slightly offset cave entrance
          ctx.fillStyle = 'rgba(10, 10, 15, 0.6)';
          ctx.beginPath();
          ctx.ellipse(0, feature.cave.yOffset, feature.cave.width / 2, feature.cave.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  
    handleMouseMove(e) {
      if (this.prefersReducedMotion) return;
      this.mousePos = { x: e.clientX, y: e.clientY };
      this.addTrailPoint();
    }
  
    handleClick(e) {
       if (this.prefersReducedMotion) return;
       // Prevent splash if clicking on interactive elements
       if (e.target.closest('a, button, .button, input, select, textarea, [role="button"]')) return;
       this.createSplash(e.clientX, e.clientY);
  
       // Fish Click Reaction
       this.fishManager.handleClick(e.clientX, e.clientY);
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
  
    createInitialPlants() {
        if (this.prefersReducedMotion) return;
        const plantDensity = this.isLowPerfDevice ? 0.02 : 0.04;
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
        const type = Math.random() < 0.5 ? 'seaweed' : (Math.random() < 0.7 ? 'grass' : 'bushy');
        let color;
        if (type === 'seaweed') {
            color = `rgba(${40 + Math.random() * 40}, ${100 + Math.random() * 60}, ${40 + Math.random() * 40}, ${0.6 + Math.random() * 0.2})`;
        } else if (type === 'grass') {
            color = `rgba(${80 + Math.random() * 50}, ${140 + Math.random() * 60}, ${70 + Math.random() * 50}, ${0.7 + Math.random() * 0.2})`;
        } else {
            color = `rgba(${100 + Math.random() * 50}, ${80 + Math.random() * 50}, ${50 + Math.random() * 30}, ${0.5 + Math.random() * 0.2})`;
        }
  
        this.plants.push({
            x: x,
            baseY: baseY,
            maxHeight: maxHeight,
            currentHeight: maxHeight * (0.8 + Math.random() * 0.2),
            color: color,
            type: type,
            swayPhase: Math.random() * Math.PI * 2,
            swayPhase2: Math.random() * Math.PI * 2, // Secondary phase for variation
            swaySpeed: 0.0003 + Math.random() * 0.0004,
            swaySpeed2: 0.0002 + Math.random() * 0.0003, // Secondary speed
            swayAmount: 0.05 + Math.random() * 0.15,
            swayAmount2: 0.03 + Math.random() * 0.1, // Secondary amount
            segments: type === 'seaweed' ? 4 + Math.floor(Math.random() * 4) : (type === 'grass' ? 1 : 5 + Math.floor(Math.random() * 4)),
            isBeingNibbledTimer: 0,
            currentSway: 0 // Store calculated sway
        });
    }
  
    updatePlants(delta) {
        if (this.prefersReducedMotion) { this.plants = []; return; }
        const time = performance.now();
        this.plants.forEach(plant => {
            plant.swayPhase += plant.swaySpeed * delta;
            plant.swayPhase2 += plant.swaySpeed2 * delta;
            plant.currentSway = (Math.sin(plant.swayPhase) * plant.swayAmount) + (Math.sin(plant.swayPhase2) * plant.swayAmount2);
  
            if (plant.isBeingNibbledTimer > 0) {
                plant.isBeingNibbledTimer -= delta;
                plant.currentSway += Math.sin(time * 0.05) * 0.05;
            }
        });
    }
  
    createInitialCorals() {
        if (this.prefersReducedMotion) return;
        const coralDensity = this.isLowPerfDevice ? 0.008 : 0.015;
        const coralCount = Math.floor(this.canvas.width * coralDensity);
        for (let i = 0; i < coralCount; i++) {
            this.addCoral();
        }
    }
  
    addCoral() {
        if (this.prefersReducedMotion) return;
        const x = Math.random() * this.canvas.width;
        const y = this.canvas.height - Math.random() * 30;
        const type = Math.random() < 0.6 ? 'branching' : (Math.random() < 0.8 ? 'brain' : 'fan');
        const size = 15 + Math.random() * (this.isLowPerfDevice ? 25 : 40);
        let color;
        const randColor = Math.random();
        if (randColor < 0.3) color = `rgba(${255}, ${100 + Math.random() * 50}, ${100 + Math.random() * 50}, ${0.7 + Math.random() * 0.2})`;
        else if (randColor < 0.6) color = `rgba(${255}, ${150 + Math.random() * 50}, ${50 + Math.random() * 50}, ${0.7 + Math.random() * 0.2})`;
        else color = `rgba(${150 + Math.random() * 50}, ${100 + Math.random() * 50}, ${200 + Math.random() * 55}, ${0.7 + Math.random() * 0.2})`;
  
        const coralData = {
            x: x, y: y, size: size, type: type, color: color,
            structure: [],
            swayPhase: Math.random() * Math.PI * 2,
            swaySpeed: 0.0001 + Math.random() * 0.0002,
            swayAmount: 0.01 + Math.random() * 0.02,
            isBeingNibbledTimer: 0,
            currentSway: 0 // Store calculated sway
        };
  
        this.generateCoralStructure(coralData);
        this.corals.push(coralData);
    }
  
    generateCoralStructure(coral) {
        coral.structure = [];
        const iterations = coral.type === 'branching' ? 4 + Math.floor(Math.random() * 3) : (coral.type === 'brain' ? 1 : 5 + Math.floor(Math.random()*4));
        const baseAngle = -Math.PI / 2;
  
        if (coral.type === 'branching') {
            const generateBranch = (x, y, angle, length, depth, width) => {
                if (depth <= 0 || length < 2) return;
                const endX = x + Math.cos(angle) * length;
                const endY = y + Math.sin(angle) * length;
                coral.structure.push({ x1: x, y1: y, x2: endX, y2: endY, width: width });
                const branches = Math.random() < 0.7 ? 2 : 1;
                for (let i = 0; i < branches; i++) {
                    const angleOffset = (Math.random() - 0.5) * (Math.PI / 2.5);
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
                const radius = coral.size * (0.8 + Math.random() * 0.4);
                points.push({
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius * 0.7
                });
            }
            coral.structure.push({ type: 'brain', points: points });
        } else { // Fan
             const generateFanBranch = (x, y, angle, length, depth, width) => {
                if (depth <= 0 || length < 1) return;
                const endX = x + Math.cos(angle) * length;
                const endY = y + Math.sin(angle) * length;
                coral.structure.push({ x1: x, y1: y, x2: endX, y2: endY, width: width });
                const branches = Math.random() < 0.8 ? 2 : 3;
                for (let i = 0; i < branches; i++) {
                    const angleOffset = (Math.random() - 0.5) * (Math.PI / 3);
                    const lengthMultiplier = 0.5 + Math.random() * 0.25;
                    generateFanBranch(endX, endY, angle + angleOffset, length * lengthMultiplier, depth - 1, Math.max(1, width * 0.9));
                }
            };
            generateFanBranch(0, 0, baseAngle, coral.size * 0.5, iterations, Math.max(1, coral.size * 0.05));
        }
    }
  
    updateCorals(delta) {
        if (this.prefersReducedMotion) return;
        this.corals.forEach(coral => {
            coral.swayPhase += coral.swaySpeed * delta;
            coral.currentSway = Math.sin(coral.swayPhase) * coral.swayAmount;
            if (coral.isBeingNibbledTimer > 0) {
                coral.isBeingNibbledTimer -= delta;
                coral.currentSway += Math.sin(performance.now() * 0.06) * 0.03;
            }
        });
    }
  
    createInitialBackgroundFeatures() {
        const featureDensity = this.isLowPerfDevice ? 0.004 : 0.008;
        const featureCount = Math.floor(this.canvas.width * featureDensity);
        for (let i = 0; i < featureCount; i++) {
            this.addBackgroundFeature();
        }
        // Sort by size for pseudo-depth (larger rocks appear further back)
        this.backgroundFeatures.sort((a, b) => b.size - a.size);
    }
  
    addBackgroundFeature() {
        const x = Math.random() * this.canvas.width;
        const y = this.canvas.height - Math.random() * this.canvas.height * 0.15;
        const type = Math.random() < 0.7 ? 'rocks' : 'cave';
        const size = 50 + Math.random() * (this.isLowPerfDevice ? 100 : 200);
        const colorValue = 30 + Math.random() * 40;
        const color = `rgba(${colorValue}, ${colorValue + Math.random() * 10}, ${colorValue + Math.random() * 20}, ${0.3 + Math.random() * 0.3})`;
  
        const featureData = {
            x: x, y: y, size: size, type: type, color: color,
            points: [],
            parallaxFactor: 0.1 + Math.random() * 0.2
        };
  
        const pointCount = 6 + Math.floor(Math.random() * 6);
        let lastPoint = { x: size * (0.6 + Math.random() * 0.4), y: 0 };
        featureData.points.push(lastPoint);
  
        for (let i = 1; i <= pointCount; i++) {
            const angle = (Math.PI * 2 / pointCount) * i;
            const radius = size * (0.5 + Math.random() * 0.5); // Irregular radius
            const nextPoint = {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius * (0.4 + Math.random() * 0.4)
            };
            const cp1 = {
                x: lastPoint.x + (nextPoint.x - lastPoint.x) * 0.3 + (Math.random() - 0.5) * size * 0.2,
                y: lastPoint.y + (nextPoint.y - lastPoint.y) * 0.3 + (Math.random() - 0.5) * size * 0.2
            };
            const cp2 = {
                x: lastPoint.x + (nextPoint.x - lastPoint.x) * 0.7 + (Math.random() - 0.5) * size * 0.2,
                y: lastPoint.y + (nextPoint.y - lastPoint.y) * 0.7 + (Math.random() - 0.5) * size * 0.2
            };
            featureData.points.push({ cp1: cp1, cp2: cp2, end: nextPoint });
            lastPoint = nextPoint;
        }
  
  
        if (type === 'cave') {
            const caveDepth = size * (0.2 + Math.random() * 0.3);
            const caveWidth = size * (0.3 + Math.random() * 0.4);
            const caveYOffset = size * (0.1 + Math.random() * 0.2);
            featureData.cave = { width: caveWidth, height: caveDepth, yOffset: caveYOffset };
        }
  
        this.backgroundFeatures.push(featureData);
    }
  
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
      if (this.activeRaindrops >= this.maxRaindrops) return; // Check pool limit
      
      // Find an inactive raindrop in the pool
      const drop = this.raindropPool.find(d => !d.active);
      if (!drop) return; // Should not happen if limit check above works, but safety first
      
      drop.x = Math.random() * this.canvas.width;
      drop.y = -10;
      drop.length = 4 + Math.random() * 8;
      drop.speedY = 7 + Math.random() * 6;
      drop.opacity = 0.25 + Math.random() * 0.3;
      drop.active = true;
      
      this.raindrops.push(drop); // Add the pooled object reference to the active list
      this.activeRaindrops++;
    }
  
    updateRaindrops(delta) {
        if (this.prefersReducedMotion || !this.isRaining) {
            // Clear active list and deactivate all pooled drops if rain stops or reduced motion
            this.raindrops = []; // Clear active list
            this.raindropPool.forEach(d => d.active = false); // Deactivate all pooled drops
            this.activeRaindrops = 0; // Reset count
            return;
        }
  
        for (let i = this.activeRaindrops - 1; i >= 0; i--) { // Iterate only active drops
            const drop = this.raindrops[i];
            drop.y += drop.speedY * (delta / 16.67);
  
            let waveSurfaceY = (100 - this.waterHeight) * this.canvas.height / 100;
            if (this.wavePoints.length > 1) {
                let index = 0;
                while (index < this.wavePoints.length - 2 && this.wavePoints[index + 1].x < drop.x) {
                    index++;
                }
                const p1 = this.wavePoints[index];
                const p2 = this.wavePoints[index + 1];
                const t = (drop.x - p1.x) / (p2.x - p1.x || 1); // Avoid division by zero
                waveSurfaceY = p1.y + t * (p2.y - p1.y); // Linear interpolation
            }
  
  
            if (drop.y + drop.length / 2 > waveSurfaceY) {
                this.createSplash(drop.x, waveSurfaceY, 0.25, 0.3);
                drop.active = false; // Mark as inactive in pool
                this.raindrops.splice(i, 1); // Remove from active list
                this.activeRaindrops--; // Decrement active count
            } else if (drop.y > this.canvas.height) {
                drop.active = false; // Mark as inactive in pool
                this.raindrops.splice(i, 1); // Remove from active list
                this.activeRaindrops--; // Decrement active count
            }
        }
        // Add new drops based on intensity and delta time
        const dropsToAdd = Math.ceil(this.rainIntensity * (this.isLowPerfDevice ? 0.5 : 2) * (delta / 16.67));
        for(let k=0; k < dropsToAdd; k++) {
            this.addRaindrop();
        }
    }
  
    updateWaterHeight(targetHeight) {
      this.waterHeight += (targetHeight - this.waterHeight) * this.lerpFactor * 0.5;
      this.fishManager.updateWaterHeight(this.waterHeight);
    }
  
    update(delta) {
      const currentTimestamp = performance.now();
      this.updateWaves(delta);
      this.updatePlants(delta);
      this.updateCorals(delta);
      this.updateRaindrops(delta);
      if (!this.prefersReducedMotion) {
          this.fishManager.updateFishInteractions(currentTimestamp);
          this.fishManager.updateFishPlantInteractions(this.plants, this.corals);
      }
      this.fishManager.updateFish(delta);
      if (!this.prefersReducedMotion) { this.updateBubbles(delta); }
      if (!this.prefersReducedMotion) { this.updateMouseTrail(delta); }
  
      // Add random bubbles using the pool method
      if (!this.prefersReducedMotion && Math.random() < 0.0008 * delta) { this.addBubble(); }
      this.fishManager.manageFishPopulation(delta);
    }
  
    updateWaves(delta) {
      const waveTime = performance.now() * 0.001;
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
      const amplitudeMultiplier = this.isLowPerfDevice ? 0.6 : 1;
      const timeFactor = delta / 16.67; // Normalize to ~60fps
      
      // Use a consistent approach for all points
      for (let i = 0; i < this.wavePoints.length; i++) {
        const point = this.wavePoints[i];
        const xFactor = i / (this.wavePoints.length - 1);
        
        const prevY = point.y;
        
        if (this.prefersReducedMotion) {
          point.y = waterLine + (Math.sin(waveTime * 0.3 + xFactor * 4) * 3 * amplitudeMultiplier);
        } else {
          // Combine multiple sine waves with different frequencies
          const wave1 = Math.sin(waveTime * 0.8 + xFactor * 10 + 0.5) * 4 * amplitudeMultiplier;
          const wave2 = Math.sin(waveTime * 0.5 + xFactor * 6 - 0.2) * 6 * amplitudeMultiplier;
          const wave3 = Math.sin(waveTime * 0.3 + xFactor * 4 + 1.0) * 3 * amplitudeMultiplier;
          const targetY = waterLine + wave1 + wave2 + wave3;
          
          point.y = this.lerp(prevY, targetY, Math.min(1, 0.3 * timeFactor));
        }
      }
    }
  
    updateBubbles(delta) {
      if (this.prefersReducedMotion) { 
        this.activeBubbles = 0; 
        this.bubblePool.forEach(bubble => bubble.active = false);
        return; 
      }
      
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
      
      for (let i = 0; i < this.bubblePool.length; i++) {
        const bubble = this.bubblePool[i];
        if (!bubble.active) continue;
        
        if (bubble.opacity < bubble.maxOpacity) {
          bubble.opacity += 0.008 * delta;
          bubble.opacity = Math.min(bubble.opacity, bubble.maxOpacity);
        }
        
        bubble.y -= bubble.speedY * (delta / 16.67);
        bubble.x += bubble.driftX * (delta / 16.67);
    
        // Deactivate near surface or off-screen
        if (bubble.y < waterLine + 5) {
          bubble.opacity -= 0.05 * delta;
          if (bubble.opacity <= 0) {
            bubble.active = false;
            this.activeBubbles--;
          }
        } else if (bubble.y < waterLine - bubble.size || 
                   bubble.x < -bubble.size || 
                   bubble.x > this.canvas.width + bubble.size) {
          bubble.active = false;
          this.activeBubbles--;
        }
      }
    }
  
    updateMouseTrail(delta) {
      if (this.prefersReducedMotion) { 
          this.mouseTrail = []; // Clear active list
          this.mouseTrailPool.forEach(p => p.active = false); // Deactivate all pooled points
          this.activeTrailPoints = 0; // Reset count
          return; 
      }
      for (let i = this.activeTrailPoints - 1; i >= 0; i--) { // Iterate only active points
        const point = this.mouseTrail[i];
        point.age += delta;
  
        if (point.isSplash) {
          point.speedY += point.gravity * (delta / 16.67);
          point.x += point.speedX * (delta / 16.67);
          point.y += point.speedY * (delta / 16.67);
          point.opacity = Math.max(0, 0.7 * (1 - point.age / point.maxAge));
        } else {
          point.opacity = Math.max(0, 0.4 * (1 - point.age / point.maxAge));
        }
  
        if (point.age >= point.maxAge || point.opacity <= 0) {
          // Mark the point as inactive in the pool before removing from active list
          point.active = false;
          this.mouseTrail.splice(i, 1); // Remove from active list
          this.activeTrailPoints--; // Decrement active count
        }
      }
    }
  
    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
      const time = performance.now();
  
      // --- Render Background from Offscreen Canvas ---
      if (this.backgroundCanvas) {
          // Apply parallax effect dynamically when drawing the offscreen canvas
          // Use an average parallax factor or calculate based on visible features if needed
          const parallaxOffset = (50 - this.waterHeight) * 0.15; // Example average parallax
          this.ctx.drawImage(this.backgroundCanvas, 0, parallaxOffset);
      }
  
      // --- Render Water Surface and Body ---
      if (!this.prefersReducedMotion && this.wavePoints.length > 1) {
          this.ctx.beginPath();
          this.ctx.moveTo(0, this.canvas.height);
          this.ctx.lineTo(0, this.wavePoints[0].y);
          // Use quadratic curves for smoother waves between points
          for (let i = 0; i < this.wavePoints.length - 1; i++) {
              const p1 = this.wavePoints[i];
              const p2 = this.wavePoints[i + 1];
              const xc = (p1.x + p2.x) / 2;
              const yc = (p1.y + p2.y) / 2;
              this.ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);
          }
          // Curve to the last point
          this.ctx.quadraticCurveTo(
              this.wavePoints[this.wavePoints.length - 1].x, this.wavePoints[this.wavePoints.length - 1].y,
              this.wavePoints[this.wavePoints.length - 1].x, this.wavePoints[this.wavePoints.length - 1].y
          );
  
          this.ctx.lineTo(this.canvas.width, this.wavePoints[this.wavePoints.length - 1].y);
          this.ctx.lineTo(this.canvas.width, this.canvas.height);
          this.ctx.closePath();
  
          const gradient = this.ctx.createLinearGradient(0, waterLine, 0, this.canvas.height);
          gradient.addColorStop(0, WaterCanvas.WATER_COLOR_TOP); // Use constant
          gradient.addColorStop(0.5, 'rgba(115, 200, 255, 0.7)'); // Midpoint color
          gradient.addColorStop(1, WaterCanvas.WATER_COLOR_BOTTOM); // Use constant
          this.ctx.fillStyle = gradient;
          this.ctx.fill();
      } else { // Static water
          const gradient = this.ctx.createLinearGradient(0, waterLine, 0, this.canvas.height);
          gradient.addColorStop(0, WaterCanvas.WATER_COLOR_TOP); // Use constant
          gradient.addColorStop(1, WaterCanvas.WATER_COLOR_BOTTOM); // Use constant
          this.ctx.fillStyle = gradient;
          this.ctx.fillRect(0, waterLine, this.canvas.width, this.canvas.height - waterLine);
      }
  
      // --- Render Corals ---
      if (!this.prefersReducedMotion) {
          this.corals.forEach(coral => {
              this.ctx.save();
              this.ctx.translate(coral.x, coral.y);
              this.ctx.rotate(coral.currentSway);
  
              if (coral.type === 'branching' || coral.type === 'fan') {
                  this.ctx.strokeStyle = coral.color;
                  this.ctx.lineCap = 'round';
                  coral.structure.forEach(branch => {
                      this.ctx.lineWidth = Math.max(1, branch.width); // Ensure minimum width
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
                      const xc = (points[0].x + points[points.length - 1].x) / 2;
                      const yc = (points[0].y + points[points.length - 1].y) / 2;
                      this.ctx.quadraticCurveTo(points[points.length - 1].x, points[points.length - 1].y, xc, yc);
                      this.ctx.closePath();
                      this.ctx.fill();
  
                      // Brain texture lines
                      this.ctx.strokeStyle = 'rgba(0,0,0,0.08)'; // More subtle texture
                      this.ctx.lineWidth = 0.5;
                      for(let i = 0; i < points.length; i++) {
                          this.ctx.beginPath();
                          this.ctx.moveTo(points[i].x * 0.9, points[i].y * 0.9); // Start closer to edge
                          // Curve towards center with slight randomness
                          this.ctx.quadraticCurveTo(points[i].x * 0.4 + (Math.random()-0.5)*5, points[i].y * 0.4 + (Math.random()-0.5)*5, 0, 0);
                          this.ctx.stroke();
                      }
                  }
              }
              this.ctx.restore();
          });
      }
      
      // --- Render Plants ---
      if (!this.prefersReducedMotion) {
          this.plants.forEach(plant => {
              this.ctx.save();
              this.ctx.translate(plant.x, plant.baseY);
              this.ctx.rotate(plant.currentSway);
  
              if (plant.type === 'seaweed') {
                  this.ctx.strokeStyle = plant.color;
                  this.ctx.lineWidth = Math.max(1, 2 + plant.maxHeight * 0.04); // Slightly thinner max
                  this.ctx.lineCap = 'round';
                  this.ctx.beginPath();
                  this.ctx.moveTo(0, 0);
                  let currentY = 0;
                  let currentX = 0;
                  const segmentHeight = plant.currentHeight / plant.segments;
                  const waveFactor = plant.maxHeight * 0.08; // Slightly less internal wave
                  for (let i = 1; i <= plant.segments; i++) {
                      const progress = i / plant.segments;
                      const nextY = -i * segmentHeight;
                      const swayOffset = Math.sin(plant.swayPhase * 0.6 + progress * Math.PI * 1.2) * waveFactor * progress; // Adjusted wave
                      const nextX = swayOffset;
                      const cp1x = currentX + (nextX - currentX) * 0.4;
                      const cp1y = currentY + (nextY - currentY) * 0.3 - segmentHeight * 0.15;
                      const cp2x = currentX + (nextX - currentX) * 0.6;
                      const cp2y = currentY + (nextY - currentY) * 0.7 - segmentHeight * 0.1;
                      this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nextX, nextY);
                      currentX = nextX;
                      currentY = nextY;
                  }
                  this.ctx.stroke();
              } else if (plant.type === 'grass') {
                  this.ctx.strokeStyle = plant.color;
                  this.ctx.lineWidth = Math.max(1, 1.5 + plant.maxHeight * 0.02);
                  this.ctx.lineCap = 'round';
                  const blades = 3 + Math.floor(plant.maxHeight / 25); // Fewer blades for short grass
                  for (let j = 0; j < blades; j++) {
                      this.ctx.beginPath();
                      const bladeOffset = (Math.random() - 0.5) * plant.maxHeight * 0.08; // Less base spread
                      const bladeHeight = plant.currentHeight * (0.6 + Math.random() * 0.4); // More height variation
                      const controlPointX = bladeOffset + (Math.random() - 0.5) * 8;
                      const controlPointY = -bladeHeight * (0.4 + Math.random() * 0.2); // Control point higher up
                      this.ctx.moveTo(bladeOffset * 0.5, 0);
                      this.ctx.quadraticCurveTo(controlPointX, controlPointY, bladeOffset, -bladeHeight);
                      this.ctx.stroke();
                  }
              } else { // Bushy
                  this.ctx.fillStyle = plant.color;
                  const leafSizeBase = plant.maxHeight * 0.08; // Smaller leaves
                  for (let i = 0; i < plant.segments; i++) {
                      const heightRatio = (0.1 + Math.random() * 0.9); // More varied height placement
                      const stemY = -plant.currentHeight * heightRatio;
                      const stemX = Math.sin(heightRatio * Math.PI * 1.5) * plant.maxHeight * 0.04; // Different stem curve
  
                      const angle = (Math.random() - 0.5) * Math.PI * 0.9; // Wider angle range
                      const leafX = stemX + Math.cos(angle) * leafSizeBase * 1.2;
                      const leafY = stemY + Math.sin(angle) * leafSizeBase * 1.2;
                      const leafWidth = leafSizeBase * (0.5 + Math.random() * 0.4);
                      const leafHeight = leafSizeBase * (0.7 + Math.random() * 0.5);
  
                      this.ctx.save();
                      this.ctx.translate(leafX, leafY);
                      this.ctx.rotate(angle + Math.PI / 2 + (Math.random() - 0.5) * 0.2); // More random leaf angle
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
      this.fishManager.renderFish();
  
      // --- Render Bubbles ---
      if (!this.prefersReducedMotion) {
          this.ctx.fillStyle = `rgba(255, 255, 255, 0.6)`; // Slightly less opaque bubbles
          for (const bubble of this.bubblePool) { // Iterate pool, but only draw active
            if (!bubble.active) continue;
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, bubble.size / 2, 0, Math.PI * 2);
            this.ctx.globalAlpha = bubble.opacity;
            this.ctx.fill();
          }
          this.ctx.globalAlpha = 1;
      }
  
      // --- Render Mouse Trail / Splashes ---
      if (!this.prefersReducedMotion) {
          this.ctx.fillStyle = `rgba(137, 247, 254, 0.8)`; // Trail color slightly less opaque
          for (let i = 0; i < this.activeTrailPoints; i++) { // Iterate only active points
            const point = this.mouseTrail[i];
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.size / 2, 0, Math.PI * 2);
            this.ctx.globalAlpha = point.opacity;
            this.ctx.fill();
          }
           this.ctx.globalAlpha = 1;
      }
  
      // --- Render Rain ---
      if (!this.prefersReducedMotion && this.isRaining) {
          this.ctx.strokeStyle = 'rgba(180, 210, 230, 0.5)'; // More transparent rain
          this.ctx.lineWidth = 1; // Thinner rain
          this.ctx.lineCap = 'round';
          for (let i = 0; i < this.activeRaindrops; i++) { // Iterate only active drops
              const drop = this.raindrops[i];
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
      if (!this.animationFrameId) return; // Ensure we don't continue after stopping
      
      this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));
    
      // Initialize timestamp on first call
      if (!this.lastTimestamp) {
        this.lastTimestamp = timestamp;
        return; // Skip first frame to establish baseline
      }
      
      // Calculate elapsed time with safety cap to prevent huge jumps after tab inactive
      const elapsed = Math.min(100, timestamp - this.lastTimestamp);
      this.lastTimestamp = timestamp;
    
      // Frame Rate Capping Logic - more stable implementation
      this.timeAccumulator += elapsed;
      
      // Process a fixed number of updates per frame for stability
      const maxUpdatesPerFrame = 3;
      let updatesProcessed = 0;
      
      while (this.timeAccumulator >= this.TARGET_FRAME_TIME && updatesProcessed < maxUpdatesPerFrame) {
        this.update(this.TARGET_FRAME_TIME);
        this.timeAccumulator -= this.TARGET_FRAME_TIME;
        updatesProcessed++;
      }
      
      // If we're falling behind, catch up (but don't lose all accumulated time)
      if (this.timeAccumulator > this.TARGET_FRAME_TIME * 3) {
        this.timeAccumulator = this.TARGET_FRAME_TIME * 2;
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
  
    // Helper method for linear interpolation
    lerp(start, end, factor) {
      return start + (end - start) * factor;
    }

    addTrailPoint() {
      if (this.prefersReducedMotion) return;
      if (this.activeTrailPoints >= this.maxTrailPoints) return; // Check pool limit
      
      // Find an inactive trail point from the pool
      const point = this.mouseTrailPool.find(p => !p.active);
      if (!point) return; // No available trail points
      
      // Configure the trail point
      point.x = this.mousePos.x;
      point.y = this.mousePos.y;
      point.size = 4 + Math.random() * 6;
      point.opacity = 0.3 + Math.random() * 0.3;
      point.age = 0;
      point.maxAge = 800 + Math.random() * 400;
      point.isSplash = false;
      point.active = true;
      
      this.mouseTrail[this.activeTrailPoints] = point; // Add to the active list using index
      this.activeTrailPoints++;
    }
  
    addBubble() {
      if (this.prefersReducedMotion) return;
      if (this.activeBubbles >= this.maxBubbles) return; // Check pool limit
      
      // Find an inactive bubble from the pool
      const bubble = this.bubblePool.find(b => !b.active);
      if (!bubble) return; // No available bubbles
      
      // Get water line position
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
      
      // Configure the bubble
      bubble.x = Math.random() * this.canvas.width;
      bubble.y = this.canvas.height - Math.random() * (this.canvas.height - waterLine) * 0.9;
      bubble.size = 2 + Math.random() * 6;
      bubble.speedY = 0.3 + Math.random() * 0.4;
      bubble.driftX = (Math.random() - 0.5) * 0.3;
      bubble.maxOpacity = 0.2 + Math.random() * WaterCanvas.BUBBLE_MAX_OPACITY;
      bubble.opacity = 0;
      bubble.active = true;
      
      this.activeBubbles++;
    }
  
    createSplash(x, y, sizeMultiplier = 1, opacityMultiplier = 1) {
      if (this.prefersReducedMotion) return;
      
      // Calculate how many particles we can actually add
      const availableSlots = this.maxTrailPoints - this.activeTrailPoints;
      if (availableSlots <= 0) return; // No room for any particles

      // Create 3-8 particles for the splash, respecting available slots
      const particleCount = Math.min(
        3 + Math.floor(Math.random() * 5), 
        availableSlots
      );
      
      for (let i = 0; i < particleCount; i++) {
        // Find an inactive trail point from the pool
        const point = this.mouseTrailPool.find(p => !p.active);
        if (!point) break; // Should not happen if limit check works, but safety first
        
        // Configure the splash particle
        point.x = x + (Math.random() - 0.5) * 4;
        point.y = y + (Math.random() - 0.5) * 4;
        point.size = (4 + Math.random() * 4) * sizeMultiplier;
        point.opacity = (0.4 + Math.random() * 0.4) * opacityMultiplier;
        point.age = 0;
        point.maxAge = 600 + Math.random() * 300;
        point.speedX = (Math.random() - 0.5) * 2;
        point.speedY = -1 - Math.random() * 2;
        point.gravity = 0.05 + Math.random() * 0.05;
        point.isSplash = true;
        point.active = true;
        
        this.mouseTrail[this.activeTrailPoints] = point; // Add to the active list using index
        this.activeTrailPoints++;
      }
    }
  }
  

  class FishManager {
    constructor(canvas, ctx, options = {}) {
        // Canvas reference and context
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Configuration options
        this.options = {
            maxFish: options.maxFish || 15,
            minFish: options.minFish || 5,
            isLowPerfDevice: options.isLowPerfDevice || false,
            prefersReducedMotion: options.prefersReducedMotion || false,
            lerpFactor: options.lerpFactor || 0.08
        };
        
        // Fish collection and properties
        this.fishes = [];
        this.fishImages = {};
        this.lastInteractionCheck = 0;
        
        // State tracking
        this.currentWaterHeight = 50; // Default water height in vh
        this.waterTopBoundary = (100 - this.currentWaterHeight);
    }

    // Method to update canvas size if needed
    updateCanvasSize(width, height) {
        // Update internal references if necessary, e.g., boundaries
        // this.canvas.width = width; // Not needed if using the passed canvas reference directly
        // this.canvas.height = height;
        // Recalculate boundaries based on new height
        this.waterTopBoundary = (100 - this.currentWaterHeight) * this.canvas.height / 100;
        // Potentially adjust fish positions if resize makes them go out of bounds
        this.fishes.forEach(fish => {
            const fishHeight = fish.img.complete ? fish.size * (fish.img.naturalHeight / fish.img.naturalWidth) : fish.size;
            const topWaterBoundary = this.waterTopBoundary + fishHeight / 2 + 5;
            const bottomWaterBoundary = this.canvas.height - fishHeight / 2 - 5;
            fish.y = Math.max(topWaterBoundary, Math.min(bottomWaterBoundary, fish.y));
            fish.targetY = Math.max(topWaterBoundary, Math.min(bottomWaterBoundary, fish.targetY));
        });
    }

    // Load fish images from FISH_IMAGES global object
    loadFishImages() {
        if (typeof FISH_IMAGES !== 'undefined') {
            for (const [key, url] of Object.entries(FISH_IMAGES)) {
                const img = new Image();
                img.src = url;
                img.onload = () => {
                    this.fishImages[key] = img;
                    // Check if enough images loaded and no fish exist yet
                    if (Object.keys(this.fishImages).length >= 3 && this.fishes.length === 0) {
                        this.createInitialFish();
                    }
                };
                img.onerror = () => { console.error(`Failed to load fish image: ${key} at ${url}`); };
            }
        } else { 
            console.error("FISH_IMAGES object not found. Cannot load fish images."); 
        }
    }

    // Initialize fish collection
    createInitialFish() {
        const fishCount = this.options.isLowPerfDevice ? 
            this.options.minFish : 
            (window.navigator.hardwareConcurrency >= 8 ? this.options.maxFish : 10);
            
        for (let i = 0; i < fishCount; i++) {
            setTimeout(() => this.addFish(), i * (this.options.isLowPerfDevice ? 700 : 400));
        }
    }

    // Add a single fish to the collection
    addFish() {
        const keys = Object.keys(this.fishImages);
        if (keys.length === 0) return;
        
        const maxFish = this.options.isLowPerfDevice ? 
            this.options.minFish : 
            (window.navigator.hardwareConcurrency >= 8 ? this.options.maxFish : 10);
            
        if (this.fishes.length >= maxFish) return;

        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const img = this.fishImages[randomKey];
        if (!img || !img.complete || !img.naturalWidth) {
            // Image not ready, try again shortly
            setTimeout(() => this.addFish(), 100);
            return;
        }

        let size = 30 + Math.random() * 40;
        if (randomKey.includes("Mythic") || randomKey.includes("Legendary") || 
            randomKey.includes("Chimerical") || randomKey.includes("Kraken") || 
            randomKey.includes("Whale")) { 
            size = 65 + Math.random() * 30; 
        }
        else if (randomKey.includes("Rare") || randomKey.includes("Shark") || 
                 randomKey.includes("Sturgeon")) { 
            size = 50 + Math.random() * 25; 
        }
        if (this.options.isLowPerfDevice) size *= 0.8;

        const direction = Math.random() > 0.5 ? 'right' : 'left';
        const waterLine = (100 - this.currentWaterHeight) * this.canvas.height / 100;
        const fishHeight = size * (img.naturalHeight / img.naturalWidth);
        const minY = waterLine + fishHeight / 2 + 5;
        const maxY = this.canvas.height - fishHeight / 2 - 5;
        // Ensure minY is not greater than maxY (can happen with very low water height)
        const startY = Math.min(maxY, minY + Math.random() * Math.max(0, maxY - minY)); 
        const startX = direction === 'right' ? -size / 2 : this.canvas.width + size / 2;

        let baseSpeed = (40 - size * 0.3) * 0.05 * (0.8 + Math.random() * 0.4);
        let currentSpeed = baseSpeed * (0.5 + Math.random() * 0.5);
        let targetSpeed = currentSpeed;
        let verticalAmount = Math.random() * 6 + 2;
        let wiggleAmount = Math.random() * 0.25 + 0.15; // Slightly reduced max wiggle

        if (this.options.isLowPerfDevice) { 
            baseSpeed *= 0.6; 
            verticalAmount *= 0.5; 
            wiggleAmount *= 0.5; 
        }
        if (this.options.prefersReducedMotion) { 
            verticalAmount = 0; 
            wiggleAmount = 0; 
            baseSpeed *= 0.5; 
            currentSpeed = baseSpeed; 
            targetSpeed = baseSpeed; 
        }

        this.fishes.push({
            img: img, 
            x: startX, 
            y: startY, 
            size: size,
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
            currentAvoidance: { x: 0, y: 0 }, 
            lastInteractionCheck: 0,
            targetPlant: null,
            targetCoral: null,
            nibbleOffset: 0,
            opacity: 0.0, // Start transparent for fade-in
            fadingOut: false
        });
    }

    // Update water level information
    updateWaterHeight(waterHeight) {
        this.currentWaterHeight = waterHeight;
        this.waterTopBoundary = (100 - this.currentWaterHeight) * this.canvas.height / 100;
        
        // Adjust fish positions if they're above the water line or below floor
        this.fishes.forEach(fish => {
            const fishHeight = fish.img.complete ? fish.size * (fish.img.naturalHeight / fish.img.naturalWidth) : fish.size;
            const topWaterBoundary = this.waterTopBoundary + fishHeight / 2 + 5;
            const bottomWaterBoundary = this.canvas.height - fishHeight / 2 - 5;
            
            if (fish.y < topWaterBoundary) {
                const newY = topWaterBoundary + Math.random() * Math.max(0, bottomWaterBoundary - topWaterBoundary);
                fish.y = newY;
                fish.targetY = newY;
            } else if (fish.y > bottomWaterBoundary) {
                 const newY = bottomWaterBoundary - Math.random() * Math.max(0, bottomWaterBoundary - topWaterBoundary);
                 fish.y = newY;
                 fish.targetY = newY;
            }
            // Also clamp targetY
            fish.targetY = Math.max(topWaterBoundary, Math.min(bottomWaterBoundary, fish.targetY));
        });
    }

    // Process fish-to-fish and fish-to-environment interactions
    updateFishInteractions(currentTimestamp) {
        if (this.options.prefersReducedMotion) return;

        const interactionRadius = 60;
        const avoidanceStrength = 0.06; // Slightly stronger base avoidance
        const checkInterval = 100; // ms

        for (let i = 0; i < this.fishes.length; i++) {
            const fish1 = this.fishes[i];

            if (currentTimestamp - fish1.lastInteractionCheck < checkInterval) {
                // Smoothly apply the previously calculated avoidance vector
                fish1.currentAvoidance.x += (fish1.avoidanceVector.x - fish1.currentAvoidance.x) * this.options.lerpFactor;
                fish1.currentAvoidance.y += (fish1.avoidanceVector.y - fish1.currentAvoidance.y) * this.options.lerpFactor;
                continue;
            }
            fish1.lastInteractionCheck = currentTimestamp;
            fish1.avoidanceVector = { x: 0, y: 0 }; // Reset target avoidance for this check

            if (fish1.state === 'darting') {
                fish1.currentAvoidance = { x: 0, y: 0 }; // Reset smoothed avoidance when darting
                continue;
            }

            // Fish-to-Fish avoidance
            for (let j = i + 1; j < this.fishes.length; j++) {
                const fish2 = this.fishes[j];
                if (fish2.state === 'darting') continue;

                const dx = fish2.x - fish1.x;
                const dy = fish2.y - fish1.y;
                const distanceSq = dx * dx + dy * dy;
                const combinedRadius = (fish1.size / 2 + fish2.size / 2) * 1.6; // Slightly larger interaction radius

                if (distanceSq < combinedRadius * combinedRadius && distanceSq > 1) { // Avoid self-interaction / division by zero
                    const distance = Math.sqrt(distanceSq);
                    const overlap = combinedRadius - distance;
                    // Stronger avoidance when closer
                    const strength = avoidanceStrength * (overlap / combinedRadius);
                    const avoidanceX = -(dx / distance) * overlap * strength;
                    const avoidanceY = -(dy / distance) * overlap * strength;

                    fish1.avoidanceVector.x += avoidanceX;
                    fish1.avoidanceVector.y += avoidanceY;
                    fish2.avoidanceVector.x -= avoidanceX; // Apply opposite to fish2
                    fish2.avoidanceVector.y -= avoidanceY;
                }
            }
            
            // Apply smoothing to the calculated avoidance vector
            fish1.currentAvoidance.x += (fish1.avoidanceVector.x - fish1.currentAvoidance.x) * this.options.lerpFactor;
            fish1.currentAvoidance.y += (fish1.avoidanceVector.y - fish1.currentAvoidance.y) * this.options.lerpFactor;
        }
    }

    // Process fish-to-plant/coral interactions (nibbling)
    updateFishPlantInteractions(plants, corals) {
        if (this.options.prefersReducedMotion) return;
        
        this.fishes.forEach(fish => {
            if (fish.state !== 'swimming') return;
            
            const nibbleChance = 0.003;
            const checkRadius = fish.size * 1.5;
            const bottomThreshold = this.canvas.height - 150; // Only check near bottom
            
            if (fish.y > bottomThreshold && Math.random() < nibbleChance) {
                let closestTarget = null;
                let minDistSq = checkRadius * checkRadius;
                let targetType = null;

                // Check plants
                if (plants && plants.length > 0) {
                    for (const plant of plants) {
                        // Check if plant is somewhat close horizontally first
                        if (Math.abs(plant.x - fish.x) > checkRadius) continue;
                        
                        const plantTopY = plant.baseY - plant.currentHeight;
                        const dx = plant.x - fish.x;
                        // Check vertical distance relative to plant height
                        const dy = (plant.baseY - plant.currentHeight * 0.5) - fish.y; // Target mid-plant
                        const distSq = dx * dx + dy * dy;
                        if (distSq < minDistSq && fish.y > plantTopY) { // Ensure fish is below plant top
                            minDistSq = distSq;
                            closestTarget = plant;
                            targetType = 'plant';
                        }
                    }
                }
                
                // Check corals (only if no closer plant found or no plants exist)
                if (corals && corals.length > 0 && (!closestTarget || targetType !== 'plant')) {
                     for (const coral of corals) {
                        // Check if coral is somewhat close horizontally first
                        if (Math.abs(coral.x - fish.x) > checkRadius) continue;

                        const coralTopY = coral.y - coral.size * 0.5;
                        const dx = coral.x - fish.x;
                        const dy = coral.y - fish.y; // Target coral center
                        const distSq = dx * dx + dy * dy;
                        if (distSq < minDistSq && fish.y > coralTopY) { // Ensure fish is below coral top
                            minDistSq = distSq;
                            closestTarget = coral;
                            targetType = 'coral';
                        }
                    }
                }

                if (closestTarget && targetType) {
                    fish.state = 'nibbling';
                    fish.stateTimer = 1500 + Math.random() * 2000;
                    fish.targetSpeed = fish.baseSpeed * 0.05; // Slow down significantly
                    closestTarget.isBeingNibbledTimer = 300 + Math.random() * 200; // Make plant/coral react

                    if (targetType === 'plant') {
                        fish.targetPlant = closestTarget;
                        fish.targetCoral = null;
                        // Target a point slightly above the base, near the plant's x
                        fish.targetY = closestTarget.baseY - closestTarget.currentHeight * (0.1 + Math.random() * 0.3);
                        fish.targetX = closestTarget.x + (fish.x > closestTarget.x ? -fish.size * 0.3 : fish.size * 0.3); // Target side of plant
                    } else { // Coral
                        fish.targetPlant = null;
                        fish.targetCoral = closestTarget;
                        // Target a point near the top/middle of the coral
                        fish.targetY = closestTarget.y - closestTarget.size * (0.1 + Math.random() * 0.2);
                        fish.targetX = closestTarget.x + (fish.x > closestTarget.x ? -closestTarget.size * 0.2 : closestTarget.size * 0.2); // Target side of coral
                    }
                    // Adjust direction to face the target
                    fish.direction = (fish.targetX > fish.x) ? 'right' : 'left';
                    fish.scaleX = fish.direction === 'left' ? -1 : 1;
                }
            }
        });
    }

    // Update fish positions and states
    updateFish(delta) {
        const waterLine = this.waterTopBoundary * this.canvas.height / 100; // Use calculated boundary
        const deltaSeconds = delta / 1000;
        const fishLerpFactor = this.options.lerpFactor * 0.8; // Specific lerp for fish movement

        for (let i = this.fishes.length - 1; i >= 0; i--) {
            const fish = this.fishes[i];

            // Handle fading out fish
            if (fish.fadingOut) {
                fish.stateTimer -= delta;
                fish.opacity = Math.max(0, fish.stateTimer / 600); // Use fade timer
                if (fish.stateTimer <= 0) {
                    this.fishes.splice(i, 1);
                    continue;
                }
            } else {
                // Fade in new fish smoothly
                if (fish.opacity < 1.0) {
                    fish.opacity += 0.005 * delta;
                    fish.opacity = Math.min(1.0, fish.opacity);
                }
            }

            // --- State Management ---
            fish.stateTimer -= delta;
            if (fish.stateTimer <= 0 && !fish.fadingOut) { // Don't transition if fading out
                this.transitionFishState(fish, waterLine);
            }

            // Smoothly adjust current speed towards target speed
            fish.currentSpeed += (fish.targetSpeed - fish.currentSpeed) * fishLerpFactor;

            // Movement calculations
            this.calculateFishMovement(fish, deltaSeconds, waterLine, fishLerpFactor);
        }
    }

    // Handle fish state transitions
    transitionFishState(fish, waterLine) {
        const wasNibbling = fish.state === 'nibbling';
        if (fish.state === 'nibbling' || fish.state === 'darting') {
            fish.targetPlant = null; 
            fish.targetCoral = null;
            fish.targetX = null; // Clear specific X target
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
            // Small chance to turn after nibbling
            if (Math.random() < 0.2) {
                fish.direction = fish.direction === 'right' ? 'left' : 'right';
                fish.scaleX = fish.direction === 'left' ? -1 : 1;
            }
            // Set a new random target Y
            const fishHeight = fish.img.complete ? fish.size * (fish.img.naturalHeight / fish.img.naturalWidth) : fish.size;
            const topWaterBoundary = waterLine + fishHeight / 2 + 10;
            const bottomWaterBoundary = this.canvas.height - fishHeight / 2 - 10;
            fish.targetY = topWaterBoundary + Math.random() * Math.max(0, bottomWaterBoundary - topWaterBoundary);
        } else if (fish.state === 'swimming') {
            // Chance to pause
            if (Math.random() < 0.15 && !this.options.prefersReducedMotion) { 
                fish.state = 'pausing';
                fish.targetSpeed = fish.baseSpeed * (0.05 + Math.random() * 0.1);
                fish.stateTimer = 800 + Math.random() * 1500; // Shorter pause
            } else { // Continue swimming, set new target Y
                fish.targetSpeed = fish.baseSpeed * (0.4 + Math.random() * 0.8);
                fish.stateTimer = 3000 + Math.random() * 4000;
                const fishHeight = fish.img.complete ? fish.size * (fish.img.naturalHeight / fish.img.naturalWidth) : fish.size;
                const topWaterBoundary = waterLine + fishHeight / 2 + 10;
                const bottomWaterBoundary = this.canvas.height - fishHeight / 2 - 10;
                fish.targetY = topWaterBoundary + Math.random() * Math.max(0, bottomWaterBoundary - topWaterBoundary);
                // Small chance to change direction while swimming normally
                if (Math.random() < 0.05) {
                     fish.direction = fish.direction === 'right' ? 'left' : 'right';
                     fish.scaleX = fish.direction === 'left' ? -1 : 1;
                }
            }
        } else if (fish.state === 'pausing') {
            fish.state = 'swimming';
            fish.targetSpeed = fish.baseSpeed * (0.5 + Math.random() * 0.7);
            fish.stateTimer = 3000 + Math.random() * 4000;
            // Chance to turn after pausing
            if (Math.random() < 0.3) {
                fish.direction = fish.direction === 'right' ? 'left' : 'right';
                fish.scaleX = fish.direction === 'left' ? -1 : 1;
            }
        }
    }

    // Calculate fish movement based on state and environment
    calculateFishMovement(fish, deltaSeconds, waterLine, fishLerpFactor) {
        const fishWidth = fish.size;
        const fishHeight = fish.img.complete ? fish.size * (fish.img.naturalHeight / fish.img.naturalWidth) : fish.size;
        const horizontalSpeedPx = fish.currentSpeed * this.canvas.width * 0.1;

        let moveX = (fish.direction === 'right' ? horizontalSpeedPx * deltaSeconds : -horizontalSpeedPx * deltaSeconds);
        let moveY = 0;

        // Apply smoothed avoidance vector
        if (!this.options.prefersReducedMotion && (fish.currentAvoidance.x !== 0 || fish.currentAvoidance.y !== 0)) {
             const maxAvoidanceInfluence = fish.currentSpeed * 0.5; // Limit avoidance speed influence
             moveX += Math.max(-maxAvoidanceInfluence, Math.min(maxAvoidanceInfluence, fish.currentAvoidance.x * deltaSeconds * 60)); // Apply smoothed avoidance
             moveY += Math.max(-maxAvoidanceInfluence, Math.min(maxAvoidanceInfluence, fish.currentAvoidance.y * deltaSeconds * 60));
             // Slightly adjust target Y based on smoothed avoidance
             fish.targetY += fish.currentAvoidance.y * 0.3;
        }

        // Apply darting direction if applicable
        if (fish.state === 'darting' && fish.targetDirectionAngle !== null) {
            const dartSpeedPx = fish.currentSpeed * this.canvas.width * 0.1;
            moveX = Math.cos(fish.targetDirectionAngle) * dartSpeedPx * deltaSeconds;
            moveY = Math.sin(fish.targetDirectionAngle) * dartSpeedPx * deltaSeconds;
            // Update fish direction based on dart angle for boundary checks
            fish.direction = (moveX > 0) ? 'right' : 'left';
            fish.scaleX = fish.direction === 'left' ? -1 : 1;
        }

        // Nibbling Movement
        if (fish.state === 'nibbling' && fish.targetX !== null) {
            // Move towards the target X position smoothly
            moveX = (fish.targetX - fish.x) * fishLerpFactor * 1.5; // Faster lerp towards target X
            // Bobbing motion
            fish.nibbleOffset = Math.sin(performance.now() * 0.012) * 1.2; // Slightly faster, smaller bob
            moveY += fish.nibbleOffset; // Apply bobbing directly to Y change for this frame
        } else {
            fish.nibbleOffset = 0;
        }

        // Apply X Movement
        fish.x += moveX;

        // Apply Y Movement (Darting/Avoidance/Bobbing)
        fish.y += moveY;

        // Vertical Boundaries
        const topWaterBoundary = waterLine + fishHeight / 2 + 5;
        const bottomWaterBoundary = this.canvas.height - fishHeight / 2 - 5;
        fish.targetY = Math.max(topWaterBoundary, Math.min(bottomWaterBoundary, fish.targetY));

        // Smoothly move towards targetY unless darting vertically or nibbling
        if (!(fish.state === 'darting' && Math.abs(moveY) > 0.1) && fish.state !== 'nibbling') {
             fish.y = this.lerpValue(fish.y, fish.targetY, fishLerpFactor * 0.6); // Slower vertical lerp
        }

        // Add subtle wiggle unless paused, nibbling or reduced motion
        if (fish.state !== 'pausing' && fish.state !== 'nibbling' && !this.options.prefersReducedMotion) {
            fish.wigglePhase += deltaSeconds * (3 + fish.currentSpeed * 1.5); // Slower base wiggle
            // Wiggle amplitude based on speed (more wiggle when faster)
            const currentWiggleAmount = fish.wiggleAmount * (0.5 + fish.currentSpeed / (fish.baseSpeed * 1.5));
            const wiggleOffset = Math.sin(fish.wigglePhase) * currentWiggleAmount * (fish.size * 0.08); // Smaller wiggle factor
            fish.y += wiggleOffset;
        }

        // Enforce Y boundaries strictly after all calculations
        fish.y = Math.max(topWaterBoundary, Math.min(bottomWaterBoundary, fish.y));

        // Horizontal Boundaries & Direction Change
        const leftBoundary = -fishWidth * 0.8; // Allow more overlap before turning
        const rightBoundary = this.canvas.width + fishWidth * 0.8;

        if (fish.x <= leftBoundary && fish.direction === 'left') {
            if (fish.state === 'darting') { // Remove if darting out of bounds
                fish.fadingOut = true; fish.stateTimer = 100; // Quick fade out
            } else {
                fish.direction = 'right'; fish.scaleX = 1; fish.x = leftBoundary + 1;
                // Set new random target Y when turning
                fish.targetY = topWaterBoundary + Math.random() * Math.max(0, bottomWaterBoundary - topWaterBoundary);
            }
        } else if (fish.x >= rightBoundary && fish.direction === 'right') {
             if (fish.state === 'darting') { // Remove if darting out of bounds
                 fish.fadingOut = true; fish.stateTimer = 100; // Quick fade out
             } else {
                fish.direction = 'left'; fish.scaleX = -1; fish.x = rightBoundary - 1;
                // Set new random target Y when turning
                fish.targetY = topWaterBoundary + Math.random() * Math.max(0, bottomWaterBoundary - topWaterBoundary);
             }
        }
    }

    // Handle click interactions with fish
    handleClick(x, y) {
        if (this.options.prefersReducedMotion) return;
        
        const clickRadius = 80;
        const dartSpeedMultiplier = 3.5; // Slightly faster dart
        const dartDuration = 600; // Slightly shorter dart

        this.fishes.forEach(fish => {
            // Don't react if already darting or fading out
            if (fish.state === 'darting' || fish.fadingOut) return; 
            
            const dx = fish.x - x;
            const dy = fish.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if click is within radius + half fish size
            if (distance < clickRadius + fish.size / 2) {
                fish.state = 'darting';
                fish.stateTimer = dartDuration + Math.random() * 150; // Add slight duration variance
                const angleAway = Math.atan2(dy, dx);
                fish.targetSpeed = fish.baseSpeed * dartSpeedMultiplier * (0.9 + Math.random() * 0.2); // Speed variance
                fish.targetDirectionAngle = angleAway + (Math.random() - 0.5) * 0.4; // Slightly less random angle change
                
                // Determine initial dart direction based on angle
                fish.direction = (Math.cos(fish.targetDirectionAngle) > 0) ? 'right' : 'left';
                fish.scaleX = fish.direction === 'left' ? -1 : 1;

                // Aim for a Y position slightly away from the click, within bounds
                const fishHeight = fish.img.complete ? fish.size * (fish.img.naturalHeight / fish.img.naturalWidth) : fish.size;
                const waterLine = this.waterTopBoundary * this.canvas.height / 100;
                const topWaterBoundary = waterLine + fishHeight / 2 + 10;
                const bottomWaterBoundary = this.canvas.height - fishHeight / 2 - 10;
                // Calculate target Y based on dart angle, but keep within bounds
                let dartTargetY = fish.y + Math.sin(fish.targetDirectionAngle) * 60 + (Math.random() - 0.5) * 40;
                fish.targetY = Math.max(topWaterBoundary, Math.min(bottomWaterBoundary, dartTargetY));
                
                // Clear any nibbling targets
                fish.targetPlant = null;
                fish.targetCoral = null;
                fish.targetX = null;
                fish.currentAvoidance = { x: 0, y: 0 }; // Reset avoidance immediately
            }
        });
    }
    
    // Manage fish population
    manageFishPopulation(delta) {
        // Add new fish periodically if below target count
        const maxFish = this.options.isLowPerfDevice ? 
            this.options.minFish : 
            (window.navigator.hardwareConcurrency >= 8 ? this.options.maxFish : 10);
            
        // Use delta in probability check for frame rate independence
        const addChance = 0.00008 * delta; 
        if (this.fishes.length < maxFish && Math.random() < addChance) {
            this.addFish();
        }
        
        // Remove excess fish gradually if significantly over limit
        const removeChance = 0.00015 * delta;
        if (this.fishes.length > maxFish + 2 && Math.random() < removeChance) {
            // Find a fish that isn't already fading out to remove
            const fishToRemove = this.fishes.find(f => !f.fadingOut);
            if (fishToRemove) {
                fishToRemove.fadingOut = true;
                fishToRemove.stateTimer = 600 + Math.random() * 200; // Slightly longer, varied fade out
            }
        }
    }
    
    // Render all fish
    renderFish() {
        for (const fish of this.fishes) {
            // Skip rendering if image isn't loaded or fish is fully faded
            if (!fish.img || !fish.img.complete || !fish.img.naturalWidth || fish.opacity <= 0) continue;
            
            this.ctx.save();
            this.ctx.globalAlpha = fish.opacity; // Apply fade in/out
            this.ctx.translate(fish.x, fish.y);
            this.ctx.scale(fish.scaleX, 1); // Apply direction flip
            // Draw image centered
            const fishDrawHeight = fish.size * (fish.img.naturalHeight / fish.img.naturalWidth);
            this.ctx.drawImage(fish.img, -fish.size/2, -fishDrawHeight/2, fish.size, fishDrawHeight);
            this.ctx.restore();
        }
    }
    
    // Utility function for linear interpolation
    lerpValue(start, end, factor) {
      // Clamp factor to avoid overshooting
      const clampedFactor = Math.max(0, Math.min(1, factor)); 
      return start + (end - start) * clampedFactor;
    }
}