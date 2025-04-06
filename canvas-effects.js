// Canvas implementation for water effects
class WaterCanvas {
    constructor() {
      // Create canvas element
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');

      // Position the canvas
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.zIndex = '-10'; // Same z-index as current water background
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

      // Mouse tracking for trail effect
      this.mousePos = { x: 0, y: 0 };
      window.addEventListener('mousemove', this.handleMouseMove);
      window.addEventListener('click', this.handleClick);

      // Load fish images
      this.loadFishImages();
    }

    resize() {
      // Set canvas to full window size for proper rendering
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      // Reinitialize wave points when resized
      this.initWavePoints();
    }

    handleMouseMove(e) {
      this.mousePos = { x: e.clientX, y: e.clientY };
      this.addTrailPoint();
    }

    handleClick(e) {
       // Ignore clicks on interactive elements
       if (e.target.closest('a, button, .button, input, select, textarea, [role="button"]')) return;
       this.createSplash(e.clientX, e.clientY);
    }

    initWavePoints() {
      // Create points for wave animation
      this.wavePoints = [];
      const pointCount = Math.ceil(this.canvas.width / 20); // Point every 20px

      for (let i = 0; i <= pointCount; i++) { // Use <= to include the last point
        this.wavePoints.push({
          x: (this.canvas.width * i) / pointCount,
          y: 0,
          originalY: 0,
          speed: 0.1 + Math.random() * 0.2
        });
      }
    }

    loadFishImages() {
      // Load fish images from your FISH_IMAGES object
      if (typeof FISH_IMAGES !== 'undefined') {
        for (const [key, url] of Object.entries(FISH_IMAGES)) {
          const img = new Image();
          img.src = url;
          img.onload = () => { // Ensure image is loaded before adding fish that might use it
              this.fishImages[key] = img;
              // Maybe trigger initial fish creation only after some images load?
              if (Object.keys(this.fishImages).length === 1) {
                   this.createInitialFish(); // Create fish once the first image loads
              }
          };
          img.onerror = () => {
              console.error(`Failed to load fish image: ${key} at ${url}`);
              // Optionally remove the key or use a placeholder
          };
        }
      } else {
          console.error("FISH_IMAGES object not found. Cannot load fish images.");
      }
    }

    createInitialFish() {
      // Add some initial fish
      const fishCount = window.navigator.hardwareConcurrency >= 8 ? 8 : 5;

      for (let i = 0; i < fishCount; i++) {
        setTimeout(() => this.addFish(), i * 300);
      }
    }

    addFish() {
      // Logic to add a fish with random properties
      const keys = Object.keys(this.fishImages);
      if (keys.length === 0) return; // Don't add if no images loaded

      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const img = this.fishImages[randomKey];

      // Check if image is actually loaded and has dimensions
      if (!img || !img.complete || !img.naturalWidth) {
          // console.warn(`Skipping fish add for ${randomKey}, image not ready.`);
          // Optionally try again later or pick another fish
          setTimeout(() => this.addFish(), 100); // Retry adding a fish shortly
          return;
      }

      // Size based on fish type
      let size = 30 + Math.random() * 40;
      if (randomKey.includes("Mythic") || randomKey.includes("Legendary") || randomKey.includes("Chimerical") || randomKey.includes("Kraken") || randomKey.includes("Whale")) {
        size = 65 + Math.random() * 30;
      } else if (randomKey.includes("Rare") || randomKey.includes("Shark") || randomKey.includes("Sturgeon")) {
          size = 50 + Math.random() * 25;
      }

      // Starting position
      const direction = Math.random() > 0.5 ? 'right' : 'left';
      const startX = direction === 'right' ? -size : this.canvas.width + size;
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
      const startY = waterLine + Math.random() * (this.canvas.height - waterLine - size);

      // Speed and movement properties
      const speed = (40 - size * 0.3) * 0.05; // Base speed factor

      this.fishes.push({
        img: img,
        x: startX,
        y: startY,
        size: size,
        speed: speed, // Speed factor (pixels per second will depend on canvas width)
        direction: direction,
        scaleX: direction === 'left' ? -1 : 1,
        verticalDirection: Math.random() > 0.5 ? 'up' : 'down',
        verticalAmount: Math.random() * 5 + 2, // Max vertical deviation
        originalY: startY,
        wiggleAmount: Math.random() * 0.4 + 0.3, // Wiggle intensity
        wigglePhase: Math.random() * Math.PI * 2, // Wiggle start offset
        verticalPhase: Math.random() * Math.PI * 2 // Phase for vertical sine movement
      });
    }

    addBubble(x, y) {
      // Add a bubble at the given position
      const size = 5 + Math.random() * 10;
      const speedY = 1 + Math.random() * 2; // Pixels per frame (approx)
      const driftX = (-0.5 + Math.random()) * 0.5; // Horizontal drift speed (pixels per frame)

      this.bubbles.push({
        x: x || Math.random() * this.canvas.width,
        y: y || this.canvas.height - Math.random() * 50,
        size: size,
        speedY: speedY,
        driftX: driftX,
        opacity: 0.1,
        maxOpacity: 0.6 + Math.random() * 0.2
      });
    }

    addTrailPoint() {
      // Add point to mouse trail
      this.mouseTrail.push({
        x: this.mousePos.x,
        y: this.mousePos.y,
        size: 8 + Math.random() * 4, // Slightly randomized size
        opacity: 0.5,
        age: 0,
        maxAge: 300 + Math.random() * 200 // Lifespan in ms
      });

      // Limit trail length (optional, could also rely on age)
      // if (this.mouseTrail.length > 30) {
      //   this.mouseTrail.shift();
      // }
    }

    createSplash(x, y) {
      // Create splash effect with multiple droplets
      const dropletCount = 8 + Math.floor(Math.random() * 5);

      for (let i = 0; i < dropletCount; i++) {
        const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() * 0.5 - 0.25);
        const initialSpeed = 3 + Math.random() * 4; // Initial velocity magnitude
        const speedX = Math.cos(angle) * initialSpeed;
        const speedY = Math.sin(angle) * initialSpeed - (2 + Math.random() * 2); // Initial upward velocity

        this.mouseTrail.push({
          x: x,
          y: y,
          size: 4 + Math.random() * 5, // Smaller splash droplets
          opacity: 0.8, // Start more opaque
          age: 0,
          maxAge: 500 + Math.random() * 300, // Splash lifespan
          speedX: speedX,
          speedY: speedY,
          gravity: 0.15, // Gravity effect
          isSplash: true
        });
      }
    }

    updateWaterHeight(targetHeight) {
      // Smoothly update water height
      const diff = targetHeight - this.waterHeight;
      this.waterHeight += diff * 0.08; // Easing factor
    }

    update(delta) { // delta is the time since last *update* call
      // Update waves
      this.updateWaves(delta);

      // Update fish positions
      this.updateFish(delta);

      // Update bubbles
      this.updateBubbles(delta);

      // Update mouse trail
      this.updateMouseTrail(delta);

      // Occasionally add bubbles (frame-rate independent)
      if (Math.random() < 0.001 * delta) { // Adjust probability based on delta
        this.addBubble();
      }

      // Occasionally add/remove fish (frame-rate independent)
      if (Math.random() < 0.0001 * delta) {
        this.addFish();
      }

      // Limit fish count
      const maxFish = window.navigator.hardwareConcurrency >= 8 ? 12 : 8;
      if (this.fishes.length > maxFish && Math.random() < 0.0005 * delta) {
        // Remove the oldest fish (first in array)
        this.fishes.shift();
      }
    }

    updateWaves(delta) {
      // Animate wave points
      const waveTime = performance.now() * 0.001; // Time in seconds
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;

      for (let i = 0; i < this.wavePoints.length; i++) {
        const point = this.wavePoints[i];
        const xFactor = i / (this.wavePoints.length -1); // Normalize x position (0 to 1)

        // Calculate wave height using multiple sine functions for complexity
        point.y = waterLine +
                  Math.sin(waveTime * 0.8 + xFactor * 10) * 4 + // Faster, smaller wave
                  Math.sin(waveTime * 0.5 + xFactor * 6) * 6 +  // Main wave
                  Math.sin(waveTime * 0.3 + xFactor * 4) * 3;  // Slower, broader wave
      }
    }

    updateFish(delta) {
      // Move fish and remove those that are off-screen
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
      const deltaSeconds = delta / 1000; // Time since last frame in seconds

      for (let i = this.fishes.length - 1; i >= 0; i--) {
        const fish = this.fishes[i];

        // Update horizontal position based on speed factor and canvas width
        const horizontalSpeedPx = fish.speed * this.canvas.width * 0.1; // Adjust multiplier as needed
        fish.x += fish.direction === 'right'
          ? horizontalSpeedPx * deltaSeconds
          : -horizontalSpeedPx * deltaSeconds;

        // Update vertical position using sine wave for smooth up/down movement
        fish.verticalPhase += deltaSeconds * 0.8; // Speed of vertical oscillation
        const verticalOffset = Math.sin(fish.verticalPhase) * fish.verticalAmount * 5; // Adjust multiplier for range

        // Update wiggle effect
        fish.wigglePhase += deltaSeconds * 5; // Speed of wiggle
        const wiggleOffset = Math.sin(fish.wigglePhase) * fish.wiggleAmount * 10; // Adjust multiplier for range

        // Combine vertical movements
        fish.y = fish.originalY + verticalOffset + wiggleOffset;

        // Keep fish underwater and within bounds
        const fishTop = fish.y - fish.size / 2;
        const fishBottom = fish.y + fish.size / 2;

        if (fishTop < waterLine) {
          fish.y = waterLine + fish.size / 2;
          // Reset originalY and phase if hitting the surface? Optional.
          // fish.originalY = fish.y;
          // fish.verticalPhase = Math.PI / 2; // Start moving down
        } else if (fishBottom > this.canvas.height) {
          fish.y = this.canvas.height - fish.size / 2;
          // fish.originalY = fish.y;
          // fish.verticalPhase = -Math.PI / 2; // Start moving up
        }

        // Remove fish if far off-screen
        const margin = fish.size * 3; // Generous margin
        if ((fish.direction === 'right' && fish.x > this.canvas.width + margin) ||
            (fish.direction === 'left' && fish.x < -margin)) {
          this.fishes.splice(i, 1);

          // Add a new fish to replace it (optional, handled by general addFish logic too)
          // setTimeout(() => this.addFish(), 500 + Math.random() * 1000);
        }

        // Flip direction randomly sometimes
        if (Math.random() < 0.0001 * delta) {
            fish.direction = fish.direction === 'right' ? 'left' : 'right';
            fish.scaleX = fish.direction === 'left' ? -1 : 1;
        }
      }
    }

    updateBubbles(delta) {
      // Move bubbles and remove those that reach the top
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;

      for (let i = this.bubbles.length - 1; i >= 0; i--) {
        const bubble = this.bubbles[i];

        // Fade in
        if (bubble.opacity < bubble.maxOpacity) {
          bubble.opacity += 0.005 * delta; // Fade speed based on delta
          bubble.opacity = Math.min(bubble.opacity, bubble.maxOpacity); // Clamp
        }

        // Move upward
        bubble.y -= bubble.speedY * (delta / 16.67); // Adjust speed based on typical 60fps frame time

        // Apply horizontal drift
        bubble.x += bubble.driftX * (delta / 16.67);

        // Remove if above water surface or off-screen horizontally
        if (bubble.y < waterLine - bubble.size || // Check above waterline
            bubble.x < -bubble.size ||
            bubble.x > this.canvas.width + bubble.size) {
          this.bubbles.splice(i, 1);
        }
      }
    }

    updateMouseTrail(delta) {
      // Update trail points and splash droplets
      for (let i = this.mouseTrail.length - 1; i >= 0; i--) {
        const point = this.mouseTrail[i];
        point.age += delta;

        if (point.isSplash) {
          // Update splash droplet position with gravity
          point.speedY += point.gravity * (delta / 16.67); // Apply gravity based on delta
          point.x += point.speedX * (delta / 16.67);
          point.y += point.speedY * (delta / 16.67);

          // Fade out based on age/maxAge
          point.opacity = Math.max(0, 0.8 * (1 - point.age / point.maxAge));
        } else {
          // Regular trail points just fade out based on age
          point.opacity = Math.max(0, 0.5 * (1 - point.age / point.maxAge));
        }

        // Remove old points
        if (point.age >= point.maxAge || point.opacity <= 0) {
          this.mouseTrail.splice(i, 1);
        }
      }
    }

    render() {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw water body
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;

      // Draw waves
      if (this.wavePoints.length > 1) {
          this.ctx.beginPath();
          this.ctx.moveTo(0, this.canvas.height); // Bottom-left
          this.ctx.lineTo(0, this.wavePoints[0].y); // Start of wave

          // Draw curve through points (simple lineTo for now)
          for (let i = 1; i < this.wavePoints.length; i++) {
              // Could use quadraticCurveTo or bezierCurveTo for smoother waves
              // const xc = (this.wavePoints[i].x + this.wavePoints[i + 1].x) / 2;
              // const yc = (this.wavePoints[i].y + this.wavePoints[i + 1].y) / 2;
              // this.ctx.quadraticCurveTo(this.wavePoints[i].x, this.wavePoints[i].y, xc, yc);
               this.ctx.lineTo(this.wavePoints[i].x, this.wavePoints[i].y);
          }

          // Line to top-right corner at water level and then bottom-right
          this.ctx.lineTo(this.canvas.width, this.wavePoints[this.wavePoints.length - 1].y);
          this.ctx.lineTo(this.canvas.width, this.canvas.height);
          this.ctx.closePath();

          // Create gradient for water
          const gradient = this.ctx.createLinearGradient(0, waterLine, 0, this.canvas.height);
          gradient.addColorStop(0, 'rgba(137, 247, 254, 0.6)'); // Water surface slightly less opaque
          gradient.addColorStop(0.5, 'rgba(115, 200, 255, 0.7)'); // Mid color
          gradient.addColorStop(1, 'rgba(102, 166, 255, 0.8)'); // Water deep slightly more opaque

          this.ctx.fillStyle = gradient;
          this.ctx.fill();
      }


      // Draw fish
      for (const fish of this.fishes) {
        // Ensure image is valid before drawing
        if (!fish.img || !fish.img.complete || !fish.img.naturalWidth) continue;

        this.ctx.save();
        this.ctx.translate(fish.x, fish.y);
        this.ctx.scale(fish.scaleX, 1); // Apply horizontal flip

        // Draw fish image centered
        const aspectRatio = fish.img.naturalHeight / fish.img.naturalWidth;
        const width = fish.size;
        const height = fish.size * aspectRatio;
        try {
          this.ctx.drawImage(fish.img, -width / 2, -height / 2, width, height);
        } catch (e) {
            console.error("Error drawing fish image:", e, fish.img.src);
            // Skip drawing this fish if error occurs
        }

        this.ctx.restore();
      }

      // Draw bubbles
      this.ctx.fillStyle = `rgba(255, 255, 255, 0.7)`; // Base bubble color
      this.ctx.globalAlpha = 1; // Reset global alpha
      for (const bubble of this.bubbles) {
        this.ctx.beginPath();
        this.ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        this.ctx.globalAlpha = bubble.opacity; // Set alpha per bubble
        this.ctx.fill();
      }
      this.ctx.globalAlpha = 1; // Restore global alpha

      // Draw mouse trail
      this.ctx.fillStyle = `rgba(137, 247, 254, 1)`; // Trail color
      for (const point of this.mouseTrail) {
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, point.size / 2, 0, Math.PI * 2); // Use half size for radius
        this.ctx.globalAlpha = point.opacity;
        this.ctx.fill();
      }
       this.ctx.globalAlpha = 1; // Restore global alpha
    }

    animate(timestamp) {
      // Always request the next frame first
      this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));

      // Calculate elapsed time since last *frame*
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const elapsed = timestamp - this.lastTimestamp;
      this.lastTimestamp = timestamp;

      // Add elapsed time to accumulator
      this.timeAccumulator += elapsed;

      // --- Frame Rate Cap Logic ---
      // Update simulation state only when enough time has passed
      let updatesProcessed = 0;
      while (this.timeAccumulator >= this.TARGET_FRAME_TIME) {
          // Process one update step using the target frame time
          this.update(this.TARGET_FRAME_TIME);
          this.timeAccumulator -= this.TARGET_FRAME_TIME;
          updatesProcessed++;
          // Safety break to prevent infinite loop if performance is very low
          if (updatesProcessed > 5) {
              this.timeAccumulator = 0; // Reset accumulator
              console.warn("Canvas falling behind, resetting time accumulator.");
              break;
          }
      }
      // --- End Frame Rate Cap Logic ---

      // Render the current state (always runs)
      this.render();
    }

    start() {
      // Start animation loop if not already running
      if (!this.animationFrameId) {
          console.log("Starting Canvas Animation Loop (Target 30fps Update)");
          this.lastTimestamp = performance.now(); // Reset timestamp
          this.timeAccumulator = 0; // Reset accumulator
          this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));
      }
    }

    stop() {
      // Cancel the animation frame
      if (this.animationFrameId) {
        console.log("Stopping Canvas Animation Loop");
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      // Remove the canvas from the DOM
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }

      // Remove event listeners
      window.removeEventListener('resize', this.resize);
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('click', this.handleClick);
      // Note: Scroll listener is added/removed in script.js conditionally
    }
}