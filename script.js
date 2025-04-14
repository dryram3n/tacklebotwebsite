// Global variable to hold the canvas instance
let waterCanvasInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    // Add canvas detection near the top of the file
    const supportsCanvas = (function() {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext && canvas.getContext('2d'));
    })();

    // Detect if the device might have performance issues or prefers reduced motion
    const isLowPerfDevice = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
                           !('requestAnimationFrame' in window) ||
                           (window.navigator.hardwareConcurrency && window.navigator.hardwareConcurrency < 4) ||
                           navigator.userAgent.match(/mobile|android/i);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Add canvas feature detection
    const useCanvas = supportsCanvas && !isLowPerfDevice && !prefersReducedMotion;

    if (isLowPerfDevice) {
        document.body.classList.add('reduced-motion');
    }

    // Add class to body based on canvas usage
    if (useCanvas) {
        document.body.classList.add('using-canvas');
        // REMOVED: No longer hiding cursor via JS

        // Load canvas dynamically
        const canvasScript = document.createElement('script');
        canvasScript.src = 'canvas-effects.js';
        canvasScript.async = true;
        canvasScript.onload = () => {
            console.log('Canvas effects script loaded successfully');
            if (typeof WaterCanvas !== 'undefined') {
                waterCanvasInstance = new WaterCanvas();
                waterCanvasInstance.start();
                initializeWebsiteAnimations();
            } else {
                console.error("WaterCanvas class not found after loading script.");
                document.body.classList.remove('using-canvas');
                document.body.classList.add('canvas-failed');
                initializeWebsiteAnimations();
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
        initializeWebsiteAnimations();
    }

    // Global state for the animation loop (for DOM-based animations)
    let animationFrameId = null;
    let lastTimestamp = 0;
    const FRAME_DURATION = 1000 / 30; // Target ~30fps
    let lastThrottledTimestamp = 0;
    let isLoopRunning = false;

    // Cache frequently accessed DOM elements
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
    const NUM_CLOUDS = isLowPerfDevice ? 3 : 7;
    let skyUpdateInterval = null;

    function initSky() {
        if (!skyContainer || !sunElement || !moonElement || !cloudsContainer) {
            console.warn("Sky elements not found, skipping sky initialization.");
            return;
        }
        if (!prefersReducedMotion) {
            for (let i = 0; i < NUM_CLOUDS; i++) { createCloud(true); }
            setInterval(() => {
                if (document.hidden || !cloudsContainer) return;
                if (cloudsContainer.children.length > NUM_CLOUDS / 2 && Math.random() < 0.3) {
                    const cloudToRemove = cloudsContainer.children[Math.floor(Math.random() * cloudsContainer.children.length)];
                    if (cloudToRemove) {
                        cloudToRemove.style.opacity = '0';
                        cloudToRemove.addEventListener('transitionend', () => cloudToRemove.remove(), { once: true });
                        setTimeout(() => { if (cloudToRemove.isConnected) cloudToRemove.remove(); }, 2100);
                    }
                }
                if (cloudsContainer.children.length < NUM_CLOUDS * 1.5 && Math.random() < 0.4) {
                   setTimeout(createCloud, 500 + Math.random() * 4500);
                }
            }, 15000);
        }
        updateSkyAndTime();
        skyUpdateInterval = setInterval(() => {
            if (!document.hidden) { updateSkyAndTime(); }
        }, 5000);
    }

    function createCloud(instant = false) {
        if (!cloudsContainer) return;
        const cloud = document.createElement('div');
        const type = Math.floor(Math.random() * 3) + 1;
        cloud.className = `cloud type-${type}`;
        cloud.setAttribute('aria-hidden', 'true');
        const sizeMultiplier = 0.7 + Math.random() * 0.6;
        cloud.style.setProperty('--cloud-scale', sizeMultiplier);
        cloud.style.top = `${5 + Math.random() * 50}%`;
        const duration = 40 + Math.random() * 50;
        cloud.style.setProperty('--drift-speed', `${duration}s`);
        const initialOpacity = (0.5 + Math.random() * 0.3).toFixed(2);
        if (instant) {
             cloud.style.animationDelay = `-${Math.random() * duration}s`;
             cloud.style.opacity = initialOpacity;
        } else {
            cloud.style.opacity = '0';
            requestAnimationFrame(() => {
                cloud.style.transition = 'opacity 1s ease-in';
                cloud.style.opacity = initialOpacity;
            });
        }
        cloud.addEventListener('animationiteration', () => {}, { once: false });
        cloudsContainer.appendChild(cloud);
    }

    function updateSkyAndTime() {
        if (!skyContainer || !sunElement || !moonElement) return;
        const now = new Date();
        let currentHour, currentMinute;
        try {
            const formatter = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour12: false, hour: 'numeric', minute: 'numeric' });
            const parts = formatter.formatToParts(now);
            const hourPart = parts.find(part => part.type === 'hour');
            const minutePart = parts.find(part => part.type === 'minute');
            if (hourPart && minutePart) {
                currentHour = parseInt(hourPart.value, 10);
                if (currentHour === 24) currentHour = 0;
                currentMinute = parseInt(minutePart.value, 10);
            } else { throw new Error("Could not parse NY time parts."); }
        } catch (e) {
            console.warn("Could not get New York time, using local time.", e);
            currentHour = now.getHours();
            currentMinute = now.getMinutes();
        }
        const timeInMinutes = currentHour * 60 + currentMinute;
        const sunriseStart = 5 * 60, sunriseEnd = 7 * 60;
        const sunsetStart = 18 * 60, sunsetEnd = 20 * 60;
        const dayDuration = sunsetStart - sunriseEnd;
        const nightDuration = (24 * 60 - sunsetEnd) + sunriseStart;
        let skyGradient = 'var(--sky-day)';
        let sunOpacity = 0, moonOpacity = 0;
        let sunX = 50, sunY = 90, moonX = 50, moonY = 90;
        if (timeInMinutes >= sunriseStart && timeInMinutes < sunriseEnd) {
            const progress = (timeInMinutes - sunriseStart) / (sunriseEnd - sunriseStart);
            skyGradient = `linear-gradient(to bottom, ${interpolateColor('#000030', '#87CEEB', progress)} 10%, ${interpolateColor('#191970', '#ADD8E6', progress)} 50%, ${interpolateColor('#2c3e50', '#B0E0E6', progress)} 100%)`;
            const transitionPoint = 0.5;
            if (progress < transitionPoint) { moonOpacity = 1 - (progress / transitionPoint); moonX = 50 + (1 - progress) * 50; moonY = 25 + Math.sin((1 - progress) * Math.PI) * 60; }
            else { sunOpacity = (progress - transitionPoint) / (1 - transitionPoint); sunX = (progress * 100) / 2; sunY = 25 + Math.sin(progress * Math.PI) * 60; }
        } else if (timeInMinutes >= sunriseEnd && timeInMinutes < sunsetStart) {
            const progress = (timeInMinutes - sunriseEnd) / dayDuration;
            skyGradient = 'var(--sky-day)'; sunOpacity = 1; sunX = progress * 100; sunY = 25 + Math.sin(progress * Math.PI) * 60;
        } else if (timeInMinutes >= sunsetStart && timeInMinutes < sunsetEnd) {
            const progress = (timeInMinutes - sunsetStart) / (sunsetEnd - sunsetStart);
            skyGradient = `linear-gradient(to bottom, ${interpolateColor('#87CEEB', '#4682B4', progress)} 0%, ${interpolateColor('#ADD8E6', '#191970', progress)} 40%, ${interpolateColor('#B0E0E6', '#000030', progress)} 100%)`;
            const transitionPoint = 0.5;
            if (progress < transitionPoint) { sunOpacity = 1 - (progress / transitionPoint); sunX = 50 + (1 - progress) * 50; sunY = 25 + Math.sin((1 - progress) * Math.PI) * 60; }
            else { moonOpacity = (progress - transitionPoint) / (1 - transitionPoint); moonX = (progress * 100) / 2; moonY = 25 + Math.sin(progress * Math.PI) * 60; }
        } else {
            let progress;
            if (timeInMinutes >= sunsetEnd) { progress = (timeInMinutes - sunsetEnd) / nightDuration; }
            else { progress = (timeInMinutes + (24 * 60 - sunsetEnd)) / nightDuration; }
            skyGradient = 'var(--sky-night)'; moonOpacity = 1; moonX = progress * 100; moonY = 25 + Math.sin(progress * Math.PI) * 60;
        }
        requestAnimationFrame(() => {
            if (skyContainer) skyContainer.style.background = skyGradient;
            if (!prefersReducedMotion) {
                if (sunElement) sunElement.style.transform = `translate(${sunX - 50}vw, ${sunY - 50}vh) translate(-50%, -50%)`;
                if (moonElement) moonElement.style.transform = `translate(${moonX - 50}vw, ${moonY - 50}vh) translate(-50%, -50%)`;
            }
            if (sunElement) sunElement.style.opacity = sunOpacity.toFixed(2);
            if (moonElement) moonElement.style.opacity = moonOpacity.toFixed(2);
        });
    }

    function interpolateColor(color1, color2, factor) {
        factor = Math.max(0, Math.min(1, factor));
        const c1 = hexToRgb(color1); const c2 = hexToRgb(color2);
        if (!c1 || !c2) return 'rgb(0,0,0)';
        const r = Math.round(c1.r + factor * (c2.r - c1.r));
        const g = Math.round(c1.g + factor * (c2.g - c1.g));
        const b = Math.round(c1.b + factor * (c2.b - c1.b));
        return `rgb(${r}, ${g}, ${b})`;
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})$/i.exec(hex);
        if (!result) return null;
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
    let waveStateInterval = null;

    function initDynamicWaves() {
        if (!waveSvg || !wavePath1 || !wavePath2) {
            console.warn("Wave elements not found, skipping wave initialization.");
            return;
        }
        waveStateInterval = setInterval(() => {
            if (document.hidden || prefersReducedMotion) return;
            const randomState = Math.random();
            if (randomState < 0.4) { targetAmplitude = 3 + Math.random() * 4; targetFrequency = 0.004 + Math.random() * 0.003; targetSpeed = 0.01 + Math.random() * 0.01; }
            else if (randomState < 0.8) { targetAmplitude = 8 + Math.random() * 7; targetFrequency = 0.006 + Math.random() * 0.004; targetSpeed = 0.02 + Math.random() * 0.015; }
            else { targetAmplitude = 16 + Math.random() * 9; targetFrequency = 0.008 + Math.random() * 0.005; targetSpeed = 0.03 + Math.random() * 0.02; }
        }, 10000);
    }

    function updateWaves(elapsedSinceLastThrottledFrame) {
        if (!wavePath1 || !wavePath2) return;
        const timeFactor = Math.min(2, elapsedSinceLastThrottledFrame / FRAME_DURATION);
        waveTime += currentSpeed * timeFactor;
        currentAmplitude += (targetAmplitude - currentAmplitude) * 0.05 * timeFactor;
        currentFrequency += (targetFrequency - currentFrequency) * 0.05 * timeFactor;
        currentSpeed += (targetSpeed - currentSpeed) * 0.05 * timeFactor;
        const points1 = [], points2 = [];
        const segments = 20;
        const waveWidth = waveSvg.viewBox.baseVal.width || 1440;
        const waveHeight = waveSvg.viewBox.baseVal.height || 60;
        for (let i = 0; i <= segments; i++) {
            const x = (waveWidth / segments) * i;
            const y1 = waveHeight / 2 + Math.sin(x * currentFrequency + waveTime) * currentAmplitude;
            points1.push(`${x.toFixed(2)},${y1.toFixed(2)}`);
            const y2 = waveHeight / 2 + Math.sin(x * currentFrequency * 1.2 + waveTime * 0.8 + 1) * currentAmplitude * 0.7;
            points2.push(`${x.toFixed(2)},${y2.toFixed(2)}`);
        }
        const pathData1 = `M0,${waveHeight} L0,${points1[0].split(',')[1]} L${points1.join(' L')} L${waveWidth},${waveHeight} Z`;
        const pathData2 = `M0,${waveHeight} L0,${points2[0].split(',')[1]} L${points2.join(' L')} L${waveWidth},${waveHeight} Z`;
        wavePath1.setAttribute('d', pathData1);
        wavePath2.setAttribute('d', pathData2);
    }

    // Water Background and Bubbles setup
    let updateWaterHeight = () => {};
    const bubblePool = [];
    let bubbleInterval = null;
    let scrollTimeout = null;

    function initWaterBackground() {
        if (!waterBody || !waterSurface || !bubblesContainer) {
            console.warn("Water elements not found, skipping water background initialization.");
            return;
        }
        const initialHeight = 50;
        waterBody.style.height = `${initialHeight}vh`;
        waterSurface.style.bottom = `${initialHeight}vh`;
        const POOL_SIZE = isLowPerfDevice ? 5 : 10;
        const BUBBLE_INTERVAL = isLowPerfDevice ? 1200 : 600;
        for (let i = 0; i < POOL_SIZE; i++) {
          const bubble = document.createElement('div');
          bubble.classList.add('bubble');
          bubble.style.display = 'none';
          bubble.setAttribute('aria-hidden', 'true');
          bubblesContainer.appendChild(bubble);
          bubblePool.push(bubble);
        }
        let lastScrollTime = 0;
        let targetWaterHeight = initialHeight;
        let currentWaterHeight = initialHeight;
        const scrollThrottle = isLowPerfDevice ? 200 : 100;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const now = Date.now();
                if (now - lastScrollTime < scrollThrottle) return;
                lastScrollTime = now;
                const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercentage = scrollMax > 0 ? Math.min(1, window.scrollY / scrollMax) : 0;
                targetWaterHeight = 40 + (scrollPercentage * 45);
                if (waterCanvasInstance && typeof waterCanvasInstance.updateWaterHeight === 'function') {
                    waterCanvasInstance.updateWaterHeight(targetWaterHeight);
                }
            }, 10);
        }, { passive: true });
        updateWaterHeight = (elapsedSinceLastThrottledFrame) => {
            if (!waterBody || !waterSurface) return;
            const timeFactor = Math.min(2, elapsedSinceLastThrottledFrame / FRAME_DURATION);
            currentWaterHeight += (targetWaterHeight - currentWaterHeight) * 0.08 * timeFactor;
            const currentStyleBottom = parseFloat(waterSurface.style.bottom);
            const newRoundedHeight = Math.round(currentWaterHeight * 10) / 10;
            if (Math.abs(currentStyleBottom - newRoundedHeight) > 0.1) {
                const heightValue = newRoundedHeight.toFixed(1);
                waterBody.style.height = `${heightValue}vh`;
                waterSurface.style.bottom = `${heightValue}vh`;
            }
        }
        function getAvailableBubble() { return bubblePool.find(bubble => bubble.style.display === 'none'); }
        function activateBubble() {
          if (document.hidden || !bubblesContainer) return;
          const bubble = getAvailableBubble();
          if (!bubble) return;
          const size = 5 + Math.random() * 10;
          const xPos = Math.random() * 100;
          const driftX = -20 + Math.random() * 40;
          const riseDuration = 5 + Math.random() * 6;
          bubble.style.cssText = `display: block; width: ${size}px; height: ${size}px; left: ${xPos}%; bottom: 0; animation: none; opacity: 0; transform: scale(0.5); --drift-x: ${driftX}px;`;
          void bubble.offsetWidth;
          bubble.style.animation = `bubble-rise ${riseDuration}s ease-out forwards`;
          bubble.style.opacity = '0.6';
          bubble.style.transform = 'scale(1)';
          const handleAnimationEnd = () => {
              bubble.style.display = 'none';
              bubble.style.animation = 'none';
              bubble.removeEventListener('animationend', handleAnimationEnd);
          };
          bubble.addEventListener('animationend', handleAnimationEnd, { once: true });
          setTimeout(() => { if (bubble.style.display !== 'none') handleAnimationEnd(); }, riseDuration * 1000 + 500);
        }
        function startBubbles() {
            if (bubbleInterval) clearInterval(bubbleInterval);
            bubbleInterval = setInterval(activateBubble, BUBBLE_INTERVAL);
            activateBubble();
        }
        if (!document.hidden) { startBubbles(); }
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) { if (!bubbleInterval) startBubbles(); }
            else { if (bubbleInterval) { clearInterval(bubbleInterval); bubbleInterval = null; } }
        });
        if (!isLowPerfDevice && !('ontouchstart' in window)) {
            document.addEventListener('click', (e) => {
                if (e.target.closest('a, button, .button, input, select, textarea, [role="button"]')) return;
                const bubble = getAvailableBubble();
                if (!bubble) return;
                const size = 5 + Math.random() * 5;
                const xPercent = (e.clientX / window.innerWidth) * 100;
                const clickRiseDuration = 4;
                bubble.style.cssText = `display: block; width: ${size}px; height: ${size}px; left: ${xPercent}%; bottom: calc(${currentWaterHeight}vh - 10px); animation: none; opacity: 0; transform: scale(0.5); --drift-x: 0px;`;
                void bubble.offsetWidth;
                bubble.style.animation = `bubble-rise ${clickRiseDuration}s ease-out forwards`;
                bubble.style.opacity = '0.6';
                bubble.style.transform = 'scale(1)';
                const handleAnimationEnd = () => {
                    bubble.style.display = 'none';
                    bubble.style.animation = 'none';
                    bubble.removeEventListener('animationend', handleAnimationEnd);
                };
                bubble.addEventListener('animationend', handleAnimationEnd, { once: true });
                setTimeout(() => { if (bubble.style.display !== 'none') handleAnimationEnd(); }, clickRiseDuration * 1000 + 500);
            });
        }
    }

    // Swimming Fish Animation setup
    let fishImageKeys = [];
    let fishImages = [];
    let currentWaterHeightVh = 50;
    const activeFish = [];
    let adjustFishToWaterInterval = null;
    let fishRefreshInterval = null;
    let fishCount = 0;
    let currentWaterTopVh = 50;

    function initSwimmingFish() {
        if (!fishContainer || !waterBody) {
            console.error('Missing elements for fish animation, skipping initialization.');
            return;
        }
        if (typeof FISH_IMAGES === 'undefined' || Object.keys(FISH_IMAGES).length === 0) {
            console.error('Fish images data (FISH_IMAGES) not found or empty.');
            return;
        }
        fishCount = isLowPerfDevice ? 5 : (window.navigator.hardwareConcurrency >= 8 ? 20 : 12);
        console.log(`Initializing DOM fish animation with target count: ${fishCount}`);
        fishImageKeys = Object.keys(FISH_IMAGES);
        fishImages = fishImageKeys.map(key => FISH_IMAGES[key]);
        currentWaterHeightVh = parseFloat(waterBody.style.height) || 50;
        currentWaterTopVh = 100 - currentWaterHeightVh;
        adjustFishToWaterInterval = setInterval(() => {
            if (!waterBody || document.hidden) return;
            const waterHeight = parseFloat(waterBody.style.height) || 50;
            if (Math.abs(waterHeight - currentWaterHeightVh) > 1) {
                currentWaterHeightVh = waterHeight;
                currentWaterTopVh = 100 - currentWaterHeightVh;
                activeFish.forEach(fish => {
                    if (!fish?.element?.isConnected) return;
                    const fishTopBoundary = currentWaterTopVh + 2;
                    if (fish.currentY_vh < fishTopBoundary) {
                        const newY_vh = fishTopBoundary + Math.random() * (currentWaterHeightVh - 4);
                        fish.element.style.transform = `translate(${fish.currentX_vw.toFixed(1)}vw, ${newY_vh.toFixed(1)}vh) scaleX(${fish.direction === 'left' ? -1 : 1})`;
                        fish.originalY_vh = newY_vh;
                        fish.currentY_vh = newY_vh;
                    }
                });
            }
        }, 2000);
        fishRefreshInterval = setInterval(() => {
            if (document.hidden || activeFish.length === 0 || Math.random() > 0.2) return;
            const indexToRemove = Math.floor(Math.random() * activeFish.length);
            const fishToRemove = activeFish[indexToRemove];
            if (fishToRemove?.element?.isConnected) {
                fishToRemove.element.style.transition = 'opacity 1.5s ease-out';
                fishToRemove.element.style.opacity = '0';
                fishToRemove.element.addEventListener('transitionend', () => {
                    if (fishToRemove.element.isConnected) fishToRemove.element.remove();
                    const arrayIndex = activeFish.indexOf(fishToRemove);
                    if (arrayIndex > -1) activeFish.splice(arrayIndex, 1);
                    if (!document.hidden && activeFish.length < fishCount) {
                        setTimeout(createFish, 500);
                    }
                }, { once: true });
                setTimeout(() => {
                    if (fishToRemove.element.isConnected) fishToRemove.element.remove();
                    const arrayIndex = activeFish.indexOf(fishToRemove);
                    if (arrayIndex > -1) activeFish.splice(arrayIndex, 1);
                    if (!document.hidden && activeFish.length < fishCount) {
                       setTimeout(createFish, 500);
                    }
                }, 1600);
            } else {
                 const arrayIndex = activeFish.indexOf(fishToRemove);
                 if (arrayIndex > -1) activeFish.splice(arrayIndex, 1);
                 if (!document.hidden && activeFish.length < fishCount) {
                     setTimeout(createFish, 500);
                 }
            }
        }, isLowPerfDevice ? 30000 : 20000);
        for (let i = 0; i < fishCount; i++) {
            setTimeout(createFish, i * (isLowPerfDevice ? 600 : 300));
        }
    }

    function createFish() {
        if (document.hidden || !fishContainer || !fishImageKeys.length || activeFish.length >= fishCount) return null;
        try {
            const fishElement = document.createElement('div');
            fishElement.className = 'swimming-fish';
            fishElement.setAttribute('aria-hidden', 'true');
            const randomFishKey = fishImageKeys[Math.floor(Math.random() * fishImageKeys.length)];
            const fishImageUrl = FISH_IMAGES[randomFishKey];
            if (!fishImageUrl) { console.warn(`Image URL not found for key: ${randomFishKey}`); return null; }
            const img = document.createElement('img');
            img.crossOrigin = "anonymous";
            img.src = fishImageUrl;
            img.alt = `${randomFishKey} fish swimming`;
            img.loading = 'lazy';
            img.onerror = function() {
                console.error(`Failed to load fish image: ${randomFishKey} at ${fishImageUrl}`);
                img.src = FISH_IMAGES["Common Carp"] || "images/placeholder-fish.png";
                img.alt = "Fallback fish image";
            };
            fishElement.appendChild(img);
            let size;
            if (randomFishKey.includes("Mythic") || randomFishKey.includes("Legendary") || randomFishKey.includes("Chimerical") || randomFishKey.includes("Kraken") || randomFishKey.includes("Whale")) { size = 65 + Math.random() * 30; }
            else if (randomFishKey.includes("Rare") || randomFishKey.includes("Shark") || randomFishKey.includes("Sturgeon")) { size = 50 + Math.random() * 25; }
            else { size = 40 + Math.random() * 20; }
            fishElement.style.width = `${size}px`;
            fishElement.style.height = 'auto';
            const startX_vw = Math.random() * 100;
            const startY_vh = currentWaterTopVh + (Math.random() * (currentWaterHeightVh * 0.8));
            fishElement.style.opacity = '0';
            const direction = Math.random() > 0.5 ? 'right' : 'left';
            const scaleX = direction === 'left' ? -1 : 1;
            fishElement.style.transform = `translate(${startX_vw.toFixed(1)}vw, ${startY_vh.toFixed(1)}vh) scaleX(${scaleX})`;
            const speedFactor = isLowPerfDevice ? 0.4 : 1;
            const baseSpeed = (40 - size * 0.3) * 0.05 * speedFactor;
            const speed = Math.max(0.5, Math.min(4, baseSpeed));
            const verticalAmount = Math.random() * 8 + 3;
            const fishData = {
                element: fishElement, speed: speed, direction: direction,
                verticalDirection: Math.random() > 0.5 ? 'up' : 'down',
                verticalAmount: verticalAmount, originalY_vh: startY_vh,
                wiggleAmount: Math.random() * 0.4 + 0.3, wigglePhase: Math.random() * Math.PI * 2,
                currentX_vw: startX_vw, currentY_vh: startY_vh
            };
            fishContainer.appendChild(fishElement);
            activeFish.push(fishData);
            requestAnimationFrame(() => {
                fishElement.style.transition = 'opacity 0.5s ease-in';
                fishElement.style.opacity = '0.8';
            });
            return fishData;
        } catch (err) { console.error("Error creating fish:", err); return null; }
    }

    function updateAllFish(elapsedSinceLastThrottledFrame) {
        if (!activeFish.length || prefersReducedMotion) return;
        const elapsedSeconds = elapsedSinceLastThrottledFrame / 1000;
        const boundaryPadding = 3;
        const waterTopBoundary_vh = currentWaterTopVh + 1;
        const waterBottomBoundary_vh = 100 - 2;
        activeFish.forEach((fish, index) => {
            if (!fish.element || !fish.element.isConnected) { activeFish.splice(index, 1); return; }
            let { element, speed, direction, verticalDirection, verticalAmount, originalY_vh, wiggleAmount, wigglePhase, currentX_vw, currentY_vh } = fish;
            const horizontalMove = speed * elapsedSeconds;
            let scaleX = direction === 'left' ? -1 : 1;
            if (direction === 'right') {
                currentX_vw += horizontalMove;
                if (currentX_vw > (100 - boundaryPadding)) { direction = 'left'; scaleX = -1; }
            } else {
                currentX_vw -= horizontalMove;
                if (currentX_vw < boundaryPadding) { direction = 'right'; scaleX = 1; }
            }
            if (Math.random() < 0.0005) { direction = (direction === 'right' ? 'left' : 'right'); scaleX = direction === 'left' ? -1 : 1; }
            originalY_vh += (Math.random() - 0.5) * 0.5 * elapsedSeconds;
            originalY_vh = Math.max(waterTopBoundary_vh + verticalAmount, Math.min(waterBottomBoundary_vh - verticalAmount, originalY_vh));
            const verticalSpeed = speed * 0.4;
            const verticalMove = verticalSpeed * elapsedSeconds;
            let targetY_vh = currentY_vh + (verticalDirection === 'up' ? -verticalMove : verticalMove);
            const verticalTopLimit = Math.max(waterTopBoundary_vh, originalY_vh - verticalAmount);
            const verticalBottomLimit = Math.min(waterBottomBoundary_vh, originalY_vh + verticalAmount);
            if (verticalDirection === 'up' && targetY_vh < verticalTopLimit) { verticalDirection = 'down'; targetY_vh = currentY_vh + verticalMove; }
            else if (verticalDirection === 'down' && targetY_vh > verticalBottomLimit) { verticalDirection = 'up'; targetY_vh = currentY_vh - verticalMove; }
            if (Math.random() < 0.005) { verticalDirection = (verticalDirection === 'up' ? 'down' : 'up'); }
            wigglePhase += 7 * elapsedSeconds;
            const wiggle = Math.sin(wigglePhase) * wiggleAmount;
            targetY_vh += wiggle * 0.2;
            currentY_vh = Math.max(waterTopBoundary_vh, Math.min(waterBottomBoundary_vh, targetY_vh));
            element.style.transform = `translate(${currentX_vw.toFixed(1)}vw, ${currentY_vh.toFixed(1)}vh) scaleX(${scaleX})`;
            fish.direction = direction; fish.verticalDirection = verticalDirection;
            fish.originalY_vh = originalY_vh; fish.wigglePhase = wigglePhase % (Math.PI * 2);
            fish.currentX_vw = currentX_vw; fish.currentY_vh = currentY_vh;
        });
    }

    // Mouse Trail Effect setup
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let trailX = mouseX, trailY = mouseY;
    let lastDropletTime = 0;
    const DROPLET_INTERVAL = 50;
    let animateTrailFn = () => {};
    let isTrailActive = false;

    function initMouseTrail() {
        if (!trail || isLowPerfDevice || 'ontouchstart' in window) {
            if (trail) trail.style.display = 'none';
            document.body.classList.remove('custom-cursor-active');
            isTrailActive = false;
            return;
        }
        if (document.body.classList.contains('using-canvas')) {
             if (trail) trail.style.display = 'none';
             document.body.classList.remove('custom-cursor-active');
             isTrailActive = false;
             return;
        }
        // REMOVED: Don't hide cursor
        document.body.classList.add('custom-cursor-active'); // Keep class for potential styling
        trail.style.opacity = '0';
        isTrailActive = true;
        document.addEventListener('mousemove', (e) => {
            if (!isTrailActive) return;
            mouseX = e.clientX; mouseY = e.clientY;
            if (trail.style.opacity === '0') {
                trailX = mouseX; trailY = mouseY;
                trail.style.transform = `translate(${trailX.toFixed(0)}px, ${trailY.toFixed(0)}px) translate(-50%, -50%) rotate(45deg) scale(1)`;
                trail.style.opacity = '0.8';
            }
        });
        animateTrailFn = (elapsedSinceLastFrame) => {
            if (!trail || !isTrailActive || isNaN(mouseX) || isNaN(mouseY)) return;
            const lerpFactor = 0.2;
            trailX += (mouseX - trailX) * lerpFactor;
            trailY += (mouseY - trailY) * lerpFactor;
            const currentTransform = trail.style.transform;
            const currentScaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
            const currentScale = currentScaleMatch ? currentScaleMatch[1] : '1';
            trail.style.transform = `translate(${trailX.toFixed(0)}px, ${trailY.toFixed(0)}px) translate(-50%, -50%) rotate(45deg) scale(${currentScale})`;
            const now = performance.now();
            const distMoved = Math.hypot(mouseX - trailX, mouseY - trailY);
            if (now - lastDropletTime > DROPLET_INTERVAL && distMoved > 3 && Math.random() > 0.5) {
                createTrailDroplet(trailX, trailY);
                lastDropletTime = now;
            }
        };
         let fadeTimeout;
         document.addEventListener('mousemove', () => {
             if (!trail || !isTrailActive) return;
             trail.style.opacity = '0.8';
             clearTimeout(fadeTimeout);
             fadeTimeout = setTimeout(() => { if (trail && isTrailActive) trail.style.opacity = '0'; }, 300);
         });
         document.addEventListener('mousedown', (e) => {
             if (!trail || !isTrailActive || e.target.closest('a, button, .button, input, select, textarea, [role="button"]')) return;
             trail.style.transform = `translate(${trailX.toFixed(0)}px, ${trailY.toFixed(0)}px) translate(-50%, -50%) rotate(45deg) scale(0.6)`;
             createWaterSplash(e.clientX, e.clientY);
         });
         document.addEventListener('mouseup', (e) => {
             if (!trail || !isTrailActive || e.target.closest('a, button, .button, input, select, textarea, [role="button"]')) return;
             trail.style.transform = `translate(${trailX.toFixed(0)}px, ${trailY.toFixed(0)}px) translate(-50%, -50%) rotate(45deg) scale(1.1)`;
             setTimeout(() => {
                 if (trail && isTrailActive) trail.style.transform = `translate(${trailX.toFixed(0)}px, ${trailY.toFixed(0)}px) translate(-50%, -50%) rotate(45deg) scale(1)`;
             }, 150);
         });
         function createTrailDroplet(x, y) {
            if (isNaN(x) || isNaN(y) || document.hidden || !isTrailActive) return;
            const droplet = document.createElement('div');
            droplet.className = 'trail-droplet';
            droplet.setAttribute('aria-hidden', 'true');
            droplet.style.left = `${x + (Math.random() * 10 - 5)}px`;
            droplet.style.top = `${y + (Math.random() * 10 - 5)}px`;
            const size = 4 + Math.random() * 6;
            droplet.style.width = `${size}px`; droplet.style.height = `${size}px`;
            document.body.appendChild(droplet);
            setTimeout(() => { droplet.remove(); }, 800);
         }
         function createWaterSplash(x, y) {
            if (document.hidden || !isTrailActive) return;
            const splashContainer = document.createElement('div');
            splashContainer.className = 'water-splash';
            splashContainer.setAttribute('aria-hidden', 'true');
            splashContainer.style.left = `${x}px`; splashContainer.style.top = `${y}px`;
            document.body.appendChild(splashContainer);
            const dropletCount = isLowPerfDevice ? 6 : 12;
            for (let i = 0; i < dropletCount; i++) {
                const droplet = document.createElement('div');
                droplet.className = 'splash-droplet';
                const size = 5 + Math.random() * 10;
                droplet.style.width = `${size}px`; droplet.style.height = `${size}px`;
                const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() * 0.5 - 0.25);
                const distance = 20 + Math.random() * 40;
                const splashX = Math.cos(angle) * distance;
                const splashY = Math.sin(angle) * distance;
                droplet.style.setProperty('--splash-x', `${splashX.toFixed(1)}px`);
                droplet.style.setProperty('--splash-y', `${splashY.toFixed(1)}px`);
                splashContainer.appendChild(droplet);
            }
            setTimeout(() => { splashContainer.remove(); }, 600);
         }
         animateTrailFn(0);
    }

    // Initialize static event listeners
    function initStaticListeners() {
        document.body.addEventListener('mousedown', function (e) {
            // Prevent ripple on UI toggle buttons specifically
            if (e.target.closest('#ui-toggle-container')) return;

            const button = e.target.closest('.button');
            if (!button) return; // Only apply ripple to elements with the .button class

            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left; const y = e.clientY - rect.top;

            // Remove existing ripple first if one exists
            const existingRipple = button.querySelector('.ripple');
            if (existingRipple) {
                existingRipple.remove();
            }

            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`; ripple.style.top = `${y}px`;
            button.appendChild(ripple);

            // Clean up ripple after animation
            ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
        });

        // Animation on Scroll
        const animatedSections = document.querySelectorAll('.animated-section.fade-in');
        if ('IntersectionObserver' in window && animatedSections.length > 0) {
            const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        obs.unobserve(entry.target); // Stop observing once visible
                    }
                });
            }, observerOptions);
            animatedSections.forEach(section => observer.observe(section));
        } else {
            // Fallback for older browsers
            animatedSections.forEach(section => {
                section.classList.add('visible');
            });
        }

        // Smooth scrolling for nav links
        document.body.addEventListener('click', function(e) {
            const anchor = e.target.closest('nav a[href^="#"]');
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (href && href.length > 1) { // Ensure it's not just "#"
                const targetElement = document.getElementById(href.substring(1));
                if (targetElement) {
                    e.preventDefault(); // Prevent default anchor jump
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        // Invite and Support Links
        const discordInviteLink = "https://discord.com/oauth2/authorize?client_id=1354018504470298624";
        const discordSupportLink = "https://discord.gg/TKqYnW4k29"; // Updated link

        document.querySelectorAll('.invite-button').forEach(button => {
            if (button.tagName === 'A') {
                button.href = discordInviteLink;
                button.target = '_blank';
                button.rel = 'noopener noreferrer';
            } else {
                button.addEventListener('click', () => window.open(discordInviteLink, '_blank', 'noopener,noreferrer'));
            }
        });

        document.querySelectorAll('.support-button').forEach(button => {
            if (button.tagName === 'A') {
                button.href = discordSupportLink;
                button.target = '_blank';
                button.rel = 'noopener noreferrer';
            } else {
                button.addEventListener('click', () => window.open(discordSupportLink, '_blank', 'noopener,noreferrer'));
            }
        });

        // REMOVED: Redundant expand button logic from here.
        // The correct logic is now placed at the end of the DOMContentLoaded listener.

        // UI Toggle Button Logic
        if (hideUiButton && showUiButton) {
            // Use the cached elements directly
            function hideUI(e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                document.body.classList.add('ui-hidden');
                hideUiButton.style.display = 'none';
                showUiButton.style.display = 'flex'; // Use flex to match button styles if needed
                localStorage.setItem('uiHidden', 'true');
            }

            function showUI(e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                document.body.classList.remove('ui-hidden');
                hideUiButton.style.display = 'flex'; // Use flex to match button styles if needed
                showUiButton.style.display = 'none';
                localStorage.setItem('uiHidden', 'false');
            }

            // Add event listeners using the cached elements
            hideUiButton.addEventListener('click', hideUI);
            showUiButton.addEventListener('click', showUI);

            // Check local storage on load
            if (localStorage.getItem('uiHidden') === 'true') {
                hideUI(); // Call without event object
            } else {
                showUI(); // Ensure correct initial state if not hidden
            }
        } else {
            console.warn("UI toggle buttons not found.");
            if (uiToggleContainer) {
                uiToggleContainer.style.display = 'none'; // Hide container if buttons are missing
            }
        }
    }

    // Main Animation Loop
    function mainLoop(timestamp) {
        if (!isLoopRunning) return;
        animationFrameId = requestAnimationFrame(mainLoop);
        if (!lastTimestamp) lastTimestamp = timestamp;
        const elapsedSinceLastFrame = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        if (isTrailActive && typeof animateTrailFn === 'function') {
            animateTrailFn(elapsedSinceLastFrame);
        }
        if (!lastThrottledTimestamp) lastThrottledTimestamp = timestamp;
        const elapsedSinceLastThrottledFrame = timestamp - lastThrottledTimestamp;
        if (elapsedSinceLastThrottledFrame >= FRAME_DURATION * 0.9) {
            lastThrottledTimestamp = timestamp;
            updateWaterHeight(elapsedSinceLastThrottledFrame);
            if (!prefersReducedMotion) {
                updateWaves(elapsedSinceLastThrottledFrame);
                updateAllFish(elapsedSinceLastThrottledFrame);
            }
        }
    }

    function startAnimationLoop() {
        if (isLoopRunning) return;
        console.log("Starting DOM animation loop");
        isLoopRunning = true;
        lastTimestamp = performance.now();
        lastThrottledTimestamp = lastTimestamp;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(mainLoop);
    }

    function stopAnimationLoop() {
        if (!isLoopRunning) return;
        console.log("Stopping DOM animation loop");
        isLoopRunning = false;
        if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
        lastTimestamp = 0; lastThrottledTimestamp = 0;
    }

    // --- START: Try Me Fishing Simulator Logic ---
    const tryMeSection = document.getElementById('try-me');
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
        let isCasting = false;
        if (typeof window.FISH_DATA === 'undefined' || typeof window.FISH_IMAGES === 'undefined') {
            console.error("Try Me Simulator Error: FISH_DATA or FISH_IMAGES not loaded.");
            if(statusText) statusText.textContent = "Error: Fish data not loaded.";
            if (castButton) castButton.disabled = true;
        } else {
            updateCoinDisplay();
            if (castButton) castButton.style.display = 'inline-flex';
            if (sellButton) sellButton.style.display = 'none';
            if (resultDiv) resultDiv.style.display = 'none';
            if (resultDiv) resultDiv.classList.remove('visible');
            function simulateCatch() {
                const rand = Math.random(); let selectedRarity = 'common'; let fishPool = [];
                const localFishData = window.FISH_DATA;
                if (rand < 0.01 && localFishData.junk?.length > 0) { selectedRarity = 'junk'; fishPool = localFishData.junk; }
                else if (rand < 0.05 && localFishData.legendary?.length > 0) { selectedRarity = 'legendary'; fishPool = localFishData.legendary; }
                else if (rand < 0.15 && localFishData.rare?.length > 0) { selectedRarity = 'rare'; fishPool = localFishData.rare; }
                else if (rand < 0.40 && localFishData.uncommon?.length > 0) { selectedRarity = 'uncommon'; fishPool = localFishData.uncommon; }
                else if (localFishData.common?.length > 0) { selectedRarity = 'common'; fishPool = localFishData.common || []; }
                else { console.warn("Could not find fish pool for selected rarity, defaulting to common."); selectedRarity = 'common'; fishPool = localFishData.common || []; }
                if (fishPool.length === 0) { console.error(`No fish found in the '${selectedRarity}' pool!`); return { name: "Nothing...", rarity: "none", baseValue: 0 }; }
                const randomIndex = Math.floor(Math.random() * fishPool.length);
                const caughtItem = { ...fishPool[randomIndex] };
                caughtItem.displayValue = caughtItem.baseValue || (caughtItem.rarity === 'junk' ? 1 : 5);
                caughtItem.rarity = caughtItem.rarity || 'unknown';
                return caughtItem;
            }
            function displayResult(item) {
                currentCatch = item;
                if (!fishName || !fishRarity || !fishValue || !fishImage || !resultDiv || !castButton || !sellButton || !statusText) { console.error("Try Me Simulator Error: One or more display elements not found."); return; }
                fishName.textContent = item.name;
                fishRarity.textContent = capitalizeFirst(item.rarity);
                fishValue.textContent = `Value: ${item.displayValue}`;
                const rarityColor = window.FISH_DATA.colors[item.rarity] || '#cccccc';
                fishRarity.style.color = rarityColor;
                const imageUrl = window.FISH_IMAGES[item.name] || window.FISH_IMAGES['placeholder'] || 'images/placeholder-fish.png';
                fishImage.src = imageUrl; fishImage.alt = item.name;
                resultDiv.style.display = 'block';
                setTimeout(() => resultDiv.classList.add('visible'), 10);
                castButton.style.display = 'none';
                if (item.rarity !== 'junk' && item.rarity !== 'none') { sellButton.style.display = 'inline-flex'; statusText.textContent = `You caught a ${item.name}!`; }
                else { sellButton.style.display = 'none'; setTimeout(resetSimulator, 1500); statusText.textContent = `You caught ${item.name}...`; }
                isCasting = false; castButton.classList.remove('casting');
            }
            function sellCatch() {
                if (currentCatch && currentCatch.rarity !== 'junk' && currentCatch.rarity !== 'none') {
                    simulatedCoins += currentCatch.displayValue; updateCoinDisplay();
                    if(statusText) statusText.textContent = `Sold ${currentCatch.name} for ${currentCatch.displayValue} coins!`;
                }
                resetSimulator();
            }
            function resetSimulator() {
                currentCatch = null;
                if (resultDiv) {
                    resultDiv.classList.remove('visible');
                    setTimeout(() => { if (!resultDiv.classList.contains('visible')) { resultDiv.style.display = 'none'; } }, 400);
                }
                if(sellButton) sellButton.style.display = 'none';
                if(castButton) castButton.style.display = 'inline-flex';
                if (!isCasting && statusText) { statusText.textContent = "Ready to cast!"; }
            }
            function updateCoinDisplay() { if(coinDisplay) coinDisplay.textContent = simulatedCoins; }
            function capitalizeFirst(str) { if (!str) return ''; return str.charAt(0).toUpperCase() + str.slice(1); }
            if (castButton) {
                castButton.addEventListener('click', () => {
                    if (isCasting) return; isCasting = true;
                    if(statusText) statusText.textContent = "Casting...";
                    castButton.disabled = true; castButton.classList.add('casting');
                    setTimeout(() => { const caughtItem = simulateCatch(); displayResult(caughtItem); castButton.disabled = false; }, 1000);
                });
            }
            if (sellButton) { sellButton.addEventListener('click', sellCatch); }
        }
    }
    // --- END: Try Me Fishing Simulator Logic ---


    // Initialize animations
    function initializeWebsiteAnimations() {
        const isUsingCanvas = document.body.classList.contains('using-canvas');
        console.log("Initializing TackleBot animations...");
        initSky();
        initStaticListeners();
        
        // Initialize expandable sections
        initExpandableSections();
        
        if (!isUsingCanvas) {
            console.log("Initializing DOM-based water effects...");
            initWaterBackground();
            initDynamicWaves();
            initMouseTrail();
            setTimeout(initSwimmingFish, 500);
            document.addEventListener('visibilitychange', () => {
                if (isUsingCanvas) return;
                if (!document.hidden) {
                    startAnimationLoop();
                    if (!bubbleInterval && bubblesContainer) startBubbles();
                } else {
                    stopAnimationLoop();
                    if (bubbleInterval) { clearInterval(bubbleInterval); bubbleInterval = null; }
                }
            });
            if (!document.hidden) { startAnimationLoop(); }
        } else {
            isTrailActive = false;
            if (trail) trail.style.display = 'none';
            document.body.classList.remove('custom-cursor-active');
        }
        window.addEventListener('pagehide', () => {
            console.log("Cleaning up animations and intervals...");
            if (waterCanvasInstance && typeof waterCanvasInstance.stop === 'function') {
                waterCanvasInstance.stop(); waterCanvasInstance = null;
            }
            stopAnimationLoop();
            if (skyUpdateInterval) clearInterval(skyUpdateInterval);
            if (waveStateInterval) clearInterval(waveStateInterval);
            if (bubbleInterval) clearInterval(bubbleInterval);
            if (adjustFishToWaterInterval) clearInterval(adjustFishToWaterInterval);
            if (fishRefreshInterval) clearInterval(fishRefreshInterval);
            if (scrollTimeout) clearTimeout(scrollTimeout);
            skyUpdateInterval = waveStateInterval = bubbleInterval = adjustFishToWaterInterval = fishRefreshInterval = scrollTimeout = null;
            console.log("Cleanup complete.");
        });
        console.log("TackleBot animations initialized.");
    }

    // Function to initialize expandable sections
    function initExpandableSections() {
        console.log("Initializing expandable sections...");
        document.querySelectorAll('.expand-btn').forEach(button => {
            const expandedContent = button.nextElementSibling;

            if (!expandedContent || !expandedContent.classList.contains('expanded-content')) {
                console.warn("Initialization: Could not find .expanded-content sibling for button:", button);
                return;
            }

            // Ensure clean state on load
            expandedContent.style.display = 'none';
            button.setAttribute('aria-expanded', 'false');
            
            // Simple toggle function that directly manipulates the DOM
            function toggleExpansion(event) {
                // Prevent any default behaviors
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                
                // Get current state
                const isCurrentlyExpanded = button.getAttribute('aria-expanded') === 'true';
                
                // Toggle the state
                button.setAttribute('aria-expanded', isCurrentlyExpanded ? 'false' : 'true');
                
                // Toggle the display of the expanded content
                expandedContent.style.display = isCurrentlyExpanded ? 'none' : 'block';
                
                console.log(`Button expanded state toggled to: ${!isCurrentlyExpanded}`);
                
                // Explicitly stop propagation again for good measure
                if (event && event.stopPropagation) {
                    event.stopPropagation();
                }
                
                return false; // Prevent default behavior for good measure
            }
            
            // Remove any existing event listeners (to prevent duplicates)
            button.removeEventListener('click', toggleExpansion);
            
            // Use a single click handler for simplicity
            button.addEventListener('click', toggleExpansion);
            
            // Additional handling for mobile devices
            if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                // For mobile: capture both touchstart and touchend
                button.addEventListener('touchend', function(e) {
                    // Prevent the simulated mouse click after touchend
                    e.preventDefault();
                    toggleExpansion(e);
                }, { passive: false });
                
                // Disable any canvas event handlers specifically for these buttons
                button.addEventListener('touchstart', function(e) {
                    // Mark this element to be ignored by canvas click handlers
                    e.target.setAttribute('data-ignore-canvas', 'true');
                }, { passive: true });
            }
        });
    }

    // Run the main initialization function
    initializeWebsiteAnimations();

}); // End DOMContentLoaded listener