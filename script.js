// Global variable to hold the canvas instance
// let waterCanvasInstance = null; // REMOVED - No longer using canvas effects

document.addEventListener('DOMContentLoaded', () => {
    // REMOVED: Canvas detection and related logic
    // REMOVED: isLowPerfDevice and prefersReducedMotion checks related to canvas/animations
    // REMOVED: Class additions like 'using-canvas', 'canvas-failed', 'reduced-motion'

    // Function to generate a random integer between min and max (inclusive)
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }    // Theme-appropriate background gradients that perfectly match the site's design system
    const themeBackgrounds = [
        // Primary gradient variations - using exact site colors
        'linear-gradient(135deg, #f0faff 0%, #89f7fe 35%, #66a6ff 100%)',
        'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 25%, #89f7fe 85%, #66a6ff 100%)',
        'radial-gradient(ellipse at top, rgba(137, 247, 254, 0.7) 0%, #f0faff 40%, #c2e9fb 100%)',
        
        // Accent gradient variations - softer, more subtle
        'linear-gradient(180deg, #f0faff 0%, rgba(161, 196, 253, 0.4) 30%, rgba(194, 233, 251, 0.6) 70%, #f0faff 100%)',
        'linear-gradient(45deg, #f0faff 0%, rgba(255, 221, 225, 0.3) 25%, rgba(194, 233, 251, 0.5) 75%, #f0faff 100%)',
        
        // Sophisticated blends matching the site's modern aesthetic
        'linear-gradient(135deg, rgba(240, 250, 255, 0.95) 0%, rgba(137, 247, 254, 0.4) 40%, rgba(102, 166, 255, 0.3) 80%, rgba(240, 250, 255, 0.95) 100%)',
        'radial-gradient(circle at 30% 70%, rgba(161, 196, 253, 0.3) 0%, rgba(240, 250, 255, 0.9) 35%, rgba(194, 233, 251, 0.4) 70%, #f0faff 100%)',
        
        // Gentle water-inspired themes
        'linear-gradient(160deg, rgba(194, 233, 251, 0.5) 0%, #f0faff 30%, rgba(161, 196, 253, 0.3) 70%, #f0faff 100%)',
        'linear-gradient(45deg, #f0faff 0%, rgba(137, 247, 254, 0.2) 20%, rgba(161, 196, 253, 0.3) 50%, rgba(194, 233, 251, 0.2) 80%, #f0faff 100%)',
        
        // Subtle atmospheric variations
        'radial-gradient(ellipse at bottom, rgba(102, 166, 255, 0.2) 0%, rgba(137, 247, 254, 0.3) 25%, #f0faff 60%, rgba(194, 233, 251, 0.4) 100%)',
        'linear-gradient(125deg, #f0faff 0%, rgba(255, 221, 225, 0.2) 15%, rgba(194, 233, 251, 0.6) 40%, rgba(161, 196, 253, 0.3) 70%, #f0faff 100%)'
    ];

    // Function to set a theme-appropriate background
    function setThemeBackground() {
        const selectedBackground = themeBackgrounds[getRandomInt(0, themeBackgrounds.length - 1)];
        document.body.style.background = selectedBackground;
        document.body.style.backgroundAttachment = 'fixed';
        
        // Add subtle water-like effects overlay
        createWaterOverlay();
    }    // Create a subtle water-like overlay effect
    function createWaterOverlay() {
        // Remove existing overlay if present
        const existingOverlay = document.getElementById('water-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const overlay = document.createElement('div');
        overlay.id = 'water-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -5;
            background: 
                radial-gradient(circle at 20% 80%, rgba(137, 247, 254, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(102, 166, 255, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(161, 196, 253, 0.06) 0%, transparent 50%),
                radial-gradient(circle at 60% 70%, rgba(194, 233, 251, 0.05) 0%, transparent 40%);
            animation: waterShimmer 12s ease-in-out infinite alternate;
        `;
        
        document.body.appendChild(overlay);
        
        // Add CSS animation for the water shimmer effect
        if (!document.getElementById('water-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'water-animation-styles';
            style.textContent = `
                @keyframes waterShimmer {
                    0% { opacity: 0.2; transform: translateY(0px) scale(1); }
                    100% { opacity: 0.4; transform: translateY(-8px) scale(1.01); }
                }
                
                @keyframes gentleFloat {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-3px) rotate(0.5deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }// Apply the theme-appropriate background
    setThemeBackground();

    // Add subtle floating bubbles for extra water atmosphere
    function createFloatingBubbles() {
        const bubbleContainer = document.createElement('div');
        bubbleContainer.id = 'floating-bubbles';
        bubbleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -3;
            overflow: hidden;
        `;
        
        // Create 8 subtle bubbles
        for (let i = 0; i < 8; i++) {
            const bubble = document.createElement('div');
            const size = getRandomInt(20, 60);
            const delay = getRandomInt(0, 8);
            const duration = getRandomInt(15, 25);
            const startPos = getRandomInt(0, 100);
            
            bubble.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(137, 247, 254, 0.1) 50%, transparent 100%);
                border-radius: 50%;
                bottom: -100px;
                left: ${startPos}%;
                animation: bubbleFloat ${duration}s linear infinite;
                animation-delay: ${delay}s;
                opacity: 0.6;
            `;
            
            bubbleContainer.appendChild(bubble);
        }
        
        document.body.appendChild(bubbleContainer);
        
        // Add bubble animation CSS
        if (!document.getElementById('bubble-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'bubble-animation-styles';
            style.textContent = `
                @keyframes bubbleFloat {
                    0% {
                        transform: translateY(0) translateX(0) scale(0.8);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.6;
                    }
                    90% {
                        opacity: 0.4;
                    }
                    100% {
                        transform: translateY(-100vh) translateX(${getRandomInt(-50, 50)}px) scale(1.2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Add floating bubbles with a small delay
    setTimeout(createFloatingBubbles, 1000);

    // Preserve UI Toggle Logic if still needed and not tied to removed elements
    const uiToggleContainer = document.getElementById('ui-toggle-container');
    const hideUiButton = document.getElementById('hide-ui-button');
    const showUiButton = document.getElementById('show-ui-button');

    if (hideUiButton && showUiButton && uiToggleContainer) {
        hideUiButton.addEventListener('click', () => {
            document.body.classList.add('ui-hidden');
            // Potentially hide other UI elements if necessary
            // Example: document.querySelector('header').style.display = 'none';
            // Example: document.querySelector('footer').style.display = 'none';
            showUiButton.style.display = 'block';
            hideUiButton.style.display = 'none';
            uiToggleContainer.classList.add('only-show-button');
        });

        showUiButton.addEventListener('click', () => {
            document.body.classList.remove('ui-hidden');
            // Potentially show other UI elements
            // Example: document.querySelector('header').style.display = '';
            // Example: document.querySelector('footer').style.display = '';
            hideUiButton.style.display = 'block';
            showUiButton.style.display = 'none';
            uiToggleContainer.classList.remove('only-show-button');
        });
    }


    // --- START: Try Me Fishing Simulator Logic ---
    // This logic seems independent of the background animations, so it can be kept if desired.
    // Ensure it doesn't rely on any removed global variables or functions.
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

}); // End DOMContentLoaded listener