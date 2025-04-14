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
});