/**
 * JavaScript specifically for the How to Use page
 * This file handles page-specific interactive elements
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('How to Use page script initialized');
    
    // Add class to identify page for script.js (prevents duplicate initialization)
    document.body.classList.add('how-to-use-page');
    
    // Initialize scroll animations specifically for this page
    initScrollAnimations();

    // Initialize expandable sections specifically for this page
    initExpandableSections(); // <-- Add this call
    
    // Function to initialize scroll animations
    function initScrollAnimations() {
        const animatedSections = document.querySelectorAll('.animated-section.fade-in');
        
        if ('IntersectionObserver' in window && animatedSections.length > 0) {
            const observerOptions = { 
                root: null, 
                rootMargin: '0px', 
                threshold: 0.15 
            };
            
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        obs.unobserve(entry.target); // Once visible, stop observing
                    }
                });
            }, observerOptions);
            
            animatedSections.forEach(section => {
                observer.observe(section);
            });
        } else {
            // Fallback for older browsers
            animatedSections.forEach(section => {
                section.classList.add('visible');
            });
        }
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId && targetId.length > 1) {
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Smooth scroll to target
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update URL hash without jumping
                    history.pushState(null, null, targetId);
                }
            }
        });
    });
    
    // For any specific section that should be shown on page load
    function checkUrlHash() {
        const hash = window.location.hash;
        if (hash && hash.length > 1) {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                // Delay slightly to allow page to render
                setTimeout(() => {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 300);
            }
        }
    }
    
    // Check for hash on page load
    checkUrlHash();

    // Function to initialize expandable sections - Moved from script.js
    function initExpandableSections() {
        console.log("Initializing expandable sections for How To Use page...");
        document.querySelectorAll('.expand-btn').forEach(button => {
            // Add data attribute to tell canvas to ignore this element
            button.setAttribute('data-ignore-canvas', 'true');

            const expandedContent = button.nextElementSibling;

            if (!expandedContent || !expandedContent.classList.contains('expanded-content')) {
                console.warn("Initialization: Could not find .expanded-content sibling for button:", button);
                return;
            }

            // Ensure initial state matches CSS (closed by default)
            button.setAttribute('aria-expanded', 'false');

            // Simple toggle function that relies on ARIA attribute for CSS
            function toggleExpansion(event) {
                // Prevent default if it's somehow triggered by something else
                event.preventDefault();
                event.stopPropagation(); // Stop event bubbling

                // Get current state - always use attribute value as source of truth
                const isCurrentlyExpanded = button.getAttribute('aria-expanded') === 'true';
                console.log(`Button clicked: ${button.textContent.trim()}, current state: ${isCurrentlyExpanded}`);

                // Toggle the state
                const newState = !isCurrentlyExpanded;
                button.setAttribute('aria-expanded', newState ? 'true' : 'false');
                // CSS rule .expand-btn[aria-expanded="true"] + .expanded-content will handle display

                console.log(`Button expanded state toggled to: ${newState}`);
            }

            // Remove any existing event listeners to prevent duplicates
            button.removeEventListener('click', toggleExpansion);
            // Add a fresh click handler
            button.addEventListener('click', toggleExpansion);
        });
    }

}); // End DOMContentLoaded listener