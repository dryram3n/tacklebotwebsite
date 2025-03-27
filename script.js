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

  // --- Mouse Trail Effect ---
  const trail = document.getElementById('mouse-trail');
  if (trail) { // Check if the element exists
    document.addEventListener('mousemove', (e) => {
      // Use requestAnimationFrame for smoother performance
      requestAnimationFrame(() => {
        trail.style.left = `${e.clientX}px`;
        trail.style.top = `${e.clientY}px`;
        trail.style.opacity = '0.8'; // Make visible when moving (matches CSS)
      });
    });

    // Optional: Fade out when mouse stops
    let timeoutId;
    document.addEventListener('mousemove', () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (trail) { // Check again in case element removed dynamically
          trail.style.opacity = '0';
        }
      }, 150); // Faster fade-out
    });

    // Optional: Effect on click (e.g., slightly larger/smaller emoji)
    document.addEventListener('mousedown', () => {
      if (trail) {
        trail.style.transform = 'translate(-50%, -50%) scale(1.2)'; // Grow slightly
      }
    });
    document.addEventListener('mouseup', () => {
      if (trail) {
        trail.style.transform = 'translate(-50%, -50%) scale(1)'; // Back to normal
      }
    });
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
