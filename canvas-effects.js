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
  
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      // Improve rendering quality slightly, especially for scaled images/lines
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
      this.bubbles = [];
      this.mouseTrail = [];
      this.plants = [];
      this.corals = [];
      this.backgroundFeatures = [];
      this.raindrops = [];
      this.waterHeight = 50;
      this.wavePoints = [];
      this.lastTimestamp = 0;
      this.animationFrameId = null;
      this.TARGET_FRAME_TIME = 1000 / WaterCanvas.TARGET_FPS;
      this.timeAccumulator = 0;
      this.isRaining = false;
      this.rainIntensity = 0.5;
      this.lerpFactor = WaterCanvas.LERP_FACTOR;
  
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
  
      // Add mouse trail pool
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
      
      // Add raindrop pool
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
      
      // Recreate features on resize
      this.plants = [];
      this.corals = [];
      this.backgroundFeatures = [];
      this.createInitialBackgroundFeatures();
      this.createInitialCorals();
      this.createInitialPlants();
      
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
      ctx.save();
      // Apply subtle parallax based on water height change (simulating scroll)
      const parallaxOffset = (50 - this.waterHeight) * feature.parallaxFactor;
      ctx.translate(feature.x, feature.y + parallaxOffset);
    
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
            // More complex sway using two sine waves
            plant.swayPhase += plant.swaySpeed * delta;
            plant.swayPhase2 += plant.swaySpeed2 * delta;
            plant.currentSway = (Math.sin(plant.swayPhase) * plant.swayAmount) + (Math.sin(plant.swayPhase2) * plant.swayAmount2);
  
            if (plant.isBeingNibbledTimer > 0) {
                plant.isBeingNibbledTimer -= delta;
                plant.currentSway += Math.sin(time * 0.05) * 0.05; // Extra wiggle
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
        const y = this.canvas.height - Math.random() * this.canvas.height * 0.15; // Lower 15%
        const type = Math.random() < 0.7 ? 'rocks' : 'cave';
        const size = 50 + Math.random() * (this.isLowPerfDevice ? 100 : 200);
        const colorValue = 30 + Math.random() * 40;
        const color = `rgba(${colorValue}, ${colorValue + Math.random() * 10}, ${colorValue + Math.random() * 20}, ${0.3 + Math.random() * 0.3})`;
  
        const featureData = {
            x: x, y: y, size: size, type: type, color: color,
            points: [],
            parallaxFactor: 0.1 + Math.random() * 0.2 // How much it moves with scroll (less = further away)
        };
  
        const pointCount = 6 + Math.floor(Math.random() * 6); // More points for bezier
        let lastPoint = { x: size * (0.6 + Math.random() * 0.4), y: 0 }; // Start point
        featureData.points.push(lastPoint);
  
        for (let i = 1; i <= pointCount; i++) {
            const angle = (Math.PI * 2 / pointCount) * i;
            const radius = size * (0.5 + Math.random() * 0.5); // Irregular radius
            const nextPoint = {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius * (0.4 + Math.random() * 0.4) // Flatter shapes
            };
            // Calculate control points for bezier curve (simple midpoint approach)
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
      
      // Find an inactive raindrop in the pool
      const drop = this.raindropPool.find(d => !d.active);
      if (!drop) return; // No available raindrops
      
      // Reuse the raindrop object
      drop.x = Math.random() * this.canvas.width;
      drop.y = -10;
      drop.length = 4 + Math.random() * 8;
      drop.speedY = 7 + Math.random() * 6;
      drop.opacity = 0.25 + Math.random() * 0.3;
      drop.active = true;
      
      this.activeRaindrops++;
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
                // More accurate wave surface check using interpolation
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
                this.createSplash(drop.x, waveSurfaceY, 0.25, 0.3); // Even smaller splash for rain
                this.raindrops.splice(i, 1);
            } else if (drop.y > this.canvas.height) {
                this.raindrops.splice(i, 1);
            }
        }
        // Add new drops based on intensity and delta time
        const dropsToAdd = Math.ceil(this.rainIntensity * (this.isLowPerfDevice ? 0.5 : 2) * (delta / 16.67));
        for(let k=0; k < dropsToAdd; k++) {
            this.addRaindrop();
        }
    }
  
    updateWaterHeight(targetHeight) {
      // Use lerp for smoother height changes
      this.waterHeight += (targetHeight - this.waterHeight) * this.lerpFactor * 0.5; // Slower height change
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
  
      // Add new bubbles/fish periodically
      if (Math.random() < 0.0008 * delta) { this.addBubble(); } // Slightly less frequent bubbles
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
        
        // Previous position for smoothing
        const prevY = point.y;
        
        if (this.prefersReducedMotion) {
          point.y = waterLine + (Math.sin(waveTime * 0.3 + xFactor * 4) * 3 * amplitudeMultiplier);
        } else {
          // Combine multiple sine waves with different frequencies
          const wave1 = Math.sin(waveTime * 0.8 + xFactor * 10 + 0.5) * 4 * amplitudeMultiplier;
          const wave2 = Math.sin(waveTime * 0.5 + xFactor * 6 - 0.2) * 6 * amplitudeMultiplier;
          const wave3 = Math.sin(waveTime * 0.3 + xFactor * 4 + 1.0) * 3 * amplitudeMultiplier;
          const targetY = waterLine + wave1 + wave2 + wave3;
          
          // Apply smoothing between frames
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
      if (this.prefersReducedMotion) { this.mouseTrail = []; return; }
      for (let i = this.mouseTrail.length - 1; i >= 0; i--) {
        const point = this.mouseTrail[i];
        point.age += delta;
  
        if (point.isSplash) {
          point.speedY += point.gravity * (delta / 16.67);
          point.x += point.speedX * (delta / 16.67);
          point.y += point.speedY * (delta / 16.67);
          point.opacity = Math.max(0, 0.7 * (1 - point.age / point.maxAge)); // Slightly lower opacity
        } else {
          point.opacity = Math.max(0, 0.4 * (1 - point.age / point.maxAge)); // Lower opacity
        }
  
        if (point.age >= point.maxAge || point.opacity <= 0) {
          this.mouseTrail.splice(i, 1);
        }
      }
    }
  
    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
      const time = performance.now(); // For animations independent of frame rate
  
      // --- Render Background Features (Rocks/Caves) ---
      this.backgroundFeatures.forEach(feature => {
          this.ctx.save();
          // Apply subtle parallax based on water height change (simulating scroll)
          // This is a simplification; true scroll parallax needs scroll position.
          // We'll use waterHeight as a proxy. A lower waterHeight means scrolled down.
          const parallaxOffset = (50 - this.waterHeight) * feature.parallaxFactor;
          this.ctx.translate(feature.x, feature.y + parallaxOffset);
  
          this.ctx.fillStyle = feature.color;
          this.ctx.beginPath();
          if (feature.points.length > 1) {
              this.ctx.moveTo(0, this.canvas.height);
              this.ctx.lineTo(0, this.wavePoints[0].y);
              // Use bezier curves for smoother waves between points
              for (let i = 0; i < this.wavePoints.length - 1; i++) {
                  const p1 = this.wavePoints[i];
                  const p2 = this.wavePoints[i + 1];
                  // Simple control points based on midpoint
                  const xc = (p1.x + p2.x) / 2;
                  const yc = (p1.y + p2.y) / 2;
                  // Adjust control points slightly for smoother curves (can be refined further)
                  const cp1x = (xc + p1.x) / 2;
                  const cp1y = (yc + p1.y) / 2;
                  const cp2x = (xc + p2.x) / 2;
                  const cp2y = (yc + p2.y) / 2;
                  // Using quadraticCurveTo is often sufficient and simpler here
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
              gradient.addColorStop(0, 'rgba(137, 247, 254, 0.6)');
              gradient.addColorStop(0.5, 'rgba(115, 200, 255, 0.7)');
              gradient.addColorStop(1, 'rgba(102, 166, 255, 0.8)');
              this.ctx.fillStyle = gradient;
              this.ctx.fill();
  
              if (feature.type === 'cave' && feature.cave) {
                  // Darker, slightly offset cave entrance
                  this.ctx.fillStyle = 'rgba(10, 10, 15, 0.6)'; // Darker, less blue
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
          // Use bezier curves for smoother waves between points
          for (let i = 0; i < this.wavePoints.length - 1; i++) {
              const p1 = this.wavePoints[i];
              const p2 = this.wavePoints[i + 1];
              // Simple control points based on midpoint
              const xc = (p1.x + p2.x) / 2;
              const yc = (p1.y + p2.y) / 2;
              // Adjust control points slightly for smoother curves (can be refined further)
              const cp1x = (xc + p1.x) / 2;
              const cp1y = (yc + p1.y) / 2;
              const cp2x = (xc + p2.x) / 2;
              const cp2y = (yc + p2.y) / 2;
              // Using quadraticCurveTo is often sufficient and simpler here
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
          gradient.addColorStop(0, 'rgba(137, 247, 254, 0.6)');
          gradient.addColorStop(0.5, 'rgba(115, 200, 255, 0.7)');
          gradient.addColorStop(1, 'rgba(102, 166, 255, 0.8)');
          this.ctx.fillStyle = gradient;
          this.ctx.fill();
      } else { // Static water
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
  
      // --- Render Plants (Refined) ---
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
          for (const bubble of this.bubblePool) {
            if (!bubble.active) continue;
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, bubble.size / 2, 0, Math.PI * 2);
            this.ctx.globalAlpha = bubble.opacity;
            this.ctx.fill();
          }
          this.ctx.globalAlpha = 1;
      }
  
      // --- Render Mouse Trail ---
      if (!this.prefersReducedMotion) {
          this.ctx.fillStyle = `rgba(137, 247, 254, 0.8)`; // Trail color slightly less opaque
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
          this.ctx.strokeStyle = 'rgba(180, 210, 230, 0.5)'; // More transparent rain
          this.ctx.lineWidth = 1; // Thinner rain
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
  
    // Add this helper method
    lerp(start, end, factor) {
      return start + (end - start) * factor;
    }

    addTrailPoint() {
      if (this.prefersReducedMotion) return;
      
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
      
      this.mouseTrail.push(point);
      this.activeTrailPoints++;
    }
  
    addBubble() {
      if (this.prefersReducedMotion) return;
      
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
      
      // Create 3-8 particles for the splash
      const particleCount = 3 + Math.floor(Math.random() * 5);
      for (let i = 0; i < particleCount; i++) {
        // Find an inactive trail point from the pool
        const point = this.mouseTrailPool.find(p => !p.active);
        if (!point) return; // No available trail points
        
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
        
        this.mouseTrail.push(point);
        this.activeTrailPoints++;
      }
    }
  }
  
  // Fish Management Class - handles all fish-related logic
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

    // Load fish images from FISH_IMAGES global object
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
        const startY = minY + Math.random() * (maxY - minY);
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
            opacity: 1.0, // Start fully opaque
            fadingOut: false
        });
    }

    // Update water level information
    updateWaterHeight(waterHeight) {
        this.currentWaterHeight = waterHeight;
        this.waterTopBoundary = (100 - this.currentWaterHeight);
        
        // Adjust fish positions if they're above the water line
        this.fishes.forEach(fish => {
            const fishTopBoundary = this.waterTopBoundary + 2;
            const fishY_vh = (fish.y / this.canvas.height) * 100;
            
            if (fishY_vh < fishTopBoundary) {
                const newY = (fishTopBoundary + Math.random() * (this.currentWaterHeight - 4)) * this.canvas.height / 100;
                fish.y = newY;
                fish.targetY = newY;
            }
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
            const bottomThreshold = this.canvas.height - 150;
            
            if (fish.y > bottomThreshold && Math.random() < nibbleChance) {
                let closestTarget = null;
                let minDistSq = checkRadius * checkRadius;
                let targetType = null;

                // Check plants
                if (plants && plants.length > 0) {
                    for (const plant of plants) {
                        const plantTopY = plant.baseY - plant.currentHeight;
                        const dx = plant.x - fish.x;
                        const dy = plantTopY - fish.y;
                        const distSq = dx * dx + dy * dy;
                        if (distSq < minDistSq) {
                            minDistSq = distSq;
                            closestTarget = plant;
                            targetType = 'plant';
                        }
                    }
                }
                
                // Check corals
                if (corals && corals.length > 0) {
                    for (const coral of corals) {
                        const coralTopY = coral.y - coral.size * 0.5;
                        const dx = coral.x - fish.x;
                        const dy = coralTopY - fish.y;
                        const distSq = dx * dx + dy * dy;
                        if (distSq < minDistSq) {
                            minDistSq = distSq;
                            closestTarget = coral;
                            targetType = 'coral';
                        }
                    }
                }

                if (closestTarget && targetType) {
                    fish.state = 'nibbling';
                    fish.stateTimer = 1500 + Math.random() * 2000;
                    fish.targetSpeed = fish.baseSpeed * 0.05;
                    closestTarget.isBeingNibbledTimer = 300;

                    if (targetType === 'plant') {
                        fish.targetPlant = closestTarget;
                        fish.targetCoral = null;
                        fish.targetY = closestTarget.baseY - closestTarget.currentHeight * (0.2 + Math.random() * 0.2); // Target lower on plant
                        fish.targetX = closestTarget.x + (Math.random() - 0.5) * 5; // Closer X target
                    } else { // Coral
                        fish.targetPlant = null;
                        fish.targetCoral = closestTarget;
                        fish.targetY = closestTarget.y - closestTarget.size * (0.1 + Math.random() * 0.2); // Target higher on coral
                        fish.targetX = closestTarget.x + (fish.x > closestTarget.x ? -1 : 1) * closestTarget.size * (0.1 + Math.random() * 0.1); // Closer X target
                    }
                }
            }
        });
    }

    // Update fish positions and states
    updateFish(delta) {
        const waterLine = (100 - this.currentWaterHeight) * this.canvas.height / 100;
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
            if (fish.stateTimer <= 0) {
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
        if (fish.state === 'nibbling' || fish.state === 'darting') {
            fish.targetPlant = null; 
            fish.targetCoral = null;
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
            if (Math.random() < 0.15 && !this.options.prefersReducedMotion) { // Slightly less pausing
                fish.state = 'pausing';
                fish.targetSpeed = fish.baseSpeed * (0.05 + Math.random() * 0.1);
                fish.stateTimer = 800 + Math.random() * 1500; // Shorter pause
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
        }

        // Nibbling Movement
        if (fish.state === 'nibbling') {
            let targetX = fish.x;
            if (fish.targetPlant) targetX = fish.targetPlant.x + (fish.scaleX > 0 ? -fishWidth * 0.4 : fishWidth * 0.4);
            else if (fish.targetCoral) targetX = fish.targetCoral.x + (fish.scaleX > 0 ? -fish.targetCoral.size * 0.3 : fish.targetCoral.size * 0.3);
            moveX = (targetX - fish.x) * fishLerpFactor; // Use lerp for smoother approach

            fish.nibbleOffset = Math.sin(performance.now() * 0.012) * 1.2; // Slightly faster, smaller bob
            moveY += fish.nibbleOffset * deltaSeconds * 8; // Apply bobbing
        } else {
            fish.nibbleOffset = 0;
        }

        // Apply Lerp to smooth movement
        fish.x += moveX;
        fish.y = this.lerpValue(fish.y, fish.targetY, fishLerpFactor);

        // Vertical Movement & Boundaries
        const topWaterBoundary = waterLine + fishHeight / 2 + 5;
        const bottomWaterBoundary = this.canvas.height - fishHeight / 2 - 5;
        fish.targetY = Math.max(topWaterBoundary, Math.min(bottomWaterBoundary, fish.targetY));

        // Smoothly move towards targetY unless darting vertically or nibbling
        if (!(fish.state === 'darting' && Math.abs(moveY) > 0.1) && fish.state !== 'nibbling') {
             fish.y += (fish.targetY - fish.y) * fishLerpFactor * 0.6; // Slower vertical lerp
        }

        // Add subtle wiggle unless paused, nibbling or reduced motion
        if (fish.state !== 'pausing' && fish.state !== 'nibbling' && !this.options.prefersReducedMotion) {
            fish.wigglePhase += deltaSeconds * (3 + fish.currentSpeed * 1.5); // Slower base wiggle
            // Wiggle amplitude based on speed (more wiggle when faster)
            const currentWiggleAmount = fish.wiggleAmount * (0.5 + fish.currentSpeed / (fish.baseSpeed * 1.5));
            const wiggleOffset = Math.sin(fish.wigglePhase) * currentWiggleAmount * (fish.size * 0.08); // Smaller wiggle factor
            fish.y += wiggleOffset;
        }

        fish.y = Math.max(topWaterBoundary, Math.min(bottomWaterBoundary, fish.y));

        // Horizontal Boundaries & Direction Change
        const leftBoundary = -fishWidth * 0.8; // Allow more overlap before turning
        const rightBoundary = this.canvas.width + fishWidth * 0.8;

        if (fish.x <= leftBoundary && fish.direction === 'left') {
            if (fish.state !== 'darting') {
                fish.direction = 'right'; fish.scaleX = 1; fish.x = leftBoundary + 1;
            } else { this.fishes.splice(this.fishes.indexOf(fish), 1); }
        } else if (fish.x >= rightBoundary && fish.direction === 'right') {
             if (fish.state !== 'darting') {
                fish.direction = 'left'; fish.scaleX = -1; fish.x = rightBoundary - 1;
             } else { this.fishes.splice(this.fishes.indexOf(fish), 1); }
        }

        // Random direction change chance (very low)
        if (fish.state === 'swimming' && Math.random() < 0.00003 * deltaSeconds) {
            fish.direction = fish.direction === 'right' ? 'left' : 'right';
            fish.scaleX = fish.direction === 'left' ? -1 : 1;
        }
    }

    // Handle click interactions with fish
    handleClick(x, y) {
        const clickRadius = 80;
        const dartSpeedMultiplier = 3.5; // Slightly faster dart
        const dartDuration = 600; // Slightly shorter dart

        this.fishes.forEach(fish => {
            if (fish.state === 'nibbling') return;
            const dx = fish.x - x;
            const dy = fish.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < clickRadius + fish.size / 2) {
                fish.state = 'darting';
                fish.stateTimer = dartDuration;
                const angleAway = Math.atan2(dy, dx);
                fish.targetSpeed = fish.baseSpeed * dartSpeedMultiplier;
                fish.targetDirectionAngle = angleAway + (Math.random() - 0.5) * 0.4; // Slightly less random angle change
                // Prioritize horizontal escape if possible
                if (Math.abs(Math.cos(angleAway)) > 0.6) {
                    fish.direction = (Math.cos(angleAway) > 0) ? 'right' : 'left';
                } else {
                    // If click is mostly vertical, flee towards nearest horizontal edge
                    fish.direction = (fish.x < this.canvas.width / 2) ? 'right' : 'left';
                }
                fish.scaleX = fish.direction === 'left' ? -1 : 1;
                // Aim for a Y position slightly away from the click, within bounds
                const fishHeight = fish.img.complete ? fish.size * (fish.img.naturalHeight / fish.img.naturalWidth) : fish.size;
                const waterLine = (100 - this.currentWaterHeight) * this.canvas.height / 100;
                const topWaterBoundary = waterLine + fishHeight / 2 + 10;
                const bottomWaterBoundary = this.canvas.height - fishHeight / 2 - 10;
                fish.targetY = Math.max(topWaterBoundary, Math.min(bottomWaterBoundary, 
                    fish.y + Math.sin(angleAway) * 40 + (Math.random() - 0.5) * 30));
                fish.targetPlant = null;
                fish.targetCoral = null;
            }
        });
    }
    
    // Manage fish population
    manageFishPopulation(delta) {
        // Add new fish periodically if below target count
        const maxFish = this.options.isLowPerfDevice ? 
            this.options.minFish : 
            (window.navigator.hardwareConcurrency >= 8 ? this.options.maxFish : 10);
            
        if (this.fishes.length < maxFish && Math.random() < 0.00008 * delta) {
            this.addFish();
        }
        
        // Remove excess fish gradually
        if (this.fishes.length > maxFish + 2 && Math.random() < 0.00015 * delta) {
            const fishToRemove = this.fishes[0];
            if (!fishToRemove.fadingOut) {
                fishToRemove.fadingOut = true;
                fishToRemove.stateTimer = 600; // Slightly longer fade out
            }
        }
    }
    
    // Render all fish
    renderFish() {
        for (const fish of this.fishes) {
            if (!fish.img || !fish.img.complete || !fish.img.naturalWidth) continue;
            
            this.ctx.save();
            this.ctx.globalAlpha = fish.opacity;
            this.ctx.translate(fish.x, fish.y);
            this.ctx.scale(fish.scaleX, 1);
            this.ctx.drawImage(fish.img, -fish.size/2, -fish.size/2, fish.size, fish.size * (fish.img.naturalHeight / fish.img.naturalWidth));
            this.ctx.restore();
        }
    }
    
    // Utility function for linear interpolation
    lerpValue(start, end, factor) {
        return start + (end - start) * factor;
    }
}