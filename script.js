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