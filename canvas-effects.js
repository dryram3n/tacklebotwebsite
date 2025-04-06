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
    
    // Resize handler
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Mouse tracking for trail effect
    this.mousePos = { x: 0, y: 0 };
    window.addEventListener('mousemove', (e) => {
      this.mousePos = { x: e.clientX, y: e.clientY };
      this.addTrailPoint();
    });
    
    window.addEventListener('click', (e) => {
      this.createSplash(e.clientX, e.clientY);
    });
    
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
  
  initWavePoints() {
    // Create points for wave animation
    this.wavePoints = [];
    const pointCount = Math.ceil(this.canvas.width / 20); // Point every 20px
    
    for (let i = 0; i < pointCount; i++) {
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
        this.fishImages[key] = img;
      }
    }
    
    // Create initial fish
    this.createInitialFish();
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
    if (keys.length === 0) return;
    
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const img = this.fishImages[randomKey];
    
    // Size based on fish type
    let size = 30 + Math.random() * 40;
    if (randomKey.includes("Mythic") || randomKey.includes("Legendary")) {
      size = 65 + Math.random() * 30;
    }
    
    // Starting position
    const direction = Math.random() > 0.5 ? 'right' : 'left';
    const startX = direction === 'right' ? -size : this.canvas.width + size;
    const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
    const startY = waterLine + Math.random() * (this.canvas.height - waterLine - size);
    
    // Speed and movement properties
    const speed = (40 - size * 0.3) * 0.05;
    
    this.fishes.push({
      img: img,
      x: startX,
      y: startY,
      size: size,
      speed: speed,
      direction: direction,
      scaleX: direction === 'left' ? -1 : 1,
      verticalDirection: Math.random() > 0.5 ? 'up' : 'down',
      verticalAmount: Math.random() * 5 + 2,
      originalY: startY,
      wiggleAmount: Math.random() * 0.4 + 0.3,
      wigglePhase: Math.random() * Math.PI * 2
    });
  }
  
  addBubble(x, y) {
    // Add a bubble at the given position
    const size = 5 + Math.random() * 10;
    const speedY = 1 + Math.random() * 2;
    const driftX = -20 + Math.random() * 40;
    
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
      size: 8,
      opacity: 0.5,
      age: 0
    });
    
    // Limit trail length
    if (this.mouseTrail.length > 20) {
      this.mouseTrail.shift();
    }
  }
  
  createSplash(x, y) {
    // Create splash effect with multiple droplets
    const dropletCount = 8 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < dropletCount; i++) {
      const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() * 0.5 - 0.25);
      const distance = 20 + Math.random() * 40;
      const speedX = Math.cos(angle) * distance / 20;
      const speedY = Math.sin(angle) * distance / 20;
      
      this.mouseTrail.push({
        x: x,
        y: y,
        size: 5 + Math.random() * 6,
        opacity: 0.7,
        age: 0,
        speedX: speedX,
        speedY: speedY,
        gravity: 0.2,
        isSplash: true
      });
    }
  }
  
  updateWaterHeight(targetHeight) {
    // Smoothly update water height
    const diff = targetHeight - this.waterHeight;
    this.waterHeight += diff * 0.08;
  }
  
  update(timestamp) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const elapsed = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    
    // Update waves
    this.updateWaves(elapsed);
    
    // Update fish positions
    this.updateFish(elapsed);
    
    // Update bubbles
    this.updateBubbles(elapsed);
    
    // Update mouse trail
    this.updateMouseTrail(elapsed);
    
    // Occasionally add bubbles
    if (Math.random() < 0.1) {
      this.addBubble();
    }
    
    // Occasionally add/remove fish
    if (Math.random() < 0.005) {
      this.addFish();
    }
    
    if (this.fishes.length > 12 && Math.random() < 0.01) {
      this.fishes.shift();
    }
  }
  
  updateWaves(elapsed) {
    // Animate wave points
    const waveTime = performance.now() * 0.001;
    const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
    
    for (let i = 0; i < this.wavePoints.length; i++) {
      const point = this.wavePoints[i];
      const xFactor = i / this.wavePoints.length;
      
      // Calculate wave height using sine functions
      point.y = waterLine + 
                Math.sin(waveTime * 0.5 + xFactor * 10) * 5 + 
                Math.sin(waveTime * 0.3 + xFactor * 20) * 3;
    }
  }
  
  updateFish(elapsed) {
    // Move fish and remove those that are off-screen
    const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
    
    for (let i = this.fishes.length - 1; i >= 0; i--) {
      const fish = this.fishes[i];
      const elapsedSeconds = elapsed / 1000;
      
      // Update horizontal position
      fish.x += fish.direction === 'right' 
        ? fish.speed * this.canvas.width * elapsedSeconds 
        : -fish.speed * this.canvas.width * elapsedSeconds;
      
      // Update vertical position with wiggle
      const wiggle = Math.sin(performance.now() * 0.002 + fish.wigglePhase) * fish.wiggleAmount * 20;
      
      if (fish.verticalDirection === 'up') {
        fish.y = fish.originalY - Math.sin(performance.now() * 0.001) * fish.verticalAmount * 10;
      } else {
        fish.y = fish.originalY + Math.sin(performance.now() * 0.001) * fish.verticalAmount * 10;
      }
      
      fish.y += wiggle;
      
      // Remove fish if off-screen
      const margin = fish.size * 2;
      if ((fish.direction === 'right' && fish.x > this.canvas.width + margin) ||
          (fish.direction === 'left' && fish.x < -margin)) {
        this.fishes.splice(i, 1);
        
        // Add a new fish to replace it
        setTimeout(() => this.addFish(), 500);
      }
      
      // Keep fish underwater
      if (fish.y < waterLine + fish.size / 2) {
        fish.y = waterLine + fish.size / 2;
        fish.verticalDirection = 'down';
      }
      
      if (fish.y > this.canvas.height - fish.size / 2) {
        fish.y = this.canvas.height - fish.size / 2;
        fish.verticalDirection = 'up';
      }
    }
  }
  
  updateBubbles(elapsed) {
    // Move bubbles and remove those that reach the top
    const waterLine = (100 - this.waterHeight) * this.canvas.height / 100;
    
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const bubble = this.bubbles[i];
      
      // Fade in
      if (bubble.opacity < bubble.maxOpacity) {
        bubble.opacity += 0.05;
      }
      
      // Move upward
      bubble.y -= bubble.speedY;
      
      // Apply horizontal drift
      bubble.x += bubble.driftX * 0.01;
      
      // Remove if above water surface or off-screen
      if (bubble.y < waterLine || 
          bubble.x < -bubble.size || 
          bubble.x > this.canvas.width + bubble.size) {
        this.bubbles.splice(i, 1);
      }
    }
  }
  
  updateMouseTrail(elapsed) {
    // Update trail points and splash droplets
    for (let i = this.mouseTrail.length - 1; i >= 0; i--) {
      const point = this.mouseTrail[i];
      point.age += elapsed;
      
      if (point.isSplash) {
        // Update splash droplet position with gravity
        point.x += point.speedX * elapsed * 0.1;
        point.speedY += point.gravity;
        point.y += point.speedY * elapsed * 0.1;
        
        // Fade out faster for splash
        point.opacity -= 0.01 * elapsed;
      } else {
        // Regular trail points just fade out
        point.opacity -= 0.003 * elapsed;
      }
      
      // Remove old points
      if (point.opacity <= 0) {
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
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height);
    this.ctx.lineTo(0, this.wavePoints[0]?.y || waterLine);
    
    for (let i = 0; i < this.wavePoints.length; i++) {
      this.ctx.lineTo(this.wavePoints[i].x, this.wavePoints[i].y);
    }
    
    this.ctx.lineTo(this.canvas.width, waterLine);
    this.ctx.lineTo(this.canvas.width, this.canvas.height);
    this.ctx.closePath();
    
    // Create gradient for water
    const gradient = this.ctx.createLinearGradient(0, waterLine, 0, this.canvas.height);
    gradient.addColorStop(0, 'rgba(137, 247, 254, 0.5)'); // Water surface
    gradient.addColorStop(1, 'rgba(102, 166, 255, 0.7)'); // Water deep
    
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    
    // Draw fish
    for (const fish of this.fishes) {
      this.ctx.save();
      this.ctx.translate(fish.x, fish.y);
      this.ctx.scale(fish.scaleX, 1);
      
      // Draw fish image
      const width = fish.size;
      const height = fish.size * (fish.img.height / fish.img.width);
      this.ctx.drawImage(fish.img, -width/2, -height/2, width, height);
      
      this.ctx.restore();
    }
    
    // Draw bubbles
    for (const bubble of this.bubbles) {
      this.ctx.beginPath();
      this.ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity})`;
      this.ctx.fill();
    }
    
    // Draw mouse trail
    for (const point of this.mouseTrail) {
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(137, 247, 254, ${point.opacity})`;
      this.ctx.fill();
    }
  }
  
  animate(timestamp) {
    this.update(timestamp);
    this.render();
    
    this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));
  }
  
  start() {
    // Start animation loop
    requestAnimationFrame((ts) => this.animate(ts));
  }
  
  stop() {
    // Cancel the animation frame
    if (this.animationFrameId) {
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
    window.removeEventListener('scroll', this.handleScroll);
  }
}

// Initialize and start when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const waterCanvas = new WaterCanvas();
  waterCanvas.start();
  
  // Remove original water elements since canvas now handles them
  const originalWaterElements = [
    document.getElementById('water-background'),
    document.getElementById('bubbles-container'),
    document.getElementById('fish-container'),
    document.getElementById('mouse-trail')
  ];
  
  // Only remove if canvas is working
  setTimeout(() => {
    originalWaterElements.forEach(el => {
      if (el) el.style.display = 'none';
    });
  }, 1000);
  
  // Update water height based on scroll position
  window.addEventListener('scroll', () => {
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = scrollMax > 0 ? Math.min(1, window.scrollY / scrollMax) : 0;
    
    // Target height based on scroll (40vh at top to 85vh at bottom)
    const targetHeight = 40 + (scrollPercentage * 45);
    waterCanvas.updateWaterHeight(targetHeight);
  });
});

// Add to the DOMContentLoaded section at the bottom of the file:
document.addEventListener('DOMContentLoaded', () => {
  // Check if canvas should be used (matches check in script.js)
  const isLowPerfDevice = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
                         !('requestAnimationFrame' in window) || 
                         (window.navigator.hardwareConcurrency && window.navigator.hardwareConcurrency < 4) || 
                         navigator.userAgent.match(/mobile|android/i);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!isLowPerfDevice && !prefersReducedMotion) {
    try {
      const waterCanvas = new WaterCanvas();
      waterCanvas.canvas.classList.add('water-effects-canvas');
      waterCanvas.start();
      
      // Add class to body to indicate canvas is active
      document.body.classList.add('using-canvas');
      
      // Hide original water elements
      setTimeout(() => {
        const originalWaterElements = [
          document.getElementById('water-background'),
          document.getElementById('bubbles-container'),
          document.getElementById('fish-container'),
          document.getElementById('mouse-trail')
        ];
        
        originalWaterElements.forEach(el => {
          if (el) el.style.display = 'none';
        });
      }, 500);
      
      // Listen for reduced motion changes
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        if (e.matches) {
          // User now prefers reduced motion
          document.body.classList.remove('using-canvas');
          document.body.classList.add('canvas-failed');
          waterCanvas.stop(); // Add a stop method to your WaterCanvas class
        }
      });
    } catch (err) {
      console.error('Error initializing canvas effects:', err);
      document.body.classList.remove('using-canvas');
      document.body.classList.add('canvas-failed');
    }
  }
});