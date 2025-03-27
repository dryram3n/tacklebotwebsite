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

    // DEBUG: Check if container exists and is accessible
    if (fishContainer) {
      console.log("Fish container found, proceeding with fish animation");
    } else {
      console.error("Fish container not found!");
    }

    if (!fishContainer || !waterBody) {
      console.error('Missing elements for fish animation');
      return;
    }

    // Check if FISH_IMAGES is loaded
    if (typeof FISH_IMAGES === 'undefined') {
      console.error('Fish images not loaded. Make sure fishImages.js is properly loaded before script.js');
      return;
    } else {
      console.log(`Loaded ${Object.keys(FISH_IMAGES).length} fish images`);
    }

    // Performance detection
    const isLowPerfDevice = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
                           !window.requestAnimationFrame ||
                           window.navigator.hardwareConcurrency < 4 ||
                           navigator.userAgent.match(/mobile|android/i);

    // Determine number of fish based on device performance - increase minimum
    const fishCount = isLowPerfDevice ? 3 :
                     (window.navigator.hardwareConcurrency >= 8 ? 8 : 5);

    console.log(`Creating ${fishCount} fish for animation`);

    // Get available fish images - pick from start of array to ensure we get some
    const fishImageKeys = Object.keys(FISH_IMAGES);
    const fishImages = fishImageKeys.slice(0, Math.min(fishCount * 5, fishImageKeys.length));

    // Current water height
    let currentWaterHeight = parseFloat(waterBody.style.height) || 50;

    // Tracking active fish for cleanup
    const activeFish = [];

    // Create initial fish with staggered delay
    for (let i = 0; i < fishCount; i++) {
      setTimeout(() => {
        const newFish = createFish();
        console.log(`Created fish #${i+1} - ${newFish ? 'success' : 'failed'}`);
      }, i * 300); // Shorter intervals
    }

    // Create a fish with random properties
    function createFish() {
      if (!isDocumentVisible()) return null;

      try {
        // Create fish element
        const fish = document.createElement('div');
        fish.className = 'swimming-fish';

        // Ensure we select a valid fish
        const randomIndex = Math.floor(Math.random() * fishImages.length);
        const randomFishKey = fishImages[randomIndex];

        if (!randomFishKey) {
          console.error('Invalid fish key selected');
          return null;
        }

        const fishImageUrl = FISH_IMAGES[randomFishKey];

        if (!fishImageUrl) {
          console.error(`No image URL found for fish: ${randomFishKey}`);
          return null;
        }

        console.log(`Creating fish: ${randomFishKey} with URL: ${fishImageUrl.substring(0, 50)}...`);

        // Create image element
        const img = document.createElement('img');
        img.crossOrigin = "anonymous"; // Try to avoid CORS issues
        img.src = fishImageUrl;
        img.alt = randomFishKey;
        img.loading = 'lazy';

        // Ensure image is loaded before adding to DOM
        img.onload = function() {
          console.log(`Fish image loaded: ${randomFishKey}`);
        };

        img.onerror = function() {
          console.error(`Failed to load fish image: ${randomFishKey}`);
          // Try a different fish if this one fails
          const fallbackIndex = (randomIndex + 1) % fishImages.length;
          const fallbackKey = fishImages[fallbackIndex];
          const fallbackUrl = FISH_IMAGES[fallbackKey];
          console.log(`Trying fallback fish: ${fallbackKey}`);

          if (fallbackUrl) {
            img.src = fallbackUrl;
          } else {
            // Last resort fallback to a known working image
            img.src = "https://cdn.discordapp.com/attachments/1349726808488153168/1349728486880710666/Carp.png?ex=67d4281c&is=67d2d69c&hm=a080decf34c81199424c78c1af8ad50db2e9b6d26e76d5c5bfe27fbdeca7f48e&";
          }
        };

        fish.appendChild(img);

        // Random fish size - make them more visible
        let size;
        if (randomFishKey.includes("Mythic") || randomFishKey.includes("Chimerical") ||
            randomFishKey.includes("Legendary") || fishImageKeys.indexOf(randomFishKey) > fishImageKeys.length * 0.7) {
          // Larger size for rare fish, but less common
          size = 65 + Math.floor(Math.random() * 30);
        } else {
          // Smaller size for common fish
          size = 40 + Math.floor(Math.random() * 25);
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

        // Set swimming speed (larger fish are much slower) - GREATLY REDUCED SPEEDS
        const speedFactor = isLowPerfDevice ? 0.1 : 0.2; // 5x slower than before
        const baseSpeed = (40 - size * 0.3) * speedFactor; // Smaller fish move faster but still slow
        const speed = Math.max(1, Math.min(10, baseSpeed)); // Much lower speed range

        fish.dataset.speed = speed;
        fish.dataset.direction = direction;
        fish.dataset.verticalDirection = Math.random() > 0.5 ? 'up' : 'down';
        fish.dataset.verticalAmount = Math.random() * 6 + 2; // Reduced vertical movement
        fish.dataset.originalY = startY;
        fish.dataset.wiggleAmount = Math.random() * 0.5 + 0.5; // Random wiggle amount
        fish.dataset.wigglePhase = Math.random() * Math.PI * 2; // Random wiggle phase

        // Add to container and tracking array
        fishContainer.appendChild(fish);
        console.log(`Fish added to container. Current count: ${fishContainer.children.length}`);
        activeFish.push(fish);

        // Start animation in the next frame (prevents layout thrashing)
        requestAnimationFrame(() => {
          animateFish(fish);
        });

        return fish;
      } catch (err) {
        console.error("Error creating fish:", err);
        return null;
      }
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
      const wiggleAmount = parseFloat(fish.dataset.wiggleAmount || 0.5);
      let wigglePhase = parseFloat(fish.dataset.wigglePhase || 0);

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
      } else if (Math.random() < 0.001) { // Much lower chance to randomly change direction
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
      } else if (Math.random() < 0.005) { // Much lower chance to randomly change vertical direction
        verticalDirection = verticalDirection === 'up' ? 'down' : 'up';
      }

      // Update wiggle phase
      wigglePhase += 0.05; // Slow phase change
      fish.dataset.wigglePhase = wigglePhase;

      // Add wiggle effect to vertical movement (sine wave)
      const wiggle = Math.sin(wigglePhase) * wiggleAmount;

      // Calculate new position (MUCH SLOWER MOVEMENT)
      const swimSpeed = speed * (0.7 + Math.random() * 0.3) * 0.02; // 50x slower + slight randomness
      const newX = direction === 'right' ? currentX + swimSpeed : currentX - swimSpeed;

      // Very slow vertical movement
      const verticalSpeed = swimSpeed * 0.3;
      const verticalOffset = verticalDirection === 'up' ?
                        verticalSpeed : -verticalSpeed;
      const newBottom = currentBottomVh + verticalOffset + wiggle * 0.01;

      // Update position
      fish.style.left = `${newX}vw`;
      fish.style.bottom = `${newBottom}vh`;

      // Save direction for next animation
      fish.dataset.direction = direction;
      fish.dataset.verticalDirection = verticalDirection;

      // Schedule next animation with much longer delays (much slower animation)
      const animationDelay = isLowPerfDevice ? 250 : 100; // 3-7.5x slower than before

      setTimeout(() => {
        if (fish.isConnected) {
          animateFish(fish);
        }
      }, animationDelay);
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

          // If fish would be out of water, update its original Y position
          if (100 - bottomVh > waterHeight * 0.9) {
            const newY = 100 - (Math.random() * (waterHeight * 0.8));
            fish.style.bottom = `${newY}vh`;
            fish.dataset.originalY = newY;
          }
        });
      }
    }, 2000); // Check less frequently

    // Periodically replace fish (much less frequently)
    const fishRefreshInterval = setInterval(() => {
      if (!isDocumentVisible()) return;

      // Remove a random fish and create a new one
      if (activeFish.length > 0 && Math.random() < 0.2) { // Lower chance
        const index = Math.floor(Math.random() * activeFish.length);
        const fishToRemove = activeFish[index];

        if (fishToRemove && fishToRemove.isConnected) {
          // Fade out
          fishToRemove.style.opacity = '0';
          fishToRemove.style.transition = 'opacity 2s ease-out'; // Slower fade

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
          }, 2000); // Longer fade time
        }
      }
    }, isLowPerfDevice ? 30000 : 20000); // Much less frequent replacements

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

  // --- Calculator Logic ---
  const calcContainer = document.getElementById('calculator');

  if (calcContainer) {
    // --- Constants (Copied from .txt files) ---
    // It's better if these were actual JS modules, but copying for now
    const SHOP_UPGRADES = {
        luck: { name: "Lucky Lure", description: "Increases chance of rare fish", maxLevel: 100, basePrice: 75, priceMultiplier: 1.18, effectPerLevel: 0.5 },
        speed: { name: "Quick Cast", description: "Reduces fishing time", maxLevel: 100, basePrice: 100, priceMultiplier: 1.18, effectPerLevel: 0.5 },
        multiCatch: { name: "Wide Net", description: "Chance to catch multiple fish", maxLevel: 100, basePrice: 150, priceMultiplier: 1.18, effectPerLevel: 0.3 },
        inventory: { name: "Tackle Box", description: "Increases inventory capacity", maxLevel: 20, basePrice: 300, priceMultiplier: 1.5, effectPerLevel: 5 },
        value: { name: "Fish Market Contacts", description: "Increases sell value of fish", maxLevel: 100, basePrice: 500, priceMultiplier: 1.25, effectPerLevel: 0.4 },
        explorer: { name: "Explorer's Map", description: "Unlocks new fishing locations", maxLevel: 10, basePrice: 5000, priceMultiplier: 2.5, effectPerLevel: 1 }
    };
    const RESEARCH_UPGRADES = {
        advancedLuck: { name: "Advanced Lure Technology", description: "Significantly boosts rare fish chances", maxLevel: 10, basePrice: 50000, priceMultiplier: 1.5, effectPerLevel: 2.0, researchTimeHours: 6, timeMultiplier: 1.25, requires: { luck: 25 } },
        efficiency: { name: "Fishing Efficiency", description: "Greatly reduces fishing time", maxLevel: 10, basePrice: 100000, priceMultiplier: 1.5, effectPerLevel: 2.5, researchTimeHours: 8, timeMultiplier: 1.3, requires: { speed: 30 } },
        masterNet: { name: "Master Fishing Net", description: "Higher chance for multiple catches", maxLevel: 10, basePrice: 150000, priceMultiplier: 1.5, effectPerLevel: 1.5, researchTimeHours: 12, timeMultiplier: 1.35, requires: { multiCatch: 40 } },
        treasureHunter: { name: "Treasure Hunter", description: "Increases chest spawn rate and value", maxLevel: 5, basePrice: 200000, priceMultiplier: 2.0, effectPerLevel: 10, researchTimeHours: 24, timeMultiplier: 1.5, requires: { value: 50 } },
        specialLure: { name: "Special Fish Attractor", description: "Increases special fish chance", maxLevel: 5, basePrice: 500000, priceMultiplier: 2.0, effectPerLevel: 5, researchTimeHours: 36, timeMultiplier: 1.5, requires: { luck: 60, value: 40 } }
    };
    const FISHING_LOCATIONS = {
        pond: { name: "Tranquil Pond", fishModifiers: { common: 1.2, uncommon: 0.8, rare: 0.5, legendary: 0.2, mythic: 0.1, chimerical: 0.05 }, commonBoost: 10, uncommonBoost: 0, rareBoost: 0, legendaryBoost: 0, mythicBoost: 0, chimericalBoost: 0 },
        river: { name: "Rushing River", fishModifiers: { common: 1.0, uncommon: 1.1, rare: 0.7, legendary: 0.3, mythic: 0.15, chimerical: 0.07 }, commonBoost: 5, uncommonBoost: 10, rareBoost: 2, legendaryBoost: 0, mythicBoost: 0, chimericalBoost: 0 },
        lake: { name: "Misty Lake", fishModifiers: { common: 0.9, uncommon: 1.0, rare: 1.1, legendary: 0.4, mythic: 0.2, chimerical: 0.1 }, commonBoost: 0, uncommonBoost: 5, rareBoost: 10, legendaryBoost: 1, mythicBoost: 0, chimericalBoost: 0 },
        ocean: { name: "Deep Ocean", fishModifiers: { common: 0.8, uncommon: 0.9, rare: 1.2, legendary: 0.6, mythic: 0.3, chimerical: 0.15 }, commonBoost: 0, uncommonBoost: 0, rareBoost: 15, legendaryBoost: 3, mythicBoost: 1, chimericalBoost: 0 },
        coral_reef: { name: "Coral Reef", fishModifiers: { common: 0.7, uncommon: 0.85, rare: 1.15, legendary: 0.8, mythic: 0.4, chimerical: 0.2 }, commonBoost: 0, uncommonBoost: 10, rareBoost: 20, legendaryBoost: 5, mythicBoost: 2, chimericalBoost: 0 },
        abyss: { name: "The Abyss", fishModifiers: { common: 0.6, uncommon: 0.75, rare: 1.0, legendary: 1.1, mythic: 0.6, chimerical: 0.3 }, commonBoost: 0, uncommonBoost: 0, rareBoost: 10, legendaryBoost: 10, mythicBoost: 5, chimericalBoost: 1 },
        sunken_city: { name: "Sunken City", fishModifiers: { common: 0.5, uncommon: 0.65, rare: 0.9, legendary: 1.2, mythic: 0.8, chimerical: 0.4 }, commonBoost: 0, uncommonBoost: 0, rareBoost: 5, legendaryBoost: 15, mythicBoost: 8, chimericalBoost: 2 },
        vortex: { name: "Mystic Vortex", fishModifiers: { common: 0.4, uncommon: 0.55, rare: 0.8, legendary: 1.1, mythic: 1.0, chimerical: 0.6 }, commonBoost: 0, uncommonBoost: 0, rareBoost: 0, legendaryBoost: 10, mythicBoost: 15, chimericalBoost: 5 },
        cosmic_sea: { name: "Cosmic Sea", fishModifiers: { common: 0.3, uncommon: 0.45, rare: 0.7, legendary: 1.0, mythic: 1.2, chimerical: 0.8 }, commonBoost: 0, uncommonBoost: 0, rareBoost: 0, legendaryBoost: 15, mythicBoost: 25, chimericalBoost: 10 },
        temporal_tide: { name: "Temporal Tide", fishModifiers: { common: 0.2, uncommon: 0.35, rare: 0.6, legendary: 0.9, mythic: 1.3, chimerical: 1.0 }, commonBoost: 0, uncommonBoost: 0, rareBoost: 0, legendaryBoost: 10, mythicBoost: 30, chimericalBoost: 15 },
        fishverse: { name: "Fishverse", fishModifiers: { common: 0.1, uncommon: 0.25, rare: 0.5, legendary: 0.8, mythic: 1.4, chimerical: 1.5 }, commonBoost: 0, uncommonBoost: 0, rareBoost: 0, legendaryBoost: 5, mythicBoost: 20, chimericalBoost: 30 }
    };
    const SEASONS = {
        spring: { name: 'Spring', modifier: { common: 0.9, uncommon: 1.0, rare: 1.05, legendary: 1.05, mythic: 1.1, chimerical: 1.0 } },
        summer: { name: 'Summer', modifier: { common: 1.0, uncommon: 1.0, rare: 1.0, legendary: 1.05, mythic: 1.1, chimerical: 1.05 } },
        fall: { name: 'Fall', modifier: { common: 0.8, uncommon: 1.0, rare: 1.1, legendary: 1.15, mythic: 0.9, chimerical: 0.9 } },
        winter: { name: 'Winter', modifier: { common: 0.95, uncommon: 0.95, rare: 0.95, legendary: 1.05, mythic: 1.10, chimerical: 1.05 } }
    };
    const RARITY_WEIGHTS = { common: 0.608, uncommon: 0.218, rare: 0.099, legendary: 0.03, mythic: 0.025, chimerical: 0.02 };
    const SPECIAL_FISH_CHANCE = 0.005; // 0.5% base chance
    const BASE_INVENTORY = 20; // Assuming a base inventory size

    // --- Get DOM Elements ---
    const inputs = {
      luck: document.getElementById('calc-luck'),
      speed: document.getElementById('calc-speed'),
      multiCatch: document.getElementById('calc-multiCatch'),
      inventory: document.getElementById('calc-inventory'),
      value: document.getElementById('calc-value'),
      explorer: document.getElementById('calc-explorer'),
      advancedLuck: document.getElementById('calc-advancedLuck'),
      efficiency: document.getElementById('calc-efficiency'),
      masterNet: document.getElementById('calc-masterNet'),
      treasureHunter: document.getElementById('calc-treasureHunter'),
      specialLure: document.getElementById('calc-specialLure'),
      level: document.getElementById('calc-level'),
      location: document.getElementById('calc-location'),
      season: document.getElementById('calc-season')
    };

    const outputs = {
      speed: document.getElementById('calc-output-speed'),
      value: document.getElementById('calc-output-value'),
      inventory: document.getElementById('calc-output-inventory'),
      multiCatch: document.getElementById('calc-output-multiCatch'),
      specialChance: document.getElementById('calc-output-specialChance'),
      treasure: document.getElementById('calc-output-treasure'),
      locations: document.getElementById('calc-output-locations'),
      luck: document.getElementById('calc-output-luck'),
      rarityCommon: document.getElementById('calc-output-rarity-common'),
      rarityUncommon: document.getElementById('calc-output-rarity-uncommon'),
      rarityRare: document.getElementById('calc-output-rarity-rare'),
      rarityLegendary: document.getElementById('calc-output-rarity-legendary'),
      rarityMythic: document.getElementById('calc-output-rarity-mythic'),
      rarityChimerical: document.getElementById('calc-output-rarity-chimerical')
    };

    // --- Populate Select Options ---
    function populateOptions() {
      // Locations
      for (const key in FISHING_LOCATIONS) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = FISHING_LOCATIONS[key].name;
        inputs.location.appendChild(option);
      }
      // Seasons
      for (const key in SEASONS) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = SEASONS[key].name;
        inputs.season.appendChild(option);
      }
      // Set default season based on current date
      const currentMonth = new Date().getMonth();
      let currentSeasonKey = 'winter';
      if (currentMonth >= 2 && currentMonth <= 4) currentSeasonKey = 'spring';
      else if (currentMonth >= 5 && currentMonth <= 7) currentSeasonKey = 'summer';
      else if (currentMonth >= 8 && currentMonth <= 10) currentSeasonKey = 'fall';
      inputs.season.value = currentSeasonKey;
    }

    // --- Helper Functions ---
    function getInputValue(element, maxVal = Infinity) {
      const value = parseInt(element.value, 10) || 0;
      return Math.max(0, Math.min(value, maxVal)); // Ensure value is within 0 and maxVal
    }

    // --- Calculation Logic ---
    function calculateStats() {
      // Read all input values
      const levels = {
        luck: getInputValue(inputs.luck, SHOP_UPGRADES.luck.maxLevel),
        speed: getInputValue(inputs.speed, SHOP_UPGRADES.speed.maxLevel),
        multiCatch: getInputValue(inputs.multiCatch, SHOP_UPGRADES.multiCatch.maxLevel),
        inventory: getInputValue(inputs.inventory, SHOP_UPGRADES.inventory.maxLevel),
        value: getInputValue(inputs.value, SHOP_UPGRADES.value.maxLevel),
        explorer: getInputValue(inputs.explorer, SHOP_UPGRADES.explorer.maxLevel),
        advancedLuck: getInputValue(inputs.advancedLuck, RESEARCH_UPGRADES.advancedLuck.maxLevel),
        efficiency: getInputValue(inputs.efficiency, RESEARCH_UPGRADES.efficiency.maxLevel),
        masterNet: getInputValue(inputs.masterNet, RESEARCH_UPGRADES.masterNet.maxLevel),
        treasureHunter: getInputValue(inputs.treasureHunter, RESEARCH_UPGRADES.treasureHunter.maxLevel),
        specialLure: getInputValue(inputs.specialLure, RESEARCH_UPGRADES.specialLure.maxLevel),
        level: getInputValue(inputs.level)
      };
      const selectedLocation = inputs.location.value;
      const selectedSeason = inputs.season.value;

      // --- Calculate Individual Stats ---

      // Speed Reduction
      const baseSpeed = levels.speed * SHOP_UPGRADES.speed.effectPerLevel;
      const efficiencyEffect = levels.efficiency * RESEARCH_UPGRADES.efficiency.effectPerLevel;
      const totalSpeedReduction = baseSpeed + efficiencyEffect;
      outputs.speed.textContent = `${totalSpeedReduction.toFixed(1)}%`;

      // Sell Value Bonus
      const totalValueBonus = levels.value * SHOP_UPGRADES.value.effectPerLevel;
      outputs.value.textContent = `${totalValueBonus.toFixed(1)}%`;

      // Inventory Size
      const totalInventory = BASE_INVENTORY + (levels.inventory * SHOP_UPGRADES.inventory.effectPerLevel);
      outputs.inventory.textContent = `${totalInventory}`;

      // Multi-Catch Chance
      const baseMultiCatch = levels.multiCatch * SHOP_UPGRADES.multiCatch.effectPerLevel;
      const masterNetEffect = levels.masterNet * RESEARCH_UPGRADES.masterNet.effectPerLevel;
      const totalMultiCatch = baseMultiCatch + masterNetEffect;
      outputs.multiCatch.textContent = `${totalMultiCatch.toFixed(1)}%`;

      // Special Fish Chance
      const specialLureBoost = levels.specialLure * RESEARCH_UPGRADES.specialLure.effectPerLevel;
      const totalSpecialChance = (SPECIAL_FISH_CHANCE * 100) + specialLureBoost; // Base chance is 0.005 -> 0.5%
      outputs.specialChance.textContent = `${totalSpecialChance.toFixed(1)}%`;

      // Treasure Hunter Bonus
      const treasureBonus = levels.treasureHunter * RESEARCH_UPGRADES.treasureHunter.effectPerLevel;
      outputs.treasure.textContent = `${treasureBonus.toFixed(0)}%`; // Display as whole number

      // Unlocked Locations
      const locationMapping = {
          0: ['pond'], 1: ['pond', 'river'], 2: ['pond', 'river', 'lake'], 3: ['pond', 'river', 'lake', 'ocean'],
          4: ['pond', 'river', 'lake', 'ocean', 'coral_reef'], 5: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss'],
          6: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss', 'sunken_city'],
          7: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss', 'sunken_city', 'vortex'],
          8: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss', 'sunken_city', 'vortex', 'cosmic_sea'],
          9: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss', 'sunken_city', 'vortex', 'cosmic_sea', 'temporal_tide'],
          10: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss', 'sunken_city', 'vortex', 'cosmic_sea', 'temporal_tide', 'fishverse']
      };
      const unlocked = (locationMapping[levels.explorer] || ['pond'])
          .map(locId => FISHING_LOCATIONS[locId]?.name || locId)
          .join(', ');
      outputs.locations.textContent = unlocked;

      // --- Calculate Luck ---
      const baseLuck = levels.luck; // Shop luck level IS the base luck value used in catchFish
      const advancedLuckEffect = levels.advancedLuck * RESEARCH_UPGRADES.advancedLuck.effectPerLevel;
      const levelLuck = Math.floor(levels.level / 10); // Approximation from fishUtils.catchFish
      // The 'total' luck in fishEffects seems to be used for the *boost* calculation, not the raw luck value passed to catchFish.
      // The raw luck passed seems to be baseLuck + levelLuck. Advanced luck modifies the *outcome* later.
      const luckValueForBoostCalc = baseLuck + (advancedLuckEffect / 2) + levelLuck; // From fishEffects
      const luckValueForRarityShift = baseLuck + levelLuck; // Approximation of value passed to catchFish
      outputs.luck.textContent = `${luckValueForRarityShift} (Shop: ${baseLuck}, Level: ${levelLuck}) + ${advancedLuckEffect.toFixed(1)}% (Research)`;

      // --- Calculate Rarity Chances (Approximate) ---
      const locationData = FISHING_LOCATIONS[selectedLocation] || FISHING_LOCATIONS.pond;
      const seasonData = SEASONS[selectedSeason] || SEASONS.winter;
      const modifiedWeights = {};
      let totalWeight = 0;

      for (const rarity in RARITY_WEIGHTS) {
          const baseWeight = RARITY_WEIGHTS[rarity];
          const locModifier = locationData.fishModifiers[rarity] || 1.0;
          const seasonModifier = seasonData.modifier[rarity] || 1.0;
          const locBoost = (locationData[`${rarity}Boost`] || 0) / 100.0;

          // Apply modifiers and boosts
          let weight = baseWeight * locModifier * seasonModifier + locBoost;
          modifiedWeights[rarity] = Math.max(0, weight); // Ensure weight isn't negative
      }

      // Normalize weights before applying luck shift
      totalWeight = Object.values(modifiedWeights).reduce((sum, w) => sum + w, 0);
      if (totalWeight > 0) {
          for (const rarity in modifiedWeights) {
              modifiedWeights[rarity] /= totalWeight;
          }
      }

      // Apply Luck Shift (Approximation)
      // Higher luck increases chances of rarer fish, decreases common/uncommon
      // We use the 'luckValueForBoostCalc' as it represents the overall luck influence
      const luckFactor = luckValueForBoostCalc * 0.0015; // Adjust this multiplier to control luck's impact

      // Calculate shift amounts (proportional to current weight and rarity value)
      const rarityValues = { common: 1, uncommon: 2, rare: 4, legendary: 8, mythic: 16, chimerical: 32 };
      let totalShiftDown = 0;
      let totalShiftUpWeight = 0;

      // Shift down from common/uncommon
      ['common', 'uncommon'].forEach(rarity => {
          const shiftAmount = modifiedWeights[rarity] * luckFactor * (1 / rarityValues[rarity]);
          modifiedWeights[rarity] -= shiftAmount;
          totalShiftDown += shiftAmount;
          modifiedWeights[rarity] = Math.max(0.001, modifiedWeights[rarity]); // Prevent going to zero
      });

      // Calculate total weight for rarer categories to distribute the shifted amount
      ['rare', 'legendary', 'mythic', 'chimerical'].forEach(rarity => {
          totalShiftUpWeight += modifiedWeights[rarity] * rarityValues[rarity];
      });

      // Distribute the shifted amount to rarer categories proportionally
      if (totalShiftUpWeight > 0) {
          ['rare', 'legendary', 'mythic', 'chimerical'].forEach(rarity => {
              const proportion = (modifiedWeights[rarity] * rarityValues[rarity]) / totalShiftUpWeight;
              modifiedWeights[rarity] += totalShiftDown * proportion;
          });
      }

      // Final Normalization (to ensure sum is exactly 100%)
      totalWeight = Object.values(modifiedWeights).reduce((sum, w) => sum + w, 0);
      if (totalWeight > 0) {
          for (const rarity in modifiedWeights) {
              modifiedWeights[rarity] /= totalWeight;
          }
      }

      // Update UI
      outputs.rarityCommon.textContent = `~${(modifiedWeights.common * 100).toFixed(1)}%`;
      outputs.rarityUncommon.textContent = `~${(modifiedWeights.uncommon * 100).toFixed(1)}%`;
      outputs.rarityRare.textContent = `~${(modifiedWeights.rare * 100).toFixed(1)}%`;
      outputs.rarityLegendary.textContent = `~${(modifiedWeights.legendary * 100).toFixed(1)}%`;
      outputs.rarityMythic.textContent = `~${(modifiedWeights.mythic * 100).toFixed(1)}%`;
      outputs.rarityChimerical.textContent = `~${(modifiedWeights.chimerical * 100).toFixed(1)}%`;
    }

    // --- Event Listeners ---
    populateOptions(); // Fill dropdowns
    calculateStats(); // Initial calculation

    // Recalculate whenever an input changes
    for (const key in inputs) {
      inputs[key].addEventListener('input', calculateStats);
    }
  } // End if(calcContainer)

}); // End DOMContentLoaded