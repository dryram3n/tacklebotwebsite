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
  const FRAME_DURATION = 1000 / 30; // Target ~30fps (milliseconds)
  let isLoopRunning = false; // Track if the main loop is active

  // --- Sky, Sun, Moon ---
  const skyContainer = document.getElementById('sky-container');
  const sunElement = document.getElementById('sun');
  const moonElement = document.getElementById('moon');
  const cloudsContainer = document.getElementById('clouds-container');
  const NUM_CLOUDS = isLowPerfDevice ? 3 : 7;
  let skyUpdateInterval = null; // Interval ID for sky updates

  function initSky() {
      if (!skyContainer || !sunElement || !moonElement || !cloudsContainer) return;

      // Create initial clouds
      if (!prefersReducedMotion) {
          for (let i = 0; i < NUM_CLOUDS; i++) {
              createCloud(true); // Create initial clouds instantly
          }
          // Periodically add/remove clouds (Keep this interval, less frequent than animation)
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

      // OPTIMIZATION: Update sky less frequently using setInterval
      skyUpdateInterval = setInterval(() => {
          if (!document.hidden) {
              updateSkyAndTime();
          }
      }, 5000); // Update sky every 5 seconds
  }

  function createCloud(instant = false) {
      if (!cloudsContainer) return;

      const cloud = document.createElement('div');
      const type = Math.floor(Math.random() * 3) + 1; // type-1, type-2, type-3
      cloud.className = `cloud type-${type}`;

      const sizeMultiplier = 0.7 + Math.random() * 0.6;
      cloud.style.setProperty('--cloud-scale', sizeMultiplier);

      cloud.style.top = `${5 + Math.random() * 50}%`;

      const duration = 40 + Math.random() * 50;
      cloud.style.animationDuration = `${duration}s`;
      cloud.style.setProperty('--drift-speed', `${duration}s`);

      if (instant) {
           cloud.style.animationDelay = `-${Math.random() * duration}s`;
           cloud.style.opacity = `${0.5 + Math.random() * 0.3}`;
      } else {
          cloud.style.left = '-200px';
          cloud.style.opacity = '0';
          setTimeout(() => { cloud.style.opacity = `${0.5 + Math.random() * 0.3}`; }, 100);
      }

      cloud.addEventListener('animationend', () => {
          cloud.remove();
      });

      cloudsContainer.appendChild(cloud);
  }

  function updateSkyAndTime() {
      if (!skyContainer || !sunElement || !moonElement) return;

      const now = new Date();
      let currentHour, currentMinute;

      try {
          const nyTimeStr = now.toLocaleString("en-US", {
              timeZone: "America/New_York", hour12: false, hour: 'numeric', minute: 'numeric'
          });
          [currentHour, currentMinute] = nyTimeStr.split(':').map(Number);
      } catch (e) {
          console.warn("Could not get New York time, using local time.", e);
          currentHour = now.getHours(); currentMinute = now.getMinutes();
      }

      const timeInMinutes = currentHour * 60 + currentMinute;
      const sunriseStart = 5 * 60, sunriseEnd = 7 * 60;
      const sunsetStart = 18 * 60, sunsetEnd = 20 * 60;
      const dayDuration = sunsetStart - sunriseEnd;
      const nightDuration = (24 * 60 - sunsetEnd) + sunriseStart;

      let skyGradient = 'var(--sky-day)';
      let sunOpacity = 0, moonOpacity = 0;
      let sunX = 50, sunY = 90, moonX = 50, moonY = 90;

      // --- Calculations (Keep as is, they are not the main bottleneck) ---
      if (timeInMinutes >= sunriseStart && timeInMinutes < sunriseEnd) {
          const progress = (timeInMinutes - sunriseStart) / (sunriseEnd - sunriseStart);
          skyGradient = `linear-gradient(to bottom, ${interpolateColor('#000030', '#87CEEB', progress)} 10%, ${interpolateColor('#191970', '#ADD8E6', progress)} 50%, ${interpolateColor('#2c3e50', '#B0E0E6', progress)} 100%)`;
          sunOpacity = progress; moonOpacity = 1 - progress;
          sunX = progress * 50; sunY = 85 - Math.sin(progress * Math.PI) * 60;
          moonX = 50 + (1 - progress) * 50; moonY = 85 - Math.sin((1 - progress) * Math.PI) * 60;
      } else if (timeInMinutes >= sunriseEnd && timeInMinutes < sunsetStart) {
          const progress = (timeInMinutes - sunriseEnd) / dayDuration;
          skyGradient = 'var(--sky-day)'; sunOpacity = 1; moonOpacity = 0;
          sunX = progress * 100; sunY = 25 + Math.sin(progress * Math.PI) * 60;
          moonY = 95;
      } else if (timeInMinutes >= sunsetStart && timeInMinutes < sunsetEnd) {
          const progress = (timeInMinutes - sunsetStart) / (sunsetEnd - sunsetStart);
          skyGradient = `linear-gradient(to bottom, ${interpolateColor('#87CEEB', '#FFB6C1', progress)} 0%, ${interpolateColor('#ADD8E6', '#FFA07A', progress)} 40%, ${interpolateColor('#B0E0E6', '#4682B4', progress)} 100%)`;
          sunOpacity = 1 - progress; moonOpacity = progress;
          sunX = 50 + (1 - progress) * 50; sunY = 85 - Math.sin((1 - progress) * Math.PI) * 60;
          moonX = progress * 50; moonY = 85 - Math.sin(progress * Math.PI) * 60;
      } else {
          let progress = (timeInMinutes < sunriseStart ? (timeInMinutes + (24*60 - sunsetEnd)) : (timeInMinutes - sunsetEnd)) / nightDuration;
          skyGradient = 'var(--sky-night)'; sunOpacity = 0; moonOpacity = 1;
          moonX = progress * 100; moonY = 25 + Math.sin(progress * Math.PI) * 60;
          sunY = 95;
      }

      // --- Apply Styles ---
      skyContainer.style.background = skyGradient;

      if (!prefersReducedMotion) {
          sunElement.style.transform = `translate(${sunX - 50}vw, ${sunY - 50}vh) translate(-50%, -50%)`;
          moonElement.style.transform = `translate(${moonX - 50}vw, ${moonY - 50}vh) translate(-50%, -50%)`;
      }
      sunElement.style.opacity = sunOpacity.toFixed(2);
      moonElement.style.opacity = moonOpacity.toFixed(2);
  }

  // Helper functions (interpolateColor, hexToRgb) remain the same

  function interpolateColor(color1, color2, factor) {
      factor = Math.max(0, Math.min(1, factor));
      const c1 = hexToRgb(color1);
      const c2 = hexToRgb(color2);
      if (!c1 || !c2) return 'rgb(0,0,0)'; // Safety check
      const r = Math.round(c1.r + factor * (c2.r - c1.r));
      const g = Math.round(c1.g + factor * (c2.g - c1.g));
      const b = Math.round(c1.b + factor * (c2.b - c1.b));
      return `rgb(${r}, ${g}, ${b})`;
  }

  function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
          r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16)
      } : null; // Return null on failure
  }


  // --- Dynamic Waves ---
  const waveSvg = document.getElementById('wave-svg');
  const wavePath1 = document.getElementById('wave-path-1');
  const wavePath2 = document.getElementById('wave-path-2');
  const waveWidth = 1440, waveHeight = 60;
  let waveTime = 0;
  let targetAmplitude = 5, currentAmplitude = 5;
  let targetFrequency = 0.005, currentFrequency = 0.005;
  let targetSpeed = 0.02, currentSpeed = 0.02;
  let waveStateInterval = null;

  function initDynamicWaves() {
      if (!waveSvg || !wavePath1 || !wavePath2) return;

      // Periodically change wave state
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
      }, 10000);
  }

  function updateWaves(elapsed) { // Pass elapsed time
      if (!wavePath1 || !wavePath2) return; // Check elements exist

      // Use elapsed time for smoother speed transition, adjusted factor for desired speed
      const timeFactor = elapsed / FRAME_DURATION; // Normalize based on target frame duration
      waveTime += currentSpeed * timeFactor;

      currentAmplitude += (targetAmplitude - currentAmplitude) * 0.05 * timeFactor;
      currentFrequency += (targetFrequency - currentFrequency) * 0.05 * timeFactor;
      currentSpeed += (targetSpeed - currentSpeed) * 0.05 * timeFactor;

      const points1 = [], points2 = [];
      const segments = 20;

      for (let i = 0; i <= segments; i++) {
          const x = (waveWidth / segments) * i;
          const y1 = waveHeight / 2 + Math.sin(x * currentFrequency + waveTime) * currentAmplitude;
          points1.push(`${x},${y1.toFixed(2)}`);
          const y2 = waveHeight / 2 + Math.sin(x * currentFrequency * 1.2 + waveTime * 0.8 + 1) * currentAmplitude * 0.7;
          points2.push(`${x},${y2.toFixed(2)}`);
      }

      const pathData1 = `M0,${waveHeight} L0,${waveHeight / 2} ${points1.map((p, i) => i === 0 ? `L${p}` : `L${p}`).join(' ')} L${waveWidth},${waveHeight} Z`;
      const pathData2 = `M0,${waveHeight} L0,${waveHeight / 2} ${points2.map((p, i) => i === 0 ? `L${p}` : `L${p}`).join(' ')} L${waveWidth},${waveHeight} Z`;

      // Apply path data directly (already inside RAF)
      wavePath1.setAttribute('d', pathData1);
      wavePath2.setAttribute('d', pathData2);
  }


  // --- Water Background ---
  let updateWaterHeight = () => {}; // Placeholder
  const waterBody = document.querySelector('.water-body');
  const waterSurface = document.querySelector('.water-surface');
  const bubblesContainer = document.getElementById('bubbles-container');
  let bubbleInterval = null;
  let scrollTimeout = null;

  function initWaterBackground() {
      if (!waterBody || !waterSurface || !bubblesContainer) return;

      const initialHeight = 50;
      waterBody.style.height = `${initialHeight}vh`;
      waterSurface.style.bottom = `${initialHeight}vh`;

      // Bubble pool (Keep existing logic)
      const bubblePool = [];
      const POOL_SIZE = isLowPerfDevice ? 5 : 10;
      const BUBBLE_INTERVAL = isLowPerfDevice ? 1200 : 600;
      for (let i = 0; i < POOL_SIZE; i++) { /* ... pool creation ... */ }
      // --- Bubble pool creation (same as before) ---
      for (let i = 0; i < POOL_SIZE; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.style.display = 'none';
        bubblesContainer.appendChild(bubble);
        bubblePool.push(bubble);
      }
      // --- End Bubble pool creation ---


      let lastScrollTime = 0;
      let targetWaterHeight = initialHeight;
      let currentWaterHeight = initialHeight;
      const scrollThrottle = isLowPerfDevice ? 250 : 150;

      window.addEventListener('scroll', () => {
          if (scrollTimeout) clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
              const now = Date.now();
              if (now - lastScrollTime < scrollThrottle) return;
              lastScrollTime = now;
              const scrollMax = document.body.scrollHeight - window.innerHeight;
              const scrollPercentage = scrollMax > 0 ? Math.min(1, window.scrollY / scrollMax) : 0;
              targetWaterHeight = 40 + (scrollPercentage * 45);
          }, 10);
      });

      updateWaterHeight = (elapsed) => { // Pass elapsed time
          if (!waterBody || !waterSurface) return; // Check elements exist
          const timeFactor = elapsed / FRAME_DURATION; // Normalize easing
          currentWaterHeight += (targetWaterHeight - currentWaterHeight) * 0.08 * timeFactor;

          // Only update DOM when change is significant (0.5vh)
          // Use Math.round to avoid floating point issues in comparison
          const currentStyleHeight = Math.round(parseFloat(waterBody.style.height) * 10) / 10;
          const newRoundedHeight = Math.round(currentWaterHeight * 10) / 10;

          if (Math.abs(currentStyleHeight - newRoundedHeight) > 0.1) { // Reduced threshold slightly
              const heightValue = newRoundedHeight.toFixed(1);
              waterBody.style.height = `${heightValue}vh`;
              waterSurface.style.bottom = `${heightValue}vh`;
          }
      }

      // Bubble activation (Keep existing logic, including getAvailableBubble, activateBubble)
      // --- Bubble activation functions (same as before) ---
      function getAvailableBubble() {
        for (const bubble of bubblePool) {
          if (bubble.style.display === 'none') return bubble;
        }
        return bubblePool[Math.floor(Math.random() * bubblePool.length)];
      }
      function activateBubble() {
        if (document.hidden || !bubblesContainer) return;
        const bubble = getAvailableBubble();
        if (!bubble) return; // Safety check
        const size = 5 + Math.floor(Math.random() * 10);
        const xPos = Math.floor(Math.random() * 100);
        const driftX = Math.floor(-20 + Math.random() * 40);
        const riseDuration = 5 + Math.floor(Math.random() * 6);
        bubble.style.cssText = `display: block; width: ${size}px; height: ${size}px; left: ${xPos}%; bottom: 0; animation: none;`;
        void bubble.offsetWidth;
        bubble.style.animation = `bubble-rise ${riseDuration}s ease-out forwards`;
        bubble.style.setProperty('--drift-x', `${driftX}px`);
        const handleAnimationEnd = () => {
            bubble.style.display = 'none';
            bubble.removeEventListener('animationend', handleAnimationEnd);
        };
        bubble.addEventListener('animationend', handleAnimationEnd);
        setTimeout(() => { if (bubble.style.display !== 'none') handleAnimationEnd(); }, riseDuration * 1000 + 100);
      }
      // --- End Bubble activation functions ---

      function startBubbles() {
          if (bubbleInterval) clearInterval(bubbleInterval);
          bubbleInterval = setInterval(activateBubble, BUBBLE_INTERVAL);
          activateBubble();
      }
      if (!document.hidden) { startBubbles(); }
      document.addEventListener('visibilitychange', () => {
          if (!document.hidden) {
              if (!bubbleInterval) startBubbles();
          } else {
              if (bubbleInterval) { clearInterval(bubbleInterval); bubbleInterval = null; }
          }
      });

      // Click bubbles (Keep existing logic)
      // --- Click bubbles (same as before) ---
      if (!isLowPerfDevice && !navigator.userAgent.match(/mobile|android/i)) {
          document.addEventListener('click', (e) => {
              if (e.target.closest('a, button, .button, input, select, textarea')) return;
              const bubble = getAvailableBubble();
              if (!bubble) return;
              const size = 5 + Math.floor(Math.random() * 5);
              const xPercent = Math.floor(e.clientX / window.innerWidth * 100);
              bubble.style.cssText = `display: block; width: ${size}px; height: ${size}px; left: ${xPercent}%; bottom: ${currentWaterHeight}vh; animation: none;`;
              void bubble.offsetWidth;
              bubble.style.animation = `bubble-rise ${4}s ease-out forwards`;
              bubble.style.setProperty('--drift-x', '0px');
              const handleAnimationEnd = () => { bubble.style.display = 'none'; bubble.removeEventListener('animationend', handleAnimationEnd); };
              bubble.addEventListener('animationend', handleAnimationEnd);
              setTimeout(() => { if (bubble.style.display !== 'none') handleAnimationEnd(); }, 4100);
          });
      }
      // --- End Click bubbles ---

      // Cleanup handled globally now
  }


  // --- Swimming Fish Animation ---
  const fishContainer = document.getElementById('fish-container');
  let fishImageKeys = [];
  let fishImages = [];
  let currentWaterHeightVh = 50; // Initial estimate
  const activeFish = [];
  let adjustFishToWaterInterval = null;
  let fishRefreshInterval = null;
  let fishCount = 0;

  function initSwimmingFish() {
      if (!fishContainer || !waterBody) { console.error('Missing elements for fish animation'); return; }
      if (typeof FISH_IMAGES === 'undefined') { console.error('Fish images not loaded.'); return; }

      fishCount = isLowPerfDevice ? 3 : (window.navigator.hardwareConcurrency >= 8 ? 8 : 5);
      fishImageKeys = Object.keys(FISH_IMAGES);
      fishImages = fishImageKeys.slice(0, Math.min(fishCount * 5, fishImageKeys.length));
      currentWaterHeightVh = parseFloat(waterBody.style.height) || 50;

      // Adjust fish when water level changes (Keep interval)
      adjustFishToWaterInterval = setInterval(() => {
          if (!waterBody || document.hidden) return;
          const waterHeight = parseFloat(waterBody.style.height) || 50;
          if (Math.abs(waterHeight - currentWaterHeightVh) > 1) {
              currentWaterHeightVh = waterHeight;
              activeFish.forEach(fish => {
                  if (!fish?.element?.isConnected) return;
                  const bottomVh = parseFloat(fish.element.style.bottom);
                  if (bottomVh > currentWaterHeightVh - 2) {
                      const newY = currentWaterHeightVh * (0.1 + Math.random() * 0.7);
                      fish.element.style.bottom = `${newY}vh`;
                      fish.originalY = newY; // Update the fish object's property
                      fish.currentBottomVh = newY; // Update current position too
                  }
              });
          }
      }, 2000);

      // Periodically replace fish (Keep interval)
      fishRefreshInterval = setInterval(() => {
          if (document.hidden || activeFish.length === 0 || Math.random() > 0.2) return;

          const index = Math.floor(Math.random() * activeFish.length);
          const fishToRemove = activeFish[index];

          if (fishToRemove?.element?.isConnected) {
              fishToRemove.element.style.opacity = '0';
              fishToRemove.element.style.transition = 'opacity 2s ease-out';

              setTimeout(() => {
                  if (fishToRemove.element.isConnected) fishToRemove.element.remove();
                  const arrayIndex = activeFish.indexOf(fishToRemove);
                  if (arrayIndex > -1) activeFish.splice(arrayIndex, 1);
                  if (!document.hidden && activeFish.length < fishCount) createFish(); // Add a new one if below target
              }, 2000);
          } else {
               const arrayIndex = activeFish.indexOf(fishToRemove);
               if (arrayIndex > -1) activeFish.splice(arrayIndex, 1);
               if (!document.hidden && activeFish.length < fishCount) createFish(); // Add replacement if needed
          }
      }, isLowPerfDevice ? 30000 : 20000);

      // Initial fish creation
      for (let i = 0; i < fishCount; i++) {
          setTimeout(() => createFish(), i * 300);
      }

      // Cleanup handled globally now
  }

  function createFish() {
      if (document.hidden || !fishContainer || !fishImages.length) return null;

      try {
          const fishElement = document.createElement('div');
          fishElement.className = 'swimming-fish';

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
          fishElement.appendChild(img);

          let size = (randomFishKey.includes("Mythic") || randomFishKey.includes("Legendary"))
                     ? 65 + Math.floor(Math.random() * 30)
                     : 40 + Math.floor(Math.random() * 25);
          fishElement.style.width = `${size}px`;
          fishElement.style.height = 'auto';

          const startX = Math.random() * 100; // vw
          const startY = 100 - (Math.random() * (currentWaterHeightVh * 0.8)); // vh from bottom
          fishElement.style.left = `${startX}vw`;
          fishElement.style.bottom = `${startY}vh`;

          const direction = Math.random() > 0.5 ? 'right' : 'left';
          if (direction === 'left') fishElement.classList.add('flip-horizontal');

          const speedFactor = isLowPerfDevice ? 0.5 : 1; // Adjusted speed factor (vw per second)
          const baseSpeed = (40 - size * 0.3) * 0.05 * speedFactor; // Base speed in vw/sec
          const speed = Math.max(0.5, Math.min(5, baseSpeed)); // Clamp speed

          // Store fish state in an object
          const fishData = {
              element: fishElement,
              speed: speed, // vw per second
              direction: direction,
              verticalDirection: Math.random() > 0.5 ? 'up' : 'down',
              verticalAmount: Math.random() * 6 + 2, // vh range
              originalY: startY, // vh
              wiggleAmount: Math.random() * 0.5 + 0.5,
              wigglePhase: Math.random() * Math.PI * 2,
              currentXPercent: startX, // vw
              currentBottomVh: startY // vh
          };

          fishContainer.appendChild(fishElement);
          activeFish.push(fishData);

          return fishData;
      } catch (err) {
          console.error("Error creating fish:", err);
          return null;
      }
  }

  // OPTIMIZATION: Update all fish within the main animation loop
  function updateAllFish(elapsed) {
      if (!activeFish.length) return;

      const elapsedSeconds = elapsed / 1000; // Convert ms to seconds

      activeFish.forEach(fish => {
          if (!fish.element || !fish.element.isConnected) return; // Skip removed fish

          let {
              element, speed, direction, verticalDirection, verticalAmount,
              originalY, wiggleAmount, wigglePhase, currentXPercent, currentBottomVh
          } = fish;

          // Change direction at edges or randomly
          if (direction === 'right' && currentXPercent > 98) direction = 'left';
          else if (direction === 'left' && currentXPercent < 2) direction = 'right';
          else if (Math.random() < 0.001) direction = direction === 'right' ? 'left' : 'right';

          if (direction === 'left') element.classList.add('flip-horizontal');
          else element.classList.remove('flip-horizontal');

          // Change vertical direction
          if (verticalDirection === 'up' && (currentBottomVh > (originalY + verticalAmount))) verticalDirection = 'down';
          else if (verticalDirection === 'down' && (currentBottomVh < (originalY - verticalAmount))) verticalDirection = 'up';
          else if (Math.random() < 0.005) verticalDirection = verticalDirection === 'up' ? 'down' : 'up';

          // Wiggle calculation
          wigglePhase += 5 * elapsedSeconds; // Adjust frequency based on time
          const wiggle = Math.sin(wigglePhase) * wiggleAmount;

          // Horizontal movement (vw per second * elapsed seconds)
          const horizontalMove = speed * elapsedSeconds;
          currentXPercent += (direction === 'right' ? horizontalMove : -horizontalMove);

          // Vertical movement (vh per second * elapsed seconds)
          const verticalSpeed = speed * 0.3; // Make vertical speed relative to horizontal
          const verticalMove = verticalSpeed * elapsedSeconds;
          const verticalOffset = (verticalDirection === 'up' ? verticalMove : -verticalMove);
          currentBottomVh = Math.max(0, Math.min(currentWaterHeightVh - 5, currentBottomVh + verticalOffset + wiggle * 0.1)); // Keep within water bounds (vh)

          // Apply transform for potentially smoother animation (left/bottom fallback)
          // Using left/bottom is often okay for a few elements and simpler here
          element.style.left = `${currentXPercent.toFixed(2)}vw`;
          element.style.bottom = `${currentBottomVh.toFixed(2)}vh`;

          // Update fish object state
          fish.direction = direction;
          fish.verticalDirection = verticalDirection;
          fish.wigglePhase = wigglePhase;
          fish.currentXPercent = currentXPercent;
          fish.currentBottomVh = currentBottomVh;
      });
  }


  // --- Mouse Trail Effect ---
  const trail = document.getElementById('mouse-trail');
  let mouseX = 0, mouseY = 0, trailX = 0, trailY = 0;
  let lastDropletTime = 0; // For throttling droplets
  const DROPLET_INTERVAL = 50; // ms between droplets max
  let animateTrailFn = () => {}; // Placeholder

  function initMouseTrail() {
      if (!trail) return; // No trail element

      document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

      animateTrailFn = (elapsed) => { // Pass elapsed time
          if (!trail) return;
          const timeFactor = Math.min(2, elapsed / FRAME_DURATION); // Limit easing factor on large gaps

          trailX += (mouseX - trailX) * 0.3 * timeFactor;
          trailY += (mouseY - trailY) * 0.3 * timeFactor;

          if (!isNaN(trailX) && !isNaN(trailY)) {
              trail.style.left = `${trailX.toFixed(0)}px`;
              trail.style.top = `${trailY.toFixed(0)}px`;
          }

          // Throttle droplet creation
          const now = performance.now();
          if (now - lastDropletTime > DROPLET_INTERVAL && Math.random() > 0.7) { // Added randomness
              createTrailDroplet(trailX, trailY);
              lastDropletTime = now;
          }
      };

       // Hover/fade logic (Keep existing)
       let fadeTimeout;
       document.addEventListener('mousemove', () => {
           if (trail) trail.style.opacity = '0.8';
           clearTimeout(fadeTimeout);
           fadeTimeout = setTimeout(() => { if (trail) trail.style.opacity = '0'; }, 150);
       });
       // Click/Splash logic (Keep existing, including createWaterSplash, createTrailDroplet)
       // --- Click/Splash logic (same as before) ---
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
                   if (trail) trail.style.transform = 'translate(-50%, -50%) scale(1) rotate(45deg)';
               }, 150);
           }
       });
       function createTrailDroplet(x, y) {
          if (isNaN(x) || isNaN(y) || document.hidden) return;
          const droplet = document.createElement('div');
          droplet.className = 'trail-droplet';
          droplet.style.left = `${x + (Math.random() * 10 - 5)}px`;
          droplet.style.top = `${y + (Math.random() * 10 - 5)}px`;
          const size = 4 + Math.random() * 6;
          droplet.style.width = `${size}px`;
          droplet.style.height = `${size}px`;
          document.body.appendChild(droplet);
          setTimeout(() => { if (droplet?.parentNode) droplet.parentNode.removeChild(droplet); }, 800);
       }
       function createWaterSplash(x, y) {
          if (document.hidden) return;
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
       // --- End Click/Splash logic ---

       // Initial position
       document.dispatchEvent(new MouseEvent('mousemove', { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 }));
  }


  // --- Other Initializations (Keep existing, they are mostly event listeners) ---
  function initStaticListeners() {
      // Button Ripple Effect
      document.querySelectorAll('.button').forEach(button => {
          button.addEventListener('mousedown', function (e) { /* ... ripple logic ... */ });
          // --- Ripple logic (same as before) ---
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
          // --- End Ripple logic ---
      });

      // Fade-in Sections on Scroll
      const animatedSections = document.querySelectorAll('.animated-section');
      if ('IntersectionObserver' in window) {
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
      } else { // Fallback for older browsers
          animatedSections.forEach(section => section.classList.add('visible'));
      }


      // Smooth Scrolling for Nav Links
      document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
          anchor.addEventListener('click', function (e) { /* ... smooth scroll ... */ });
          // --- Smooth scroll (same as before) ---
          anchor.addEventListener('click', function (e) {
              const href = this.getAttribute('href');
              if (href && href.startsWith('#') && href.length > 1) {
                  e.preventDefault();
                  try { // Add try-catch for querySelector
                      const targetElement = document.querySelector(href);
                      if (targetElement) {
                          const headerOffset = document.querySelector('header')?.offsetHeight || 80;
                          const elementPosition = targetElement.getBoundingClientRect().top;
                          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                      }
                  } catch (err) {
                      console.error("Error finding element for smooth scroll:", href, err);
                  }
              }
          });
          // --- End Smooth scroll ---
      });

      // Invite/Support Links
      const discordInviteLink = "https://discord.com/oauth2/authorize?client_id=1354018504470298624";
      const discordSupportLink = "https://discord.gg/6TxYjeQcXg";
      document.querySelectorAll('.invite-button').forEach(button => { /* ... link assignment ... */ });
      document.querySelectorAll('.support-button').forEach(button => { /* ... link assignment ... */ });
      // --- Link assignment (same as before) ---
       document.querySelectorAll('.invite-button').forEach(button => {
          if (button.tagName === 'A' && (button.getAttribute('href') === '#' || !button.getAttribute('href'))) {
              button.href = discordInviteLink; button.target = "_blank"; button.rel = "noopener noreferrer";
          }
      });
      document.querySelectorAll('.support-button').forEach(button => {
          if (button.tagName === 'A' && (button.getAttribute('href') === '#' || !button.getAttribute('href'))) {
              button.href = discordSupportLink; button.target = "_blank"; button.rel = "noopener noreferrer";
          }
      });
      // --- End Link assignment ---


      // Legal Section Expandable Content
      document.querySelectorAll('.expand-btn').forEach(button => {
          button.addEventListener('click', function() { /* ... expand logic ... */ });
          // --- Expand logic (same as before) ---
          button.addEventListener('click', function() {
              const expandedContent = this.nextElementSibling;
              if (!expandedContent) return;
              const isVisible = expandedContent.style.display === 'block';
              expandedContent.style.display = isVisible ? 'none' : 'block';
              this.textContent = isVisible
                  ? this.textContent.replace('Hide', 'View').replace('-', '+')
                  : this.textContent.replace('View', 'Hide').replace('+', '-');
          });
          // --- End Expand logic ---
      });
  }


  // --- Main Animation Loop ---
  function mainLoop(timestamp) {
      if (!isLoopRunning) return; // Stop if flag is false

      // Request next frame immediately
      animationFrameId = requestAnimationFrame(mainLoop);

      // Calculate elapsed time since last frame
      if (!lastTimestamp) lastTimestamp = timestamp;
      const elapsed = timestamp - lastTimestamp;

      // --- Perform updates ---
      // Only run updates if enough time has passed (throttle)
      // This helps smooth out performance on inconsistent frame rates
      if (elapsed >= FRAME_DURATION * 0.9) { // Allow slightly less than target duration
          lastTimestamp = timestamp; // Update last timestamp

          // Update water height (already throttled internally)
          updateWaterHeight(elapsed);

          // Update dynamic waves (visual, needs smoothness)
          if (!prefersReducedMotion) {
              updateWaves(elapsed);
          }

          // Update mouse trail position (visual, needs smoothness)
          animateTrailFn(elapsed);

          // Update fish positions (visual, needs smoothness)
          if (!prefersReducedMotion) {
              updateAllFish(elapsed);
          }
      }
  }

  // --- Start & Stop Logic ---
  function startAnimationLoop() {
      if (isLoopRunning) return; // Already running
      console.log("Starting animation loop");
      isLoopRunning = true;
      lastTimestamp = performance.now(); // Reset timestamp before starting
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
  }

  // --- Initialize Everything ---
  initSky();
  initWaterBackground();
  initDynamicWaves();
  initMouseTrail();
  initStaticListeners(); // Initialize non-animated event listeners
  setTimeout(initSwimmingFish, 1000); // Delay fish slightly

  // Handle visibility changes
  document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
          startAnimationLoop(); // Restart loop if tab becomes visible
      } else {
          stopAnimationLoop(); // Stop loop if tab becomes hidden
      }
  });

  // Start the main animation loop initially if not hidden
  if (!document.hidden) {
      startAnimationLoop();
  }

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
      stopAnimationLoop(); // Stop RAF loop
      // Clear intervals
      if (skyUpdateInterval) clearInterval(skyUpdateInterval);
      if (waveStateInterval) clearInterval(waveStateInterval);
      if (bubbleInterval) clearInterval(bubbleInterval);
      if (adjustFishToWaterInterval) clearInterval(adjustFishToWaterInterval);
      if (fishRefreshInterval) clearInterval(fishRefreshInterval);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      // Remove other listeners if necessary, though most are passive
      console.log("Cleaned up intervals and animation loop.");
  });

}); // End DOMContentLoaded