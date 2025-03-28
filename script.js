document.addEventListener('DOMContentLoaded', () => {

    // --- Performance Detection ---
    // Use const for values that don't change after initialization
    const isLowPerfDevice = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
                           !('requestAnimationFrame' in window) || // More robust check
                           (window.navigator.hardwareConcurrency && window.navigator.hardwareConcurrency < 4) || // Check if hardwareConcurrency exists
                           navigator.userAgent.match(/mobile|android/i);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isLowPerfDevice) {
        document.body.classList.add('reduced-motion');
    }

    // --- Global Animation State ---
    let animationFrameId = null;
    let lastTimestamp = 0;
    // FRAME_DURATION is now primarily for throttling *other* animations, not the mouse trail
    const FRAME_DURATION = 1000 / 30; // Target ~30fps for non-trail animations (milliseconds)
    let lastThrottledTimestamp = 0; // Separate timestamp for throttled updates
    let isLoopRunning = false; // Track if the main loop is active

    // --- Element Caching ---
    // Cache frequently accessed elements early
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

    // --- Sky, Sun, Moon ---
    const NUM_CLOUDS = isLowPerfDevice ? 3 : 7;
    let skyUpdateInterval = null; // Interval ID for sky updates

    function initSky() {
        // Use cached elements
        if (!skyContainer || !sunElement || !moonElement || !cloudsContainer) {
            console.warn("Sky elements not found, skipping sky initialization.");
            return;
        }

        // Create initial clouds
        if (!prefersReducedMotion) {
            for (let i = 0; i < NUM_CLOUDS; i++) {
                createCloud(true); // Create initial clouds instantly
            }
            // Periodically add/remove clouds (Keep this interval, less frequent than animation)
            // Use requestIdleCallback or setTimeout for non-critical background tasks if possible,
            // but setInterval is acceptable here for simplicity and low frequency.
            setInterval(() => {
                if (document.hidden || !cloudsContainer) return; // Check container exists
                // Remove one cloud (if enough exist)
                if (cloudsContainer.children.length > NUM_CLOUDS / 2) {
                    const cloudToRemove = cloudsContainer.children[Math.floor(Math.random() * cloudsContainer.children.length)];
                    if (cloudToRemove) {
                        cloudToRemove.style.opacity = '0'; // Fade out
                        // Use transitionend event for removal instead of fixed timeout for robustness
                        cloudToRemove.addEventListener('transitionend', () => cloudToRemove.remove(), { once: true });
                        // Fallback timeout in case transitionend doesn't fire (e.g., element removed before transition)
                        setTimeout(() => { if (cloudToRemove.isConnected) cloudToRemove.remove(); }, 2100);
                    }
                }
                // Add one cloud (if not too many)
                if (cloudsContainer.children.length < NUM_CLOUDS * 1.5) {
                   // Delay addition slightly to spread load
                   setTimeout(createCloud, 500 + Math.random() * 4500);
                }
            }, 15000); // Every 15 seconds
        }

        // Initial update
        updateSkyAndTime();

        // OPTIMIZATION: Update sky less frequently using setInterval
        skyUpdateInterval = setInterval(() => {
            if (!document.hidden) {
                updateSkyAndTime();
            }
        }, 5000); // Update sky every 5 seconds
    }

    function createCloud(instant = false) {
        if (!cloudsContainer) return; // Use cached element

        const cloud = document.createElement('div');
        const type = Math.floor(Math.random() * 3) + 1; // type-1, type-2, type-3
        cloud.className = `cloud type-${type}`;

        const sizeMultiplier = 0.7 + Math.random() * 0.6;
        cloud.style.setProperty('--cloud-scale', sizeMultiplier);

        cloud.style.top = `${5 + Math.random() * 50}%`;

        const duration = 40 + Math.random() * 50;
        // Removed animationDuration setting as it's handled by CSS animation + drift-speed var
        cloud.style.setProperty('--drift-speed', `${duration}s`);

        const initialOpacity = (0.5 + Math.random() * 0.3).toFixed(2);

        if (instant) {
             cloud.style.animationDelay = `-${Math.random() * duration}s`;
             cloud.style.opacity = initialOpacity;
        } else {
            // Start off-screen (handled by animation initial state)
            cloud.style.opacity = '0'; // Start invisible
            // Use requestAnimationFrame to ensure style is applied before transition starts
            requestAnimationFrame(() => {
                cloud.style.transition = 'opacity 1s ease-in';
                cloud.style.opacity = initialOpacity;
            });
        }

        // Use animationend event for removal
        cloud.addEventListener('animationend', () => {
            cloud.remove();
        }, { once: true }); // Use once: true for automatic listener cleanup

        cloudsContainer.appendChild(cloud);
    }

    function updateSkyAndTime() {
        // Use cached elements
        if (!skyContainer || !sunElement || !moonElement) return;

        const now = new Date();
        let currentHour, currentMinute;

        // Use Intl API for better time zone handling and robustness
        try {
            const formatter = new Intl.DateTimeFormat("en-US", {
                timeZone: "America/New_York", hour12: false, hour: 'numeric', minute: 'numeric'
            });
            const parts = formatter.formatToParts(now);
            const hourPart = parts.find(part => part.type === 'hour');
            const minutePart = parts.find(part => part.type === 'minute');
            if (hourPart && minutePart) {
                currentHour = parseInt(hourPart.value, 10);
                // Handle potential 24 -> 0 conversion for midnight
                if (currentHour === 24) currentHour = 0;
                currentMinute = parseInt(minutePart.value, 10);
            } else {
                throw new Error("Could not parse NY time parts.");
            }
        } catch (e) {
            console.warn("Could not get New York time, using local time.", e);
            currentHour = now.getHours();
            currentMinute = now.getMinutes();
        }

        const timeInMinutes = currentHour * 60 + currentMinute;
        const sunriseStart = 5 * 60, sunriseEnd = 7 * 60; // 5:00 AM - 7:00 AM
        const sunsetStart = 18 * 60, sunsetEnd = 20 * 60; // 6:00 PM - 8:00 PM
        const dayDuration = sunsetStart - sunriseEnd;
        const nightDuration = (24 * 60 - sunsetEnd) + sunriseStart;

        let skyGradient = 'var(--sky-day)';
        let sunOpacity = 0, moonOpacity = 0;
        let sunX = 50, sunY = 90, moonX = 50, moonY = 90; // Default positions (usually below horizon)

        // --- Calculations ---
        if (timeInMinutes >= sunriseStart && timeInMinutes < sunriseEnd) { // Sunrise Transition
            const progress = (timeInMinutes - sunriseStart) / (sunriseEnd - sunriseStart);
            skyGradient = `linear-gradient(to bottom, ${interpolateColor('#000030', '#87CEEB', progress)} 10%, ${interpolateColor('#191970', '#ADD8E6', progress)} 50%, ${interpolateColor('#2c3e50', '#B0E0E6', progress)} 100%)`;

            // Simplified transition: Moon fades out first, then Sun fades in
            const transitionPoint = 0.5;
            if (progress < transitionPoint) { // Moon fades out
                moonOpacity = 1 - (progress / transitionPoint);
                sunOpacity = 0;
                moonX = 50 + (1 - progress) * 50; // Moves from right to center
                moonY = 25 + Math.sin((1 - progress) * Math.PI) * 60; // Sets like night
                sunY = 95; // Keep sun below horizon
            } else { // Sun fades in
                sunOpacity = (progress - transitionPoint) / (1 - transitionPoint);
                moonOpacity = 0;
                sunX = (progress * 100) / 2; // Moves from left horizon towards center
                sunY = 25 + Math.sin(progress * Math.PI) * 60; // Rises like day
                moonY = 95; // Keep moon below horizon
            }

        } else if (timeInMinutes >= sunriseEnd && timeInMinutes < sunsetStart) { // Daytime
            const progress = (timeInMinutes - sunriseEnd) / dayDuration;
            skyGradient = 'var(--sky-day)'; sunOpacity = 1; moonOpacity = 0;
            sunX = progress * 100; // Moves across the sky
            sunY = 25 + Math.sin(progress * Math.PI) * 60; // Arcs across the sky
            moonY = 95; // Keep moon below horizon

        } else if (timeInMinutes >= sunsetStart && timeInMinutes < sunsetEnd) { // Sunset Transition
            const progress = (timeInMinutes - sunsetStart) / (sunsetEnd - sunsetStart);
            // Adjusted sunset gradient for smoother transition
            skyGradient = `linear-gradient(to bottom, ${interpolateColor('#87CEEB', '#4682B4', progress)} 0%, ${interpolateColor('#ADD8E6', '#191970', progress)} 40%, ${interpolateColor('#B0E0E6', '#000030', progress)} 100%)`;

            // Simplified transition: Sun fades out first, then Moon fades in
            const transitionPoint = 0.5;
            if (progress < transitionPoint) { // Sun fades out
                sunOpacity = 1 - (progress / transitionPoint);
                moonOpacity = 0;
                sunX = 50 + (1 - progress) * 50; // Moves from center to right horizon
                sunY = 25 + Math.sin((1 - progress) * Math.PI) * 60; // Sets like day
                moonY = 95; // Keep moon below horizon
            } else { // Moon fades in
                moonOpacity = (progress - transitionPoint) / (1 - transitionPoint);
                sunOpacity = 0;
                moonX = (progress * 100) / 2; // Moves from left horizon towards center
                moonY = 25 + Math.sin(progress * Math.PI) * 60; // Rises like night
                sunY = 95; // Keep sun below horizon
            }

        } else { // Nighttime
            // Calculate progress through the night (handles wrap around midnight)
            let progress;
            if (timeInMinutes >= sunsetEnd) { // Before midnight
                progress = (timeInMinutes - sunsetEnd) / nightDuration;
            } else { // After midnight
                progress = (timeInMinutes + (24 * 60 - sunsetEnd)) / nightDuration;
            }
            skyGradient = 'var(--sky-night)'; sunOpacity = 0; moonOpacity = 1;
            moonX = progress * 100; // Moves across the sky
            moonY = 25 + Math.sin(progress * Math.PI) * 60; // Arcs across the sky
            sunY = 95; // Keep sun below horizon
        }

        // --- Apply Styles ---
        // Use requestAnimationFrame for potentially smoother visual updates for background
        requestAnimationFrame(() => {
            if (skyContainer) skyContainer.style.background = skyGradient;

            if (!prefersReducedMotion) {
                // Apply transforms for sun/moon positioning
                if (sunElement) sunElement.style.transform = `translate(${sunX - 50}vw, ${sunY - 50}vh) translate(-50%, -50%)`;
                if (moonElement) moonElement.style.transform = `translate(${moonX - 50}vw, ${moonY - 50}vh) translate(-50%, -50%)`;
            }
            // Apply opacities
            if (sunElement) sunElement.style.opacity = sunOpacity.toFixed(2);
            if (moonElement) moonElement.style.opacity = moonOpacity.toFixed(2);
        });
    }

    // --- Color Interpolation Helpers ---
    function interpolateColor(color1, color2, factor) {
        factor = Math.max(0, Math.min(1, factor)); // Clamp factor
        const c1 = hexToRgb(color1);
        const c2 = hexToRgb(color2);
        if (!c1 || !c2) return 'rgb(0,0,0)'; // Safety check
        const r = Math.round(c1.r + factor * (c2.r - c1.r));
        const g = Math.round(c1.g + factor * (c2.g - c1.g));
        const b = Math.round(c1.b + factor * (c2.b - c1.b));
        return `rgb(${r}, ${g}, ${b})`;
    }

    function hexToRgb(hex) {
        // Improved regex for optional # and 3/6 digit hex codes
        const result = /^#?([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})$/i.exec(hex);
        if (!result) return null;
        // Handle shorthand hex (e.g., #03F)
        const r = parseInt(result[1].length === 1 ? result[1] + result[1] : result[1], 16);
        const g = parseInt(result[2].length === 1 ? result[2] + result[2] : result[2], 16);
        const b = parseInt(result[3].length === 1 ? result[3] + result[3] : result[3], 16);
        return { r, g, b };
    }


    // --- Dynamic Waves ---
    // Use cached elements
    let waveTime = 0;
    let targetAmplitude = 5, currentAmplitude = 5;
    let targetFrequency = 0.005, currentFrequency = 0.005;
    let targetSpeed = 0.02, currentSpeed = 0.02;
    let waveStateInterval = null;

    function initDynamicWaves() {
        if (!waveSvg || !wavePath1 || !wavePath2) {
            console.warn("Wave elements not found, skipping wave initialization.");
            return;
        }

        // Periodically change wave state (Interval is fine for infrequent changes)
        waveStateInterval = setInterval(() => {
            if (document.hidden || prefersReducedMotion) return;
            const randomState = Math.random();
            if (randomState < 0.4) { // calm
                targetAmplitude = 3 + Math.random() * 4; targetFrequency = 0.004 + Math.random() * 0.003; targetSpeed = 0.01 + Math.random() * 0.01;
            } else if (randomState < 0.8) { // small
                targetAmplitude = 8 + Math.random() * 7; targetFrequency = 0.006 + Math.random() * 0.004; targetSpeed = 0.02 + Math.random() * 0.015;
            } else { // big
                targetAmplitude = 16 + Math.random() * 9; targetFrequency = 0.008 + Math.random() * 0.005; targetSpeed = 0.03 + Math.random() * 0.02;
            }
        }, 10000); // Every 10 seconds
    }

    function updateWaves(elapsedSinceLastThrottledFrame) {
        if (!wavePath1 || !wavePath2) return; // Check elements exist

        // Calculate time factor for smooth transitions based on the throttled frame duration
        const timeFactor = Math.min(2, elapsedSinceLastThrottledFrame / FRAME_DURATION); // Clamp timeFactor

        waveTime += currentSpeed * timeFactor;

        // Smoothly interpolate towards target values
        currentAmplitude += (targetAmplitude - currentAmplitude) * 0.05 * timeFactor;
        currentFrequency += (targetFrequency - currentFrequency) * 0.05 * timeFactor;
        currentSpeed += (targetSpeed - currentSpeed) * 0.05 * timeFactor;

        const points1 = [], points2 = [];
        const segments = 20; // Number of segments for the wave path
        const waveWidth = waveSvg.viewBox.baseVal.width || 1440; // Get width from SVG viewBox if possible
        const waveHeight = waveSvg.viewBox.baseVal.height || 60; // Get height from SVG viewBox

        for (let i = 0; i <= segments; i++) {
            const x = (waveWidth / segments) * i;
            // Wave 1 calculation
            const y1 = waveHeight / 2 + Math.sin(x * currentFrequency + waveTime) * currentAmplitude;
            points1.push(`${x.toFixed(2)},${y1.toFixed(2)}`);
            // Wave 2 calculation (slightly different frequency/phase/amplitude)
            const y2 = waveHeight / 2 + Math.sin(x * currentFrequency * 1.2 + waveTime * 0.8 + 1) * currentAmplitude * 0.7;
            points2.push(`${x.toFixed(2)},${y2.toFixed(2)}`);
        }

        // Construct SVG path data strings
        // Start from bottom-left, go up to first point's y, draw wave, go to bottom-right, close path
        const pathData1 = `M0,${waveHeight} L0,${points1[0].split(',')[1]} L${points1.join(' L')} L${waveWidth},${waveHeight} Z`;
        const pathData2 = `M0,${waveHeight} L0,${points2[0].split(',')[1]} L${points2.join(' L')} L${waveWidth},${waveHeight} Z`;

        // Apply path data directly (already inside RAF via mainLoop)
        wavePath1.setAttribute('d', pathData1);
        wavePath2.setAttribute('d', pathData2);
    }


    // --- Water Background ---
    // Use cached elements
    let updateWaterHeight = () => {}; // Placeholder function
    const bubblePool = []; // Bubble object pool
    let bubbleInterval = null;
    let scrollTimeout = null; // Timeout ID for scroll throttling

    function initWaterBackground() {
        if (!waterBody || !waterSurface || !bubblesContainer) {
            console.warn("Water elements not found, skipping water background initialization.");
            return;
        }

        const initialHeight = 50; // vh
        waterBody.style.height = `${initialHeight}vh`;
        waterSurface.style.bottom = `${initialHeight}vh`;

        // --- Bubble pool creation ---
        const POOL_SIZE = isLowPerfDevice ? 5 : 10;
        const BUBBLE_INTERVAL = isLowPerfDevice ? 1200 : 600;
        for (let i = 0; i < POOL_SIZE; i++) {
          const bubble = document.createElement('div');
          bubble.classList.add('bubble');
          bubble.style.display = 'none'; // Initially hidden
          bubble.setAttribute('aria-hidden', 'true'); // Decorative element
          bubblesContainer.appendChild(bubble);
          bubblePool.push(bubble);
        }
        // --- End Bubble pool creation ---

        let lastScrollTime = 0;
        let targetWaterHeight = initialHeight;
        let currentWaterHeight = initialHeight;
        const scrollThrottle = isLowPerfDevice ? 200 : 100; // Slightly adjusted throttle time

        // Use passive listener for scroll performance
        window.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const now = Date.now();
                // Throttle scroll updates
                if (now - lastScrollTime < scrollThrottle) return;
                lastScrollTime = now;

                const scrollMax = document.documentElement.scrollHeight - window.innerHeight; // Use documentElement for better accuracy
                const scrollPercentage = scrollMax > 0 ? Math.min(1, window.scrollY / scrollMax) : 0;
                // Water height range: 40vh (top) to 85vh (bottom)
                targetWaterHeight = 40 + (scrollPercentage * 45);
            }, 10); // Debounce slightly
        }, { passive: true });

        // Function to update water height smoothly (called in main loop)
        updateWaterHeight = (elapsedSinceLastThrottledFrame) => {
            if (!waterBody || !waterSurface) return; // Check elements exist
            const timeFactor = Math.min(2, elapsedSinceLastThrottledFrame / FRAME_DURATION); // Normalize easing based on throttled frame duration
            currentWaterHeight += (targetWaterHeight - currentWaterHeight) * 0.08 * timeFactor;

            // Only update DOM when change is significant enough to avoid layout thrashing
            const currentStyleBottom = parseFloat(waterSurface.style.bottom); // Read once
            const newRoundedHeight = Math.round(currentWaterHeight * 10) / 10; // Round to 1 decimal place

            // Use a small threshold for updating to prevent jitter
            if (Math.abs(currentStyleBottom - newRoundedHeight) > 0.1) {
                const heightValue = newRoundedHeight.toFixed(1);
                waterBody.style.height = `${heightValue}vh`;
                waterSurface.style.bottom = `${heightValue}vh`;
            }
        }

        // --- Bubble activation functions ---
        function getAvailableBubble() {
          // Find the first hidden bubble
          return bubblePool.find(bubble => bubble.style.display === 'none');
          // If none are hidden (unlikely with pooling), could optionally reuse the oldest one
        }

        function activateBubble() {
          if (document.hidden || !bubblesContainer) return;
          const bubble = getAvailableBubble();
          if (!bubble) return; // No available bubble in the pool

          const size = 5 + Math.random() * 10; // Random size
          const xPos = Math.random() * 100; // Random horizontal start position
          const driftX = -20 + Math.random() * 40; // Random horizontal drift
          const riseDuration = 5 + Math.random() * 6; // Random rise duration

          // Reset styles and animation before starting
          bubble.style.cssText = `
              display: block;
              width: ${size}px;
              height: ${size}px;
              left: ${xPos}%;
              bottom: 0;
              animation: none;
              opacity: 0; /* Start faded out */
              transform: scale(0.5); /* Start small */
              --drift-x: ${driftX}px; /* Set drift custom property */
          `;
          // Force reflow to apply reset styles before starting animation
          void bubble.offsetWidth;

          // Apply animation and fade-in styles
          bubble.style.animation = `bubble-rise ${riseDuration}s ease-out forwards`;
          bubble.style.opacity = '0.6';
          bubble.style.transform = 'scale(1)';

          // Cleanup after animation ends using the 'animationend' event
          const handleAnimationEnd = () => {
              bubble.style.display = 'none'; // Hide bubble
              bubble.style.animation = 'none'; // Remove animation
              bubble.removeEventListener('animationend', handleAnimationEnd); // Clean up listener
          };
          bubble.addEventListener('animationend', handleAnimationEnd, { once: true });

          // Fallback cleanup in case animationend doesn't fire
          setTimeout(() => {
              if (bubble.style.display !== 'none') {
                  handleAnimationEnd();
              }
          }, riseDuration * 1000 + 500); // Add a buffer
        }
        // --- End Bubble activation functions ---

        function startBubbles() {
            if (bubbleInterval) clearInterval(bubbleInterval); // Clear existing interval if any
            bubbleInterval = setInterval(activateBubble, BUBBLE_INTERVAL);
            activateBubble(); // Activate one immediately
        }

        // Start/stop bubbles based on document visibility
        if (!document.hidden) { startBubbles(); }
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                if (!bubbleInterval) startBubbles();
            } else {
                if (bubbleInterval) { clearInterval(bubbleInterval); bubbleInterval = null; }
            }
        });

        // --- Click bubbles ---
        // Only add listener if not a touch device (basic check) and not low perf
        if (!isLowPerfDevice && !('ontouchstart' in window)) {
            document.addEventListener('click', (e) => {
                // Ignore clicks on interactive elements
                if (e.target.closest('a, button, .button, input, select, textarea, [role="button"]')) return;

                const bubble = getAvailableBubble();
                if (!bubble) return; // No bubble available

                const size = 5 + Math.random() * 5; // Smaller click bubbles
                const xPercent = (e.clientX / window.innerWidth) * 100;
                const clickRiseDuration = 4; // Fixed duration for click bubbles

                // Reset styles
                bubble.style.cssText = `
                    display: block;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${xPercent}%;
                    /* Start bubble slightly below the current water surface */
                    bottom: calc(${currentWaterHeight}vh - 10px);
                    animation: none;
                    opacity: 0;
                    transform: scale(0.5);
                    --drift-x: 0px; /* No horizontal drift for click bubbles */
                `;
                void bubble.offsetWidth; // Force reflow

                // Apply animation
                bubble.style.animation = `bubble-rise ${clickRiseDuration}s ease-out forwards`;
                bubble.style.opacity = '0.6';
                bubble.style.transform = 'scale(1)';

                // Cleanup using animationend
                const handleAnimationEnd = () => {
                    bubble.style.display = 'none';
                    bubble.style.animation = 'none';
                    bubble.removeEventListener('animationend', handleAnimationEnd);
                };
                bubble.addEventListener('animationend', handleAnimationEnd, { once: true });

                // Fallback cleanup
                setTimeout(() => {
                    if (bubble.style.display !== 'none') handleAnimationEnd();
                }, clickRiseDuration * 1000 + 500);
            });
        }
        // --- End Click bubbles ---

        // Cleanup handled globally now
    }


    // --- Swimming Fish Animation ---
    // Use cached element
    let fishImageKeys = []; // Keys from FISH_IMAGES
    let fishImages = []; // URLs derived from FISH_IMAGES
    let currentWaterHeightVh = 50; // Track current water height for fish bounds
    const activeFish = []; // Array to hold active fish objects { element, speed, direction, ... }
    let adjustFishToWaterInterval = null;
    let fishRefreshInterval = null;
    let fishCount = 0; // Target number of fish

    function initSwimmingFish() {
        if (!fishContainer || !waterBody) {
            console.error('Missing elements for fish animation, skipping initialization.');
            return;
        }
        // Ensure FISH_IMAGES data is loaded (assuming fishImages.js is loaded before this script)
        if (typeof FISH_IMAGES === 'undefined' || Object.keys(FISH_IMAGES).length === 0) {
            console.error('Fish images data (FISH_IMAGES) not found or empty.');
            return;
        }

        fishCount = isLowPerfDevice ? 3 : (window.navigator.hardwareConcurrency >= 8 ? 8 : 5);
        fishImageKeys = Object.keys(FISH_IMAGES);
        // Pre-select a subset of images to use, potentially improving variety if list is huge
        // This example just uses all available keys.
        fishImages = fishImageKeys.map(key => FISH_IMAGES[key]); // Get URLs
        currentWaterHeightVh = parseFloat(waterBody.style.height) || 50; // Get initial water height

        // Adjust fish vertical position if water level changes significantly
        adjustFishToWaterInterval = setInterval(() => {
            if (!waterBody || document.hidden) return;
            const waterHeight = parseFloat(waterBody.style.height) || 50;
            // Only adjust if water height changed noticeably
            if (Math.abs(waterHeight - currentWaterHeightVh) > 1) {
                currentWaterHeightVh = waterHeight; // Update tracked height
                activeFish.forEach(fish => {
                    if (!fish?.element?.isConnected) return; // Skip if fish element is gone
                    // If fish is now above the water surface, move it down
                    if (fish.currentBottomVh > currentWaterHeightVh - 2) { // -2vh buffer
                        // Move fish to a random position within the new water height
                        const newY = currentWaterHeightVh * (0.1 + Math.random() * 0.7);
                        fish.element.style.bottom = `${newY.toFixed(1)}vh`;
                        fish.originalY = newY; // Update base vertical position
                        fish.currentBottomVh = newY; // Update current vertical position
                    }
                });
            }
        }, 2000); // Check every 2 seconds

        // Periodically replace a fish to refresh variety
        fishRefreshInterval = setInterval(() => {
            // Only run if tab is visible, there are fish, and randomly (20% chance)
            if (document.hidden || activeFish.length === 0 || Math.random() > 0.2) return;

            const indexToRemove = Math.floor(Math.random() * activeFish.length);
            const fishToRemove = activeFish[indexToRemove];

            if (fishToRemove?.element?.isConnected) {
                // Fade out the fish before removing
                fishToRemove.element.style.transition = 'opacity 1.5s ease-out'; // Use CSS transition
                fishToRemove.element.style.opacity = '0';

                // Remove after fade-out transition completes
                fishToRemove.element.addEventListener('transitionend', () => {
                    if (fishToRemove.element.isConnected) fishToRemove.element.remove();
                    // Remove from activeFish array *after* removal from DOM
                    const arrayIndex = activeFish.indexOf(fishToRemove);
                    if (arrayIndex > -1) activeFish.splice(arrayIndex, 1);
                    // Add a new fish if below target count and tab is visible
                    if (!document.hidden && activeFish.length < fishCount) {
                        setTimeout(createFish, 500); // Add with slight delay
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
                }, 1600); // Slightly longer than transition

            } else {
                 // If element somehow disconnected before fade, just remove from array
                 const arrayIndex = activeFish.indexOf(fishToRemove);
                 if (arrayIndex > -1) activeFish.splice(arrayIndex, 1);
                 // Add replacement if needed
                 if (!document.hidden && activeFish.length < fishCount) {
                     setTimeout(createFish, 500);
                 }
            }
        }, isLowPerfDevice ? 30000 : 20000); // Refresh interval

        // Initial fish creation with slight stagger
        for (let i = 0; i < fishCount; i++) {
            setTimeout(createFish, i * (isLowPerfDevice ? 600 : 300));
        }

        // Cleanup handled globally now
    }

    function createFish() {
        if (document.hidden || !fishContainer || !fishImageKeys.length) return null;

        try {
            const fishElement = document.createElement('div');
            fishElement.className = 'swimming-fish';
            fishElement.setAttribute('aria-hidden', 'true'); // Decorative

            // Select a random fish image key and get its URL
            const randomFishKey = fishImageKeys[Math.floor(Math.random() * fishImageKeys.length)];
            const fishImageUrl = FISH_IMAGES[randomFishKey]; // Assumes FISH_IMAGES is globally available
            if (!fishImageUrl) {
                console.warn(`Image URL not found for key: ${randomFishKey}`);
                return null; // Skip if URL is missing
            }

            const img = document.createElement('img');
            img.crossOrigin = "anonymous"; // For potential canvas use later, if needed
            img.src = fishImageUrl;
            img.alt = `${randomFishKey} fish swimming`; // Descriptive alt text
            img.loading = 'lazy'; // Lazy load images
            img.onerror = function() {
                console.error(`Failed to load fish image: ${randomFishKey} at ${fishImageUrl}`);
                // Provide a default fallback image
                img.src = "https://cdn.discordapp.com/attachments/1349726808488153168/1349728486880710666/Carp.png?ex=67d4281c&is=67d2d69c&hm=a080decf34c81199424c78c1af8ad50db2e9b6d26e76d5c5bfe27fbdeca7f48e&";
                img.alt = "Fallback fish image (Carp)";
            };
            fishElement.appendChild(img);

            // Determine size based on rarity keywords in the key (adjust keywords as needed)
            let size;
            if (randomFishKey.includes("Mythic") || randomFishKey.includes("Legendary") || randomFishKey.includes("Chimerical")) {
                size = 65 + Math.random() * 30; // Larger for rarer fish
            } else if (randomFishKey.includes("Rare")) {
                size = 50 + Math.random() * 25;
            } else {
                size = 40 + Math.random() * 20; // Smaller for common/uncommon
            }
            fishElement.style.width = `${size}px`;
            fishElement.style.height = 'auto'; // Maintain aspect ratio

            // Initial position within the current water height
            const startX = Math.random() * 100; // vw
            const startY = Math.random() * (currentWaterHeightVh * 0.8); // vh from bottom, within 80% of water height
            fishElement.style.left = `${startX.toFixed(1)}vw`;
            fishElement.style.bottom = `${startY.toFixed(1)}vh`;
            fishElement.style.opacity = '0'; // Start invisible for fade-in

            const direction = Math.random() > 0.5 ? 'right' : 'left';
            if (direction === 'left') fishElement.classList.add('flip-horizontal');

            // Speed calculation (slower for larger fish, adjusted by performance)
            const speedFactor = isLowPerfDevice ? 0.4 : 1;
            const baseSpeed = (40 - size * 0.3) * 0.05 * speedFactor; // Base speed in vw/sec
            const speed = Math.max(0.5, Math.min(4, baseSpeed)); // Clamp speed between 0.5 and 4 vw/sec

            // Store fish state in an object
            const fishData = {
                element: fishElement,
                speed: speed, // vw per second
                direction: direction,
                verticalDirection: Math.random() > 0.5 ? 'up' : 'down',
                verticalAmount: Math.random() * 5 + 2, // Vertical movement range (vh)
                originalY: startY, // Base vertical position (vh)
                wiggleAmount: Math.random() * 0.4 + 0.3, // Wiggle intensity
                wigglePhase: Math.random() * Math.PI * 2, // Initial wiggle phase
                currentXPercent: startX, // Current horizontal position (vw)
                currentBottomVh: startY // Current vertical position (vh)
            };

            fishContainer.appendChild(fishElement);
            activeFish.push(fishData);

            // Fade in the fish
            requestAnimationFrame(() => {
                fishElement.style.transition = 'opacity 0.5s ease-in';
                fishElement.style.opacity = '0.8'; // Target opacity
            });

            return fishData;
        } catch (err) {
            console.error("Error creating fish:", err);
            return null;
        }
    }

    // Update all active fish positions within the main animation loop
    function updateAllFish(elapsedSinceLastThrottledFrame) {
        if (!activeFish.length || prefersReducedMotion) return; // Skip if no fish or reduced motion

        // Use elapsed time since the *last throttled frame* for consistent movement speed
        const elapsedSeconds = elapsedSinceLastThrottledFrame / 1000;
        const boundaryPadding = 3; // vw padding from screen edges
        const waterTopBoundary = currentWaterHeightVh - 3; // vh padding from water surface

        activeFish.forEach((fish, index) => {
            // Check if fish element still exists and is connected
            if (!fish.element || !fish.element.isConnected) {
                // Remove stale fish data from the array
                activeFish.splice(index, 1);
                return;
            }

            let {
                element, speed, direction, verticalDirection, verticalAmount,
                originalY, wiggleAmount, wigglePhase, currentXPercent, currentBottomVh
            } = fish;

            // --- Update Horizontal Movement & Direction ---
            const horizontalMove = speed * elapsedSeconds;
            if (direction === 'right') {
                currentXPercent += horizontalMove;
                if (currentXPercent > (100 - boundaryPadding)) {
                    direction = 'left'; // Turn left
                    element.classList.add('flip-horizontal');
                }
            } else { // Moving left
                currentXPercent -= horizontalMove;
                if (currentXPercent < boundaryPadding) {
                    direction = 'right'; // Turn right
                    element.classList.remove('flip-horizontal');
                }
            }
            // Small chance to randomly change direction mid-screen
            if (Math.random() < 0.0005) {
                direction = (direction === 'right' ? 'left' : 'right');
                element.classList.toggle('flip-horizontal');
            }

            // --- Update Vertical Movement & Direction ---
            // Vertical speed relative to horizontal speed
            const verticalSpeed = speed * 0.3;
            const verticalMove = verticalSpeed * elapsedSeconds;
            // Calculate target vertical position based on direction
            let targetY = currentBottomVh + (verticalDirection === 'up' ? verticalMove : -verticalMove);

            // Check vertical boundaries (within water and original range)
            if (verticalDirection === 'up' && targetY > Math.min(waterTopBoundary, originalY + verticalAmount)) {
                verticalDirection = 'down'; // Turn down
                targetY = currentBottomVh - verticalMove; // Adjust target based on new direction
            } else if (verticalDirection === 'down' && targetY < Math.max(2, originalY - verticalAmount)) { // Keep slightly above bottom (2vh)
                verticalDirection = 'up'; // Turn up
                targetY = currentBottomVh + verticalMove; // Adjust target based on new direction
            }
            // Small chance to randomly change vertical direction
            if (Math.random() < 0.002) {
                verticalDirection = (verticalDirection === 'up' ? 'down' : 'up');
            }

            // Apply vertical movement, clamping within water bounds
            currentBottomVh = Math.max(1, Math.min(waterTopBoundary, targetY)); // Clamp between 1vh and top boundary

            // --- Wiggle ---
            wigglePhase += 6 * elapsedSeconds; // Adjust wiggle speed
            const wiggle = Math.sin(wigglePhase) * wiggleAmount;
            // Apply wiggle subtly to vertical position
            currentBottomVh += wiggle * 0.1;

            // --- Apply Styles ---
            // Use translate for potentially smoother animation, falling back to left/bottom if needed
            // element.style.transform = `translate(${currentXPercent.toFixed(1)}vw, ${-currentBottomVh.toFixed(1)}vh) ${direction === 'left' ? 'scaleX(-1)' : ''}`; // Example using transform
            // Sticking with left/bottom as per original, which is simpler here:
            element.style.left = `${currentXPercent.toFixed(1)}vw`;
            element.style.bottom = `${currentBottomVh.toFixed(1)}vh`;

            // --- Update fish object state ---
            fish.direction = direction;
            fish.verticalDirection = verticalDirection;
            fish.wigglePhase = wigglePhase % (Math.PI * 2); // Keep phase manageable
            fish.currentXPercent = currentXPercent;
            fish.currentBottomVh = currentBottomVh;
        });
    }


    // --- Mouse Trail Effect ---
    // Use cached element
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2; // Initial position center
    let trailX = mouseX, trailY = mouseY; // Trail starts at mouse position
    let lastDropletTime = 0;
    const DROPLET_INTERVAL = 50; // ms between droplets max (reduced slightly for potentially more droplets)
    let animateTrailFn = () => {}; // Placeholder for the trail animation function
    let isTrailActive = false; // Track if the trail should be running

    function initMouseTrail() {
        if (!trail || isLowPerfDevice || 'ontouchstart' in window) { // Skip if no trail element, low perf, or touch device
            if (trail) trail.style.display = 'none'; // Hide trail element if it exists but shouldn't run
            document.body.style.cursor = 'auto'; // Restore default cursor
            isTrailActive = false;
            return;
        }

        // Hide default cursor, show custom trail
        document.body.style.cursor = 'none';
        trail.style.opacity = '0'; // Start hidden
        isTrailActive = true; // Enable trail updates

        document.addEventListener('mousemove', (e) => {
            if (!isTrailActive) return;
            mouseX = e.clientX;
            mouseY = e.clientY;
            // Make trail visible on first move
            if (trail.style.opacity === '0') {
                // Position trail immediately before making visible
                trailX = mouseX;
                trailY = mouseY;
                trail.style.transform = `translate(${trailX.toFixed(0)}px, ${trailY.toFixed(0)}px) translate(-50%, -50%) rotate(45deg) scale(1)`;
                trail.style.opacity = '0.8';
            }
        });

        // Function to animate the trail (called in main loop on *every* frame)
        animateTrailFn = (elapsedSinceLastFrame) => {
            if (!trail || !isTrailActive || isNaN(mouseX) || isNaN(mouseY)) return; // Safety checks

            // Smoothly interpolate trail position towards mouse position
            // Use a fixed interpolation factor for smoother feel at higher frame rates
            // Adjust this factor (e.g., 0.15 to 0.25) to change responsiveness vs smoothness
            const lerpFactor = 0.2;
            trailX += (mouseX - trailX) * lerpFactor;
            trailY += (mouseY - trailY) * lerpFactor;

            // Update trail element position (use translate for performance)
            // Extract current scale to preserve it during updates (especially during click)
            const currentTransform = trail.style.transform;
            const currentScaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
            const currentScale = currentScaleMatch ? currentScaleMatch[1] : '1';
            trail.style.transform = `translate(${trailX.toFixed(0)}px, ${trailY.toFixed(0)}px) translate(-50%, -50%) rotate(45deg) scale(${currentScale})`;


            // Throttle droplet creation based on time and distance moved
            const now = performance.now();
            const distMoved = Math.hypot(mouseX - trailX, mouseY - trailY); // Approx distance mouse moved since last trail update

            // Create droplets more frequently if moving faster, but still throttle
            if (now - lastDropletTime > DROPLET_INTERVAL && distMoved > 3 && Math.random() > 0.5) {
                createTrailDroplet(trailX, trailY);
                lastDropletTime = now;
            }
        };

         // Hover/fade logic
         let fadeTimeout;
         document.addEventListener('mousemove', () => {
             if (!trail || !isTrailActive) return;
             trail.style.opacity = '0.8'; // Show trail
             clearTimeout(fadeTimeout);
             // Fade out trail if mouse stops moving
             fadeTimeout = setTimeout(() => { if (trail && isTrailActive) trail.style.opacity = '0'; }, 300);
         });

         // Click/Splash logic
         document.addEventListener('mousedown', (e) => {
             if (!trail || !isTrailActive || e.target.closest('a, button, .button, input, select, textarea, [role="button"]')) return; // Ignore clicks on interactive elements
             // Scale down trail slightly on click
             trail.style.transform = `translate(${trailX.toFixed(0)}px, ${trailY.toFixed(0)}px) translate(-50%, -50%) rotate(45deg) scale(0.6)`;
             createWaterSplash(e.clientX, e.clientY); // Create splash at click location
         });
         document.addEventListener('mouseup', (e) => {
             if (!trail || !isTrailActive || e.target.closest('a, button, .button, input, select, textarea, [role="button"]')) return;
             // Restore trail scale on mouse up
             trail.style.transform = `translate(${trailX.toFixed(0)}px, ${trailY.toFixed(0)}px) translate(-50%, -50%) rotate(45deg) scale(1.1)`; // Slight bounce back
             setTimeout(() => {
                 if (trail && isTrailActive) trail.style.transform = `translate(${trailX.toFixed(0)}px, ${trailY.toFixed(0)}px) translate(-50%, -50%) rotate(45deg) scale(1)`;
             }, 150);
         });

         // Function to create a single trail droplet
         function createTrailDroplet(x, y) {
            if (isNaN(x) || isNaN(y) || document.hidden || !isTrailActive) return;
            const droplet = document.createElement('div');
            droplet.className = 'trail-droplet';
            droplet.setAttribute('aria-hidden', 'true');
            // Position droplet near the trail cursor
            droplet.style.left = `${x + (Math.random() * 10 - 5)}px`;
            droplet.style.top = `${y + (Math.random() * 10 - 5)}px`;
            const size = 4 + Math.random() * 6;
            droplet.style.width = `${size}px`;
            droplet.style.height = `${size}px`;
            document.body.appendChild(droplet);
            // Remove droplet after animation (CSS handles fade-out)
            setTimeout(() => { droplet.remove(); }, 800); // Match CSS animation duration
         }

         // Function to create the water splash effect on click
         function createWaterSplash(x, y) {
            if (document.hidden || !isTrailActive) return;
            const splashContainer = document.createElement('div');
            splashContainer.className = 'water-splash';
            splashContainer.setAttribute('aria-hidden', 'true');
            splashContainer.style.left = `${x}px`;
            splashContainer.style.top = `${y}px`;
            document.body.appendChild(splashContainer);

            const dropletCount = isLowPerfDevice ? 6 : 12; // Fewer droplets on low perf
            for (let i = 0; i < dropletCount; i++) {
                const droplet = document.createElement('div');
                droplet.className = 'splash-droplet';
                const size = 5 + Math.random() * 10;
                droplet.style.width = `${size}px`;
                droplet.style.height = `${size}px`;
                // Calculate outward trajectory
                const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() * 0.5 - 0.25); // Add randomness to angle
                const distance = 20 + Math.random() * 40;
                const splashX = Math.cos(angle) * distance;
                const splashY = Math.sin(angle) * distance;
                // Set custom properties for CSS animation
                droplet.style.setProperty('--splash-x', `${splashX.toFixed(1)}px`);
                droplet.style.setProperty('--splash-y', `${splashY.toFixed(1)}px`);
                splashContainer.appendChild(droplet);
            }
            // Remove the splash container after animation completes
            setTimeout(() => { splashContainer.remove(); }, 600); // Match CSS animation duration
         }
         // --- End Click/Splash logic ---

         // Initial position update (run once to position trail initially if mouse hasn't moved yet)
         animateTrailFn(0);
    }


    // --- Other Initializations (Static Listeners) ---
    function initStaticListeners() {
        // Button Ripple Effect (using event delegation on body for potential future dynamic buttons)
        document.body.addEventListener('mousedown', function (e) {
            const button = e.target.closest('.button'); // Find closest ancestor button
            if (!button) return; // Exit if click wasn't on or inside a button

            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Remove existing ripple first
            const existingRipple = button.querySelector('.ripple');
            if (existingRipple) existingRipple.remove();

            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            button.appendChild(ripple);

            // Clean up ripple after animation
            ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
        });

        // Fade-in Sections on Scroll (Intersection Observer)
        const animatedSections = document.querySelectorAll('.animated-section');
        if ('IntersectionObserver' in window && animatedSections.length > 0) {
            const observerOptions = {
                root: null, // Use viewport as root
                rootMargin: '0px',
                threshold: 0.15 // Trigger when 15% of the element is visible
            };
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        obs.unobserve(entry.target); // Stop observing once visible
                    }
                });
            }, observerOptions);
            animatedSections.forEach(section => observer.observe(section));
        } else { // Fallback for older browsers or no sections found
            animatedSections.forEach(section => section.classList.add('visible')); // Make visible immediately
        }


        // Smooth Scrolling for Nav Links (using event delegation)
        document.body.addEventListener('click', function(e) {
            const anchor = e.target.closest('nav a[href^="#"]'); // Check if click is on or inside a nav anchor
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (href && href.length > 1) { // Ensure href is not just "#"
                e.preventDefault(); // Prevent default anchor jump
                try {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        const headerOffset = document.querySelector('header')?.offsetHeight || 80; // Get header height dynamically
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.scrollY - headerOffset; // Use scrollY for consistency

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth" // Use smooth scrolling behavior
                        });
                    } else {
                        console.warn(`Smooth scroll target not found: ${href}`);
                    }
                } catch (err) {
                    console.error("Error finding element for smooth scroll:", href, err);
                }
            }
        });

        // Invite/Support Links Assignment
        const discordInviteLink = "https://discord.com/oauth2/authorize?client_id=1354018504470298624";
        const discordSupportLink = "https://discord.gg/6TxYjeQcXg";

        // Use more specific selectors if possible, or iterate as before
        document.querySelectorAll('.invite-button').forEach(button => {
            if (button.tagName === 'A') { // Ensure it's an anchor tag
               button.href = discordInviteLink;
               button.target = "_blank";
               button.rel = "noopener noreferrer"; // Security best practice
            } else if (button.tagName === 'BUTTON') { // Handle buttons that should act like links
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


        // Legal Section Expandable Content (using event delegation)
        document.body.addEventListener('click', function(e) {
            const button = e.target.closest('.expand-btn');
            if (!button) return;

            const expandedContent = button.nextElementSibling;
            if (!expandedContent || !expandedContent.classList.contains('expanded-content')) {
                console.warn('Expanded content not found for button:', button);
                return;
            }

            const isVisible = expandedContent.style.display === 'block';
            expandedContent.style.display = isVisible ? 'none' : 'block';
            // Update ARIA attribute for accessibility
            button.setAttribute('aria-expanded', !isVisible);
            // Update button text (handled by CSS ::after now)
            // button.textContent = isVisible
            //     ? button.textContent.replace('Hide', 'View').replace('−', '+') // Use minus sign instead of hyphen
            //     : button.textContent.replace('View', 'Hide').replace('+', '−');
        });
        // Initialize ARIA attributes for expandable buttons
        document.querySelectorAll('.expand-btn').forEach(button => {
            const expandedContent = button.nextElementSibling;
            const isVisible = expandedContent?.style.display === 'block';
            button.setAttribute('aria-expanded', isVisible);
            // Ensure initial text matches state (handled by CSS ::after now)
            //  button.textContent = isVisible
            //     ? button.textContent.replace('View', 'Hide').replace('+', '−')
            //     : button.textContent.replace('Hide', 'View').replace('−', '+');
            //  // Ensure the correct symbol is used initially based on display state
            //  if (isVisible && !button.textContent.includes('−')) {
            //      button.textContent = button.textContent.replace('+','−');
            //  } else if (!isVisible && !button.textContent.includes('+')) {
            //      button.textContent = button.textContent.replace('−','+');
            //  }
        });
    }


    // --- Main Animation Loop ---
    function mainLoop(timestamp) {
        if (!isLoopRunning) return; // Stop if flag is false

        // Request next frame immediately for smooth looping
        animationFrameId = requestAnimationFrame(mainLoop);

        // Calculate elapsed time since last frame
        if (!lastTimestamp) lastTimestamp = timestamp;
        const elapsedSinceLastFrame = timestamp - lastTimestamp;
        lastTimestamp = timestamp; // Update last timestamp for the *next* frame

        // --- Perform High-Frequency Updates (Run Every Frame) ---
        // Update mouse trail position (visual, needs smoothness)
        // Check if animateTrailFn is initialized and active before calling
        if (isTrailActive && typeof animateTrailFn === 'function') {
            animateTrailFn(elapsedSinceLastFrame);
        }

        // --- Throttle Lower-Frequency Updates ---
        // Calculate elapsed time since the last *throttled* update
        if (!lastThrottledTimestamp) lastThrottledTimestamp = timestamp;
        const elapsedSinceLastThrottledFrame = timestamp - lastThrottledTimestamp;

        // Only perform throttled updates if enough time has passed
        if (elapsedSinceLastThrottledFrame >= FRAME_DURATION * 0.9) { // Allow slightly less than target duration
            lastThrottledTimestamp = timestamp; // Update last throttled timestamp

            // --- Perform Throttled Updates ---
            // These functions are called less frequently

            // Update water height (already throttled internally via scroll listener, but smooth easing happens here)
            updateWaterHeight(elapsedSinceLastThrottledFrame);

            // Update dynamic waves (visual, needs smoothness)
            if (!prefersReducedMotion) {
                updateWaves(elapsedSinceLastThrottledFrame);
            }

            // Update fish positions (visual, needs smoothness)
            if (!prefersReducedMotion) {
                updateAllFish(elapsedSinceLastThrottledFrame);
            }
        }
    }

    // --- Start & Stop Logic ---
    function startAnimationLoop() {
        if (isLoopRunning) return; // Already running
        console.log("Starting animation loop");
        isLoopRunning = true;
        lastTimestamp = performance.now(); // Reset timestamp before starting
        lastThrottledTimestamp = lastTimestamp; // Also reset throttled timestamp
        // Clear any previous frame ID just in case
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(mainLoop);
    }

    function stopAnimationLoop() {
        if (!isLoopRunning) return; // Already stopped
        console.log("Stopping animation loop");
        isLoopRunning = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        lastTimestamp = 0; // Reset timestamp
        lastThrottledTimestamp = 0; // Reset throttled timestamp
    }

    // --- Initialize Everything ---
    function initializeWebsiteAnimations() {
        console.log("Initializing TackleBot animations...");
        initSky();
        initWaterBackground();
        initDynamicWaves();
        initMouseTrail(); // Initialize trail logic
        initStaticListeners(); // Initialize non-animated event listeners
        // Delay fish initialization slightly to allow other elements to render first
        setTimeout(initSwimmingFish, 500);

        // Handle visibility changes to pause/resume animations
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                startAnimationLoop(); // Restart loop if tab becomes visible
                // Optionally restart intervals that were cleared, e.g., bubbles
                if (!bubbleInterval && bubblesContainer) startBubbles(); // Restart bubbles if needed
            } else {
                stopAnimationLoop(); // Stop loop if tab becomes hidden
                // Optionally clear intervals like bubbles
                if (bubbleInterval) { clearInterval(bubbleInterval); bubbleInterval = null; }
            }
        });

        // Start the main animation loop initially if the page isn't hidden
        if (!document.hidden) {
            startAnimationLoop();
        }

        // Cleanup on unload/pagehide
        // Use 'pagehide' for better mobile compatibility
        window.addEventListener('pagehide', () => {
            console.log("Cleaning up animations and intervals...");
            stopAnimationLoop(); // Stop RAF loop

            // Clear all known intervals and timeouts
            if (skyUpdateInterval) clearInterval(skyUpdateInterval);
            if (waveStateInterval) clearInterval(waveStateInterval);
            if (bubbleInterval) clearInterval(bubbleInterval);
            if (adjustFishToWaterInterval) clearInterval(adjustFishToWaterInterval);
            if (fishRefreshInterval) clearInterval(fishRefreshInterval);
            if (scrollTimeout) clearTimeout(scrollTimeout);
            // Could potentially remove event listeners here, but many are passive or delegated,
            // and browser usually handles cleanup on page unload.

            skyUpdateInterval = waveStateInterval = bubbleInterval = adjustFishToWaterInterval = fishRefreshInterval = scrollTimeout = null; // Clear interval IDs

            console.log("Cleanup complete.");
        });

        console.log("TackleBot animations initialized.");
    }

    // --- Run Initialization ---
    initializeWebsiteAnimations();

}); // End DOMContentLoaded