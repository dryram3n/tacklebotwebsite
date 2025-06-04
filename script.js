// Global variable to hold the canvas instance
// let waterCanvasInstance = null; // REMOVED - No longer using canvas effects

document.addEventListener('DOMContentLoaded', () => {
    // REMOVED: Canvas detection and related logic
    // REMOVED: isLowPerfDevice and prefersReducedMotion checks related to canvas/animations
    // REMOVED: Class additions like 'using-canvas', 'canvas-failed', 'reduced-motion'

    // Function to generate a random integer between min and max (inclusive)
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Function to generate a random hex color
    function getRandomHexColor() {
        return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    }

    // Function to set a random static gradient background
    function setRandomStaticBackground() {
        const color1 = getRandomHexColor();
        const color2 = getRandomHexColor();
        const angle = getRandomInt(0, 360);
        document.body.style.background = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
        document.body.style.backgroundAttachment = 'fixed'; // Ensure gradient covers viewport
    }

    // Apply the random static background
    setRandomStaticBackground();

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