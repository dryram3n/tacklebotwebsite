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
                trail.style.opacity = '0.5'; // Make visible when moving
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
            }, 200); // Adjust fade-out delay (ms)
        });

         // Optional: Shrink trail on click
        document.addEventListener('mousedown', () => {
            if (trail) {
                trail.style.width = '10px';
                trail.style.height = '10px';
            }
        });
        document.addEventListener('mouseup', () => {
             if (trail) {
                trail.style.width = '15px';
                trail.style.height = '15px';
             }
        });
    }


    // --- Fade-in Sections on Scroll ---
    const animatedSections = document.querySelectorAll('.animated-section');

    const observerOptions = {
        root: null, // relative to the viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    // CORRECTED: 'obs' parameter is now used by uncommenting obs.unobserve()
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
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
            // Allow default behavior for external links or simple '#' links
        });
    });

    // --- Placeholder for Invite/Support Links ---
    // You'll replace '#' with your actual Discord invite links
    const inviteButtons = document.querySelectorAll('.invite-button');
    const supportButton = document.querySelector('.support-button'); // Assuming only one main support button

    // --- IMPORTANT: REPLACE THESE PLACEHOLDER LINKS ---
    const discordInviteLink = "YOUR_DISCORD_BOT_INVITE_LINK_HERE";
    const discordSupportLink = "YOUR_DISCORD_SUPPORT_SERVER_INVITE_LINK_HERE";
    // --- IMPORTANT: REPLACE THESE PLACEHOLDER LINKS ---


    inviteButtons.forEach(button => {
        // Only set href if it's currently '#' or empty, to avoid overwriting other links by mistake
        if (button.getAttribute('href') === '#' || !button.getAttribute('href')) {
            button.href = discordInviteLink;
            button.target = "_blank"; // Open in new tab
            button.rel = "noopener noreferrer"; // Security best practice
        }
    });

    if (supportButton) {
         // Only set href if it's currently '#' or empty
        if (supportButton.getAttribute('href') === '#' || !supportButton.getAttribute('href')) {
            supportButton.href = discordSupportLink;
            supportButton.target = "_blank"; // Open in new tab
            supportButton.rel = "noopener noreferrer"; // Security best practice
        }
    }

}); // End DOMContentLoaded
