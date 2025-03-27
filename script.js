document.addEventListener('DOMContentLoaded', () => {

  // --- Button Ripple Effect ---
  const buttons = document.querySelectorAll('.button');

  buttons.forEach(button => {
    button.addEventListener('click', function (e) {
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
    
    // Previous positions for smooth motion
    let prevX = 0;
    let prevY = 0;
    let trailDroplets = [];
    
    // Track mouse position for water trail
    document.addEventListener('mousemove', (e) => {
      // Smooth follow effect
      prevX = prevX + (e.clientX - prevX) * 0.3;
      prevY = prevY + (e.clientY - prevY) * 0.3;
      
      requestAnimationFrame(() => {
        // Position the main water droplet
        trail.style.left = `${prevX}px`;
        trail.style.top = `${prevY}px`;
        trail.style.opacity = '0.8';
        
        // Create occasional smaller droplets for trail effect
        if (Math.random() > 0.85) {
          createTrailDroplet(prevX, prevY);
        }
      });
    });

    // Fade out when mouse stops
    let timeoutId;
    document.addEventListener('mousemove', () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (trail) {
          trail.style.opacity = '0';
        }
      }, 150);
    });

    // Water splash effect on click
    document.addEventListener('mousedown', (e) => {
      if (trail) {
        // Squish the water droplet
        trail.style.transform = 'translate(-50%, -50%) scale(0.6) rotate(45deg)';
        
        // Create water splash
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

}); // End DOMContentLoaded