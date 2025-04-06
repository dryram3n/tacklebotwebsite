// Global variable to hold the canvas instance
let waterCanvasInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    // Add canvas detection near the top of the file
    const supportsCanvas = (function() {
        // Check if canvas is supported
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext && canvas.getContext('2d'));
    })();

    // Detect if the device might have performance issues or prefers reduced motion
    const isLowPerfDevice = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
                           !('requestAnimationFrame' in window) || // Check for basic animation support
                           (window.navigator.hardwareConcurrency && window.navigator.hardwareConcurrency < 4) || // Check CPU cores (if available)
                           navigator.userAgent.match(/mobile|android/i); // Simple mobile check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Add canvas feature detection
    const useCanvas = supportsCanvas && !isLowPerfDevice && !prefersReducedMotion;

    if (isLowPerfDevice) {
        document.body.classList.add('reduced-motion'); // Apply CSS class for reduced effects
    }

    // Add class to body based on canvas usage
    if (useCanvas) {
        document.body.classList.add('using-canvas');
        document.body.style.cursor = 'none'; // Hide cursor if canvas trail is used

        // Load canvas dynamically to prevent unnecessary downloading on devices that won't use it
        const canvasScript = document.createElement('script');
        canvasScript.src = 'canvas-effects.js';
        canvasScript.async = true;
        canvasScript.onload = () => {
            console.log('Canvas effects script loaded successfully');
            // Instantiate and start the canvas effects AFTER the script is loaded
            if (typeof WaterCanvas !== 'undefined') {
                waterCanvasInstance = new WaterCanvas();
                waterCanvasInstance.start();
                // Initialize non-water related animations after canvas setup
                initializeWebsiteAnimations();
            } else {
                console.error("WaterCanvas class not found after loading script.");
                document.body.classList.remove('using-canvas');
                document.body.classList.add('canvas-failed');
                initializeWebsiteAnimations(); // Fallback to DOM animations
            }
        };
        canvasScript.onerror = () => {
            console.error('Failed to load canvas effects');
            document.body.classList.remove('using-canvas');
            document.body.classList.add('canvas-failed');
            initializeWebsiteAnimations();
        };
        document.head.appendChild(canvasScript);
    } else {
        document.body.classList.add('canvas-failed');
        // Continue with the existing animation code
        initializeWebsiteAnimations();
    }

    // Global state for the animation loop (for DOM-based animations)
    let animationFrameId = null;
    let lastTimestamp = 0;
    // --- CHANGE FRAME RATE CAP ---
    const FRAME_DURATION = 1000 / 30; // Target ~30fps for non-trail animations (in milliseconds)
    // --- END CHANGE ---
    let lastThrottledTimestamp = 0; // Separate timestamp for updates that don't need 60fps
    let isLoopRunning = false; // Track if the main DOM animation loop is active

    // Cache frequently accessed DOM elements for performance
    const skyContainer = document.getElementById('sky-container');
    const sunElement = document.getElementById('sun');
    const moonElement = document.getElementById('moon');
    const cloudsContainer = document.getElementById('clouds-container');
    const waveSvg = document.getElementById('wave-svg');
    const wavePath1 = document.getElementById('wave-path-1');
    const wavePath2 = document.getElementById('wave-path-2');
    const waterBody = document.querySelector('.water-body');
    const waterSurface = document.querySelector('.water-surface');
    const bubblesContainer = document.getElementById('bubbles-container');
    const fishContainer = document.getElementById('fish-container');
    const trail = document.getElementById('mouse-trail');
    const uiToggleContainer = document.getElementById('ui-toggle-container');
    const hideUiButton = document.getElementById('hide-ui-button');
    const showUiButton = document.getElementById('show-ui-button');

    // Sky, Sun, Moon, and Clouds setup
    const NUM_CLOUDS = isLowPerfDevice ? 3 : 7; // Fewer clouds on low-performance devices
    let skyUpdateInterval = null; // Stores the interval ID for time/sky updates

    function initSky() {
        if (!skyContainer || !sunElement || !moonElement || !cloudsContainer) {
            console.warn("Sky elements not found, skipping sky initialization.");
            return;
        }

        // Create initial clouds if motion is not reduced
        if (!prefersReducedMotion) {
            for (let i = 0; i < NUM_CLOUDS; i++) {
                createCloud(true); // Create initial clouds instantly without fade-in
            }
            // Periodically add/remove clouds for variety
            setInterval(() => {
                if (document.hidden || !cloudsContainer) return; // Don't run if tab is hidden or container missing
                // Occasionally remove a cloud
                if (cloudsContainer.children.length > NUM_CLOUDS / 2 && Math.random() < 0.3) {
                    const cloudToRemove = cloudsContainer.children[Math.floor(Math.random() * cloudsContainer.children.length)];
                    if (cloudToRemove) {
                        cloudToRemove.style.opacity = '0'; // Fade out using CSS transition
                        // Remove from DOM after transition (with fallback timeout)
                        cloudToRemove.addEventListener('transitionend', () => cloudToRemove.remove(), { once: true });
                        setTimeout(() => { if (cloudToRemove.isConnected) cloudToRemove.remove(); }, 2100);
                    }
                }
                // Occasionally add a new cloud if not too many exist
                if (cloudsContainer.children.length < NUM_CLOUDS * 1.5 && Math.random() < 0.4) {
                   // Add with a random delay to spread out creation
                   setTimeout(createCloud, 500 + Math.random() * 4500);
                }
            }, 15000); // Check every 15 seconds
        }

        // Update sky immediately on load
        updateSkyAndTime();

        // Set interval to update sky periodically (every 5 seconds)
        skyUpdateInterval = setInterval(() => {
            if (!document.hidden) { // Only update if the tab is visible
                updateSkyAndTime();
            }
        }, 5000);
    }

    function createCloud(instant = false) {
        if (!cloudsContainer) return; // Ensure container exists

        const cloud = document.createElement('div');
        const type = Math.floor(Math.random() * 3) + 1; // Random cloud type (1, 2, or 3)
        cloud.className = `cloud type-${type}`;
        cloud.setAttribute('aria-hidden', 'true'); // Decorative element

        // Randomize size and position
        const sizeMultiplier = 0.7 + Math.random() * 0.6;
        cloud.style.setProperty('--cloud-scale', sizeMultiplier);
        cloud.style.top = `${5 + Math.random() * 50}%`; // Random vertical position

        // Randomize animation duration (drift speed)
        const duration = 40 + Math.random() * 50;
        cloud.style.setProperty('--drift-speed', `${duration}s`);

        const initialOpacity = (0.5 + Math.random() * 0.3).toFixed(2);

        if (instant) {
             // Start animation at a random point if instant
             cloud.style.animationDelay = `-${Math.random() * duration}s`;
             cloud.style.opacity = initialOpacity;
        } else {
            // Fade in smoothly if not instant
            cloud.style.opacity = '0';
            requestAnimationFrame(() => { // Ensure initial opacity is set before transition starts
                cloud.style.transition = 'opacity 1s ease-in';
                cloud.style.opacity = initialOpacity;
            });
        }

        // Remove cloud when its animation finishes
        cloud.addEventListener('animationiteration', () => {
            // Instead of removing on end, let it loop and rely on the interval remover
            // cloud.remove();
        }, { once: false }); // Let it loop

        cloudsContainer.appendChild(cloud);
    }

    function updateSkyAndTime() {
        if (!skyContainer || !sunElement || !moonElement) return; // Ensure elements exist

        const now = new Date();
        let currentHour, currentMinute;

        // Try to get time in New York timezone, fallback to local time
        try {
            const formatter = new Intl.DateTimeFormat("en-US", {
                timeZone: "America/New_York", hour12: false, hour: 'numeric', minute: 'numeric'
            });
            const parts = formatter.formatToParts(now);
            const hourPart = parts.find(part => part.type === 'hour');
            const minutePart = parts.find(part => part.type === 'minute');
            if (hourPart && minutePart) {
                currentHour = parseInt(hourPart.value, 10);
                if (currentHour === 24) currentHour = 0; // Handle midnight case
                currentMinute = parseInt(minutePart.value, 10);
            } else {
                throw new Error("Could not parse NY time parts.");
            }
        } catch (e) {
            console.warn("Could not get New York time, using local time.", e);
            currentHour = now.getHours();
            currentMinute = now.getMinutes();
        }

        // Calculate time progression through the day/night cycle
        const timeInMinutes = currentHour * 60 + currentMinute;
        const sunriseStart = 5 * 60, sunriseEnd = 7 * 60; // 5:00 AM - 7:00 AM
        const sunsetStart = 18 * 60, sunsetEnd = 20 * 60; // 6:00 PM - 8:00 PM
        const dayDuration = sunsetStart - sunriseEnd;
        const nightDuration = (24 * 60 - sunsetEnd) + sunriseStart;

        let skyGradient = 'var(--sky-day)'; // Default gradient
        let sunOpacity = 0, moonOpacity = 0;
        let sunX = 50, sunY = 90, moonX = 50, moonY = 90; // Default positions (below horizon)

        // Determine sky gradient and sun/moon visibility/position based on time
        if (timeInMinutes >= sunriseStart && timeInMinutes < sunriseEnd) { // Sunrise
            const progress = (timeInMinutes - sunriseStart) / (sunriseEnd - sunriseStart);
            skyGradient = `linear-gradient(to bottom, ${interpolateColor('#000030', '#87CEEB', progress)} 10%, ${interpolateColor('#191970', '#ADD8E6', progress)} 50%, ${interpolateColor('#2c3e50', '#B0E0E6', progress)} 100%)`;
            const transitionPoint = 0.5;
            if (progress < transitionPoint) { // Moon fades out
                moonOpacity = 1 - (progress / transitionPoint);
                moonX = 50 + (1 - progress) * 50; moonY = 25 + Math.sin((1 - progress) * Math.PI) * 60;
            } else { // Sun fades in
                sunOpacity = (progress - transitionPoint) / (1 - transitionPoint);
                sunX = (progress * 100) / 2; sunY = 25 + Math.sin(progress * Math.PI) * 60;
            }
        } else if (timeInMinutes >= sunriseEnd && timeInMinutes < sunsetStart) { // Daytime
            const progress = (timeInMinutes - sunriseEnd) / dayDuration;
            skyGradient = 'var(--sky-day)'; sunOpacity = 1;
            sunX = progress * 100; sunY = 25 + Math.sin(progress * Math.PI) * 60; // Sun arcs across sky
        } else if (timeInMinutes >= sunsetStart && timeInMinutes < sunsetEnd) { // Sunset
            const progress = (timeInMinutes - sunsetStart) / (sunsetEnd - sunsetStart);
            skyGradient = `linear-gradient(to bottom, ${interpolateColor('#87CEEB', '#4682B4', progress)} 0%, ${interpolateColor('#ADD8E6', '#191970', progress)} 40%, ${interpolateColor('#B0E0E6', '#000030', progress)} 100%)`;
            const transitionPoint = 0.5;
            if (progress < transitionPoint) { // Sun fades out
                sunOpacity = 1 - (progress / transitionPoint);
                sunX = 50 + (1 - progress) * 50; sunY = 25 + Math.sin((1 - progress) * Math.PI) * 60;
            } else { // Moon fades in
                moonOpacity = (progress - transitionPoint) / (1 - transitionPoint);
                moonX = (progress * 100) / 2; moonY = 25 + Math.sin(progress * Math.PI) * 60;
            }
        } else { // Nighttime
            let progress; // Calculate progress through the night (handles midnight wrap-around)
            if (timeInMinutes >= sunsetEnd) { progress = (timeInMinutes - sunsetEnd) / nightDuration; }
            else { progress = (timeInMinutes + (24 * 60 - sunsetEnd)) / nightDuration; }
            skyGradient = 'var(--sky-night)'; moonOpacity = 1;
            moonX = progress * 100; moonY = 25 + Math.sin(progress * Math.PI) * 60; // Moon arcs across sky
        }

        // Apply the calculated styles
        requestAnimationFrame(() => { // Use RAF for smoother background/position updates
            if (skyContainer) skyContainer.style.background = skyGradient;
            if (!prefersReducedMotion) { // Only update position if motion is enabled
                if (sunElement) sunElement.style.transform = `translate(${sunX - 50}vw, ${sunY - 50}vh) translate(-50%, -50%)`;
                if (moonElement) moonElement.style.transform = `translate(${moonX - 50}vw, ${moonY - 50}vh) translate(-50%, -50%)`;
            }
            if (sunElement) sunElement.style.opacity = sunOpacity.toFixed(2);
            if (moonElement) moonElement.style.opacity = moonOpacity.toFixed(2);
        });
    }

    // Helper to interpolate between two hex colors
    function interpolateColor(color1, color2, factor) {
        factor = Math.max(0, Math.min(1, factor)); // Clamp factor between 0 and 1
        const c1 = hexToRgb(color1);
        const c2 = hexToRgb(color2);
        if (!c1 || !c2) return 'rgb(0,0,0)'; // Return black on error
        const r = Math.round(c1.r + factor * (c2.r - c1.r));
        const g = Math.round(c1.g + factor * (c2.g - c1.g));
        const b = Math.round(c1.b + factor * (c2.b - c1.b));
        return `rgb(${r}, ${g}, ${b})`;
    }

    // Helper to convert hex color string to RGB object
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})$/i.exec(hex);
        if (!result) return null;
        // Handle both shorthand (e.g., #03F) and full hex codes
        const r = parseInt(result[1].length === 1 ? result[1] + result[1] : result[1], 16);
        const g = parseInt(result[2].length === 1 ? result[2] + result[2] : result[2], 16);
        const b = parseInt(result[3].length === 1 ? result[3] + result[3] : result[3], 16);
        return { r, g, b };
    }

    // Dynamic Wave setup
    let waveTime = 0;
    let targetAmplitude = 5, currentAmplitude = 5;
    let targetFrequency = 0.005, currentFrequency = 0.005;
    let targetSpeed = 0.02, currentSpeed = 0.02;
    let waveStateInterval = null; // Interval for changing wave behavior

    function initDynamicWaves() {
        if (!waveSvg || !wavePath1 || !wavePath2) {
            console.warn("Wave elements not found, skipping wave initialization.");
            return;
        }

        // Periodically change the target wave parameters for variety
        waveStateInterval = setInterval(() => {
            if (document.hidden || prefersReducedMotion) return; // Don't change if hidden or reduced motion
            const randomState = Math.random();
            if (randomState < 0.4) { // Calm waves
                targetAmplitude = 3 + Math.random() * 4; targetFrequency = 0.004 + Math.random() * 0.003; targetSpeed = 0.01 + Math.random() * 0.01;
            } else if (randomState < 0.8) { // Medium waves
                targetAmplitude = 8 + Math.random() * 7; targetFrequency = 0.006 + Math.random() * 0.004; targetSpeed = 0.02 + Math.random() * 0.015;
            } else { // Larger waves
                targetAmplitude = 16 + Math.random() * 9; targetFrequency = 0.008 + Math.random() * 0.005; targetSpeed = 0.03 + Math.random() * 0.02;
            }
        }, 10000); // Change every 10 seconds
    }

    function updateWaves(elapsedSinceLastThrottledFrame) {
        if (!wavePath1 || !wavePath2) return; // Ensure elements exist

        // Calculate time factor based on throttled frame duration for consistent easing speed
        const timeFactor = Math.min(2, elapsedSinceLastThrottledFrame / FRAME_DURATION);

        waveTime += currentSpeed * timeFactor; // Advance wave phase

        // Smoothly transition current parameters towards target parameters
        currentAmplitude += (targetAmplitude - currentAmplitude) * 0.05 * timeFactor;
        currentFrequency += (targetFrequency - currentFrequency) * 0.05 * timeFactor;
        currentSpeed += (targetSpeed - currentSpeed) * 0.05 * timeFactor;

        const points1 = [], points2 = [];
        const segments = 20; // Number of points to calculate along the wave
        const waveWidth = waveSvg.viewBox.baseVal.width || 1440; // Get width from SVG
        const waveHeight = waveSvg.viewBox.baseVal.height || 60; // Get height from SVG

        // Calculate points for both wave paths
        for (let i = 0; i <= segments; i++) {
            const x = (waveWidth / segments) * i;
            // Wave 1: Base sine wave
            const y1 = waveHeight / 2 + Math.sin(x * currentFrequency + waveTime) * currentAmplitude;
            points1.push(`${x.toFixed(2)},${y1.toFixed(2)}`);
            // Wave 2: Slightly different parameters for variation
            const y2 = waveHeight / 2 + Math.sin(x * currentFrequency * 1.2 + waveTime * 0.8 + 1) * currentAmplitude * 0.7;
            points2.push(`${x.toFixed(2)},${y2.toFixed(2)}`);
        }

        // Construct the SVG path data string (starts bottom-left, draws wave, ends bottom-right)
        const pathData1 = `M0,${waveHeight} L0,${points1[0].split(',')[1]} L${points1.join(' L')} L${waveWidth},${waveHeight} Z`;
        const pathData2 = `M0,${waveHeight} L0,${points2[0].split(',')[1]} L${points2.join(' L')} L${waveWidth},${waveHeight} Z`;

        // Apply the new path data (this function is called within the main RAF loop)
        wavePath1.setAttribute('d', pathData1);
        wavePath2.setAttribute('d', pathData2);
    }

    // Water Background and Bubbles setup
    let updateWaterHeight = () => {}; // Placeholder for the height update function
    const bubblePool = []; // Pool to reuse bubble DOM elements
    let bubbleInterval = null; // Interval for automatic bubble generation
    let scrollTimeout = null; // Timeout ID for debouncing scroll events

    function initWaterBackground() {
        if (!waterBody || !waterSurface || !bubblesContainer) {
            console.warn("Water elements not found, skipping water background initialization.");
            return;
        }

        // Set initial water height
        const initialHeight = 50; // vh
        waterBody.style.height = `${initialHeight}vh`;
        waterSurface.style.bottom = `${initialHeight}vh`;

        // Create a pool of bubble elements for reuse
        const POOL_SIZE = isLowPerfDevice ? 5 : 10; // Fewer bubbles on low-perf devices
        const BUBBLE_INTERVAL = isLowPerfDevice ? 1200 : 600; // Slower interval on low-perf
        for (let i = 0; i < POOL_SIZE; i++) {
          const bubble = document.createElement('div');
          bubble.classList.add('bubble');
          bubble.style.display = 'none'; // Start hidden
          bubble.setAttribute('aria-hidden', 'true');
          bubblesContainer.appendChild(bubble);
          bubblePool.push(bubble);
        }

        let lastScrollTime = 0;
        let targetWaterHeight = initialHeight;
        let currentWaterHeight = initialHeight;
        const scrollThrottle = isLowPerfDevice ? 200 : 100; // Throttle scroll updates

        // Listen for scroll events to adjust target water height
        window.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout); // Debounce scroll handler
            scrollTimeout = setTimeout(() => {
                const now = Date.now();
                if (now - lastScrollTime < scrollThrottle) return; // Throttle updates
                lastScrollTime = now;

                const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercentage = scrollMax > 0 ? Math.min(1, window.scrollY / scrollMax) : 0;
                // Adjust target height based on scroll (range: 40vh at top to 85vh at bottom)
                targetWaterHeight = 40 + (scrollPercentage * 45);

                // Update canvas water height if canvas is active
                if (waterCanvasInstance && typeof waterCanvasInstance.updateWaterHeight === 'function') {
                    waterCanvasInstance.updateWaterHeight(targetWaterHeight);
                }
            }, 10);
        }, { passive: true }); // Use passive listener for better scroll performance

        // Function to smoothly update the actual water height (called in main loop)
        updateWaterHeight = (elapsedSinceLastThrottledFrame) => {
            if (!waterBody || !waterSurface) return; // Ensure elements exist
            const timeFactor = Math.min(2, elapsedSinceLastThrottledFrame / FRAME_DURATION); // Factor for smooth easing
            currentWaterHeight += (targetWaterHeight - currentWaterHeight) * 0.08 * timeFactor; // Interpolate height

            // Only update DOM if the height changed significantly to avoid layout thrashing
            const currentStyleBottom = parseFloat(waterSurface.style.bottom);
            const newRoundedHeight = Math.round(currentWaterHeight * 10) / 10; // Round to 1 decimal

            if (Math.abs(currentStyleBottom - newRoundedHeight) > 0.1) { // Update threshold
                const heightValue = newRoundedHeight.toFixed(1);
                waterBody.style.height = `${heightValue}vh`;
                waterSurface.style.bottom = `${heightValue}vh`;
            }
        }

        // Get an available (hidden) bubble from the pool
        function getAvailableBubble() {
          return bubblePool.find(bubble => bubble.style.display === 'none');
        }

        // Activate a bubble from the pool
        function activateBubble() {
          if (document.hidden || !bubblesContainer) return; // Don't run if hidden or no container
          const bubble = getAvailableBubble();
          if (!bubble) return; // No available bubbles

          // Randomize bubble properties
          const size = 5 + Math.random() * 10;
          const xPos = Math.random() * 100;
          const driftX = -20 + Math.random() * 40;
          const riseDuration = 5 + Math.random() * 6;

          // Reset styles and animation before starting
          bubble.style.cssText = `
              display: block; width: ${size}px; height: ${size}px;
              left: ${xPos}%; bottom: 0; animation: none;
              opacity: 0; transform: scale(0.5); --drift-x: ${driftX}px;
          `;
          void bubble.offsetWidth; // Force reflow to apply reset styles

          // Apply animation and make visible
          bubble.style.animation = `bubble-rise ${riseDuration}s ease-out forwards`;
          bubble.style.opacity = '0.6';
          bubble.style.transform = 'scale(1)';

          // Cleanup function to hide the bubble and reset animation after it finishes
          const handleAnimationEnd = () => {
              bubble.style.display = 'none';
              bubble.style.animation = 'none';
              bubble.removeEventListener('animationend', handleAnimationEnd); // Remove listener
          };
          bubble.addEventListener('animationend', handleAnimationEnd, { once: true });

          // Fallback cleanup in case 'animationend' doesn't fire reliably
          setTimeout(() => {
              if (bubble.style.display !== 'none') handleAnimationEnd();
          }, riseDuration * 1000 + 500); // Timeout slightly longer than animation
        }

        // Start the interval for automatic bubble generation
        function startBubbles() {
            if (bubbleInterval) clearInterval(bubbleInterval); // Clear previous interval
            bubbleInterval = setInterval(activateBubble, BUBBLE_INTERVAL);
            activateBubble(); // Start one immediately
        }

        // Start/stop automatic bubbles based on tab visibility
        if (!document.hidden) { startBubbles(); }
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                if (!bubbleInterval) startBubbles(); // Restart if needed
            } else {
                if (bubbleInterval) { clearInterval(bubbleInterval); bubbleInterval = null; } // Stop interval
            }
        });

        // Create bubbles on click (only if not touch/low-perf)
        if (!isLowPerfDevice && !('ontouchstart' in window)) {
            document.addEventListener('click', (e) => {
                // Ignore clicks on interactive elements like buttons, links, inputs
                if (e.target.closest('a, button, .button, input, select, textarea, [role="button"]')) return;

                const bubble = getAvailableBubble();
                if (!bubble) return; // No bubble available

                const size = 5 + Math.random() * 5; // Smaller bubbles for clicks
                const xPercent = (e.clientX / window.innerWidth) * 100;
                const clickRiseDuration = 4; // Fixed duration

                // Reset styles, position near water surface at click location
                bubble.style.cssText = `
                    display: block; width: ${size}px; height: ${size}px;
                    left: ${xPercent}%; bottom: calc(${currentWaterHeight}vh - 10px);
                    animation: none; opacity: 0; transform: scale(0.5); --drift-x: 0px;
                `;
                void bubble.offsetWidth; // Force reflow

                // Apply animation
                bubble.style.animation = `bubble-rise ${clickRiseDuration}s ease-out forwards`;
                bubble.style.opacity = '0.6';
                bubble.style.transform = 'scale(1)';

                // Cleanup after animation
                const handleAnimationEnd = () => {
                    bubble.style.display = 'none';
                    bubble.style.animation = 'none';
                    bubble.removeEventListener('animationend', handleAnimationEnd);
                };
                bubble.addEventListener('animationend', handleAnimationEnd, { once: true });
                // Fallback cleanup
                setTimeout(() => { if (bubble.style.display !== 'none') handleAnimationEnd(); }, clickRiseDuration * 1000 + 500);
            });
        }
    }

    // Swimming Fish Animation setup
    let fishImageKeys = []; // Array of keys from FISH_IMAGES (e.g., "Common Carp")
    let fishImages = []; // Array of image URLs
    let currentWaterHeightVh = 50; // Track water height for fish boundaries
    const activeFish = []; // Holds data for currently visible fish { element, speed, direction, etc. }
    let adjustFishToWaterInterval = null; // Interval to check if fish are above water
    let fishRefreshInterval = null; // Interval to periodically replace fish
    let fishCount = 0; // Target number of fish on screen
    // ADDED: Variable to track water top boundary in vh
    let currentWaterTopVh = 50;

    function initSwimmingFish() {
        if (!fishContainer || !waterBody) {
            console.error('Missing elements for fish animation, skipping initialization.');
            return;
        }
        // Ensure the FISH_IMAGES data is loaded and available
        if (typeof FISH_IMAGES === 'undefined' || Object.keys(FISH_IMAGES).length === 0) {
            console.error('Fish images data (FISH_IMAGES) not found or empty.');
            return;
        }

        // Determine number of fish based on performance/cores
        fishCount = isLowPerfDevice ? 3 : (window.navigator.hardwareConcurrency >= 8 ? 8 : 5);
        fishImageKeys = Object.keys(FISH_IMAGES); // Get all fish names
        fishImages = fishImageKeys.map(key => FISH_IMAGES[key]); // Get all image URLs
        currentWaterHeightVh = parseFloat(waterBody.style.height) || 50; // Get initial water height
        // ADDED: Calculate initial water top
        currentWaterTopVh = 100 - currentWaterHeightVh;

        // Periodically check if fish are above the water line due to scrolling
        adjustFishToWaterInterval = setInterval(() => {
            if (!waterBody || document.hidden) return;
            const waterHeight = parseFloat(waterBody.style.height) || 50;
            // Only adjust if water height changed significantly
            if (Math.abs(waterHeight - currentWaterHeightVh) > 1) {
                currentWaterHeightVh = waterHeight; // Update tracked height
                // ADDED: Update water top boundary
                currentWaterTopVh = 100 - currentWaterHeightVh;

                activeFish.forEach(fish => {
                    if (!fish?.element?.isConnected) return; // Skip if fish element was removed

                    // CHANGED: Check if fish is above the water surface (using Y from top)
                    const fishTopBoundary = currentWaterTopVh + 2; // Add 2vh buffer below surface
                    if (fish.currentY_vh < fishTopBoundary) {
                        // Move fish to a random position within the new water height (from top)
                        const newY_vh = fishTopBoundary + Math.random() * (currentWaterHeightVh - 4); // Keep within buffer
                        fish.element.style.transform = `translate(${fish.currentX_vw.toFixed(1)}vw, ${newY_vh.toFixed(1)}vh) scaleX(${fish.direction === 'left' ? -1 : 1})`;
                        fish.originalY_vh = newY_vh; // Update base vertical position (from top)
                        fish.currentY_vh = newY_vh; // Update current vertical position (from top)
                    }
                });
            }
        }, 2000); // Check every 2 seconds

        // Periodically replace a fish to keep the variety fresh
        fishRefreshInterval = setInterval(() => {
            // Only run if tab is visible, there are fish, and randomly (20% chance)
            if (document.hidden || activeFish.length === 0 || Math.random() > 0.2) return;

            const indexToRemove = Math.floor(Math.random() * activeFish.length);
            const fishToRemove = activeFish[indexToRemove];

            if (fishToRemove?.element?.isConnected) {
                // Fade out the fish smoothly using CSS transition
                fishToRemove.element.style.transition = 'opacity 1.5s ease-out';
                fishToRemove.element.style.opacity = '0';

                // Remove from DOM and array after fade-out completes
                fishToRemove.element.addEventListener('transitionend', () => {
                    if (fishToRemove.element.isConnected) fishToRemove.element.remove();
                    // Remove from activeFish array *after* DOM removal
                    const arrayIndex = activeFish.indexOf(fishToRemove);
                    if (arrayIndex > -1) activeFish.splice(arrayIndex, 1);
                    // Add a new fish if below target count and tab is visible
                    if (!document.hidden && activeFish.length < fishCount) {
                        setTimeout(createFish, 500); // Add replacement with slight delay
                    }
                }, { once: true });

                // Fallback removal if transitionend doesn't fire
                setTimeout(() => {
                    if (fishToRemove.element.isConnected) fishToRemove.element.remove();
                    const arrayIndex = activeFish.indexOf(fishToRemove);
                    if (arrayIndex > -1) activeFish.splice(arrayIndex, 1);
                    if (!document.hidden && activeFish.length < fishCount) {
                       setTimeout(createFish, 500);
                    }
                }, 1600); // Timeout slightly longer than transition

            } else {
                 // If element somehow disconnected before fade, just remove from array
                 const arrayIndex = activeFish.indexOf(fishToRemove);
                 if (arrayIndex > -1) activeFish.splice(arrayIndex, 1);
                 // Add replacement if needed
                 if (!document.hidden && activeFish.length < fishCount) {
                     setTimeout(createFish, 500);
                 }
            }
        }, isLowPerfDevice ? 30000 : 20000); // Longer refresh interval on low-perf

        // Create the initial set of fish with a slight stagger
        for (let i = 0; i < fishCount; i++) {
            setTimeout(createFish, i * (isLowPerfDevice ? 600 : 300));
        }
    }

    function createFish() {
        if (document.hidden || !fishContainer || !fishImageKeys.length) return null; // Don't create if hidden or no data

        try {
            const fishElement = document.createElement('div');
            fishElement.className = 'swimming-fish';
            fishElement.setAttribute('aria-hidden', 'true'); // It's decorative

            // Select a random fish image
            const randomFishKey = fishImageKeys[Math.floor(Math.random() * fishImageKeys.length)];
            const fishImageUrl = FISH_IMAGES[randomFishKey];
            if (!fishImageUrl) {
                console.warn(`Image URL not found for key: ${randomFishKey}`);
                return null; // Skip this fish if URL is missing
            }

            // Create image element
            const img = document.createElement('img');
            img.crossOrigin = "anonymous"; // May help if drawing to canvas later
            img.src = fishImageUrl;
            img.alt = `${randomFishKey} fish swimming`; // Alt text for accessibility (though hidden)
            img.loading = 'lazy'; // Let browser decide when to load
            img.onerror = function() { // Handle image loading errors
                console.error(`Failed to load fish image: ${randomFishKey} at ${fishImageUrl}`);
                // Use a default fallback image if the intended one fails
                img.src = FISH_IMAGES["Common Carp"] || "images/placeholder-fish.png"; // Use Carp or placeholder
                img.alt = "Fallback fish image";
            };
            fishElement.appendChild(img);

            // Determine fish size based on rarity keywords in its name (adjust as needed)
            let size;
            if (randomFishKey.includes("Mythic") || randomFishKey.includes("Legendary") || randomFishKey.includes("Chimerical") || randomFishKey.includes("Kraken") || randomFishKey.includes("Whale")) {
                size = 65 + Math.random() * 30; // Larger for rarer/bigger types
            } else if (randomFishKey.includes("Rare") || randomFishKey.includes("Shark") || randomFishKey.includes("Sturgeon")) {
                size = 50 + Math.random() * 25;
            } else {
                size = 40 + Math.random() * 20; // Smaller for common/uncommon/smaller types
            }
            fishElement.style.width = `${size}px`;
            fishElement.style.height = 'auto'; // Maintain aspect ratio

            // Set initial position within the current water height
            const startX_vw = Math.random() * 100; // Random horizontal start (vw)
            // CHANGED: Calculate Y position from the TOP within water boundaries
            const startY_vh = currentWaterTopVh + (Math.random() * (currentWaterHeightVh * 0.8)); // Random vertical start (vh, within 80% of water height, from top)

            fishElement.style.opacity = '0'; // Start invisible for fade-in

            // Set initial direction and determine scaleX for flipping
            const direction = Math.random() > 0.5 ? 'right' : 'left';
            const scaleX = direction === 'left' ? -1 : 1;

            // CHANGED: Set initial transform
            fishElement.style.transform = `translate(${startX_vw.toFixed(1)}vw, ${startY_vh.toFixed(1)}vh) scaleX(${scaleX})`;

            // Calculate speed (slower for larger fish, adjusted by performance)
            const speedFactor = isLowPerfDevice ? 0.4 : 1;
            const baseSpeed = (40 - size * 0.3) * 0.05 * speedFactor; // Base speed in vw/sec
            const speed = Math.max(0.5, Math.min(4, baseSpeed)); // Clamp speed

            // Store fish state data (using vw/vh from top-left)
            const fishData = {
                element: fishElement,
                speed: speed, // Horizontal speed (vw per second)
                direction: direction,
                verticalDirection: Math.random() > 0.5 ? 'up' : 'down', // Initial vertical direction
                verticalAmount: Math.random() * 5 + 2, // How far up/down it moves (vh)
                originalY_vh: startY_vh, // Base vertical position (vh from top)
                wiggleAmount: Math.random() * 0.4 + 0.3, // How much it wiggles
                wigglePhase: Math.random() * Math.PI * 2, // Starting point in wiggle cycle
                currentX_vw: startX_vw, // Current horizontal position (vw)
                currentY_vh: startY_vh // Current vertical position (vh from top)
            };

            fishContainer.appendChild(fishElement);
            activeFish.push(fishData); // Add to the list of active fish

            // Fade the fish in smoothly
            requestAnimationFrame(() => {
                fishElement.style.transition = 'opacity 0.5s ease-in';
                fishElement.style.opacity = '0.8'; // Target opacity when visible
            });

            return fishData;
        } catch (err) {
            console.error("Error creating fish:", err);
            return null;
        }
    }

    // Update positions of all active fish (called in the throttled part of main loop)
    function updateAllFish(elapsedSinceLastThrottledFrame) {
        if (!activeFish.length || prefersReducedMotion) return; // Skip if no fish or reduced motion

        const elapsedSeconds = elapsedSinceLastThrottledFrame / 1000; // Time since last update in seconds
        const boundaryPadding = 3; // Keep fish away from screen edges (vw)
        // CHANGED: Define water boundaries from the top
        const waterTopBoundary_vh = currentWaterTopVh + 1; // 1vh below surface
        const waterBottomBoundary_vh = 100 - 2; // 2vh above viewport bottom

        activeFish.forEach((fish, index) => {
            // Check if fish element still exists in the DOM
            if (!fish.element || !fish.element.isConnected) {
                activeFish.splice(index, 1); // Remove stale fish data
                return; // Skip to next fish
            }

            // Destructure fish data for easier access
            let {
                element, speed, direction, verticalDirection, verticalAmount,
                originalY_vh, wiggleAmount, wigglePhase, currentX_vw, currentY_vh
            } = fish;

            // Update Horizontal Movement & Check Boundaries
            const horizontalMove = speed * elapsedSeconds;
            let scaleX = direction === 'left' ? -1 : 1; // Keep track of scale for transform

            if (direction === 'right') {
                currentX_vw += horizontalMove;
                if (currentX_vw > (100 - boundaryPadding)) { // Hit right edge
                    direction = 'left';
                    scaleX = -1; // Update scale for flipping
                }
            } else { // Moving left
                currentX_vw -= horizontalMove;
                if (currentX_vw < boundaryPadding) { // Hit left edge
                    direction = 'right';
                    scaleX = 1; // Update scale for flipping
                }
            }
            // Small random chance to change direction mid-screen
            if (Math.random() < 0.0005) {
                direction = (direction === 'right' ? 'left' : 'right');
                scaleX = direction === 'left' ? -1 : 1; // Update scale
            }

            // Update Vertical Movement & Check Boundaries (using vh from top)
            const verticalSpeed = speed * 0.3; // Vertical movement slower than horizontal
            const verticalMove = verticalSpeed * elapsedSeconds;
            let targetY_vh = currentY_vh + (verticalDirection === 'up' ? -verticalMove : verticalMove); // 'up' decreases vh

            // Define vertical movement range based on original position
            const verticalTopLimit = Math.max(waterTopBoundary_vh, originalY_vh - verticalAmount);
            const verticalBottomLimit = Math.min(waterBottomBoundary_vh, originalY_vh + verticalAmount);

            // Check vertical boundaries
            if (verticalDirection === 'up' && targetY_vh < verticalTopLimit) {
                verticalDirection = 'down'; // Turn down
                targetY_vh = currentY_vh + verticalMove; // Adjust target for new direction
            } else if (verticalDirection === 'down' && targetY_vh > verticalBottomLimit) {
                verticalDirection = 'up'; // Turn up
                targetY_vh = currentY_vh - verticalMove; // Adjust target for new direction
            }
            // Small random chance to change vertical direction
            if (Math.random() < 0.002) {
                verticalDirection = (verticalDirection === 'up' ? 'down' : 'up');
            }

            // Apply Wiggle (subtle vertical oscillation)
            wigglePhase += 6 * elapsedSeconds; // Adjust wiggle speed
            const wiggle = Math.sin(wigglePhase) * wiggleAmount;
            targetY_vh += wiggle * 0.1; // Apply small wiggle offset

            // Clamp final vertical position within absolute water boundaries
            currentY_vh = Math.max(waterTopBoundary_vh, Math.min(waterBottomBoundary_vh, targetY_vh));

            // CHANGED: Apply updated position and flip using transform
            element.style.transform = `translate(${currentX_vw.toFixed(1)}vw, ${currentY_vh.toFixed(1)}vh) scaleX(${scaleX})`;

            // Update the fish object state in the array
            fish.direction = direction;
            fish.verticalDirection = verticalDirection;
            fish.wigglePhase = wigglePhase % (Math.PI * 2); // Keep phase value reasonable
            fish.currentX_vw = currentX_vw;
            fish.currentY_vh = currentY_vh;
        });
    }

    // Mouse Trail Effect setup
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2; // Start mouse position at center
    let trailX = mouseX, trailY = mouseY; // Trail starts at mouse position
    let lastDropletTime = 0;
    const DROPLET_INTERVAL = 50; // Max interval between trail droplets (ms)
    let animateTrailFn = () => {}; // Placeholder for the trail animation function
    let isTrailActive = false; // Track if the trail effect should be running

    function initMouseTrail() {
        // Skip initialization if trail element missing, low performance, or touch device
        if (!trail || isLowPerfDevice || 'ontouchstart' in window) {
            if (trail) trail.style.display = 'none'; // Hide element if it exists but shouldn't run
            document.body.style.cursor = 'auto'; // Ensure default cursor is visible
            document.body.classList.remove('custom-cursor-active'); // Remove class if trail not active
            isTrailActive = false;
            return;
        }

        // Double-check: If canvas is somehow active, don't run this DOM trail
        if (document.body.classList.contains('using-canvas')) {
             if (trail) trail.style.display = 'none';
             document.body.classList.remove('custom-cursor-active'); // Remove class if canvas overrides
             isTrailActive = false;
             return;
        }

        // Hide default cursor and prepare custom trail
        document.body.style.cursor = 'none';
        document.body.classList.add('custom-cursor-active'); // Add class to indicate custom cursor
        trail.style.opacity = '0'; // Start hidden
        isTrailActive = true; // Enable trail updates in the main loop

        // Track mouse movement
        document.addEventListener('mousemove', (e) => {
            if (!isTrailActive) return;
            mouseX = e.clientX;
            mouseY = e.clientY;
            // Make trail visible on first mouse move
            if (trail.style.opacity === '0') {
                trailX = mouseX; // Position trail immediately
                trailY = mouseY;
                trail.style.transform = `translate(${trailX.toFixed(0)}px, ${trailY.toFixed(0)}px) translate(-50%, -50%) rotate(45deg) scale(1)`;
                trail.style.opacity = '0.8'; // Make visible
            }
        });

        // Function to animate the trail's position smoothly (called every frame in mainLoop)
        animateTrailFn = (elapsedSinceLastFrame) => {
            if (!trail || !isTrailActive || isNaN(mouseX) || isNaN(mouseY)) return; // Safety checks

            // Interpolate trail position towards the actual mouse position for smoothness
            const lerpFactor = 0.2; // Adjust for responsiveness vs smoothness (0.1 = smoother, 0.3 = more responsive)
            trailX += (mouseX - trailX) * lerpFactor;
            trailY += (mouseY - trailY) * lerpFactor;

            // Update trail element position using translate for performance
            // Preserve scale during updates (important for click effect)
            const currentTransform = trail.style.transform;
            const currentScaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
            const currentScale = currentScaleMatch ? currentScaleMatch[1] : '1';
            trail.style.transform = `translate(${trailX.toFixed(0)}px, ${trailY.toFixed(0)}px) translate(-50%, -50%) rotate(45deg) scale(${currentScale})`;

            // Create trailing droplets based on time and distance moved
            const now = performance.now();
            const distMoved = Math.hypot(mouseX - trailX, mouseY - trailY); // Approx distance moved
            // Create droplet if enough time passed, mouse moved, and randomly (50% chance)
            if (now - lastDropletTime > DROPLET_INTERVAL && distMoved > 3 && Math.random() > 0.5) {
                createTrailDroplet(trailX, trailY);
                lastDropletTime = now;
            }
        };

         // Fade trail out when mouse stops moving
         let fadeTimeout;
         document.addEventListener('mousemove', () => {
             if (!trail || !isTrailActive) return;
             trail.style.opacity = '0.8'; // Ensure trail is visible on move
             clearTimeout(fadeTimeout); // Clear previous fade timeout
             // Set new timeout to fade after a delay
             fadeTimeout = setTimeout(() => { if (trail && isTrailActive) trail.style.opacity = '0'; }, 300);
         });

         // Handle click effects (scale trail, create splash)
         document.addEventListener('mousedown', (e) => {
             // Ignore clicks on interactive elements
             if (!trail || !isTrailActive || e.target.closest('a, button, .button, input, select, textarea, [role="button"]')) return;
             // Scale down trail slightly on click
             trail.style.transform = `translate(${trailX.toFixed(0)}px, ${trailY.toFixed(0)}px) translate(-50%, -50%) rotate(45deg) scale(0.6)`;
             createWaterSplash(e.clientX, e.clientY); // Create splash effect at click location
         });
         document.addEventListener('mouseup', (e) => {
             // Ignore clicks on interactive elements
             if (!trail || !isTrailActive || e.target.closest('a, button, .button, input, select, textarea, [role="button"]')) return;
             // Restore trail scale with a slight bounce effect
             trail.style.transform = `translate(${trailX.toFixed(0)}px, ${trailY.toFixed(0)}px) translate(-50%, -50%) rotate(45deg) scale(1.1)`;
             setTimeout(() => { // Return to normal scale after bounce
                 if (trail && isTrailActive) trail.style.transform = `translate(${trailX.toFixed(0)}px, ${trailY.toFixed(0)}px) translate(-50%, -50%) rotate(45deg) scale(1)`;
             }, 150);
         });

         // Function to create a single droplet behind the trail
         function createTrailDroplet(x, y) {
            if (isNaN(x) || isNaN(y) || document.hidden || !isTrailActive) return;
            const droplet = document.createElement('div');
            droplet.className = 'trail-droplet';
            droplet.setAttribute('aria-hidden', 'true');
            // Position near the trail cursor with slight randomness
            droplet.style.left = `${x + (Math.random() * 10 - 5)}px`;
            droplet.style.top = `${y + (Math.random() * 10 - 5)}px`;
            const size = 4 + Math.random() * 6; // Random size
            droplet.style.width = `${size}px`;
            droplet.style.height = `${size}px`;
            document.body.appendChild(droplet);
            // Remove droplet after its CSS fade-out animation completes
            setTimeout(() => { droplet.remove(); }, 800); // Match CSS animation duration
         }

         // Function to create the splash effect (multiple droplets) on click
         function createWaterSplash(x, y) {
            if (document.hidden || !isTrailActive) return;
            const splashContainer = document.createElement('div');
            splashContainer.className = 'water-splash';
            splashContainer.setAttribute('aria-hidden', 'true');
            splashContainer.style.left = `${x}px`; // Position at click location
            splashContainer.style.top = `${y}px`;
            document.body.appendChild(splashContainer);

            const dropletCount = isLowPerfDevice ? 6 : 12; // Fewer droplets for performance
            for (let i = 0; i < dropletCount; i++) {
                const droplet = document.createElement('div');
                droplet.className = 'splash-droplet';
                const size = 5 + Math.random() * 10; // Random size
                droplet.style.width = `${size}px`;
                droplet.style.height = `${size}px`;
                // Calculate outward trajectory for each droplet
                const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() * 0.5 - 0.25); // Base angle + randomness
                const distance = 20 + Math.random() * 40; // Random distance
                const splashX = Math.cos(angle) * distance;
                const splashY = Math.sin(angle) * distance;
                // Set CSS custom properties used by the splash animation
                droplet.style.setProperty('--splash-x', `${splashX.toFixed(1)}px`);
                droplet.style.setProperty('--splash-y', `${splashY.toFixed(1)}px`);
                splashContainer.appendChild(droplet);
            }
            // Remove the entire splash container after the animation duration
            setTimeout(() => { splashContainer.remove(); }, 600); // Match CSS animation duration
         }

         // Run the trail animation once immediately to position it correctly
         animateTrailFn(0);
    }

    // Initialize static event listeners (like button clicks, scroll effects)
    function initStaticListeners() {
        // Button Ripple Effect (using event delegation on the body)
        document.body.addEventListener('mousedown', function (e) {
            // Don't apply ripple to UI toggle buttons
            if (e.target.closest('#ui-toggle-container')) return;

            const button = e.target.closest('.button'); // Find the button element clicked on/inside
            if (!button) return; // Exit if not a button click

            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left; // Click position relative to button
            const y = e.clientY - rect.top;

            // Remove any existing ripple element first
            const existingRipple = button.querySelector('.ripple');
            if (existingRipple) existingRipple.remove();

            // Create and append the ripple element
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            button.appendChild(ripple);

            // Remove the ripple element after its animation finishes
            ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
        });

        // Fade-in Sections on Scroll using Intersection Observer
        const animatedSections = document.querySelectorAll('.animated-section.fade-in');
        if ('IntersectionObserver' in window && animatedSections.length > 0) {
            const observerOptions = {
                root: null, // Observe intersections relative to the viewport
                rootMargin: '0px',
                threshold: 0.15 // Trigger when 15% of the element is visible
            };
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible'); // Make section visible
                        entry.target.classList.remove('fade-in'); // Remove initial fade-in class
                        obs.unobserve(entry.target); // Stop observing once it's visible
                    }
                });
            }, observerOptions);
            // Observe each section that needs the initial fade-in
            animatedSections.forEach(section => observer.observe(section));
        } else { // Fallback for browsers without IntersectionObserver or if no sections found
            animatedSections.forEach(section => {
                section.classList.add('visible'); // Make sections visible immediately
                section.classList.remove('fade-in');
            });
        }

        // Smooth Scrolling for Navigation Links (using event delegation)
        document.body.addEventListener('click', function(e) {
            const anchor = e.target.closest('nav a[href^="#"]'); // Check if click is on a nav link to an anchor
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (href && href.length > 1) { // Ensure it's a valid anchor link (not just "#")
                e.preventDefault(); // Prevent the default instant jump
                try {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        const headerOffset = document.querySelector('header')?.offsetHeight || 80; // Get header height or use default
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.scrollY - headerOffset; // Calculate target scroll position

                        // Perform smooth scroll
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
                    } else {
                        console.warn(`Smooth scroll target not found: ${href}`);
                    }
                } catch (err) {
                    console.error("Error finding element for smooth scroll:", href, err);
                }
            }
        });

        // Assign Discord Invite and Support Server links to relevant buttons/links
        const discordInviteLink = "https://discord.com/oauth2/authorize?client_id=1354018504470298624";
        const discordSupportLink = "https://discord.gg/6TxYjeQcXg";

        document.querySelectorAll('.invite-button').forEach(button => {
            if (button.tagName === 'A') { // If it's a link, set href
               button.href = discordInviteLink;
               button.target = "_blank"; // Open in new tab
               button.rel = "noopener noreferrer"; // Security best practice
            } else if (button.tagName === 'BUTTON') { // If it's a button, add click listener
                button.addEventListener('click', () => window.open(discordInviteLink, '_blank', 'noopener,noreferrer'));
            }
        });
        document.querySelectorAll('.support-button').forEach(button => {
            if (button.tagName === 'A') {
               button.href = discordSupportLink;
               button.target = "_blank";
               button.rel = "noopener noreferrer";
            } else if (button.tagName === 'BUTTON') {
                button.addEventListener('click', () => window.open(discordSupportLink, '_blank', 'noopener,noreferrer'));
            }
        });

        // Expandable Content in Legal Sections (using event delegation)
        document.body.addEventListener('click', function(e) {
            const button = e.target.closest('.expand-btn'); // Check if click is on an expand button
            if (!button) return;

            const expandedContent = button.nextElementSibling; // Get the content element right after the button
            if (!expandedContent || !expandedContent.classList.contains('expanded-content')) {
                console.warn('Expanded content not found for button:', button);
                return;
            }

            // Toggle visibility and ARIA attribute
            const isVisible = expandedContent.style.display === 'block';
            expandedContent.style.display = isVisible ? 'none' : 'block';
            button.setAttribute('aria-expanded', !isVisible);
            // The +/- icon is handled by CSS using the [aria-expanded] attribute
        });
        // Initialize ARIA attributes on page load based on initial display state
        document.querySelectorAll('.expand-btn').forEach(button => {
            const expandedContent = button.nextElementSibling;
            const isVisible = expandedContent?.style.display === 'block';
            button.setAttribute('aria-expanded', isVisible);
        });

        // UI Toggle Button Functionality
        if (hideUiButton && showUiButton) {
            hideUiButton.addEventListener('click', () => {
                document.body.classList.add('ui-hidden'); // Add class to hide main UI elements via CSS
                hideUiButton.style.display = 'none'; // Hide the "Hide UI" button
                showUiButton.style.display = 'inline-flex'; // Show the "Show UI" button
            });

            showUiButton.addEventListener('click', () => {
                document.body.classList.remove('ui-hidden'); // Remove class to show main UI
                hideUiButton.style.display = 'inline-flex'; // Show the "Hide UI" button
                showUiButton.style.display = 'none'; // Hide the "Show UI" button
            });
        } else {
            console.warn("UI toggle buttons not found.");
        }
    }

    // Main Animation Loop - Coordinates all DOM-based animations
    function mainLoop(timestamp) {
        if (!isLoopRunning) return; // Stop the loop if the flag is false

        // Request the next frame immediately
        animationFrameId = requestAnimationFrame(mainLoop);

        // Calculate time elapsed since the last frame
        if (!lastTimestamp) lastTimestamp = timestamp;
        const elapsedSinceLastFrame = timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        // --- High-Frequency Updates (Run Every Frame) ---
        // Update mouse trail position for maximum smoothness
        if (isTrailActive && typeof animateTrailFn === 'function') {
            animateTrailFn(elapsedSinceLastFrame);
        }

        // --- Throttled Updates (Run Less Frequently - Now ~30fps) ---
        // Calculate time elapsed since the last *throttled* update
        if (!lastThrottledTimestamp) lastThrottledTimestamp = timestamp;
        const elapsedSinceLastThrottledFrame = timestamp - lastThrottledTimestamp;

        // Only run throttled updates if enough time has passed (approx. 30fps)
        if (elapsedSinceLastThrottledFrame >= FRAME_DURATION * 0.9) { // Use 0.9 multiplier for buffer
            lastThrottledTimestamp = timestamp; // Update timestamp for the *next* throttled frame

            // Update water height (smooth easing happens here)
            updateWaterHeight(elapsedSinceLastThrottledFrame);

            // Update dynamic waves (if motion is enabled)
            if (!prefersReducedMotion) {
                updateWaves(elapsedSinceLastThrottledFrame);
            }

            // Update fish positions (if motion is enabled)
            if (!prefersReducedMotion) {
                updateAllFish(elapsedSinceLastThrottledFrame);
            }
        }
    }

    // Functions to start and stop the main DOM animation loop
    function startAnimationLoop() {
        if (isLoopRunning) return; // Don't start if already running
        console.log("Starting DOM animation loop");
        isLoopRunning = true;
        lastTimestamp = performance.now(); // Reset timestamps before starting
        lastThrottledTimestamp = lastTimestamp;
        if (animationFrameId) cancelAnimationFrame(animationFrameId); // Clear any old frame ID
        animationFrameId = requestAnimationFrame(mainLoop); // Start the loop
    }

    function stopAnimationLoop() {
        if (!isLoopRunning) return; // Don't stop if already stopped
        console.log("Stopping DOM animation loop");
        isLoopRunning = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId); // Cancel the next frame request
            animationFrameId = null;
        }
        lastTimestamp = 0; // Reset timestamps
        lastThrottledTimestamp = 0;
    }

    // --- START: Try Me Fishing Simulator Logic ---
    const tryMeSection = document.getElementById('try-me');

    // Only initialize if the Try Me section exists on the current page
    if (tryMeSection) {
        const castButton = document.getElementById('tryMeCastButton');
        const sellButton = document.getElementById('tryMeSellButton');
        const resultDiv = document.getElementById('tryMeResult');
        const fishImage = document.getElementById('tryMeFishImage');
        const fishName = document.getElementById('tryMeFishName');
        const fishRarity = document.getElementById('tryMeFishRarity');
        const fishValue = document.getElementById('tryMeFishValue');
        const coinDisplay = document.getElementById('tryMeCoinDisplay');
        const statusText = document.getElementById('tryMeStatusText');

        let simulatedCoins = 0;
        let currentCatch = null;
        let isCasting = false; // Prevent spamming cast

        // Ensure FISH_DATA and FISH_IMAGES are loaded
        // Use window object as they are loaded globally from separate files
        if (typeof window.FISH_DATA === 'undefined' || typeof window.FISH_IMAGES === 'undefined') {
            console.error("Try Me Simulator Error: FISH_DATA or FISH_IMAGES not loaded.");
            if(statusText) statusText.textContent = "Error: Fish data not loaded.";
            if (castButton) castButton.disabled = true;
            // Optionally hide the whole section or show a more prominent error
        } else {
            // Initialize display
            updateCoinDisplay();
            if (castButton) castButton.style.display = 'inline-flex';
            if (sellButton) sellButton.style.display = 'none';
            if (resultDiv) resultDiv.style.display = 'none';
            if (resultDiv) resultDiv.classList.remove('visible');

            // Simplified catch logic
            function simulateCatch() {
                const rand = Math.random();
                let selectedRarity = 'common'; // Default
                let fishPool = [];

                // Use globally available FISH_DATA
                const localFishData = window.FISH_DATA;

                // Simplified probabilities (adjust as needed)
                if (rand < 0.01 && localFishData.junk?.length > 0) { // 1% Junk
                    selectedRarity = 'junk';
                    fishPool = localFishData.junk;
                } else if (rand < 0.05 && localFishData.legendary?.length > 0) { // 4% Legendary (0.05 - 0.01)
                    selectedRarity = 'legendary';
                    fishPool = localFishData.legendary;
                } else if (rand < 0.15 && localFishData.rare?.length > 0) { // 10% Rare (0.15 - 0.05)
                    selectedRarity = 'rare';
                    fishPool = localFishData.rare;
                } else if (rand < 0.40 && localFishData.uncommon?.length > 0) { // 25% Uncommon (0.40 - 0.15)
                    selectedRarity = 'uncommon';
                    fishPool = localFishData.uncommon;
                } else if (localFishData.common?.length > 0) { // 60% Common (remaining)
                    selectedRarity = 'common';
                    fishPool = localFishData.common || []; // Use common or empty array
                } else {
                    // Fallback if a category is empty
                    console.warn("Could not find fish pool for selected rarity, defaulting to common.");
                    selectedRarity = 'common';
                    fishPool = localFishData.common || []; // Use common or empty array
                }

                if (fishPool.length === 0) {
                    console.error(`No fish found in the '${selectedRarity}' pool!`);
                    // Return a default placeholder or handle error
                    return { name: "Nothing...", rarity: "none", baseValue: 0 };
                }

                // Select a random item from the pool
                const randomIndex = Math.floor(Math.random() * fishPool.length);
                const caughtItem = { ...fishPool[randomIndex] }; // Clone the item

                // Assign a value even if it's junk for simplicity in the demo
                caughtItem.displayValue = caughtItem.baseValue || (caughtItem.rarity === 'junk' ? 1 : 5);
                caughtItem.rarity = caughtItem.rarity || 'unknown'; // Ensure rarity exists

                return caughtItem;
            }

            // Display the result
            function displayResult(item) {
                currentCatch = item; // Store the catch

                if (!fishName || !fishRarity || !fishValue || !fishImage || !resultDiv || !castButton || !sellButton || !statusText) {
                    console.error("Try Me Simulator Error: One or more display elements not found.");
                    return;
                }

                fishName.textContent = item.name;
                fishRarity.textContent = capitalizeFirst(item.rarity);
                fishValue.textContent = `Value: ${item.displayValue}`;

                // Set rarity color (using inline style for simplicity here)
                const rarityColor = window.FISH_DATA.colors[item.rarity] || '#cccccc';
                fishRarity.style.color = rarityColor; // Color the text
                // Optional: Add border color like catalog cards
                // resultDiv.style.borderColor = rarityColor;

                // Set image using globally available FISH_IMAGES
                const imageUrl = window.FISH_IMAGES[item.name] || window.FISH_IMAGES['placeholder'] || 'images/placeholder-fish.png';
                fishImage.src = imageUrl;
                fishImage.alt = item.name;

                resultDiv.style.display = 'block';
                // Use timeout to allow display:block before adding class for transition
                setTimeout(() => resultDiv.classList.add('visible'), 10);

                // Update buttons and status
                castButton.style.display = 'none';
                if (item.rarity !== 'junk' && item.rarity !== 'none') {
                    sellButton.style.display = 'inline-flex';
                    statusText.textContent = `You caught a ${item.name}!`;
                } else {
                    sellButton.style.display = 'none';
                    // Show cast button again immediately if junk/nothing
                    setTimeout(resetSimulator, 1500); // Show cast after a delay
                    statusText.textContent = `You caught ${item.name}...`;
                }
                isCasting = false; // Re-enable casting after result is shown
                castButton.classList.remove('casting'); // Remove animation class
            }

            // Sell the current catch
            function sellCatch() {
                if (currentCatch && currentCatch.rarity !== 'junk' && currentCatch.rarity !== 'none') {
                    simulatedCoins += currentCatch.displayValue;
                    updateCoinDisplay();
                    if(statusText) statusText.textContent = `Sold ${currentCatch.name} for ${currentCatch.displayValue} coins!`;
                }
                resetSimulator();
            }

            // Reset the simulator state
            function resetSimulator() {
                currentCatch = null;
                if (resultDiv) {
                    resultDiv.classList.remove('visible');
                    // Hide result after transition ends
                    setTimeout(() => {
                        if (!resultDiv.classList.contains('visible')) { // Check if still hidden
                             resultDiv.style.display = 'none';
                        }
                    }, 400); // Match CSS transition duration
                }

                if(sellButton) sellButton.style.display = 'none';
                if(castButton) castButton.style.display = 'inline-flex';
                if (!isCasting && statusText) { // Only update status if not currently casting
                     statusText.textContent = "Ready to cast!";
                }
            }

            // Update coin display
            function updateCoinDisplay() {
                if(coinDisplay) coinDisplay.textContent = simulatedCoins;
            }

            // Helper to capitalize
            function capitalizeFirst(str) {
                if (!str) return '';
                return str.charAt(0).toUpperCase() + str.slice(1);
            }

            // Event Listeners (check if buttons exist)
            if (castButton) {
                castButton.addEventListener('click', () => {
                    if (isCasting) return; // Prevent multiple clicks while casting

                    isCasting = true;
                    if(statusText) statusText.textContent = "Casting...";
                    castButton.disabled = true; // Disable button during cast
                    castButton.classList.add('casting'); // Add animation class

                    // Simulate casting time (e.g., 1 second)
                    setTimeout(() => {
                        const caughtItem = simulateCatch();
                        displayResult(caughtItem);
                        castButton.disabled = false; // Re-enable button
                    }, 1000); // 1 second delay
                });
            }

            if (sellButton) {
                sellButton.addEventListener('click', sellCatch);
            }
        }
    }
    // --- END: Try Me Fishing Simulator Logic ---


    // Modify initializeWebsiteAnimations() to only run when canvas isn't used
    function initializeWebsiteAnimations() {
        // Don't initialize DOM water effects if canvas is being used
        const isUsingCanvas = document.body.classList.contains('using-canvas');

        console.log("Initializing TackleBot animations...");
        initSky(); // Always initialize sky
        initStaticListeners(); // Always setup non-animated listeners

        if (!isUsingCanvas) {
            console.log("Initializing DOM-based water effects...");
            initWaterBackground();
            initDynamicWaves();
            initMouseTrail();
            // Delay fish initialization slightly to prioritize initial page render
            setTimeout(initSwimmingFish, 500);

            // Pause/resume DOM animations when tab visibility changes
            document.addEventListener('visibilitychange', () => {
                if (isUsingCanvas) return; // Canvas handles its own visibility
                if (!document.hidden) {
                    startAnimationLoop(); // Resume loop
                    // Restart intervals that might have been cleared
                    if (!bubbleInterval && bubblesContainer) startBubbles(); // Assuming startBubbles is defined globally or accessible here
                } else {
                    stopAnimationLoop(); // Pause loop
                    // Clear intervals to save resources when hidden
                    if (bubbleInterval) { clearInterval(bubbleInterval); bubbleInterval = null; } // Assuming bubbleInterval is global or accessible
                }
            });

            // Start the DOM animation loop initially if the page is visible
            if (!document.hidden) {
                startAnimationLoop();
            }
        }

        // Cleanup intervals and animation loop when the page is unloaded
        window.addEventListener('pagehide', () => { // 'pagehide' is better for mobile
            console.log("Cleaning up animations and intervals...");
            // Stop and cleanup canvas if it exists
            if (waterCanvasInstance && typeof waterCanvasInstance.stop === 'function') {
                waterCanvasInstance.stop();
                waterCanvasInstance = null;
            }
            // Stop DOM animation loop if it was running
            stopAnimationLoop();

            // Clear all known intervals (ensure these variables are accessible)
            if (skyUpdateInterval) clearInterval(skyUpdateInterval);
            if (waveStateInterval) clearInterval(waveStateInterval);
            if (bubbleInterval) clearInterval(bubbleInterval);
            if (adjustFishToWaterInterval) clearInterval(adjustFishToWaterInterval);
            if (fishRefreshInterval) clearInterval(fishRefreshInterval);
            if (scrollTimeout) clearTimeout(scrollTimeout);

            // Reset interval IDs
            skyUpdateInterval = waveStateInterval = bubbleInterval = adjustFishToWaterInterval = fishRefreshInterval = scrollTimeout = null;

            console.log("Cleanup complete.");
        });

        console.log("TackleBot animations initialized.");
    }

    // Run the main initialization function
    initializeWebsiteAnimations();

}); // End DOMContentLoaded listener