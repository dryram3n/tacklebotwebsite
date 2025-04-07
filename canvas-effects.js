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

       // --- START: Fish Click Reaction ---
       const clickRadius = 80; // How close a fish needs to be to react
       const dartSpeedMultiplier = 3; // How much faster they dart away
       const dartDuration = 700; // ms

       this.fishes.forEach(fish => {
           const dx = fish.x - e.clientX;
           const dy = fish.y - e.clientY;
           const distance = Math.sqrt(dx * dx + dy * dy);

           if (distance < clickRadius + fish.size / 2) {
               fish.state = 'darting';
               fish.stateTimer = dartDuration;
               // Calculate direction away from the click
               const angleAway = Math.atan2(dy, dx);
               fish.targetSpeed = fish.baseSpeed * dartSpeedMultiplier; // Dart faster
               // Aim slightly away from the click
               fish.targetDirectionAngle = angleAway + (Math.random() - 0.5) * 0.5; // Add some randomness
               // Determine general direction based on angle
               if (Math.abs(Math.cos(angleAway)) > Math.abs(Math.sin(angleAway))) {
                   // More horizontal escape
                   fish.direction = (Math.cos(angleAway) > 0) ? 'right' : 'left';
               } else {
                   // More vertical escape - try to stay horizontal if possible
                   fish.direction = (fish.x < this.canvas.width / 2) ? 'right' : 'left'; // Flee towards edge
               }
               fish.scaleX = fish.direction === 'left' ? -1 : 1;
               // Aim for a slightly different vertical position too
               fish.targetY = fish.y + Math.sin(angleAway) * 30 + (Math.random() - 0.5) * 20;
           }
       });
       // --- END: Fish Click Reaction ---
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
              // Start adding fish once a few images are loaded
              if (Object.keys(this.fishImages).length >= 3 && this.fishes.length === 0) {
                   this.createInitialFish();
              }
          };
          img.onerror = () => { console.error(`Failed to load fish image: ${key} at ${url}`); };
        }
      } else { console.error("FISH_IMAGES object not found. Cannot load fish images."); }
    }

    createInitialFish() {
      const fishCount = this.isLowPerfDevice ? 5 : (window.navigator.hardwareConcurrency >= 8 ? 15 : 10); // Reduced count slightly for performance
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
          // console.warn(`Image ${randomKey} not ready, retrying...`);
          setTimeout(() => this.addFish(), 100); // Retry if image not loaded
          return;
      }

      let size = 30 + Math.random() * 40;
      // Adjust size based on rarity/type (example)
      if (randomKey.includes("Mythic") || randomKey.includes("Legendary") || randomKey.includes("Chimerical") || randomKey.includes("Kraken") || randomKey.includes("Whale")) { size = 65 + Math.random() * 30; }
      else if (randomKey.includes("Rare") || randomKey.includes("Shark") || randomKey.includes("Sturgeon")) { size = 50 + Math.random() * 25; }
      if (this.isLowPerfDevice) size *= 0.8;

      const direction = Math.random() > 0.5 ? 'right' : 'left';
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
      const fishHeight = size * (img.naturalHeight / img.naturalWidth);
      const minY = waterLine + fishHeight / 2 + 5; // Add padding from surface
      const maxY = this.canvas.height - fishHeight / 2 - 5; // Add padding from bottom
      const startY = minY + Math.random() * (maxY - minY);
      const startX = direction === 'right' ? -size / 2 : this.canvas.width + size / 2;

      // --- START: New Fish Properties ---
      let baseSpeed = (40 - size * 0.3) * 0.05 * (0.8 + Math.random() * 0.4); // Base speed with some variance
      let currentSpeed = baseSpeed * (0.5 + Math.random() * 0.5); // Start at a random fraction of base speed
      let targetSpeed = currentSpeed;
      let verticalAmount = Math.random() * 6 + 2; // Vertical movement range
      let wiggleAmount = Math.random() * 0.3 + 0.2; // Tail wiggle intensity

      // Reduce effects for performance modes
      if (this.isLowPerfDevice) { baseSpeed *= 0.6; verticalAmount *= 0.5; wiggleAmount *= 0.5; }
      if (this.prefersReducedMotion) { verticalAmount = 0; wiggleAmount = 0; baseSpeed *= 0.5; currentSpeed = baseSpeed; targetSpeed = baseSpeed; }

      this.fishes.push({
        img: img, x: startX, y: startY, size: size,
        baseSpeed: baseSpeed, // Store base speed
        currentSpeed: currentSpeed,
        targetSpeed: targetSpeed,
        direction: direction,
        scaleX: direction === 'left' ? -1 : 1,
        targetY: startY, // Target vertical position
        verticalAmount: verticalAmount,
        wiggleAmount: wiggleAmount,
        wigglePhase: Math.random() * Math.PI * 2,
        state: 'swimming', // Initial state: swimming, pausing, darting
        stateTimer: 2000 + Math.random() * 3000, // Time until next state change (ms)
        targetDirectionAngle: null, // Used for darting/avoidance
        avoidanceVector: { x: 0, y: 0 }, // For fish interaction
        lastInteractionCheck: 0 // Throttle interaction checks
      });
      // --- END: New Fish Properties ---
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
      this.waterHeight += diff * 0.08; // Smooth transition
    }

    // --- START: Fish Interaction Logic ---
    updateFishInteractions(currentTimestamp) {
        const interactionRadius = 60; // How close fish need to be to interact
        const avoidanceStrength = 0.05; // How strongly they avoid
        const checkInterval = 100; // ms between checks per fish

        for (let i = 0; i < this.fishes.length; i++) {
            const fish1 = this.fishes[i];

            // Throttle checks for performance
            if (currentTimestamp - fish1.lastInteractionCheck < checkInterval) {
                continue;
            }
            fish1.lastInteractionCheck = currentTimestamp;
            fish1.avoidanceVector = { x: 0, y: 0 }; // Reset avoidance for this frame

            if (fish1.state === 'darting') continue; // Don't interact while darting

            for (let j = i + 1; j < this.fishes.length; j++) {
                const fish2 = this.fishes[j];
                if (fish2.state === 'darting') continue;

                const dx = fish2.x - fish1.x;
                const dy = fish2.y - fish1.y;
                const distanceSq = dx * dx + dy * dy; // Use squared distance for performance
                const combinedRadius = (fish1.size / 2 + fish2.size / 2) * 1.5; // Slightly larger than visual radius

                if (distanceSq < combinedRadius * combinedRadius) {
                    const distance = Math.sqrt(distanceSq);
                    const overlap = combinedRadius - distance;
                    if (distance > 0.01) { // Avoid division by zero
                        // Calculate vector pointing away from fish2
                        const avoidanceX = -(dx / distance) * overlap * avoidanceStrength;
                        const avoidanceY = -(dy / distance) * overlap * avoidanceStrength;

                        fish1.avoidanceVector.x += avoidanceX;
                        fish1.avoidanceVector.y += avoidanceY;
                        // Apply opposite vector to fish2
                        fish2.avoidanceVector.x -= avoidanceX;
                        fish2.avoidanceVector.y -= avoidanceY;
                    }
                }
            }
        }
    }
    // --- END: Fish Interaction Logic ---

    update(delta) {
      const currentTimestamp = performance.now();
      this.updateWaves(delta);
      if (!this.prefersReducedMotion) {
          this.updateFishInteractions(currentTimestamp); // Update interactions first
      }
      this.updateFish(delta); // Then update fish movement
      if (!this.prefersReducedMotion) { this.updateBubbles(delta); }
      if (!this.prefersReducedMotion) { this.updateMouseTrail(delta); }

      // Add new bubbles/fish periodically
      if (Math.random() < 0.001 * delta) { this.addBubble(); }
      const maxFish = this.isLowPerfDevice ? 5 : (window.navigator.hardwareConcurrency >= 8 ? 15 : 10);
      if (this.fishes.length < maxFish && Math.random() < 0.0001 * delta) { this.addFish(); }
      // Remove excess fish gradually
      if (this.fishes.length > maxFish + 2 && Math.random() < 0.0002 * delta) {
          // Fade out fish before removing
          const fishToRemove = this.fishes[0]; // Remove the oldest fish
          if (!fishToRemove.fadingOut) {
              fishToRemove.fadingOut = true;
              fishToRemove.stateTimer = 500; // Fade out duration
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
        // Simplified wave for reduced motion
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
      const lerpFactor = 0.05; // How quickly fish change speed/direction

      for (let i = this.fishes.length - 1; i >= 0; i--) {
        const fish = this.fishes[i];

        // Handle fading out fish
        if (fish.fadingOut) {
            fish.stateTimer -= delta;
            fish.opacity = Math.max(0, fish.stateTimer / 500); // Calculate opacity based on timer
            if (fish.stateTimer <= 0) {
                this.fishes.splice(i, 1);
                continue; // Skip rest of update for this fish
            }
        } else {
            fish.opacity = 1.0; // Ensure non-fading fish are fully opaque
        }


        // --- State Management ---
        fish.stateTimer -= delta;
        if (fish.stateTimer <= 0) {
            if (fish.state === 'darting') {
                fish.state = 'swimming'; // Return to swimming after darting
                fish.targetSpeed = fish.baseSpeed * (0.5 + Math.random() * 0.7); // Pick a new random speed
                fish.stateTimer = 3000 + Math.random() * 4000; // Time until next state change
                fish.targetDirectionAngle = null; // Clear darting angle
            } else if (fish.state === 'swimming') {
                // Chance to start pausing
                if (Math.random() < 0.2) {
                    fish.state = 'pausing';
                    fish.targetSpeed = fish.baseSpeed * (0.05 + Math.random() * 0.1); // Slow down significantly
                    fish.stateTimer = 1000 + Math.random() * 2000; // Pause duration
                } else {
                    // Continue swimming, pick new target speed and Y
                    fish.targetSpeed = fish.baseSpeed * (0.4 + Math.random() * 0.8);
                    fish.stateTimer = 3000 + Math.random() * 4000;
                    const fishHeight = fish.size * (fish.img.naturalHeight / fish.img.naturalWidth);
                    const minY = waterLine + fishHeight / 2 + 10;
                    const maxY = this.canvas.height - fishHeight / 2 - 10;
                    fish.targetY = minY + Math.random() * (maxY - minY); // Pick new target Y
                }
            } else if (fish.state === 'pausing') {
                fish.state = 'swimming';
                fish.targetSpeed = fish.baseSpeed * (0.5 + Math.random() * 0.7); // Speed up again
                fish.stateTimer = 3000 + Math.random() * 4000;
                // Maybe change direction after pausing
                if (Math.random() < 0.3) {
                    fish.direction = fish.direction === 'right' ? 'left' : 'right';
                    fish.scaleX = fish.direction === 'left' ? -1 : 1;
                }
            }
        }

        // Smoothly adjust current speed towards target speed
        fish.currentSpeed += (fish.targetSpeed - fish.currentSpeed) * lerpFactor;

        // --- Movement Calculation ---
        const fishWidth = fish.size;
        const fishHeight = fish.img.complete ? fish.size * (fish.img.naturalHeight / fish.img.naturalWidth) : fish.size;
        const horizontalSpeedPx = fish.currentSpeed * this.canvas.width * 0.1; // Speed relative to canvas width

        let moveX = (fish.direction === 'right' ? horizontalSpeedPx * deltaSeconds : -horizontalSpeedPx * deltaSeconds);
        let moveY = 0;

        // Apply avoidance vector
        if (!this.prefersReducedMotion && (fish.avoidanceVector.x !== 0 || fish.avoidanceVector.y !== 0)) {
             moveX += fish.avoidanceVector.x * deltaSeconds * 50; // Apply avoidance influence
             moveY += fish.avoidanceVector.y * deltaSeconds * 50;
             // Slightly adjust target Y based on avoidance
             fish.targetY += fish.avoidanceVector.y * 0.5;
        }

        // Apply darting direction if applicable
        if (fish.state === 'darting' && fish.targetDirectionAngle !== null) {
            const dartSpeedPx = fish.currentSpeed * this.canvas.width * 0.1;
            moveX = Math.cos(fish.targetDirectionAngle) * dartSpeedPx * deltaSeconds;
            moveY = Math.sin(fish.targetDirectionAngle) * dartSpeedPx * deltaSeconds;
        }

        // Update position
        fish.x += moveX;
        fish.y += moveY;

        // --- Vertical Movement & Boundaries ---
        const topWaterBoundary = waterLine + fishHeight / 2 + 5; // Add padding
        const bottomWaterBoundary = this.canvas.height - fishHeight / 2 - 5; // Add padding

        // Clamp targetY within bounds
        fish.targetY = Math.max(topWaterBoundary, Math.min(bottomWaterBoundary, fish.targetY));

        // Smoothly move towards targetY unless darting vertically
        if (!(fish.state === 'darting' && Math.abs(moveY) > 0.1)) {
             fish.y += (fish.targetY - fish.y) * lerpFactor * 0.5; // Slower vertical lerp
        }

        // Add subtle wiggle unless paused or reduced motion
        if (fish.state !== 'pausing' && !this.prefersReducedMotion) {
            fish.wigglePhase += deltaSeconds * (4 + fish.currentSpeed * 2); // Wiggle faster when moving faster
            const wiggleOffset = Math.sin(fish.wigglePhase) * fish.wiggleAmount * (fish.size * 0.1); // Wiggle relative to size
            fish.y += wiggleOffset;
        }

        // Final boundary clamp for Y
        fish.y = Math.max(topWaterBoundary, Math.min(bottomWaterBoundary, fish.y));

        // --- Horizontal Boundaries & Direction Change ---
        const leftBoundary = -fishWidth / 2; // Allow fish to go slightly off-screen
        const rightBoundary = this.canvas.width + fishWidth / 2;

        if (fish.x <= leftBoundary && fish.direction === 'left') {
            if (fish.state !== 'darting') { // Don't flip if darting off-screen
                fish.direction = 'right'; fish.scaleX = 1; fish.x = leftBoundary + 1;
            } else { this.fishes.splice(i, 1); continue; } // Remove if darted off-screen
        } else if (fish.x >= rightBoundary && fish.direction === 'right') {
             if (fish.state !== 'darting') {
                fish.direction = 'left'; fish.scaleX = -1; fish.x = rightBoundary - 1;
             } else { this.fishes.splice(i, 1); continue; }
        }

        // Random direction change chance (less frequent)
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
        // Fade in
        if (bubble.opacity < bubble.maxOpacity) {
            bubble.opacity += 0.005 * delta;
            bubble.opacity = Math.min(bubble.opacity, bubble.maxOpacity);
        }
        // Movement
        bubble.y -= bubble.speedY * (delta / 16.67); // Normalize speed to ~60fps
        bubble.x += bubble.driftX * (delta / 16.67);

        // Remove if off-screen or above water
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
          // Apply gravity and velocity for splash droplets
          point.speedY += point.gravity * (delta / 16.67); // Normalize
          point.x += point.speedX * (delta / 16.67);
          point.y += point.speedY * (delta / 16.67);
          point.opacity = Math.max(0, 0.8 * (1 - point.age / point.maxAge)); // Fade out
        } else {
          // Regular trail points just fade
          point.opacity = Math.max(0, 0.5 * (1 - point.age / point.maxAge));
        }

        // Remove if old or faded
        if (point.age >= point.maxAge || point.opacity <= 0) {
          this.mouseTrail.splice(i, 1);
        }
      }
    }

    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;

      // --- Render Water ---
      if (!this.prefersReducedMotion && this.wavePoints.length > 1) {
          // Dynamic wave rendering
          this.ctx.beginPath();
          this.ctx.moveTo(0, this.canvas.height);
          this.ctx.lineTo(0, this.wavePoints[0].y);
          for (let i = 1; i < this.wavePoints.length; i++) {
              // Could use quadraticCurveTo or bezierCurveTo for smoother waves if needed
              this.ctx.lineTo(this.wavePoints[i].x, this.wavePoints[i].y);
          }
          this.ctx.lineTo(this.canvas.width, this.wavePoints[this.wavePoints.length - 1].y);
          this.ctx.lineTo(this.canvas.width, this.canvas.height);
          this.ctx.closePath();

          const gradient = this.ctx.createLinearGradient(0, waterLine, 0, this.canvas.height);
          gradient.addColorStop(0, 'rgba(137, 247, 254, 0.6)'); // Surface color
          gradient.addColorStop(0.5, 'rgba(115, 200, 255, 0.7)'); // Mid color
          gradient.addColorStop(1, 'rgba(102, 166, 255, 0.8)'); // Deep color
          this.ctx.fillStyle = gradient;
          this.ctx.fill();
      } else {
          // Static water rendering (for reduced motion or if waves fail)
          const gradient = this.ctx.createLinearGradient(0, waterLine, 0, this.canvas.height);
          gradient.addColorStop(0, 'rgba(137, 247, 254, 0.6)');
          gradient.addColorStop(1, 'rgba(102, 166, 255, 0.8)');
          this.ctx.fillStyle = gradient;
          this.ctx.fillRect(0, waterLine, this.canvas.width, this.canvas.height - waterLine);
      }

      // --- Render Fish ---
      for (const fish of this.fishes) {
        if (!fish.img || !fish.img.complete || !fish.img.naturalWidth) continue; // Skip if image not loaded

        this.ctx.save();
        this.ctx.translate(fish.x, fish.y);
        this.ctx.scale(fish.scaleX, 1); // Handle direction flip

        const aspectRatio = fish.img.naturalHeight / fish.img.naturalWidth;
        const width = fish.size;
        const height = fish.size * aspectRatio;

        try {
          // Apply opacity for fading out fish
          this.ctx.globalAlpha = fish.opacity * (this.isLowPerfDevice ? 0.85 : 1.0);
          this.ctx.drawImage(fish.img, -width / 2, -height / 2, width, height);
        } catch (e) {
          console.error("Error drawing fish image:", e, fish.img.src);
          // Optionally draw a placeholder rectangle if image fails
          // this.ctx.fillStyle = 'red';
          // this.ctx.fillRect(-width / 2, -height / 2, width, height);
        }
        this.ctx.restore(); // Restore transform and alpha
      }
      this.ctx.globalAlpha = 1.0; // Reset global alpha

      // --- Render Bubbles ---
      if (!this.prefersReducedMotion) {
          this.ctx.fillStyle = `rgba(255, 255, 255, 0.7)`; // Base bubble color
          for (const bubble of this.bubbles) {
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, bubble.size / 2, 0, Math.PI * 2); // Use size/2 for radius
            this.ctx.globalAlpha = bubble.opacity; // Apply individual bubble opacity
            this.ctx.fill();
          }
          this.ctx.globalAlpha = 1; // Reset global alpha
      }

      // --- Render Mouse Trail ---
      if (!this.prefersReducedMotion) {
          this.ctx.fillStyle = `rgba(137, 247, 254, 1)`; // Trail color
          for (const point of this.mouseTrail) {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.size / 2, 0, Math.PI * 2); // Use size/2 for radius
            this.ctx.globalAlpha = point.opacity; // Apply individual point opacity
            this.ctx.fill();
          }
           this.ctx.globalAlpha = 1; // Reset global alpha
      }
    }

    animate(timestamp) {
      // Request next frame immediately
      this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));

      // Calculate elapsed time since last frame
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const elapsed = timestamp - this.lastTimestamp;
      this.lastTimestamp = timestamp;

      // --- Frame Rate Capping Logic ---
      this.timeAccumulator += elapsed;
      let updatesProcessed = 0;
      // Process updates in fixed steps if enough time has passed
      while (this.timeAccumulator >= this.TARGET_FRAME_TIME) {
          this.update(this.TARGET_FRAME_TIME); // Update with fixed delta
          this.timeAccumulator -= this.TARGET_FRAME_TIME;
          updatesProcessed++;
          // Safety break to prevent infinite loop if falling too far behind
          if (updatesProcessed > 5) {
              this.timeAccumulator = 0; // Reset accumulator
              console.warn("Canvas falling behind, resetting time accumulator.");
              break;
          }
      }

      // Render the current state
      this.render();
    }

    start() {
      if (!this.animationFrameId) {
          console.log("Starting Canvas Animation Loop (Target 30fps Update)");
          this.lastTimestamp = performance.now(); // Reset timestamp
          this.timeAccumulator = 0; // Reset accumulator
          this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));
      }
    }

    stop() {
      if (this.animationFrameId) {
        console.log("Stopping Canvas Animation Loop");
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      // Cleanup canvas and listeners
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