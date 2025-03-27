document.addEventListener('DOMContentLoaded', () => {

  // --- Water Background Effect (Further Optimized) ---
  function initWaterBackground() {
    const waterBody = document.querySelector('.water-body');
    const waterSurface = document.querySelector('.water-surface');
    const bubblesContainer = document.getElementById('bubbles-container');
    
    if (!waterBody || !waterSurface || !bubblesContainer) return;
    
    // Enhanced performance detection
    const isLowPerfDevice = window.matchMedia('(prefers-reduced-motion: reduce)').matches || 
                           !window.requestAnimationFrame ||
                           window.navigator.hardwareConcurrency < 4 ||
                           navigator.userAgent.match(/mobile|android/i); // Also detect mobile
    
    // Apply performance classes
    if (isLowPerfDevice) {
      document.body.classList.add('reduced-motion');
    }
    
    // Initial water level 
    waterBody.style.height = '50vh';
    waterSurface.style.bottom = '50vh';
    
    // Bubble pool optimization
    const bubblePool = [];
    const POOL_SIZE = isLowPerfDevice ? 5 : 10; // Further reduced pool size
    const BUBBLE_INTERVAL = isLowPerfDevice ? 1200 : 600; // Slower bubble creation
    
    // Create bubble pool
    for (let i = 0; i < POOL_SIZE; i++) {
      const bubble = document.createElement('div');
      bubble.classList.add('bubble');
      bubble.style.display = 'none';
      bubblesContainer.appendChild(bubble);
      bubblePool.push(bubble);
    }
    
    // Throttle scroll updates even more aggressively
    let lastScrollTime = 0;
    let targetWaterHeight = 50; 
    let currentWaterHeight = 50;
    
    // More aggressive scroll throttling
    const scrollThrottle = isLowPerfDevice ? 250 : 150; // ms between updates
    
    // Debounced scroll handler
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        const now = Date.now();
        if (now - lastScrollTime < scrollThrottle) return;
        
        lastScrollTime = now;
        const scrollPercentage = Math.min(1, window.scrollY / (document.body.scrollHeight - window.innerHeight));
        targetWaterHeight = 40 + (scrollPercentage * 45);
      }, 10);
    });
    
    // Capped at 30fps (33.33ms)
    let animationFrame;
    let lastAnimationTime = 0;
    const FRAME_DURATION = 33.33; // Explicit 30fps cap
    
    function updateWater(timestamp) {
      if (!lastAnimationTime) lastAnimationTime = timestamp;
      const elapsed = timestamp - lastAnimationTime;
      
      if (elapsed >= FRAME_DURATION) { // Only update at 30fps
        lastAnimationTime = timestamp;
        
        // Simple easing with minimal calculations
        currentWaterHeight += (targetWaterHeight - currentWaterHeight) * 0.08; // Slower easing
        
        // Only update DOM when change is significant (0.5vh)
        if (Math.abs(parseFloat(waterBody.style.height) - currentWaterHeight) > 0.5) {
          // Round to 1 decimal place to reduce precision calculations
          const heightValue = Math.round(currentWaterHeight * 10) / 10;
          waterBody.style.height = `${heightValue}vh`;
          waterSurface.style.bottom = `${heightValue}vh`;
        }
      }
      
      animationFrame = requestAnimationFrame(updateWater);
    }
    
    // Function to check if document is visible
    function isDocumentVisible() {
      return !document.hidden;
    }
    
    // Start animation if visible
    if (isDocumentVisible()) {
      animationFrame = requestAnimationFrame(updateWater);
    }
    
    // Get bubble from pool
    function getAvailableBubble() {
      for (const bubble of bubblePool) {
        if (bubble.style.display === 'none') {
          return bubble;
        }
      }
      return bubblePool[Math.floor(Math.random() * bubblePool.length)];
    }
    
    // Activate bubble with minimal calculations
    function activateBubble() {
      if (!isDocumentVisible()) return;
      
      const bubble = getAvailableBubble();
      
      // Simpler random properties
      const size = 5 + Math.floor(Math.random() * 10); // Integer sizes
      const xPos = Math.floor(Math.random() * 100); // Integer positions
      const driftX = Math.floor(-20 + Math.random() * 40); // Integer drift
      const riseDuration = 5 + Math.floor(Math.random() * 6); // Integer durations
      
      // Set all styles at once with minimal property changes
      bubble.style.cssText = `
        display: block;
        width: ${size}px;
        height: ${size}px;
        left: ${xPos}%;
        bottom: 0;
        animation: bubble-rise ${riseDuration}s ease-out forwards;
      `;
      
      bubble.style.setProperty('--drift-x', `${driftX}px`);
      
      // Reset bubble
      setTimeout(() => {
        bubble.style.display = 'none';
      }, riseDuration * 1000);
    }
    
    // Interval for bubble creation
    let bubbleInterval;
    
    function startBubbles() {
      if (bubbleInterval) clearInterval(bubbleInterval);
      bubbleInterval = setInterval(activateBubble, BUBBLE_INTERVAL);
      activateBubble();
    }
    
    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      if (isDocumentVisible()) {
        if (!animationFrame) {
          lastAnimationTime = 0;
          animationFrame = requestAnimationFrame(updateWater);
        }
        if (!bubbleInterval) {
          startBubbles();
        }
      } else {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
        if (bubbleInterval) {
          clearInterval(bubbleInterval);
          bubbleInterval = null;
        }
      }
    });
    
    // Start bubbles
    if (isDocumentVisible()) {
      startBubbles();
    }
    
    // Very limited click bubbles (only on desktops)
    if (!isLowPerfDevice && !navigator.userAgent.match(/mobile|android/i)) {
      document.addEventListener('click', (e) => {
        // Don't create bubbles for clicks on interactive elements
        if (e.target.closest('a, button, .button, input, select, textarea')) return;
        
        // Just one bubble per click
        const bubble = getAvailableBubble();
        if (!bubble) return;
        
        const size = 5 + Math.floor(Math.random() * 5);
        const xPercent = Math.floor(e.clientX / window.innerWidth * 100);
        
        bubble.style.cssText = `
          display: block;
          width: ${size}px;
          height: ${size}px;
          left: ${xPercent}%;
          bottom: ${currentWaterHeight}vh;
          animation: bubble-rise ${4}s ease-out forwards;
        `;
        
        bubble.style.setProperty('--drift-x', '0px');
        
        setTimeout(() => {
          bubble.style.display = 'none';
        }, 4000);
      });
    }
    
    // Clean up resources
    window.addEventListener('beforeunload', () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (bubbleInterval) clearInterval(bubbleInterval);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    });
  }
  
  // Initialize water background - ensure it runs on all pages
  initWaterBackground();

  // --- Swimming Fish Animation ---
  function initSwimmingFish() {
    const fishContainer = document.getElementById('fish-container');
    const waterBody = document.querySelector('.water-body');
    
    if (!fishContainer || !waterBody || typeof FISH_IMAGES === 'undefined') return;
    
    // Performance detection
    const isLowPerfDevice = window.matchMedia('(prefers-reduced-motion: reduce)').matches || 
                           !window.requestAnimationFrame ||
                           window.navigator.hardwareConcurrency < 4 ||
                           navigator.userAgent.match(/mobile|android/i);
    
    // Determine number of fish based on device performance
    const fishCount = isLowPerfDevice ? 3 : 
                     (window.navigator.hardwareConcurrency >= 8 ? 8 : 5);
    
    // Get available fish images
    const fishImageKeys = Object.keys(FISH_IMAGES);
    const fishImages = shuffleArray(fishImageKeys).slice(0, Math.min(fishCount * 2, fishImageKeys.length));
    
    // Current water height
    let currentWaterHeight = parseFloat(waterBody.style.height) || 50;
    
    // Tracking active fish for cleanup
    const activeFish = [];
    
    // Create initial fish
    for (let i = 0; i < fishCount; i++) {
      createFish();
    }
    
    // Create a fish with random properties
    function createFish() {
      if (!isDocumentVisible()) return;
      
      // Create fish element
      const fish = document.createElement('div');
      fish.className = 'swimming-fish';
      
      // Select random fish image
      const randomFishKey = fishImages[Math.floor(Math.random() * fishImages.length)];
      const fishImage = FISH_IMAGES[randomFishKey];
      
      // Create image element
      const img = document.createElement('img');
      img.src = fishImage;
      img.alt = randomFishKey;
      img.loading = 'lazy'; // Optimize loading
      fish.appendChild(img);
      
      // Random fish size based on rarity (assumed from the structure in fishImages.js)
      let size;
      if (randomFishKey.includes("Mythic") || randomFishKey.includes("Chimerical") || 
          randomFishKey.includes("Legendary") || fishImageKeys.indexOf(randomFishKey) > fishImageKeys.length * 0.7) {
        // Larger size for rare fish, but less common
        size = 45 + Math.floor(Math.random() * 30);
      } else {
        // Smaller size for common fish
        size = 20 + Math.floor(Math.random() * 25);
      }
      
      // Apply size with slight random variation
      fish.style.width = `${size}px`;
      fish.style.height = 'auto';
      
      // Random starting position (always in water)
      const startX = Math.random() * 100; // percent
      const waterHeightPercent = currentWaterHeight; // vh
      const startY = 100 - (Math.random() * (waterHeightPercent * 0.8)); // Keep fish in water
      
      fish.style.left = `${startX}vw`;
      fish.style.bottom = `${startY}vh`;
      
      // Initial swimming direction
      const direction = Math.random() > 0.5 ? 'right' : 'left';
      if (direction === 'left') {
        fish.classList.add('flip-horizontal');
      }
      
      // Set swimming speed (larger fish are slower)
      const speedFactor = isLowPerfDevice ? 0.3 : 1;
      const baseSpeed = (50 - size * 0.5) * speedFactor; // Smaller fish move faster
      const speed = Math.max(10, Math.min(30, baseSpeed));
      
      fish.dataset.speed = speed;
      fish.dataset.direction = direction;
      fish.dataset.verticalDirection = Math.random() > 0.5 ? 'up' : 'down';
      fish.dataset.verticalAmount = Math.random() * 10 + 5; // max vertical movement in vh
      fish.dataset.originalY = startY;
      
      // Add to container and tracking array
      fishContainer.appendChild(fish);
      activeFish.push(fish);
      
      // Start animation in the next frame (prevents layout thrashing)
      requestAnimationFrame(() => {
        animateFish(fish);
      });
      
      return fish;
    }
    
    // Fish animation logic - uses setTimeout for performance instead of RAF
    function animateFish(fish) {
      if (!isDocumentVisible() || !fish.isConnected) return;
      
      // Get current position
      const rect = fish.getBoundingClientRect();
      const fishX = rect.left;
      const fishWidth = rect.width;
      const viewportWidth = window.innerWidth;
      
      // Current direction and speed
      let direction = fish.dataset.direction;
      const speed = parseFloat(fish.dataset.speed);
      let verticalDirection = fish.dataset.verticalDirection;
      const verticalAmount = parseFloat(fish.dataset.verticalAmount);
      const originalY = parseFloat(fish.dataset.originalY);
      
      // Current position in viewport units
      const currentX = (fishX / viewportWidth) * 100;
      const currentBottomVh = parseFloat(fish.style.bottom);
      
      // Determine if fish needs to change horizontal direction
      if (direction === 'right' && currentX > 95) {
        direction = 'left';
        fish.classList.add('flip-horizontal');
      } else if (direction === 'left' && currentX < 0) {
        direction = 'right';
        fish.classList.remove('flip-horizontal');
      } else if (Math.random() < 0.01) { // Small chance to randomly change direction
        direction = direction === 'right' ? 'left' : 'right';
        if (direction === 'left') {
          fish.classList.add('flip-horizontal');
        } else {
          fish.classList.remove('flip-horizontal');
        }
      }
      
      // Determine if fish needs to change vertical direction
      if (verticalDirection === 'up' && (currentBottomVh > (originalY + verticalAmount))) {
        verticalDirection = 'down';
      } else if (verticalDirection === 'down' && (currentBottomVh < (originalY - verticalAmount))) {
        verticalDirection = 'up';
      } else if (Math.random() < 0.02) { // Small chance to randomly change vertical direction
        verticalDirection = verticalDirection === 'up' ? 'down' : 'up';
      }
      
      // Calculate new position
      const swimSpeed = (speed / (isLowPerfDevice ? 2 : 1)) * (Math.random() * 0.4 + 0.8); // Add slight randomness
      const newX = direction === 'right' ? currentX + swimSpeed * 0.1 : currentX - swimSpeed * 0.1;
      
      // Vertical movement (slower)
      const verticalSpeed = swimSpeed * 0.03;
      const newBottom = verticalDirection === 'up' ? 
                        currentBottomVh + verticalSpeed : 
                        currentBottomVh - verticalSpeed;
      
      // Update position
      fish.style.left = `${newX}vw`;
      fish.style.bottom = `${newBottom}vh`;
      
      // Save direction for next animation
      fish.dataset.direction = direction;
      fish.dataset.verticalDirection = verticalDirection;
      
      // Schedule next animation with throttled frame rate
      setTimeout(() => {
        if (fish.isConnected) {
          animateFish(fish);
        }
      }, isLowPerfDevice ? 100 : 33.33); // 30fps or 10fps for low-perf devices
    }
    
    // Watch for water level changes and adjust fish
    const adjustFishToWaterInterval = setInterval(() => {
      if (!waterBody || !isDocumentVisible()) return;
      
      // Get current water height
      const waterHeight = parseFloat(waterBody.style.height) || 50;
      
      // Only update if water height changed significantly
      if (Math.abs(waterHeight - currentWaterHeight) > 2) {
        currentWaterHeight = waterHeight;
        
        // Adjust existing fish positions if water level changed
        activeFish.forEach(fish => {
          if (!fish.isConnected) return;
          
          const bottomVh = parseFloat(fish.style.bottom);
          const originalY = parseFloat(fish.dataset.originalY);
          
          // If fish would be out of water, update its original Y position
          if (100 - bottomVh > waterHeight * 0.9) {
            const newY = 100 - (Math.random() * (waterHeight * 0.8));
            fish.style.bottom = `${newY}vh`;
            fish.dataset.originalY = newY;
          }
        });
      }
    }, 1000); // Check every second
    
    // Periodically replace fish
    const fishRefreshInterval = setInterval(() => {
      if (!isDocumentVisible()) return;
      
      // Remove a random fish and create a new one
      if (activeFish.length > 0 && Math.random() < 0.3) {
        const index = Math.floor(Math.random() * activeFish.length);
        const fishToRemove = activeFish[index];
        
        if (fishToRemove && fishToRemove.isConnected) {
          // Fade out
          fishToRemove.style.opacity = '0';
          fishToRemove.style.transition = 'opacity 1s ease-out';
          
          // Remove after fade
          setTimeout(() => {
            if (fishToRemove.isConnected) {
              fishToRemove.remove();
            }
            
            // Remove from active fish array
            const arrayIndex = activeFish.indexOf(fishToRemove);
            if (arrayIndex > -1) {
              activeFish.splice(arrayIndex, 1);
            }
            
            // Add a new fish if document is visible
            if (isDocumentVisible()) {
              createFish();
            }
          }, 1000);
        }
      }
    }, isLowPerfDevice ? 15000 : 8000); // Refresh fish less often on low-perf devices
    
    // Clean up resources
    window.addEventListener('beforeunload', () => {
      clearInterval(adjustFishToWaterInterval);
      clearInterval(fishRefreshInterval);
      activeFish.length = 0; // Clear array
    });
    
    // Helper function to shuffle array
    function shuffleArray(array) {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    }
    
    // Check document visibility
    function isDocumentVisible() {
      return !document.hidden;
    }
  }
  
  // Initialize swimming fish (after water background)
  setTimeout(() => {
    initSwimmingFish();
  }, 1000); // Delay to ensure water background is initialized first

  // --- Button Ripple Effect ---
  const buttons = document.querySelectorAll('.button');

  buttons.forEach(button => {
    // Using mousedown instead of click to capture both left and right clicks
    button.addEventListener('mousedown', function (e) {
      // Get click coordinates relative to the button
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Remove existing ripples if any (optional, prevents multiple rapid clicks)
      const existingRipple = button.querySelector('.ripple');
      if (existingRipple) {
        existingRipple.remove();
      }

      // Create the ripple element
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      // Append, animate, and remove
      this.appendChild(ripple);

      // Clean up the ripple element after animation
      ripple.addEventListener('animationend', () => {
        ripple.remove();
      });
    });
  });

  // --- Enhanced Water Trail Effect ---
  const trail = document.getElementById('mouse-trail');
  if (trail) {
    // Remove any text content from the trail element
    trail.textContent = '';
    
    // Initialize cursor position (using clientX/Y directly for immediate response)
    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;
    let trailDroplets = [];
    
    // Track mouse position directly
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    
    // Use requestAnimationFrame for smooth animation
    function animateTrail() {
      // Smoother following with easing
      trailX += (mouseX - trailX) * 0.3;
      trailY += (mouseY - trailY) * 0.3;
      
      if (trail) {
        trail.style.left = `${trailX}px`;
        trail.style.top = `${trailY}px`;
        trail.style.opacity = '0.8';
        
        // Create occasional smaller droplets for trail effect
        if (Math.random() > 0.85) {
          createTrailDroplet(trailX, trailY);
        }
      }
      
      requestAnimationFrame(animateTrail);
    }
    
    // Start the animation loop
    animateTrail();

    // Fade out when mouse stops
    let isMoving = false;
    let fadeTimeout;
    
    document.addEventListener('mousemove', () => {
      isMoving = true;
      if (trail) {
        trail.style.opacity = '0.8';
      }
      
      clearTimeout(fadeTimeout);
      fadeTimeout = setTimeout(() => {
        isMoving = false;
        if (trail) {
          trail.style.opacity = '0';
        }
      }, 150);
    });

    // Water splash effect on any mouse button click
    document.addEventListener('mousedown', (e) => {
      if (trail) {
        // Squish the water droplet
        trail.style.transform = 'translate(-50%, -50%) scale(0.6) rotate(45deg)';
        
        // Create water splash at exact mouse position (not trail position)
        createWaterSplash(e.clientX, e.clientY);
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (trail) {
        // Return to normal size with slight bounce
        trail.style.transform = 'translate(-50%, -50%) scale(1.1) rotate(45deg)';
        setTimeout(() => {
          trail.style.transform = 'translate(-50%, -50%) scale(1) rotate(45deg)';
        }, 150);
      }
    });
    
    // Create smaller droplets that follow the cursor path
    function createTrailDroplet(x, y) {
      const droplet = document.createElement('div');
      droplet.className = 'trail-droplet';
      droplet.style.left = `${x + (Math.random() * 10 - 5)}px`;
      droplet.style.top = `${y + (Math.random() * 10 - 5)}px`;
      droplet.style.width = `${4 + Math.random() * 6}px`;
      droplet.style.height = droplet.style.width;
      
      document.body.appendChild(droplet);
      
      // Remove droplet after animation completes
      setTimeout(() => {
        if (droplet && droplet.parentNode) {
          droplet.parentNode.removeChild(droplet);
        }
      }, 800);
    }
    
    // Create water splash effect on click
    function createWaterSplash(x, y) {
      const splash = document.createElement('div');
      splash.className = 'water-splash';
      splash.style.left = `${x}px`;
      splash.style.top = `${y}px`;
      document.body.appendChild(splash);
      
      // Create multiple droplets in different directions
      const dropletCount = 12; // Increased number of droplets
      for (let i = 0; i < dropletCount; i++) {
        const droplet = document.createElement('div');
        droplet.className = 'splash-droplet';
        
        // Randomize sizes for more natural look
        const size = 5 + Math.random() * 10;
        droplet.style.width = `${size}px`;
        droplet.style.height = `${size}px`;
        
        // Calculate random distance and angle for splashing
        const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() * 0.5);
        const distance = 20 + Math.random() * 40;
        const splashX = Math.cos(angle) * distance;
        const splashY = Math.sin(angle) * distance;
        
        // Set custom properties for the animation
        droplet.style.setProperty('--splash-x', `${splashX}px`);
        droplet.style.setProperty('--splash-y', `${splashY}px`);
        
        splash.appendChild(droplet);
      }
      
      // Remove splash element after animation completes
      setTimeout(() => {
        if (splash && splash.parentNode) {
          splash.parentNode.removeChild(splash);
        }
      }, 600);
    }
    
    // Make sure cursor is visible initially by setting it at current mouse position
    document.dispatchEvent(new MouseEvent('mousemove', {
      clientX: window.innerWidth / 2,
      clientY: window.innerHeight / 2
    }));
  }

  // --- Fade-in Sections on Scroll ---
  const animatedSections = document.querySelectorAll('.animated-section');

  const observerOptions = {
    root: null, // relative to the viewport
    rootMargin: '0px',
    threshold: 0.15 // Trigger a bit later
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Stop observing the element once it's visible
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Start observing each section
  animatedSections.forEach(section => {
    observer.observe(section);
  });

  // --- Smooth Scrolling for Nav Links ---
  document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      // Prevent default only if it's an internal link starting with # and has more characters
      if (href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        const targetElement = document.querySelector(href);
        if (targetElement) {
          // Calculate offset for sticky header if needed
          const headerOffset = document.querySelector('header')?.offsetHeight || 80; // Get header height or default
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }
      // Allow default behavior for external links or simple '#' links
    });
  });

  // --- Placeholder for Invite/Support Links ---
  const inviteButtons = document.querySelectorAll('.invite-button');
  const supportButton = document.querySelector('.support-button');

  // --- IMPORTANT: REPLACE THESE PLACEHOLDER LINKS ---
  const discordInviteLink = "https://discord.com/oauth2/authorize?client_id=1354018504470298624";
  const discordSupportLink = "https://discord.gg/6TxYjeQcXg ";
  // --- IMPORTANT: REPLACE THESE PLACEHOLDER LINKS ---


  inviteButtons.forEach(button => {
    if (button.getAttribute('href') === '#' || !button.getAttribute('href')) {
      button.href = discordInviteLink;
      button.target = "_blank";
      button.rel = "noopener noreferrer";
    }
  });

  if (supportButton) {
    if (supportButton.getAttribute('href') === '#' || !supportButton.getAttribute('href')) {
      supportButton.href = discordSupportLink;
      supportButton.target = "_blank";
      supportButton.rel = "noopener noreferrer";
    }
  }

  // --- Toggle Legal Section Expandable Content ---
  const expandButtons = document.querySelectorAll('.expand-btn');
  
  expandButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Get the next sibling element (the expanded content div)
      const expandedContent = this.nextElementSibling;
      
      // Toggle display
      if (expandedContent.style.display === 'block') {
        expandedContent.style.display = 'none';
        this.textContent = this.textContent.replace('Hide', 'View');
        this.textContent = this.textContent.replace('-', '+');
      } else {
        expandedContent.style.display = 'block';
        this.textContent = this.textContent.replace('View', 'Hide');
        this.textContent = this.textContent.replace('+', '-');
      }
    });
  });

}); // End DOMContentLoaded