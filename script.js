document.addEventListener('DOMContentLoaded', () => {

  // --- Water Background Effect ---
  function initWaterBackground() {
    const waterBody = document.querySelector('.water-body');
    const waterSurface = document.querySelector('.water-surface');
    const bubblesContainer = document.getElementById('bubbles-container');
    
    if (!waterBody || !waterSurface || !bubblesContainer) return;
    
    // Initial water level (50% of screen height)
    waterBody.style.height = '50vh';
    waterSurface.style.bottom = '50vh';
    
    // Update water level on scroll with physics-based easing
    let targetWaterHeight = 50; // Initial target (50vh)
    let currentWaterHeight = 50; // Current height
    let velocity = 0; // For physics
    const springStrength = 0.05; // How quickly water catches up
    const damping = 0.8; // Damping to prevent overshooting
    
    // Scroll handler
    window.addEventListener('scroll', () => {
      // Calculate scroll percentage (0 to 1)
      const scrollPercentage = Math.min(1, window.scrollY / (document.body.scrollHeight - window.innerHeight));
      // Map to water height (40vh to 85vh) - deeper as you scroll
      targetWaterHeight = 40 + (scrollPercentage * 45);
    });
    
    // Animation loop for smooth physics-based movement
    function updateWater() {
      // Apply spring physics to water height
      const distanceToTarget = targetWaterHeight - currentWaterHeight;
      const spring = distanceToTarget * springStrength;
      
      velocity += spring;
      velocity *= damping;
      currentWaterHeight += velocity;
      
      // Update water level
      waterBody.style.height = `${currentWaterHeight}vh`;
      waterSurface.style.bottom = `${currentWaterHeight}vh`;
      
      requestAnimationFrame(updateWater);
    }
    
    // Start the animation loop
    updateWater();
    
    // Create bubbles periodically with randomness
    function createBubble() {
      const bubble = document.createElement('div');
      bubble.classList.add('bubble');
      
      // Random bubble properties
      const size = 4 + Math.random() * 18;
      const xPos = Math.random() * 100; // Random horizontal position (%)
      const driftX = -50 + Math.random() * 100; // Random horizontal drift
      const riseDuration = 5 + Math.random() * 12; // Random rise duration
      const bubbleOpacity = 0.3 + Math.random() * 0.6; // Random opacity
      
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${xPos}%`;
      bubble.style.bottom = '0';
      bubble.style.setProperty('--drift-x', `${driftX}px`);
      bubble.style.setProperty('--rise-duration', `${riseDuration}s`);
      bubble.style.setProperty('--bubble-opacity', bubbleOpacity);
      
      bubblesContainer.appendChild(bubble);
      
      // Remove bubble after animation completes
      setTimeout(() => {
        if (bubble && bubble.parentNode) {
          bubble.parentNode.removeChild(bubble);
        }
      }, riseDuration * 1000);
      
      // Schedule next bubble with random interval
      const nextBubbleTime = 100 + Math.random() * 500;
      setTimeout(createBubble, nextBubbleTime);
    }
    
    // Start creating bubbles
    createBubble();
    
    // Add additional bubbles on click for interactivity
    document.addEventListener('click', (e) => {
      // Don't create bubbles for clicks on buttons or links
      if (e.target.closest('a, button, .button')) return;
      
      // Create 5-8 bubbles at click location
      const numBubbles = 5 + Math.floor(Math.random() * 4);
      
      for (let i = 0; i < numBubbles; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        
        // Size and position relative to click
        const size = 3 + Math.random() * 10;
        const xOffset = -20 + Math.random() * 40;
        const yOffset = -20 + Math.random() * 40;
        
        // Position relative to viewport
        const xPercent = (e.clientX + xOffset) / window.innerWidth * 100;
        
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${xPercent}%`;
        bubble.style.bottom = `${currentWaterHeight}vh`;
        
        // Random drift and duration
        const driftX = -30 + Math.random() * 60;
        const riseDuration = 3 + Math.random() * 8;
        
        bubble.style.setProperty('--drift-x', `${driftX}px`);
        bubble.style.setProperty('--rise-duration', `${riseDuration}s`);
        
        bubblesContainer.appendChild(bubble);
        
        // Remove bubble after animation
        setTimeout(() => {
          if (bubble && bubble.parentNode) {
            bubble.parentNode.removeChild(bubble);
          }
        }, riseDuration * 1000);
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