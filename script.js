document.addEventListener('DOMContentLoaded', () => {

  // --- Performance Detection ---
  const isLowPerfDevice = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
                         !window.requestAnimationFrame ||
                         window.navigator.hardwareConcurrency < 4 ||
                         navigator.userAgent.match(/mobile|android/i);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isLowPerfDevice) {
      document.body.classList.add('reduced-motion');
  }

  // --- Global Animation State ---
  let animationFrameId = null;
  let lastTimestamp = 0;
  const FRAME_DURATION = 33.33; // Target ~30fps

  // --- Sky, Sun, Moon ---
  const skyContainer = document.getElementById('sky-container');
  const sunElement = document.getElementById('sun');
  const moonElement = document.getElementById('moon');
  const cloudsContainer = document.getElementById('clouds-container');
  const NUM_CLOUDS = isLowPerfDevice ? 3 : 7;

  function initSky() {
      if (!skyContainer || !sunElement || !moonElement || !cloudsContainer) return;

      // Create initial clouds
      if (!prefersReducedMotion) {
          for (let i = 0; i < NUM_CLOUDS; i++) {
              createCloud(true); // Create initial clouds instantly
          }
          // Periodically add/remove clouds
          setInterval(() => {
              if (document.hidden) return;
              // Remove one cloud
              if (cloudsContainer.children.length > NUM_CLOUDS / 2) {
                  const cloudToRemove = cloudsContainer.children[Math.floor(Math.random() * cloudsContainer.children.length)];
                  if (cloudToRemove) {
                      cloudToRemove.style.opacity = '0'; // Fade out
                      setTimeout(() => cloudToRemove.remove(), 2000);
                  }
              }
              // Add one cloud
              if (cloudsContainer.children.length < NUM_CLOUDS * 1.5) {
                 setTimeout(createCloud, Math.random() * 5000); // Add with delay
              }
          }, 15000); // Every 15 seconds
      }

      // Initial update
      updateSkyAndTime();
  }

  function createCloud(instant = false) {
      if (!cloudsContainer) return;

      const cloud = document.createElement('div');
      const type = Math.floor(Math.random() * 3) + 1; // type-1, type-2, type-3
      cloud.className = `cloud type-${type}`;

      // Random size multiplier
      const sizeMultiplier = 0.7 + Math.random() * 0.6; // 70% to 130% size
      cloud.style.setProperty('--cloud-scale', sizeMultiplier); // Use CSS variable for scale in animation

      // Random vertical position
      cloud.style.top = `${5 + Math.random() * 50}%`; // 5% to 55% from top

      // Random animation duration (speed) & delay
      const duration = 40 + Math.random() * 50; // 40s to 90s
      cloud.style.animationDuration = `${duration}s`;
      cloud.style.setProperty('--drift-speed', `${duration}s`); // For reduced motion scaling

      if (instant) {
           // Start partway through animation for initial clouds
           cloud.style.animationDelay = `-${Math.random() * duration}s`;
           cloud.style.opacity = `${0.5 + Math.random() * 0.3}`; // Random initial opacity
      } else {
          // New clouds start off-screen and fade in
          cloud.style.left = '-200px'; // Ensure starts off-screen
          cloud.style.opacity = '0';
          setTimeout(() => { cloud.style.opacity = `${0.5 + Math.random() * 0.3}`; }, 100); // Fade in
      }


      // Remove cloud when animation ends (it's off screen)
      cloud.addEventListener('animationend', () => {
          cloud.remove();
          // Optionally create a new cloud to replace it
          // if (!document.hidden && cloudsContainer.children.length < NUM_CLOUDS * 1.5) {
          //     createCloud();
          // }
      });

      cloudsContainer.appendChild(cloud);
  }

  function updateSkyAndTime() {
      if (!skyContainer || !sunElement || !moonElement) return;

      const now = new Date();
      let currentHour, currentMinute;

      // Get time in New York (ET)
      try {
          const nyTimeStr = now.toLocaleString("en-US", {
              timeZone: "America/New_York",
              hour12: false,
              hour: 'numeric',
              minute: 'numeric'
          });
          [currentHour, currentMinute] = nyTimeStr.split(':').map(Number);
      } catch (e) {
          console.warn("Could not get New York time, using local time.", e);
          currentHour = now.getHours();
          currentMinute = now.getMinutes();
      }

      const timeInMinutes = currentHour * 60 + currentMinute;

      // --- Define Time Periods (approximate ET) ---
      const sunriseStart = 5 * 60; // 5:00 AM
      const sunriseEnd = 7 * 60;   // 7:00 AM
      const sunsetStart = 18 * 60; // 6:00 PM
      const sunsetEnd = 20 * 60;   // 8:00 PM
      const dayDuration = sunsetStart - sunriseEnd;
      const nightDuration = (24 * 60 - sunsetEnd) + sunriseStart;

      let skyGradient = 'var(--sky-day)';
      let sunOpacity = 0;
      let moonOpacity = 0;
      let sunX = 50, sunY = 90; // Default position (bottom middle)
      let moonX = 50, moonY = 90;

      // --- Calculate Positions and Opacity ---
      if (timeInMinutes >= sunriseStart && timeInMinutes < sunriseEnd) {
          // Sunrise transition
          const progress = (timeInMinutes - sunriseStart) / (sunriseEnd - sunriseStart);
          skyGradient = `linear-gradient(to bottom, ${interpolateColor('#000030', '#87CEEB', progress)} 10%, ${interpolateColor('#191970', '#ADD8E6', progress)} 50%, ${interpolateColor('#2c3e50', '#B0E0E6', progress)} 100%)`;
          sunOpacity = progress;
          moonOpacity = 1 - progress;
          // Sun rising arc
          sunX = progress * 50; // 0% to 50%
          sunY = 85 - Math.sin(progress * Math.PI) * 60; // Arc path
          // Moon setting arc (opposite)
          moonX = 50 + (1 - progress) * 50; // 100% to 50%
          moonY = 85 - Math.sin((1 - progress) * Math.PI) * 60;

      } else if (timeInMinutes >= sunriseEnd && timeInMinutes < sunsetStart) {
          // Daytime
          skyGradient = 'var(--sky-day)';
          sunOpacity = 1;
          moonOpacity = 0;
          // Sun arc across sky
          const progress = (timeInMinutes - sunriseEnd) / dayDuration; // 0 to 1
          sunX = progress * 100; // 0% to 100%
          sunY = 25 + Math.sin(progress * Math.PI) * 60; // Top arc (adjust 25 for peak height)
          moonY = 95; // Keep moon below horizon

      } else if (timeInMinutes >= sunsetStart && timeInMinutes < sunsetEnd) {
          // Sunset transition
          const progress = (timeInMinutes - sunsetStart) / (sunsetEnd - sunsetStart);
          skyGradient = `linear-gradient(to bottom, ${interpolateColor('#87CEEB', '#FFB6C1', progress)} 0%, ${interpolateColor('#ADD8E6', '#FFA07A', progress)} 40%, ${interpolateColor('#B0E0E6', '#4682B4', progress)} 100%)`; // Day -> Sunset -> Night mix
          sunOpacity = 1 - progress;
          moonOpacity = progress;
          // Sun setting arc
          sunX = 50 + (1 - progress) * 50; // 100% to 50%
          sunY = 85 - Math.sin((1 - progress) * Math.PI) * 60;
          // Moon rising arc
          moonX = progress * 50; // 0% to 50%
          moonY = 85 - Math.sin(progress * Math.PI) * 60;

      } else {
          // Nighttime
          skyGradient = 'var(--sky-night)';
          sunOpacity = 0;
          moonOpacity = 1;
          // Moon arc across sky
          let progress;
          if (timeInMinutes >= sunsetEnd) { // Before midnight
              progress = (timeInMinutes - sunsetEnd) / (24 * 60 - sunsetEnd); // 0 towards 1
          } else { // After midnight
              progress = (timeInMinutes + (24 * 60 - sunsetEnd)) / nightDuration; // fraction of total night
          }
          progress = (timeInMinutes < sunriseStart ? (timeInMinutes + (24*60 - sunsetEnd)) : (timeInMinutes - sunsetEnd)) / nightDuration;

          moonX = progress * 100; // 0% to 100% across the night
          moonY = 25 + Math.sin(progress * Math.PI) * 60; // Top arc
          sunY = 95; // Keep sun below horizon
      }

      // --- Apply Styles ---
      skyContainer.style.background = skyGradient;

      // Update Moon's pseudo-element color if using crescent effect
      // const moonAfter = document.querySelector('#moon::after');
      // if (moonAfter) moonAfter.style.backgroundColor = skyGradient;

      if (!prefersReducedMotion) {
          sunElement.style.transform = `translate(${sunX - 50}vw, ${sunY - 50}vh) translate(-50%, -50%)`;
          moonElement.style.transform = `translate(${moonX - 50}vw, ${moonY - 50}vh) translate(-50%, -50%)`;
      }
      sunElement.style.opacity = sunOpacity.toFixed(2);
      moonElement.style.opacity = moonOpacity.toFixed(2);
  }

  // Helper to interpolate between two hex colors
  function interpolateColor(color1, color2, factor) {
      factor = Math.max(0, Math.min(1, factor));
      const c1 = hexToRgb(color1);
      const c2 = hexToRgb(color2);
      const r = Math.round(c1.r + factor * (c2.r - c1.r));
      const g = Math.round(c1.g + factor * (c2.g - c1.g));
      const b = Math.round(c1.b + factor * (c2.b - c1.b));
      return `rgb(${r}, ${g}, ${b})`;
  }

  function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 }; // Default to black if parse fails
  }


  // --- Dynamic Waves ---
  const waveSvg = document.getElementById('wave-svg');
  const wavePath1 = document.getElementById('wave-path-1');
  const wavePath2 = document.getElementById('wave-path-2');
  const waveWidth = 1440; // SVG viewbox width
  const waveHeight = 60;  // SVG viewbox height

  let waveTime = 0;
  let currentWaveState = 'calm'; // 'calm', 'small', 'big'
  let targetAmplitude = 5;
  let currentAmplitude = 5;
  let targetFrequency = 0.005;
  let currentFrequency = 0.005;
  let targetSpeed = 0.02;
  let currentSpeed = 0.02;

  function initDynamicWaves() {
      if (!waveSvg || !wavePath1 || !wavePath2) return;

      // Periodically change wave state
      setInterval(() => {
          if (document.hidden || prefersReducedMotion) return;

          const randomState = Math.random();
          if (randomState < 0.4) { // 40% chance calm
              currentWaveState = 'calm';
              targetAmplitude = 3 + Math.random() * 4; // 3-7
              targetFrequency = 0.004 + Math.random() * 0.003; // Slower
              targetSpeed = 0.01 + Math.random() * 0.01;
          } else if (randomState < 0.8) { // 40% chance small
              currentWaveState = 'small';
              targetAmplitude = 8 + Math.random() * 7; // 8-15
              targetFrequency = 0.006 + Math.random() * 0.004;
              targetSpeed = 0.02 + Math.random() * 0.015;
          } else { // 20% chance big
              currentWaveState = 'big';
              targetAmplitude = 16 + Math.random() * 9; // 16-25
              targetFrequency = 0.008 + Math.random() * 0.005; // Faster
              targetSpeed = 0.03 + Math.random() * 0.02;
          }
          // console.log("New wave state:", currentWaveState, targetAmplitude, targetFrequency);
      }, 10000); // Change state every 10 seconds

      // updateWaves(); // Start the wave animation - called by main loop now
  }

  function updateWaves() {
      if (!wavePath1 || !wavePath2 || document.hidden) return; // Stop if hidden

      waveTime += currentSpeed;

      // Smoothly transition to target parameters
      currentAmplitude += (targetAmplitude - currentAmplitude) * 0.05;
      currentFrequency += (targetFrequency - currentFrequency) * 0.05;
      currentSpeed += (targetSpeed - currentSpeed) * 0.05;

      // Generate SVG path data
      const points1 = [];
      const points2 = [];
      const segments = 20; // Number of segments for the wave path

      for (let i = 0; i <= segments; i++) {
          const x = (waveWidth / segments) * i;

          // Wave 1
          const y1 = waveHeight / 2 + Math.sin(x * currentFrequency + waveTime) * currentAmplitude;
          points1.push(`${x},${y1.toFixed(2)}`);

          // Wave 2 (slightly offset in phase and frequency/amplitude)
          const y2 = waveHeight / 2 + Math.sin(x * currentFrequency * 1.2 + waveTime * 0.8 + 1) * currentAmplitude * 0.7;
          points2.push(`${x},${y2.toFixed(2)}`);
      }

      // Create the 'd' attribute string
      const pathData1 = `M0,${waveHeight} L0,${waveHeight / 2} ${points1.map((p, i) => i === 0 ? `L${p}` : `L${p}`).join(' ')} L${waveWidth},${waveHeight} Z`;
      const pathData2 = `M0,${waveHeight} L0,${waveHeight / 2} ${points2.map((p, i) => i === 0 ? `L${p}` : `L${p}`).join(' ')} L${waveWidth},${waveHeight} Z`;

      // Apply the path data - requestAnimationFrame ensures this happens efficiently
      // Moved application to RAF within the function itself for safety
      requestAnimationFrame(() => {
           if (wavePath1 && wavePath2) { // Check again inside RAF
              wavePath1.setAttribute('d', pathData1);
              wavePath2.setAttribute('d', pathData2);
           }
      });
  }


  // --- Water Background (Optimized - Keep existing logic, adjust height update) ---
  let updateWaterHeight = () => {}; // Placeholder function
  function initWaterBackground() {
      const waterBody = document.querySelector('.water-body');
      const waterSurface = document.querySelector('.water-surface'); // This is the SVG container now
      const bubblesContainer = document.getElementById('bubbles-container');

      if (!waterBody || !waterSurface || !bubblesContainer) return;

      // Initial water level
      const initialHeight = 50;
      waterBody.style.height = `${initialHeight}vh`;
      waterSurface.style.bottom = `${initialHeight}vh`; // SVG container follows water body

      // Bubble pool optimization (keep existing code)
      const bubblePool = [];
      const POOL_SIZE = isLowPerfDevice ? 5 : 10;
      const BUBBLE_INTERVAL = isLowPerfDevice ? 1200 : 600;
      for (let i = 0; i < POOL_SIZE; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.style.display = 'none';
        bubblesContainer.appendChild(bubble);
        bubblePool.push(bubble);
      }


      // Scroll handling (keep existing code)
      let lastScrollTime = 0;
      let targetWaterHeight = initialHeight;
      let currentWaterHeight = initialHeight;
      const scrollThrottle = isLowPerfDevice ? 250 : 150;
      let scrollTimeout;
      window.addEventListener('scroll', () => {
          if (scrollTimeout) clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
              const now = Date.now();
              if (now - lastScrollTime < scrollThrottle) return;
              lastScrollTime = now;
              const scrollMax = document.body.scrollHeight - window.innerHeight;
              const scrollPercentage = scrollMax > 0 ? Math.min(1, window.scrollY / scrollMax) : 0;
              targetWaterHeight = 40 + (scrollPercentage * 45); // Adjust target range if needed
          }, 10);
      });

      // Update water height function (to be called by main loop)
      updateWaterHeight = () => { // Assign to the outer scope variable
          // Simple easing with minimal calculations
          currentWaterHeight += (targetWaterHeight - currentWaterHeight) * 0.08;

          // Only update DOM when change is significant (0.5vh)
          if (Math.abs(parseFloat(waterBody.style.height) - currentWaterHeight) > 0.5) {
              const heightValue = Math.round(currentWaterHeight * 10) / 10;
              waterBody.style.height = `${heightValue}vh`;
              waterSurface.style.bottom = `${heightValue}vh`; // SVG container follows
          }
      }

      // Bubble activation (keep existing activateBubble and getAvailableBubble)
      function getAvailableBubble() {
        for (const bubble of bubblePool) {
          if (bubble.style.display === 'none') {
            return bubble;
          }
        }
        // If no inactive bubble, reuse the oldest one (less ideal but prevents overflow)
        return bubblePool[Math.floor(Math.random() * bubblePool.length)];
      }
      function activateBubble() {
        if (document.hidden) return;
        const bubble = getAvailableBubble();
        const size = 5 + Math.floor(Math.random() * 10);
        const xPos = Math.floor(Math.random() * 100);
        const driftX = Math.floor(-20 + Math.random() * 40);
        const riseDuration = 5 + Math.floor(Math.random() * 6);
        bubble.style.cssText = `
          display: block;
          width: ${size}px;
          height: ${size}px;
          left: ${xPos}%;
          bottom: 0;
          animation: none; /* Reset animation */
        `;
        // Force reflow to restart animation
        void bubble.offsetWidth;
        bubble.style.animation = `bubble-rise ${riseDuration}s ease-out forwards`;
        bubble.style.setProperty('--drift-x', `${driftX}px`);

        // Use animationend event for cleanup if possible, fallback to timeout
        const handleAnimationEnd = () => {
            bubble.style.display = 'none';
            bubble.removeEventListener('animationend', handleAnimationEnd);
        };
        bubble.addEventListener('animationend', handleAnimationEnd);
        // Fallback timeout
        setTimeout(() => {
            if (bubble.style.display !== 'none') { // If event didn't fire
                handleAnimationEnd();
            }
        }, riseDuration * 1000 + 100); // Add buffer
      }

      // Bubble interval (keep existing logic)
      let bubbleInterval;
      function startBubbles() {
          if (bubbleInterval) clearInterval(bubbleInterval);
          bubbleInterval = setInterval(activateBubble, BUBBLE_INTERVAL);
          activateBubble(); // Create one immediately
      }
      if (!document.hidden) { startBubbles(); }
      document.addEventListener('visibilitychange', () => {
          if (!document.hidden) {
              if (!bubbleInterval) startBubbles();
          } else {
              if (bubbleInterval) { clearInterval(bubbleInterval); bubbleInterval = null; }
          }
      });

      // Click bubbles (keep existing logic)
      if (!isLowPerfDevice && !navigator.userAgent.match(/mobile|android/i)) {
          document.addEventListener('click', (e) => {
              if (e.target.closest('a, button, .button, input, select, textarea')) return;
              const bubble = getAvailableBubble();
              if (!bubble) return;
              const size = 5 + Math.floor(Math.random() * 5);
              const xPercent = Math.floor(e.clientX / window.innerWidth * 100);
              bubble.style.cssText = `
                display: block; width: ${size}px; height: ${size}px;
                left: ${xPercent}%; bottom: ${currentWaterHeight}vh;
                animation: none; /* Reset animation */
              `;
              void bubble.offsetWidth; // Reflow
              bubble.style.animation = `bubble-rise ${4}s ease-out forwards`;
              bubble.style.setProperty('--drift-x', '0px');

              const handleAnimationEnd = () => {
                  bubble.style.display = 'none';
                  bubble.removeEventListener('animationend', handleAnimationEnd);
              };
              bubble.addEventListener('animationend', handleAnimationEnd);
              setTimeout(() => { if (bubble.style.display !== 'none') handleAnimationEnd(); }, 4100);
          });
      }

      // Cleanup
      window.addEventListener('beforeunload', () => {
          if (bubbleInterval) clearInterval(bubbleInterval);
          if (scrollTimeout) clearTimeout(scrollTimeout);
      });
  }


  // --- Swimming Fish Animation (Keep existing initSwimmingFish logic) ---
  function initSwimmingFish() {
      const fishContainer = document.getElementById('fish-container');
      const waterBody = document.querySelector('.water-body');

      if (!fishContainer || !waterBody) {
        console.error('Missing elements for fish animation');
        return;
      }
      if (typeof FISH_IMAGES === 'undefined') {
        console.error('Fish images not loaded.');
        return;
      }

      const fishCount = isLowPerfDevice ? 3 : (window.navigator.hardwareConcurrency >= 8 ? 8 : 5);
      const fishImageKeys = Object.keys(FISH_IMAGES);
      const fishImages = fishImageKeys.slice(0, Math.min(fishCount * 5, fishImageKeys.length));
      let currentWaterHeightVh = parseFloat(waterBody.style.height) || 50;
      const activeFish = [];
      let fishAnimationTimers = []; // Store setTimeout IDs

      function createFish() {
          if (document.hidden || !fishContainer) return null; // Check container exists

          try {
              const fish = document.createElement('div');
              fish.className = 'swimming-fish';

              const randomIndex = Math.floor(Math.random() * fishImages.length);
              const randomFishKey = fishImages[randomIndex];
              if (!randomFishKey) return null;
              const fishImageUrl = FISH_IMAGES[randomFishKey];
              if (!fishImageUrl) return null;

              const img = document.createElement('img');
              img.crossOrigin = "anonymous";
              img.src = fishImageUrl;
              img.alt = randomFishKey;
              img.loading = 'lazy';
              img.onerror = function() {
                  console.error(`Failed to load fish image: ${randomFishKey}`);
                  img.src = "https://cdn.discordapp.com/attachments/1349726808488153168/1349728486880710666/Carp.png?ex=67d4281c&is=67d2d69c&hm=a080decf34c81199424c78c1af8ad50db2e9b6d26e76d5c5bfe27fbdeca7f48e&"; // Fallback
              };
              fish.appendChild(img);

              let size = (randomFishKey.includes("Mythic") || randomFishKey.includes("Legendary"))
                         ? 65 + Math.floor(Math.random() * 30)
                         : 40 + Math.floor(Math.random() * 25);
              fish.style.width = `${size}px`;
              fish.style.height = 'auto';

              const startX = Math.random() * 100;
              const startY = 100 - (Math.random() * (currentWaterHeightVh * 0.8)); // Position relative to bottom (vh)
              fish.style.left = `${startX}vw`;
              fish.style.bottom = `${startY}vh`; // Use vh for bottom positioning

              const direction = Math.random() > 0.5 ? 'right' : 'left';
              if (direction === 'left') fish.classList.add('flip-horizontal');

              const speedFactor = isLowPerfDevice ? 0.1 : 0.2;
              const baseSpeed = (40 - size * 0.3) * speedFactor;
              const speed = Math.max(1, Math.min(10, baseSpeed));

              fish.dataset.speed = speed;
              fish.dataset.direction = direction;
              fish.dataset.verticalDirection = Math.random() > 0.5 ? 'up' : 'down';
              fish.dataset.verticalAmount = Math.random() * 6 + 2;
              fish.dataset.originalY = startY; // Store initial Y in vh
              fish.dataset.wiggleAmount = Math.random() * 0.5 + 0.5;
              fish.dataset.wigglePhase = Math.random() * Math.PI * 2;

              fishContainer.appendChild(fish);
              activeFish.push(fish);

              // Start animation using setTimeout
              const timerId = setTimeout(() => animateFish(fish), 50 + Math.random() * 100); // Initial random delay
              fishAnimationTimers.push(timerId);
              fish.dataset.timerId = timerId; // Store timer ID on the fish

              return fish;
          } catch (err) {
              console.error("Error creating fish:", err);
              return null;
          }
      }

      function animateFish(fish) {
          if (document.hidden || !fish.isConnected) {
               // Clear timer if fish is removed or tab hidden
               const timerId = parseInt(fish.dataset.timerId);
               if (!isNaN(timerId)) {
                   clearTimeout(timerId);
                   fishAnimationTimers = fishAnimationTimers.filter(id => id !== timerId);
               }
               return;
          }

          const fishXPercent = parseFloat(fish.style.left); // vw
          const fishBottomVh = parseFloat(fish.style.bottom); // vh

          let direction = fish.dataset.direction;
          const speed = parseFloat(fish.dataset.speed);
          let verticalDirection = fish.dataset.verticalDirection;
          const verticalAmount = parseFloat(fish.dataset.verticalAmount);
          const originalY = parseFloat(fish.dataset.originalY); // vh
          const wiggleAmount = parseFloat(fish.dataset.wiggleAmount || 0.5);
          let wigglePhase = parseFloat(fish.dataset.wigglePhase || 0);

          // Change direction at edges or randomly
          if (direction === 'right' && fishXPercent > 95) direction = 'left';
          else if (direction === 'left' && fishXPercent < 0) direction = 'right';
          else if (Math.random() < 0.001) direction = direction === 'right' ? 'left' : 'right';

          if (direction === 'left') fish.classList.add('flip-horizontal');
          else fish.classList.remove('flip-horizontal');

          // Change vertical direction
          if (verticalDirection === 'up' && (fishBottomVh > (originalY + verticalAmount))) verticalDirection = 'down';
          else if (verticalDirection === 'down' && (fishBottomVh < (originalY - verticalAmount))) verticalDirection = 'up';
          else if (Math.random() < 0.005) verticalDirection = verticalDirection === 'up' ? 'down' : 'up';

          wigglePhase += 0.05;
          fish.dataset.wigglePhase = wigglePhase;
          const wiggle = Math.sin(wigglePhase) * wiggleAmount;

          const swimSpeed = speed * (0.7 + Math.random() * 0.3) * 0.02; // vw per frame interval
          const newX = direction === 'right' ? fishXPercent + swimSpeed : fishXPercent - swimSpeed;

          const verticalSpeed = swimSpeed * 0.3; // vh per frame interval
          const verticalOffset = verticalDirection === 'up' ? verticalSpeed : -verticalSpeed;
          const newBottom = Math.max(0, Math.min(currentWaterHeightVh - 5, fishBottomVh + verticalOffset + wiggle * 0.01)); // Keep within water bounds (vh)

          fish.style.left = `${newX}vw`;
          fish.style.bottom = `${newBottom}vh`; // Update bottom in vh

          fish.dataset.direction = direction;
          fish.dataset.verticalDirection = verticalDirection;

          const animationDelay = isLowPerfDevice ? 250 : 100;
          const timerId = setTimeout(() => animateFish(fish), animationDelay);
          fishAnimationTimers.push(timerId);
          fish.dataset.timerId = timerId; // Update timer ID
      }

      // Adjust fish when water level changes
      const adjustFishToWaterInterval = setInterval(() => {
          if (!waterBody || document.hidden) return;
          const waterHeight = parseFloat(waterBody.style.height) || 50;
          if (Math.abs(waterHeight - currentWaterHeightVh) > 1) { // Update if changed
              currentWaterHeightVh = waterHeight;
              activeFish.forEach(fish => {
                  if (!fish.isConnected) return;
                  const bottomVh = parseFloat(fish.style.bottom);
                  // If fish is too high (out of water), reset its base Y
                  if (bottomVh > currentWaterHeightVh - 2) { // Check against current water height
                      const newY = currentWaterHeightVh * (0.1 + Math.random() * 0.7); // New Y within water
                      fish.style.bottom = `${newY}vh`;
                      fish.dataset.originalY = newY;
                  }
              });
          }
      }, 2000);

      // Periodically replace fish
      const fishRefreshInterval = setInterval(() => {
          if (document.hidden || activeFish.length === 0 || Math.random() > 0.2) return;

          const index = Math.floor(Math.random() * activeFish.length);
          const fishToRemove = activeFish[index];

          if (fishToRemove?.isConnected) {
              fishToRemove.style.opacity = '0';
              fishToRemove.style.transition = 'opacity 2s ease-out';

              // Clear its animation timer
              const timerId = parseInt(fishToRemove.dataset.timerId);
              if (!isNaN(timerId)) {
                  clearTimeout(timerId);
                  fishAnimationTimers = fishAnimationTimers.filter(id => id !== timerId);
              }

              setTimeout(() => {
                  if (fishToRemove.isConnected) fishToRemove.remove();
                  const arrayIndex = activeFish.indexOf(fishToRemove);
                  if (arrayIndex > -1) activeFish.splice(arrayIndex, 1);
                  if (!document.hidden) createFish(); // Add a new one
              }, 2000);
          } else {
               // Clean up array if fish was already removed somehow
               const arrayIndex = activeFish.indexOf(fishToRemove);
               if (arrayIndex > -1) activeFish.splice(arrayIndex, 1);
          }
      }, isLowPerfDevice ? 30000 : 20000);

      // Initial fish creation
      for (let i = 0; i < fishCount; i++) {
          setTimeout(() => createFish(), i * 300);
      }

      // Cleanup
      window.addEventListener('beforeunload', () => {
          clearInterval(adjustFishToWaterInterval);
          clearInterval(fishRefreshInterval);
          fishAnimationTimers.forEach(clearTimeout); // Clear all animation timers
          fishAnimationTimers = [];
          activeFish.length = 0;
      });
  }


  // --- Mouse Trail Effect (Keep existing logic) ---
  function initMouseTrail() {
      const trail = document.getElementById('mouse-trail');
      if (!trail) return () => {}; // Return dummy function if no trail
      trail.textContent = '';
      let mouseX = 0, mouseY = 0, trailX = 0, trailY = 0;
      document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

      function animateTrail() {
          if (!trail) return; // Check if trail exists
          trailX += (mouseX - trailX) * 0.3;
          trailY += (mouseY - trailY) * 0.3;
          // Check if trailX/Y are valid numbers before setting style
          if (!isNaN(trailX) && !isNaN(trailY)) {
              trail.style.left = `${trailX}px`;
              trail.style.top = `${trailY}px`;
          }
          // trail.style.opacity = '0.8'; // Opacity handled by hover/fade
          if (Math.random() > 0.85) createTrailDroplet(trailX, trailY);
      }

       let isMoving = false;
       let fadeTimeout;
       document.addEventListener('mousemove', () => {
           isMoving = true;
           if (trail) trail.style.opacity = '0.8';
           clearTimeout(fadeTimeout);
           fadeTimeout = setTimeout(() => {
               isMoving = false;
               if (trail) trail.style.opacity = '0';
           }, 150);
       });
       document.addEventListener('mousedown', (e) => {
           if (trail) {
               trail.style.transform = 'translate(-50%, -50%) scale(0.6) rotate(45deg)';
               createWaterSplash(e.clientX, e.clientY);
           }
       });
       document.addEventListener('mouseup', () => {
           if (trail) {
               trail.style.transform = 'translate(-50%, -50%) scale(1.1) rotate(45deg)';
               setTimeout(() => {
                   trail.style.transform = 'translate(-50%, -50%) scale(1) rotate(45deg)';
               }, 150);
           }
       });
       function createTrailDroplet(x, y) {
          if (isNaN(x) || isNaN(y)) return; // Prevent creating if position is invalid
          const droplet = document.createElement('div');
          droplet.className = 'trail-droplet';
          droplet.style.left = `${x + (Math.random() * 10 - 5)}px`;
          droplet.style.top = `${y + (Math.random() * 10 - 5)}px`;
          droplet.style.width = `${4 + Math.random() * 6}px`;
          droplet.style.height = droplet.style.width;
          document.body.appendChild(droplet);
          setTimeout(() => { if (droplet?.parentNode) droplet.parentNode.removeChild(droplet); }, 800);
       }
       function createWaterSplash(x, y) {
          const splash = document.createElement('div');
          splash.className = 'water-splash';
          splash.style.left = `${x}px`; splash.style.top = `${y}px`;
          document.body.appendChild(splash);
          const dropletCount = 12;
          for (let i = 0; i < dropletCount; i++) {
              const droplet = document.createElement('div');
              droplet.className = 'splash-droplet';
              const size = 5 + Math.random() * 10;
              droplet.style.width = `${size}px`; droplet.style.height = `${size}px`;
              const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() * 0.5);
              const distance = 20 + Math.random() * 40;
              const splashX = Math.cos(angle) * distance;
              const splashY = Math.sin(angle) * distance;
              droplet.style.setProperty('--splash-x', `${splashX}px`);
              droplet.style.setProperty('--splash-y', `${splashY}px`);
              splash.appendChild(droplet);
          }
          setTimeout(() => { if (splash?.parentNode) splash.parentNode.removeChild(splash); }, 600);
       }
       // Initial position
       document.dispatchEvent(new MouseEvent('mousemove', { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 }));

       // Return the animateTrail function to be called by the main loop
       return animateTrail;
  }


  // --- Other Initializations (Keep existing) ---
  // Button Ripple Effect
  const buttons = document.querySelectorAll('.button');
  buttons.forEach(button => {
      button.addEventListener('mousedown', function (e) {
          const rect = button.getBoundingClientRect();
          const x = e.clientX - rect.left; const y = e.clientY - rect.top;
          const existingRipple = button.querySelector('.ripple');
          if (existingRipple) existingRipple.remove();
          const ripple = document.createElement('span');
          ripple.classList.add('ripple');
          ripple.style.left = `${x}px`; ripple.style.top = `${y}px`;
          this.appendChild(ripple);
          ripple.addEventListener('animationend', () => ripple.remove());
      });
  });

  // Fade-in Sections on Scroll
  const animatedSections = document.querySelectorAll('.animated-section');
  const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
  const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              obs.unobserve(entry.target);
          }
      });
  }, observerOptions);
  animatedSections.forEach(section => observer.observe(section));

  // Smooth Scrolling for Nav Links
  document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          const href = this.getAttribute('href');
          if (href.startsWith('#') && href.length > 1) {
              e.preventDefault();
              const targetElement = document.querySelector(href);
              if (targetElement) {
                  const headerOffset = document.querySelector('header')?.offsetHeight || 80;
                  const elementPosition = targetElement.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                  window.scrollTo({ top: offsetPosition, behavior: "smooth" });
              }
          }
      });
  });

  // Invite/Support Links
  const discordInviteLink = "https://discord.com/oauth2/authorize?client_id=1354018504470298624";
  const discordSupportLink = "https://discord.gg/6TxYjeQcXg";
  document.querySelectorAll('.invite-button').forEach(button => {
      if (button.getAttribute('href') === '#' || !button.getAttribute('href')) {
          button.href = discordInviteLink; button.target = "_blank"; button.rel = "noopener noreferrer";
      }
  });
  document.querySelectorAll('.support-button').forEach(button => {
      if (button.getAttribute('href') === '#' || !button.getAttribute('href')) {
          button.href = discordSupportLink; button.target = "_blank"; button.rel = "noopener noreferrer";
      }
  });

  // Legal Section Expandable Content
  const expandButtons = document.querySelectorAll('.expand-btn');
  expandButtons.forEach(button => {
      button.addEventListener('click', function() {
          const expandedContent = this.nextElementSibling;
          if (expandedContent.style.display === 'block') {
              expandedContent.style.display = 'none';
              this.textContent = this.textContent.replace('Hide', 'View').replace('-', '+');
          } else {
              expandedContent.style.display = 'block';
              this.textContent = this.textContent.replace('View', 'Hide').replace('+', '-');
          }
      });
  });


  // --- Main Animation Loop ---
  let timeUpdateCounter = 0;
  const TIME_UPDATE_INTERVAL = 60; // Update time/sun/moon roughly every second (60 frames @ ~30fps = 2 seconds)

  // Get the trail animation function
  const animateTrailFn = initMouseTrail(); // Initialize mouse trail and get its animation function

  function mainLoop(timestamp) {
      // Request next frame immediately
      animationFrameId = requestAnimationFrame(mainLoop);

      // Calculate elapsed time since last frame
      if (!lastTimestamp) lastTimestamp = timestamp;
      const elapsed = timestamp - lastTimestamp;

      // Run updates only if tab is visible and enough time has passed
      if (!document.hidden && elapsed >= FRAME_DURATION) {
          lastTimestamp = timestamp - (elapsed % FRAME_DURATION); // Adjust lastTimestamp to sync with frame rate

          // Update water height (already throttled by scroll)
          updateWaterHeight(); // Function defined within initWaterBackground scope

          // Update dynamic waves
          if (!prefersReducedMotion) {
              updateWaves();
          }

          // Update mouse trail position
          if (animateTrailFn) {
              animateTrailFn();
          }

          // Update time/sky less frequently
          timeUpdateCounter++;
          if (timeUpdateCounter >= TIME_UPDATE_INTERVAL) {
              timeUpdateCounter = 0;
              updateSkyAndTime();
          }
      } else if (document.hidden) {
           // If tab is hidden, reset lastTimestamp so elapsed calculation is correct on resume
           lastTimestamp = 0;
           timeUpdateCounter = 0; // Reset counter too
      }
  }

  // --- Start Everything ---
  initSky();
  initWaterBackground(); // Initializes bubbles and water height logic
  initDynamicWaves();
  setTimeout(initSwimmingFish, 1000); // Delay fish slightly

  // Start the main animation loop
  if (animationFrameId) cancelAnimationFrame(animationFrameId); // Clear previous loop if any
  lastTimestamp = 0; // Reset timestamp before starting
  animationFrameId = requestAnimationFrame(mainLoop);

  // Handle visibility changes for the main loop (redundant with check inside loop, but safe)
  document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
          // Reset timestamp to avoid large jump when resuming
          lastTimestamp = 0;
          timeUpdateCounter = 0;
          // Loop will restart automatically due to requestAnimationFrame
      } else {
           // No need to explicitly cancel, loop checks document.hidden
      }
  });

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      // Other cleanup logic (intervals, etc.) should be in their respective init functions
  });


}); // End DOMContentLoaded