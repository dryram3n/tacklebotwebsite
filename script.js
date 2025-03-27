document.addEventListener('DOMContentLoaded', () => {

  // --- Water Background Effect (Optimized) ---
  function initWaterBackground() {
    const waterBody = document.querySelector('.water-body');
    const waterSurface = document.querySelector('.water-surface');
    const bubblesContainer = document.getElementById('bubbles-container');
    
    if (!waterBody || !waterSurface || !bubblesContainer) return;
    
    // Performance detection - check if device is likely low-powered
    const isLowPerfDevice = window.matchMedia('(prefers-reduced-motion: reduce)').matches || 
                           !window.requestAnimationFrame ||
                           window.navigator.hardwareConcurrency < 4;
    
    // Apply performance mode classes if needed
    if (isLowPerfDevice) {
      document.body.classList.add('reduced-motion');
    }
    
    // Initial water level (50% of screen height)
    waterBody.style.height = '50vh';
    waterSurface.style.bottom = '50vh';
    
    // Bubble pool for reusing elements instead of creating new ones
    const bubblePool = [];
    const POOL_SIZE = isLowPerfDevice ? 10 : 20;
    const BUBBLE_INTERVAL = isLowPerfDevice ? 800 : 400;
    
    // Create bubble pool
    for (let i = 0; i < POOL_SIZE; i++) {
      const bubble = document.createElement('div');
      bubble.classList.add('bubble');
      bubble.style.display = 'none';
      bubblesContainer.appendChild(bubble);
      bubblePool.push(bubble);
    }
    
    // Throttle water height updates
    let lastScrollTime = 0;
    let targetWaterHeight = 50; // Initial target (50vh)
    let currentWaterHeight = 50; // Current height
    
    // Simplified physics - less intensive calculations
    const scrollThrottle = isLowPerfDevice ? 150 : 50; // ms between updates
    
    // Less frequent scroll handler
    window.addEventListener('scroll', () => {
      const now = Date.now();
      if (now - lastScrollTime < scrollThrottle) return;
      
      lastScrollTime = now;
      const scrollPercentage = Math.min(1, window.scrollY / (document.body.scrollHeight - window.innerHeight));
      targetWaterHeight = 40 + (scrollPercentage * 45);
    });
    
    // Simplified animation with less frequent updates
    let animationFrame;
    let lastAnimationTime = 0;
    const ANIMATION_INTERVAL = isLowPerfDevice ? 50 : 16.67; // ~60fps or ~20fps
    
    function updateWater(timestamp) {
      if (!lastAnimationTime) lastAnimationTime = timestamp;
      const elapsed = timestamp - lastAnimationTime;
      
      if (elapsed > ANIMATION_INTERVAL) {
        lastAnimationTime = timestamp;
        
        // Simple easing without complex physics
        currentWaterHeight += (targetWaterHeight - currentWaterHeight) * 0.1;
        
        // Reduce DOM updates by checking if value changed significantly
        if (Math.abs(parseFloat(waterBody.style.height) - currentWaterHeight) > 0.1) {
          waterBody.style.height = `${currentWaterHeight}vh`;
          waterSurface.style.bottom = `${currentWaterHeight}vh`;
        }
      }
      
      animationFrame = requestAnimationFrame(updateWater);
    }
    
    // Start animation if visible
    if (isDocumentVisible()) {
      animationFrame = requestAnimationFrame(updateWater);
    }
    
    // Find available bubble from pool
    function getAvailableBubble() {
      for (const bubble of bubblePool) {
        if (bubble.style.display === 'none') {
          return bubble;
        }
      }
      // If all bubbles are in use, return the first one (oldest)
      return bubblePool[0];
    }
    
    // Activate a bubble with properties
    function activateBubble() {
      if (!isDocumentVisible()) return;
      
      const bubble = getAvailableBubble();
      
      // Random bubble properties
      const size = 4 + Math.random() * 12;
      const xPos = Math.random() * 100;
      const driftX = -30 + Math.random() * 60;
      const riseDuration = 5 + Math.random() * 8;
      const bubbleOpacity = 0.3 + Math.random() * 0.5;
      
      // Optimize by setting all styles at once
      bubble.style.cssText = `
        display: block;
        width: ${size}px;
        height: ${size}px;
        left: ${xPos}%;
        bottom: 0;
        opacity: 0;
        transform: translate(0, 0) scale(0.5);
        animation: bubble-rise ${riseDuration}s ease-in-out forwards;
      `;
      
      bubble.style.setProperty('--drift-x', `${driftX}px`);
      bubble.style.setProperty('--bubble-opacity', bubbleOpacity);
      
      // Reset bubble after animation completes
      setTimeout(() => {
        bubble.style.display = 'none';
      }, riseDuration * 1000);
    }
    
    // Start bubble creation at intervals
    let bubbleInterval;
    
    function startBubbles() {
      bubbleInterval = setInterval(activateBubble, BUBBLE_INTERVAL);
      activateBubble(); // Create one immediately
    }
    
    // Only run animations when document is visible
    function isDocumentVisible() {
      return !document.hidden;
    }
    
    // Handle visibility changes to save resources
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
    
    // Start bubbles if document is visible
    if (isDocumentVisible()) {
      startBubbles();
    }
    
    // Add limited bubbles on click (much fewer than before)
    document.addEventListener('click', (e) => {
      // Don't create bubbles for clicks on buttons or links or if low performance
      if (e.target.closest('a, button, .button') || isLowPerfDevice) return;
      
      // Create just 2-3 bubbles at click location
      const numBubbles = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < numBubbles; i++) {
        const bubble = getAvailableBubble();
        if (!bubble) return; // No available bubbles
        
        // Size and position relative to click
        const size = 3 + Math.random() * 8;
        const xOffset = -10 + Math.random() * 20;
        
        // Position relative to viewport
        const xPercent = (e.clientX + xOffset) / window.innerWidth * 100;
        
        bubble.style.cssText = `
          display: block;
          width: ${size}px;
          height: ${size}px;
          left: ${xPercent}%;
          bottom: ${currentWaterHeight}vh;
          opacity: 0;
          transform: translate(0, 0) scale(0.5);
          animation: bubble-rise ${3 + Math.random() * 4}s ease-in-out forwards;
        `;
        
        bubble.style.setProperty('--drift-x', `${-15 + Math.random() * 30}px`);
        bubble.style.setProperty('--bubble-opacity', '0.6');
        
        // Reset bubble after animation
        setTimeout(() => {
          bubble.style.display = 'none';
        }, 7000);
      }
    });
    
    // Clean up resources when leaving the page
    window.addEventListener('beforeunload', () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (bubbleInterval) {
        clearInterval(bubbleInterval);
      }
    });
  }
  
  // Initialize water background
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