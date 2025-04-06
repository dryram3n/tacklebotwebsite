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
      this.waterHeight = 50; // Initial height in vh
      this.wavePoints = [];
      this.lastTimestamp = 0;
      this.animationFrameId = null; // Store animation frame ID

      // Frame rate capping
      this.TARGET_FRAME_TIME = 1000 / 30; // Target milliseconds per frame (~30 fps)
      this.timeAccumulator = 0; // Accumulates elapsed time

      // Resize handler
      this.resize = this.resize.bind(this); // Bind context for event listener
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleClick = this.handleClick.bind(this);

      this.resize();
      window.addEventListener('resize', this.resize);

      // Mouse tracking for trail effect (disable if reduced motion)
      this.mousePos = { x: 0, y: 0 };
      if (!this.prefersReducedMotion) {
          window.addEventListener('mousemove', this.handleMouseMove);
          window.addEventListener('click', this.handleClick);
      }
      // REMOVED: No longer setting cursor style from JS
      // else { document.body.style.cursor = 'auto'; }

      // Load fish images
      this.loadFishImages();
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.initWavePoints();
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
      const fishCount = this.isLowPerfDevice ? 5 : (window.navigator.hardwareConcurrency >= 8 ? 20 : 12);
      for (let i = 0; i < fishCount; i++) {
        setTimeout(() => this.addFish(), i * (this.isLowPerfDevice ? 600 : 300));
      }
    }

    addFish() {
      const keys = Object.keys(this.fishImages);
      if (keys.length === 0) return;
      const maxFish = this.isLowPerfDevice ? 5 : (window.navigator.hardwareConcurrency >= 8 ? 20 : 12);
      if (this.fishes.length >= maxFish) return;
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const img = this.fishImages[randomKey];
      if (!img || !img.complete || !img.naturalWidth) { setTimeout(() => this.addFish(), 100); return; }
      let size = 30 + Math.random() * 40;
      if (randomKey.includes("Mythic") || randomKey.includes("Legendary") || randomKey.includes("Chimerical") || randomKey.includes("Kraken") || randomKey.includes("Whale")) { size = 65 + Math.random() * 30; }
      else if (randomKey.includes("Rare") || randomKey.includes("Shark") || randomKey.includes("Sturgeon")) { size = 50 + Math.random() * 25; }
      if (this.isLowPerfDevice) size *= 0.8;
      const direction = Math.random() > 0.5 ? 'right' : 'left';
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
      const fishHeight = size * (img.naturalHeight / img.naturalWidth);
      const minY = waterLine + fishHeight / 2;
      const maxY = this.canvas.height - fishHeight / 2;
      const startY = minY + Math.random() * (maxY - minY);
      const startX = direction === 'right' ? -size / 2 : this.canvas.width + size / 2;
      let speed = (40 - size * 0.3) * 0.05;
      let verticalAmount = Math.random() * 8 + 4; // Increased range
      let wiggleAmount = Math.random() * 0.4 + 0.3;
      if (this.isLowPerfDevice) { speed *= 0.6; verticalAmount *= 0.5; wiggleAmount *= 0.5; }
      if (this.prefersReducedMotion) { verticalAmount = 0; wiggleAmount = 0; speed *= 0.5; }
      this.fishes.push({
        img: img, x: startX, y: startY, size: size, speed: speed, direction: direction,
        scaleX: direction === 'left' ? -1 : 1, verticalDirection: Math.random() > 0.5 ? 'up' : 'down',
        verticalAmount: verticalAmount, originalY: startY, wiggleAmount: wiggleAmount,
        wigglePhase: Math.random() * Math.PI * 2, verticalPhase: Math.random() * Math.PI * 2
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

    createSplash(x, y) {
      if (this.prefersReducedMotion) return;
      const dropletCount = this.isLowPerfDevice ? 4 + Math.floor(Math.random() * 3) : 8 + Math.floor(Math.random() * 5);
      for (let i = 0; i < dropletCount; i++) {
        const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() * 0.5 - 0.25);
        const initialSpeed = 3 + Math.random() * 4;
        const speedX = Math.cos(angle) * initialSpeed;
        const speedY = Math.sin(angle) * initialSpeed - (2 + Math.random() * 2);
        this.mouseTrail.push({
          x: x, y: y, size: 4 + Math.random() * 5, opacity: 0.8, age: 0,
          maxAge: 500 + Math.random() * 300, speedX: speedX, speedY: speedY,
          gravity: 0.15, isSplash: true
        });
      }
    }

    updateWaterHeight(targetHeight) {
      const diff = targetHeight - this.waterHeight;
      this.waterHeight += diff * 0.08;
    }

    update(delta) {
      this.updateWaves(delta);
      this.updateFish(delta);
      if (!this.prefersReducedMotion) { this.updateBubbles(delta); }
      if (!this.prefersReducedMotion) { this.updateMouseTrail(delta); }
      if (Math.random() < 0.001 * delta) { this.addBubble(); }
      const maxFish = this.isLowPerfDevice ? 5 : (window.navigator.hardwareConcurrency >= 8 ? 20 : 12);
      if (this.fishes.length < maxFish && Math.random() < 0.0001 * delta) { this.addFish(); }
      if (this.fishes.length > maxFish + 2 && Math.random() < 0.0002 * delta) { this.fishes.shift(); }
    }

    updateWaves(delta) {
      const waveTime = performance.now() * 0.001;
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
      const amplitudeMultiplier = this.isLowPerfDevice ? 0.6 : 1;
      for (let i = 0; i < this.wavePoints.length; i++) {
        const point = this.wavePoints[i];
        const xFactor = i / (this.wavePoints.length -1);
        point.y = waterLine +
                  (Math.sin(waveTime * 0.8 + xFactor * 10) * 4 * amplitudeMultiplier) +
                  (Math.sin(waveTime * 0.5 + xFactor * 6) * 6 * amplitudeMultiplier) +
                  (Math.sin(waveTime * 0.3 + xFactor * 4) * 3 * amplitudeMultiplier);
      }
    }

    updateFish(delta) {
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
      const deltaSeconds = delta / 1000;
      for (let i = this.fishes.length - 1; i >= 0; i--) {
        const fish = this.fishes[i];
        const fishWidth = fish.size;
        const fishHeight = fish.img.complete ? fish.size * (fish.img.naturalHeight / fish.img.naturalWidth) : fish.size;
        const horizontalSpeedPx = fish.speed * this.canvas.width * 0.1;
        let nextX = fish.x + (fish.direction === 'right' ? horizontalSpeedPx * deltaSeconds : -horizontalSpeedPx * deltaSeconds);
        const leftBoundary = fishWidth / 2;
        const rightBoundary = this.canvas.width - fishWidth / 2;
        if (nextX <= leftBoundary && fish.direction === 'left') { fish.direction = 'right'; fish.scaleX = 1; nextX = leftBoundary + (leftBoundary - nextX); }
        else if (nextX >= rightBoundary && fish.direction === 'right') { fish.direction = 'left'; fish.scaleX = -1; nextX = rightBoundary - (nextX - rightBoundary); }
        fish.x = Math.max(leftBoundary, Math.min(rightBoundary, nextX));
        const topWaterBoundary = waterLine + fishHeight / 2;
        const bottomWaterBoundary = this.canvas.height - fishHeight / 2;
        if (!this.prefersReducedMotion) {
            fish.originalY += (Math.random() - 0.5) * 10 * deltaSeconds;
            const driftClampMargin = fish.verticalAmount * 8 + fish.wiggleAmount * 15;
            fish.originalY = Math.max(topWaterBoundary + driftClampMargin, Math.min(bottomWaterBoundary - driftClampMargin, fish.originalY));
            fish.verticalPhase += deltaSeconds * 0.8;
            const verticalOffset = Math.sin(fish.verticalPhase) * fish.verticalAmount * 8;
            fish.wigglePhase += deltaSeconds * 6;
            const wiggleOffset = Math.sin(fish.wigglePhase) * fish.wiggleAmount * 15;
            fish.y = fish.originalY + verticalOffset + wiggleOffset;
            if (fish.y < topWaterBoundary) {
              fish.y = topWaterBoundary;
              fish.originalY = topWaterBoundary + Math.random() * 5;
              fish.verticalPhase += Math.PI;
            } else if (fish.y > bottomWaterBoundary) {
              fish.y = bottomWaterBoundary;
              fish.originalY = bottomWaterBoundary - Math.random() * 5;
              fish.verticalPhase += Math.PI;
            }
        } else {
             fish.y = fish.originalY;
             fish.y = Math.max(topWaterBoundary, Math.min(bottomWaterBoundary, fish.y));
             fish.originalY = fish.y;
        }
        const changeDirChance = this.isLowPerfDevice ? 0.0001 : 0.0002;
        if (Math.random() < changeDirChance * delta) {
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
        if (bubble.opacity < bubble.maxOpacity) { bubble.opacity += 0.005 * delta; bubble.opacity = Math.min(bubble.opacity, bubble.maxOpacity); }
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
      if (!this.prefersReducedMotion && this.wavePoints.length > 1) {
          this.ctx.beginPath();
          this.ctx.moveTo(0, this.canvas.height); this.ctx.lineTo(0, this.wavePoints[0].y);
          for (let i = 1; i < this.wavePoints.length; i++) { this.ctx.lineTo(this.wavePoints[i].x, this.wavePoints[i].y); }
          this.ctx.lineTo(this.canvas.width, this.wavePoints[this.wavePoints.length - 1].y);
          this.ctx.lineTo(this.canvas.width, this.canvas.height); this.ctx.closePath();
          const gradient = this.ctx.createLinearGradient(0, waterLine, 0, this.canvas.height);
          gradient.addColorStop(0, 'rgba(137, 247, 254, 0.6)'); gradient.addColorStop(0.5, 'rgba(115, 200, 255, 0.7)'); gradient.addColorStop(1, 'rgba(102, 166, 255, 0.8)');
          this.ctx.fillStyle = gradient; this.ctx.fill();
      } else {
          const gradient = this.ctx.createLinearGradient(0, waterLine, 0, this.canvas.height);
          gradient.addColorStop(0, 'rgba(137, 247, 254, 0.6)'); gradient.addColorStop(1, 'rgba(102, 166, 255, 0.8)');
          this.ctx.fillStyle = gradient; this.ctx.fillRect(0, waterLine, this.canvas.width, this.canvas.height - waterLine);
      }
      for (const fish of this.fishes) {
        if (!fish.img || !fish.img.complete || !fish.img.naturalWidth) continue;
        this.ctx.save();
        this.ctx.translate(fish.x, fish.y); this.ctx.scale(fish.scaleX, 1);
        const aspectRatio = fish.img.naturalHeight / fish.img.naturalWidth;
        const width = fish.size; const height = fish.size * aspectRatio;
        try {
          this.ctx.globalAlpha = this.isLowPerfDevice ? 0.85 : 1.0;
          this.ctx.drawImage(fish.img, -width / 2, -height / 2, width, height);
          this.ctx.globalAlpha = 1.0;
        } catch (e) { console.error("Error drawing fish image:", e, fish.img.src); }
        this.ctx.restore();
      }
      if (!this.prefersReducedMotion) {
          this.ctx.fillStyle = `rgba(255, 255, 255, 0.7)`; this.ctx.globalAlpha = 1;
          for (const bubble of this.bubbles) {
            this.ctx.beginPath(); this.ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
            this.ctx.globalAlpha = bubble.opacity; this.ctx.fill();
          }
          this.ctx.globalAlpha = 1;
      }
      if (!this.prefersReducedMotion) {
          this.ctx.fillStyle = `rgba(137, 247, 254, 1)`;
          for (const point of this.mouseTrail) {
            this.ctx.beginPath(); this.ctx.arc(point.x, point.y, point.size / 2, 0, Math.PI * 2);
            this.ctx.globalAlpha = point.opacity; this.ctx.fill();
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
          if (updatesProcessed > 5) { this.timeAccumulator = 0; console.warn("Canvas falling behind, resetting time accumulator."); break; }
      }
      this.render();
    }

    start() {
      if (!this.animationFrameId) {
          console.log("Starting Canvas Animation Loop (Target 30fps Update)");
          // REMOVED: No longer setting cursor style from JS
          // if (!this.prefersReducedMotion) { document.body.style.cursor = 'none'; }
          // else { document.body.style.cursor = 'auto'; }
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
      // REMOVED: No longer setting cursor style from JS
      // document.body.style.cursor = 'auto';
      if (this.canvas && this.canvas.parentNode) { this.canvas.parentNode.removeChild(this.canvas); }
      window.removeEventListener('resize', this.resize);
      if (!this.prefersReducedMotion) {
          window.removeEventListener('mousemove', this.handleMouseMove);
          window.removeEventListener('click', this.handleClick);
      }
    }
}