// Helper function to throttle function calls for better performance
function throttle(func, delay) {
  let lastCall = 0;
  let timeoutId = null;
  return function(...args) {
    const now = performance.now(); // Use performance.now() for better precision
    const remaining = delay - (now - lastCall);
    
    // Clear any pending execution
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    if (remaining <= 0) {
      // If enough time has passed, execute immediately
      lastCall = now;
      return func.apply(this, args);
    } else {
      // Otherwise, schedule execution
      timeoutId = setTimeout(() => {
        lastCall = performance.now();
        func.apply(this, args);
      }, remaining);
    }
  };
}

document.addEventListener('DOMContentLoaded', () => {
    const calcContainer = document.getElementById('calculator');

    if (calcContainer) {
        // Initialize calculator tabs
        initCalculatorTabs();
        
        // Initialize each calculator
        initStatsCalculator();
        initBusinessCalculator();
        initPirateCalculator();
    }
});

function initCalculatorTabs() {
    const tabButtons = document.querySelectorAll('.calc-tab');
    const calculatorContainers = document.querySelectorAll('.calculator-container');
    
    // Use event delegation for better performance
    const tabContainer = document.querySelector('.calculator-tabs');
    if (tabContainer) {
        tabContainer.addEventListener('click', (e) => {
            // Only respond to clicks on tab buttons
            if (e.target.classList.contains('calc-tab')) {
                const targetTab = e.target.dataset.tab;
                
                // Update active button - use more efficient method
                const prevActive = tabContainer.querySelector('.calc-tab.active');
                if (prevActive) prevActive.classList.remove('active');
                e.target.classList.add('active');
                
                // Use requestAnimationFrame for smoother transitions
                requestAnimationFrame(() => {
                    // Show/hide calculator sections
                    calculatorContainers.forEach(container => {
                        container.classList.toggle('active', container.id === `${targetTab}-calculator`);
                    });
                });
            }
        });
    } else {
        // Fallback to individual listeners if container not found
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Update active button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show/hide calculator sections
                calculatorContainers.forEach(container => {
                    if (container.id === `${targetTab}-calculator`) {
                        container.classList.add('active');
                    } else {
                        container.classList.remove('active');
                    }
                });
            });
        });
    }
}

function initStatsCalculator() {
    // Constants updated from provided files

    // From fishUtils.txt -> fishConstants.js reference
    const SHOP_UPGRADES = {
        luck: { name: "Lucky Lure", description: "Increases chance of rare fish", maxLevel: 100, basePrice: 75, priceMultiplier: 1.18, effectPerLevel: 0.5 },
        speed: { name: "Quick Cast", description: "Reduces fishing time", maxLevel: 100, basePrice: 100, priceMultiplier: 1.18, effectPerLevel: 0.5 },
        multiCatch: { name: "Wide Net", description: "Chance to catch multiple fish", maxLevel: 100, basePrice: 150, priceMultiplier: 1.18, effectPerLevel: 0.3 },
        inventory: { name: "Tackle Box", description: "Increases inventory capacity", maxLevel: 20, basePrice: 300, priceMultiplier: 1.5, effectPerLevel: 5 },
        value: { name: "Fish Market Contacts", description: "Increases sell value of fish", maxLevel: 100, basePrice: 500, priceMultiplier: 1.25, effectPerLevel: 0.4 },
        explorer: { name: "Explorer's Map", description: "Unlocks new fishing locations", maxLevel: 11, basePrice: 5000, priceMultiplier: 2.5, effectPerLevel: 1 },
        // Add the Special Map upgrade
        specialMap: { name: "Special Map", description: "Unlocks special fishing locations", maxLevel: 1, basePrice: 2000000, priceMultiplier: 1, effectPerLevel: 1, requiresBoatCompany: true }
    };
    
    const RESEARCH_UPGRADES = {
        advancedLuck: { name: "Advanced Lure Technology", description: "Significantly boosts rare fish chances", maxLevel: 10, basePrice: 50000, priceMultiplier: 1.5, effectPerLevel: 2.0, researchTimeHours: 6, timeMultiplier: 1.25, requires: { luck: 25 } },
        efficiency: { name: "Fishing Efficiency", description: "Greatly reduces fishing time", maxLevel: 10, basePrice: 100000, priceMultiplier: 1.5, effectPerLevel: 2.5, researchTimeHours: 8, timeMultiplier: 1.3, requires: { speed: 30 } },
        masterNet: { name: "Master Fishing Net", description: "Higher chance for multiple catches", maxLevel: 10, basePrice: 150000, priceMultiplier: 1.5, effectPerLevel: 1.5, researchTimeHours: 12, timeMultiplier: 1.35, requires: { multiCatch: 40 } },
        treasureHunter: { name: "Treasure Hunter", description: "Increases chest spawn rate and value", maxLevel: 5, basePrice: 200000, priceMultiplier: 2.0, effectPerLevel: 10, researchTimeHours: 24, timeMultiplier: 1.5, requires: { value: 50 } },
        specialLure: { name: "Special Fish Attractor", description: "Increases special fish chance", maxLevel: 5, basePrice: 500000, priceMultiplier: 2.0, effectPerLevel: 5, researchTimeHours: 36, timeMultiplier: 1.5, requires: { luck: 60, value: 40 } }
    };
    
    // From fishLocationUtils.txt
    const FISHING_LOCATIONS = {
        pond: {
            name: "Tranquil Pond",
            fishModifiers: { common: 1.2, uncommon: 0.8, rare: 0.5, legendary: 0.2, mythic: 0.1, chimerical: 0.05 },
            commonBoost: 10, uncommonBoost: 0, rareBoost: 0, legendaryBoost: 0, mythicBoost: 0, chimericalBoost: 0
        },
        river: {
            name: "Rushing River",
            fishModifiers: { common: 1.0, uncommon: 1.1, rare: 0.7, legendary: 0.3, mythic: 0.15, chimerical: 0.07 },
            commonBoost: 5, uncommonBoost: 10, rareBoost: 2, legendaryBoost: 0, mythicBoost: 0, chimericalBoost: 0
        },
        lake: {
            name: "Misty Lake",
            fishModifiers: { common: 0.9, uncommon: 1.0, rare: 1.1, legendary: 0.4, mythic: 0.2, chimerical: 0.1 },
            commonBoost: 0, uncommonBoost: 5, rareBoost: 10, legendaryBoost: 1, mythicBoost: 0, chimericalBoost: 0
        },
        ocean: {
            name: "Deep Ocean",
            fishModifiers: { common: 0.8, uncommon: 0.9, rare: 1.2, legendary: 0.6, mythic: 0.3, chimerical: 0.15 },
            commonBoost: 0, uncommonBoost: 0, rareBoost: 15, legendaryBoost: 3, mythicBoost: 1, chimericalBoost: 0
        },
        coral_reef: {
            name: "Coral Reef",
            fishModifiers: { common: 0.7, uncommon: 0.85, rare: 1.15, legendary: 0.8, mythic: 0.4, chimerical: 0.2 },
            commonBoost: 0, uncommonBoost: 10, rareBoost: 20, legendaryBoost: 5, mythicBoost: 2, chimericalBoost: 0
        },
        abyss: {
            name: "The Abyss",
            fishModifiers: { common: 0.6, uncommon: 0.75, rare: 1.0, legendary: 1.1, mythic: 0.6, chimerical: 0.25 },
            commonBoost: 0, uncommonBoost: 0, rareBoost: 10, legendaryBoost: 10, mythicBoost: 2, chimericalBoost: 1
        },
        sunken_city: {
            name: "Sunken City",
            fishModifiers: { common: 0.5, uncommon: 0.65, rare: 0.9, legendary: 1.2, mythic: 0.8, chimerical: 0.3 },
            commonBoost: 0, uncommonBoost: 0, rareBoost: 5, legendaryBoost: 15, mythicBoost: 3, chimericalBoost: 1
        },
        vortex: {
            name: "Mystic Vortex",
            fishModifiers: { common: 0.4, uncommon: 0.55, rare: 0.8, legendary: 1.1, mythic: 1.0, chimerical: 0.35 },
            commonBoost: 0, uncommonBoost: 0, rareBoost: 0, legendaryBoost: 10, mythicBoost: 5, chimericalBoost: 2
        },
        cosmic_sea: {
            name: "Cosmic Sea",
            fishModifiers: { common: 0.3, uncommon: 0.45, rare: 0.7, legendary: 1.0, mythic: 1.2, chimerical: 0.4 },
            commonBoost: 0, uncommonBoost: 0, rareBoost: 0, legendaryBoost: 15, mythicBoost: 5, chimericalBoost: 2
        },
        temporal_tide: {
            name: "Temporal Tide",
            fishModifiers: { common: 0.2, uncommon: 0.35, rare: 0.6, legendary: 0.9, mythic: 1.2, chimerical: 0.45 },
            commonBoost: 0, uncommonBoost: 0, rareBoost: 0, legendaryBoost: 10, mythicBoost: 8, chimericalBoost: 3
        },
        fishverse: {
            name: "Fishverse",
            fishModifiers: { common: 0.1, uncommon: 0.25, rare: 0.5, legendary: 0.8, mythic: 1.2, chimerical: 1.0 },
            commonBoost: 0, uncommonBoost: 0, rareBoost: 0, legendaryBoost: 5, mythicBoost: 10, chimericalBoost: 5
        },
        // Add Lucky Land
        lucky_land: {
            name: "Lucky Land",
            fishModifiers: { common: 0.1, uncommon: 0.1, rare: 1, legendary: 1.05, mythic: 1.1, chimerical: 1.2 },
            commonBoost: 0, uncommonBoost: 0, rareBoost: 0, legendaryBoost: 5, mythicBoost: 10, chimericalBoost: 20
        },
        // Add Junk Island
        junk_island: {
            name: "Junk Island",
            fishModifiers: { common: 0, uncommon: 0, rare: 0, legendary: 0, mythic: 0, chimerical: 0, junk: 5 },
            commonBoost: 0, uncommonBoost: 0, rareBoost: 0, legendaryBoost: 0, mythicBoost: 0, chimericalBoost: 0,
            junkOnly: true, requiresSpecialMap: true
        }
    };
    
    // From fishSeasonUtils.txt
    const SEASONS = {
        spring: { name: 'Spring', modifier: { common: 0.9, uncommon: 1.0, rare: 1.05, legendary: 1.05, mythic: 1.1, chimerical: 1.0 } },
        summer: { name: 'Summer', modifier: { common: 1.0, uncommon: 1.0, rare: 1.0, legendary: 1.05, mythic: 1.1, chimerical: 1.05 } },
        fall: { name: 'Fall', modifier: { common: 0.8, uncommon: 1.0, rare: 1.1, legendary: 1.15, mythic: 0.9, chimerical: 0.9 } },
        winter: { name: 'Winter', modifier: { common: 0.95, uncommon: 0.95, rare: 0.95, legendary: 1.05, mythic: 1.10, chimerical: 1.05 } }
    };
    
    // From fishRarityUtils.txt
    const RARITY_WEIGHTS = { common: 0.608, uncommon: 0.218, rare: 0.099, legendary: 0.03, mythic: 0.025, chimerical: 0.02 };
    
    // From fishRarityUtils.txt
    const SPECIAL_FISH_CHANCE = 0.005; // 0.5% base chance
    
    // From fishUtils.txt (addFish logic implies base is 20, each upgrade adds 5)
    const BASE_INVENTORY = 20; // Default inventory size before upgrades

    // Get references to the input and output elements in the HTML
    const inputs = {
      // Shop upgrades
      luck: document.getElementById('calc-luck'),
      speed: document.getElementById('calc-speed'),
      multiCatch: document.getElementById('calc-multiCatch'),
      inventory: document.getElementById('calc-inventory'),
      value: document.getElementById('calc-value'),
      explorer: document.getElementById('calc-explorer'),
      specialMap: document.getElementById('calc-specialMap'), // Add Special Map input
      
      // Research upgrades
      advancedLuck: document.getElementById('calc-advancedLuck'),
      efficiency: document.getElementById('calc-efficiency'),
      masterNet: document.getElementById('calc-masterNet'),
      treasureHunter: document.getElementById('calc-treasureHunter'),
      specialLure: document.getElementById('calc-specialLure'),
      
      // Business upgrades
      fisherLevel: document.getElementById('calc-fisherLevel'),
      warehouseLevel: document.getElementById('calc-warehouseLevel'),
      investmentLevel: document.getElementById('calc-investmentLevel'),
      
      // Other factors
      level: document.getElementById('calc-level'),
      location: document.getElementById('calc-location'),
      season: document.getElementById('calc-season')
    };

    const outputs = {
      speed: document.getElementById('calc-output-speed'),
      value: document.getElementById('calc-output-value'),
      inventory: document.getElementById('calc-output-inventory'),
      multiCatch: document.getElementById('calc-output-multiCatch'),
      specialChance: document.getElementById('calc-output-specialChance'),
      treasure: document.getElementById('calc-output-treasure'),
      locations: document.getElementById('calc-output-locations'),
      luck: document.getElementById('calc-output-luck'),
      rarityCommon: document.getElementById('calc-output-rarity-common'),
      rarityUncommon: document.getElementById('calc-output-rarity-uncommon'),
      rarityRare: document.getElementById('calc-output-rarity-rare'),
      rarityLegendary: document.getElementById('calc-output-rarity-legendary'),
      rarityMythic: document.getElementById('calc-output-rarity-mythic'),
      rarityChimerical: document.getElementById('calc-output-rarity-chimerical')
    };    // Fill the location and season dropdowns with options
    function populateOptions() {
      // Get current explorer level and special map status
      const explorerLevel = getInputValue(inputs.explorer, SHOP_UPGRADES.explorer.maxLevel);
      const hasSpecialMap = getInputValue(inputs.specialMap, SHOP_UPGRADES.specialMap.maxLevel) > 0;
      
      // Locations
      inputs.location.innerHTML = ''; // Clear existing options first
      for (const key in FISHING_LOCATIONS) {
        // Check if location should be shown based on explorer level and special map
        const location = FISHING_LOCATIONS[key];
        
        // Skip Junk Island if no special map
        if (key === 'junk_island' && !hasSpecialMap) continue;
        
        // Skip Lucky Land if explorer level < 11
        if (key === 'lucky_land' && explorerLevel < 11) continue;
        
        const option = document.createElement('option');
        option.value = key;
        option.textContent = location.name;
        inputs.location.appendChild(option);
      }
      
      // Seasons
      inputs.season.innerHTML = ''; // Clear existing options first
      for (const key in SEASONS) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = SEASONS[key].name;
        inputs.season.appendChild(option);
      }
      
      // Set default season based on the current date (using logic from fishSeasonUtils)
      const month = new Date().getMonth();
      let currentSeasonKey = 'winter'; // Default
      
      if (month >= 2 && month <= 4) {
        currentSeasonKey = 'spring'; // Mar, Apr, May
      } else if (month >= 5 && month <= 7) {
        currentSeasonKey = 'summer'; // Jun, Jul, Aug
      } else if (month >= 8 && month <= 10) {
        currentSeasonKey = 'fall'; // Sep, Oct, Nov
      } else {
        currentSeasonKey = 'winter'; // Dec, Jan, Feb
      }
      
      inputs.season.value = currentSeasonKey;
    }

    // Helper to safely get integer input values within bounds
    function getInputValue(element, maxVal = Infinity) {
      if (!element) return 0; // Handle missing elements
      
      const value = parseInt(element.value, 10) || 0;
      // Use the maxLevel from the upgrade definition if available and maxVal wasn't explicitly passed differently
      const elementMax = element.max ? parseInt(element.max, 10) : maxVal;
      return Math.max(0, Math.min(value, elementMax));
    }

    // Main function to calculate and display all stats
    function calculateStats() {
      // Read all current input values, respecting max levels from constants
      const levels = {
        // Shop upgrades
        luck: getInputValue(inputs.luck, SHOP_UPGRADES.luck.maxLevel),
        speed: getInputValue(inputs.speed, SHOP_UPGRADES.speed.maxLevel),
        multiCatch: getInputValue(inputs.multiCatch, SHOP_UPGRADES.multiCatch.maxLevel),
        inventory: getInputValue(inputs.inventory, SHOP_UPGRADES.inventory.maxLevel),
        value: getInputValue(inputs.value, SHOP_UPGRADES.value.maxLevel),
        explorer: getInputValue(inputs.explorer, SHOP_UPGRADES.explorer.maxLevel),
        specialMap: getInputValue(inputs.specialMap, SHOP_UPGRADES.specialMap.maxLevel), // Add Special Map input
        
        // Research upgrades
        advancedLuck: getInputValue(inputs.advancedLuck, RESEARCH_UPGRADES.advancedLuck.maxLevel),
        efficiency: getInputValue(inputs.efficiency, RESEARCH_UPGRADES.efficiency.maxLevel),
        masterNet: getInputValue(inputs.masterNet, RESEARCH_UPGRADES.masterNet.maxLevel),
        treasureHunter: getInputValue(inputs.treasureHunter, RESEARCH_UPGRADES.treasureHunter.maxLevel),
        specialLure: getInputValue(inputs.specialLure, RESEARCH_UPGRADES.specialLure.maxLevel),
        
        // Business upgrades - NEW
        fisherLevel: getInputValue(inputs.fisherLevel, 50), // Max level from businessUtils.js
        warehouseLevel: getInputValue(inputs.warehouseLevel, 50), // Max level from businessUtils.js
        investmentLevel: getInputValue(inputs.investmentLevel, 100), // Max level from businessUtils.js
        
        // Other
        level: getInputValue(inputs.level) // No max level for player level
      };
      const selectedLocation = inputs.location.value;
      const selectedSeason = inputs.season.value;

      // --- Calculate individual stats based on levels and constants ---

      // Speed Reduction (%)
      const baseSpeed = levels.speed * SHOP_UPGRADES.speed.effectPerLevel;
      const efficiencyEffect = levels.efficiency * RESEARCH_UPGRADES.efficiency.effectPerLevel;
      const totalSpeedReduction = baseSpeed + efficiencyEffect;
      outputs.speed.textContent = `${totalSpeedReduction.toFixed(1)}% (Shop: ${baseSpeed.toFixed(1)}%, Research: ${efficiencyEffect.toFixed(1)}%)`;

      // Sell Value Bonus (%)
      const baseValueBonus = levels.value * SHOP_UPGRADES.value.effectPerLevel;
      const investmentBonus = levels.investmentLevel * 2; // +2% per level 
      const totalValueBonus = baseValueBonus + investmentBonus;
      outputs.value.textContent = `${totalValueBonus.toFixed(1)}% (Shop: ${baseValueBonus.toFixed(1)}%, Investment: ${investmentBonus.toFixed(1)}%)`;

      // Inventory Size - Updated with warehouse bonus
      const baseInventory = BASE_INVENTORY + (levels.inventory * SHOP_UPGRADES.inventory.effectPerLevel);
      // From fishUtils.js: warehouseBonus = warehouseLevel * 10; // +10 slots per warehouse level
      const warehouseBonus = levels.warehouseLevel * 10;
      const totalInventory = baseInventory + warehouseBonus;
      outputs.inventory.textContent = `${totalInventory} (Base: ${baseInventory}, Warehouse: +${warehouseBonus})`;

      // Multi-Catch Chance (%) - Updated with fisher bonus
      const baseMultiCatch = levels.multiCatch * SHOP_UPGRADES.multiCatch.effectPerLevel;
      const masterNetEffect = levels.masterNet * RESEARCH_UPGRADES.masterNet.effectPerLevel;
      // From fishEffects.js: fisherBonus = fisherLevel * 0.5; // +0.5% per level
      const fisherBonus = levels.fisherLevel * 0.5; 
      const totalMultiCatch = baseMultiCatch + masterNetEffect + fisherBonus;
      outputs.multiCatch.textContent = `${totalMultiCatch.toFixed(1)}% (Shop: ${baseMultiCatch.toFixed(1)}%, Research: ${masterNetEffect.toFixed(1)}%, Boat: ${fisherBonus.toFixed(1)}%)`;

      // Special Fish Chance (%) - Updated based on fishUtils -> catchFish & fishEffects
      const specialLureBoost = levels.specialLure * RESEARCH_UPGRADES.specialLure.effectPerLevel;
      const totalSpecialChance = (SPECIAL_FISH_CHANCE * 100) + specialLureBoost; // Base chance is 0.5%
      outputs.specialChance.textContent = `${totalSpecialChance.toFixed(1)}%`;

      // Treasure Hunter Bonus (%) - Updated based on fishUtils -> fishEffects
      const treasureBonus = levels.treasureHunter * RESEARCH_UPGRADES.treasureHunter.effectPerLevel;
      outputs.treasure.textContent = `${treasureBonus.toFixed(0)}%`; // Display as whole number

      // Unlocked Locations - Updated to include Lucky Land (level 11)
      const locationMapping = {
          0: ['pond'], 
          1: ['pond', 'river'], 
          2: ['pond', 'river', 'lake'], 
          3: ['pond', 'river', 'lake', 'ocean'],
          4: ['pond', 'river', 'lake', 'ocean', 'coral_reef'], 
          5: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss'],
          6: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss', 'sunken_city'],
          7: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss', 'sunken_city', 'vortex'],
          8: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss', 'sunken_city', 'vortex', 'cosmic_sea'],
          9: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss', 'sunken_city', 'vortex', 'cosmic_sea', 'temporal_tide'],
          10: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss', 'sunken_city', 'vortex', 'cosmic_sea', 'temporal_tide', 'fishverse'],
          11: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss', 'sunken_city', 'vortex', 'cosmic_sea', 'temporal_tide', 'fishverse', 'lucky_land']
      };
      
      // Get the basic unlocked locations from explorer level
      let unlockedLocations = (locationMapping[levels.explorer] || ['pond'])
          .map(locId => FISHING_LOCATIONS[locId]?.name || locId);
          
      // Add Junk Island if special map is owned
      if (levels.specialMap > 0) {
        unlockedLocations.push(FISHING_LOCATIONS.junk_island.name);
      }
      
      // Display unlocked locations
      outputs.locations.textContent = unlockedLocations.join(', ');

      // --- Calculate Luck Influence ---
      // Based on fishUtils -> getTotalLuckModifier (ignoring permanent boosts)
      const baseLuck = levels.luck; // Shop luck level
      const advancedLuckEffect = levels.advancedLuck * RESEARCH_UPGRADES.advancedLuck.effectPerLevel; // This is a percentage boost applied differently
      const levelLuck = Math.floor(levels.level / 10); // Luck bonus from player level (as used in catchFish)

      // Total luck value passed to catchFish for rarity roll adjustment
      const totalLuckForRoll = baseLuck + levelLuck;
      // Display the components
      outputs.luck.textContent = `${totalLuckForRoll} (Shop: ${baseLuck}, Level: ${levelLuck}) + ${advancedLuckEffect.toFixed(1)}% (Research)`;

      // --- Calculate Approximate Rarity Chances ---
      // Based on fishUtils -> catchFish logic
      const locationData = FISHING_LOCATIONS[selectedLocation] || FISHING_LOCATIONS.pond;
      const seasonData = SEASONS[selectedSeason] || SEASONS.winter;
      const modifiedWeights = {};
      let totalWeight = 0;

      // 1. Apply base weights, location/season modifiers, and location boosts
      for (const rarity in RARITY_WEIGHTS) {
          const baseWeight = RARITY_WEIGHTS[rarity];
          const locModifier = locationData.fishModifiers[rarity] || 1.0;
          const seasonModifier = seasonData.modifier[rarity] || 1.0;
          // Boosts are added as percentages *after* multipliers in fishUtils
          const locBoost = (locationData[`${rarity}Boost`] || 0) / 100.0;

          let weight = baseWeight * locModifier * seasonModifier;
          // Add boost after multiplicative modifiers
          weight += locBoost;
          modifiedWeights[rarity] = Math.max(0, weight); // Ensure weight isn't negative
      }

      // 2. Normalize weights before applying luck shift
      totalWeight = Object.values(modifiedWeights).reduce((sum, w) => sum + w, 0);
      if (totalWeight > 0) {
          for (const rarity in modifiedWeights) {
              modifiedWeights[rarity] /= totalWeight;
          }
      } else {
           // Avoid division by zero if all weights somehow became zero
           for (const rarity in modifiedWeights) {
               modifiedWeights[rarity] = 1 / Object.keys(RARITY_WEIGHTS).length;
           }
      }

      // 3. Apply Luck Shift (Approximation of the bot's `rarityRoll = Math.random() - totalLuckBoost;`)
      const luckShiftFactor = totalLuckForRoll * 0.002; // Corresponds to the bot's `totalLuckBoost` calculation

      // Define relative values to determine how much to shift
      const rarityValues = { common: 1, uncommon: 2, rare: 4, legendary: 8, mythic: 16, chimerical: 32 };
      let totalValueWeight = 0;
      for (const rarity in modifiedWeights) {
          totalValueWeight += modifiedWeights[rarity] * rarityValues[rarity];
      }

      if (totalValueWeight > 0) {
          const redistributedWeights = {};
          let totalShifted = 0;

          // Calculate how much each rarity *should* change based on luck and its value
          for (const rarity in modifiedWeights) {
              // Higher value rarities gain more from luck, lower value ones lose
              const valueDifference = rarityValues[rarity] - (totalValueWeight / Object.keys(rarityValues).length); // Difference from average value
              const shift = modifiedWeights[rarity] * luckShiftFactor * valueDifference * 0.1; // Adjust multiplier (0.1) as needed for desired effect strength
              redistributedWeights[rarity] = modifiedWeights[rarity] + shift;
              totalShifted += shift; // Track net shift to ensure it balances out (should be close to 0)
          }

           // Apply a small correction if totalShifted isn't zero (due to approximations)
           if (Math.abs(totalShifted) > 1e-6) {
               const correctionFactor = totalShifted / Object.keys(redistributedWeights).length;
               for (const rarity in redistributedWeights) {
                   redistributedWeights[rarity] -= correctionFactor;
               }
           }

          // Ensure no negative weights and normalize again
          let finalTotalWeight = 0;
          for (const rarity in redistributedWeights) {
              modifiedWeights[rarity] = Math.max(0.0001, redistributedWeights[rarity]); // Prevent zero chance
              finalTotalWeight += modifiedWeights[rarity];
          }

          if (finalTotalWeight > 0) {
              for (const rarity in modifiedWeights) {
                  modifiedWeights[rarity] /= finalTotalWeight;
              }
          }
      }

      // Update the UI with the calculated rarity percentages
      outputs.rarityCommon.textContent = `~${(modifiedWeights.common * 100).toFixed(1)}%`;
      outputs.rarityUncommon.textContent = `~${(modifiedWeights.uncommon * 100).toFixed(1)}%`;
      outputs.rarityRare.textContent = `~${(modifiedWeights.rare * 100).toFixed(1)}%`;
      outputs.rarityLegendary.textContent = `~${(modifiedWeights.legendary * 100).toFixed(1)}%`;
      outputs.rarityMythic.textContent = `~${(modifiedWeights.mythic * 100).toFixed(1)}%`;
      outputs.rarityChimerical.textContent = `~${(modifiedWeights.chimerical * 100).toFixed(1)}%`;
    }

    // Setup and Initial Calculation
    populateOptions(); // Fill dropdowns with locations and seasons
    calculateStats(); // Run the calculation once on page load

    // Create a single throttled calculate function with enhanced performance
    const throttledCalculate = throttle(calculateStats, 250);

    // Use event delegation to optimize input handling
    const allInputsContainer = document.querySelector('.calc-inputs');
    if (allInputsContainer) {
      allInputsContainer.addEventListener('input', (e) => {
        // Only trigger calculation for relevant input elements
        if (e.target.matches('input, select')) {
          throttledCalculate();
        }
      });
    } else {
      // Fallback to individual listeners
      for (const key in inputs) {
        if (inputs[key]) {
          inputs[key].addEventListener('input', throttledCalculate);
        } else {
          console.warn(`Calculator input element not found: ${key}`);
        }
      }
    }

    // Ensure the special map and explorer inputs trigger a reload of location options
    // These need special treatment as they change available options
    if (inputs.specialMap) {
      inputs.specialMap.addEventListener('change', function() {
        // Re-populate options to show or hide Junk Island based on special map status
        populateOptions();
        // Then recalculate stats
        throttledCalculate();
      });
    }
    
    if (inputs.explorer) {
      inputs.explorer.addEventListener('change', function() {
        // Re-populate options to show or hide Lucky Land based on explorer level
        populateOptions();
        // Then recalculate stats
        throttledCalculate();
      });
    }

    // Add after your existing calculateStats function

    function setupTabInterface() {
      // Cache DOM selections for better performance
      const calcInputs = document.querySelector('.calc-inputs');
      if (!calcInputs) return; // Guard clause - exit if element not found
      
      // Create tab navigation
      const tabContainer = document.createElement('div');
      tabContainer.className = 'calc-tabs';
      
      const tabs = [
        { id: 'tab-shop', label: '🛒 Shop', target: 'shop-upgrades' },
        { id: 'tab-research', label: '🔬 Research', target: 'research-upgrades' },
        { id: 'tab-business', label: '💼 Business', target: 'business-upgrades' },
        { id: 'tab-other', label: '⚙️ Other', target: 'other-factors' }
      ];
      
      // Use document fragment for better performance
      const fragment = document.createDocumentFragment();
      
      // Create tab buttons and attach to fragment
      tabs.forEach(tab => {
        const button = document.createElement('button');
        button.id = tab.id;
        button.className = 'calc-tab-button'; // Changed class name to avoid conflict with main tabs
        button.textContent = tab.label;
        button.setAttribute('aria-selected', tab.id === 'tab-shop' ? 'true' : 'false');
        button.dataset.target = tab.target; // Store target in dataset for easier access
        fragment.appendChild(button);
      });
      
      // Append all buttons to container at once
      tabContainer.appendChild(fragment);
      
      // Use event delegation for better performance
      tabContainer.addEventListener('click', (e) => {
        if (e.target.matches('.calc-tab-button')) {
          switchSubTab(e.target);
        }
      });
      
      // Insert tabs before the inputs
      calcInputs.parentNode.insertBefore(tabContainer, calcInputs);
      
      // Add tabbed content containers
      const calcGroups = document.querySelectorAll('.calc-group');
      
      // Set initial visibility state
      calcGroups.forEach(group => {
        group.classList.add('calc-tab-content');
        
        // Initially hide all except shop upgrades
        if (!group.querySelector('h3').textContent.toLowerCase().includes('shop')) {
          group.style.display = 'none';
        }
      });
    }

    function switchSubTab(selectedTab) {
      // Find all tab buttons and update their state
      const allTabButtons = document.querySelectorAll('.calc-tab-button');
      allTabButtons.forEach(tab => {
        tab.setAttribute('aria-selected', tab === selectedTab ? 'true' : 'false');
      });
      
      // Get the target group name
      const targetGroupName = selectedTab.dataset.target;
      
      // Use requestAnimationFrame for smoother UI updates
      requestAnimationFrame(() => {
        // Show/hide appropriate content
        const groups = document.querySelectorAll('.calc-group');
        groups.forEach(group => {
          const groupTitle = group.querySelector('h3').textContent.toLowerCase();
          const isTarget = groupTitle.includes(targetGroupName.replace('-', ' '));
          group.style.display = isTarget ? 'block' : 'none';
        });
      });
    }

    setupTabInterface();

    // Make outputs collapsible on mobile
    function setupCollapsibleOutputs() {
      const outputsSection = document.querySelector('.calc-outputs');
      const outputsHeading = outputsSection.querySelector('h3');
      
      if (window.innerWidth <= 480) {
        // Add toggle functionality
        outputsHeading.addEventListener('click', () => {
          outputsSection.classList.toggle('collapsed');
        });
        
        // Add calculate button for mobile
        const calcButton = document.createElement('button');
        calcButton.className = 'calc-action-button';
        calcButton.textContent = 'Calculate Stats';
        calcButton.addEventListener('click', calculateStats);
        
        // Insert before outputs section
        outputsSection.parentNode.insertBefore(calcButton, outputsSection);
        
        // Initially collapse outputs on very small screens
        outputsSection.classList.add('collapsed');
      }
    }

    // Call in your document ready function
    setupCollapsibleOutputs();

    // Throttle calculations on mobile
    let calculateThrottleTimer;
    function throttledCalculate() {
      if (window.innerWidth <= 768) { // Only throttle on mobile
        clearTimeout(calculateThrottleTimer);
        calculateThrottleTimer = setTimeout(calculateStats, 500);
      } else {
        calculateStats(); // Immediate on desktop
      }
    }

    // Make sure the special map input triggers a reload of location options
    inputs.specialMap.addEventListener('input', function() {
      // Re-populate options to show or hide Junk Island based on special map status
      populateOptions();
      // Then recalculate stats
      throttledCalculate();
    });
      inputs.explorer.addEventListener('input', function() {
      // Re-populate options to show or hide Lucky Land based on explorer level
      populateOptions();
      // Then recalculate stats
      throttledCalculate();
    });
  }

function initBusinessCalculator() {
  console.log("Initializing Business Income Calculator");
  
  // Get references to the business UI elements
  const businessTypeButtons = document.querySelectorAll('.business-type-btn');
  const businessSections = document.querySelectorAll('.business-upgrade-section');
  
  // Create a throttled version of the calculate function for better performance
  const throttledCalculate = throttle(calculateBusinessIncome, 100);
  
  // Show the default business type (boat)
  document.getElementById('boat-upgrades').classList.add('active');
  
  // Add event listeners to business type buttons
  businessTypeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const businessType = button.dataset.business;
      
      // Update active button
      businessTypeButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Show/hide business sections
      businessSections.forEach(section => {
        if (section.id === `${businessType}-upgrades`) {
          section.classList.add('active');
        } else {
          section.classList.remove('active');
        }
      });
      
      // Recalculate business income
      throttledCalculate();
    });
  });
  
  // Get all business input elements
  const boatInputs = document.querySelectorAll('#boat-upgrades input');
  const marketInputs = document.querySelectorAll('#market-upgrades input');
  const bankInputs = document.querySelectorAll('#bank-upgrades input');
  const waterWorldInputs = document.querySelectorAll('#waterworld-upgrades input');
  
  // Add event listeners to all inputs
  [...boatInputs, ...marketInputs, ...bankInputs, ...waterWorldInputs].forEach(input => {
    input.addEventListener('input', throttledCalculate);
  });
    // Calculate business income based on inputs
  function calculateBusinessIncome() {
    const activeBusinessType = document.querySelector('.business-type-btn.active').dataset.business;
    
    let incomePerMinute = 0;
    let collectionTime = 60;  // Default: 60 minutes
    let maxStorage = 1000;    // Default: 1000 coins
    let costEstimate = 0;     // For ROI calculation
    
    switch(activeBusinessType) {
      case 'boat':
        const boatCount = parseInt(document.getElementById('boat-count').value) || 1;
        const netLevel = parseInt(document.getElementById('boat-nets').value) || 0;
        const engineLevel = parseInt(document.getElementById('boat-engines').value) || 0;
        const crewSize = parseInt(document.getElementById('boat-crew').value) || 1;
        const fisherLevel = parseInt(document.getElementById('boat-fisher').value) || 1;
        
        // Calculate boat fleet income
        const baseIncomePerBoat = 5;  // Base coins per minute per boat
        const netBonus = netLevel * 1.5;  // +1.5% per net level
        const engineReduction = engineLevel * 2;  // -2% collection time per level
        const crewBonus = crewSize * 10;  // +10% per crew member
        const fisherBonus = fisherLevel * 5;  // +5% per fisher level
        
        // Apply all modifiers
        incomePerMinute = boatCount * baseIncomePerBoat * (1 + (netBonus + crewBonus + fisherBonus) / 100);
        collectionTime = Math.max(10, 60 * (1 - (engineReduction / 100)));
        maxStorage = 1000 * boatCount * (1 + (crewSize / 10));
        
        // Estimate costs for ROI calculation
        const boatCost = 5000 * boatCount;
        const netCost = netLevel * 1000;
        const engineCost = engineLevel * 1500;
        const crewCost = crewSize * 2000;
        const fisherCost = fisherLevel * 3000;
        costEstimate = boatCost + netCost + engineCost + crewCost + fisherCost;
        break;
        
      case 'market':
        const stallCount = parseInt(document.getElementById('market-stalls').value) || 1;
        const qualityLevel = parseInt(document.getElementById('market-quality').value) || 0;
        const preservationLevel = parseInt(document.getElementById('market-preservation').value) || 0;
        const advertisingLevel = parseInt(document.getElementById('market-advertising').value) || 0;
        const warehouseLevel = parseInt(document.getElementById('market-warehouse').value) || 1;
        
        // Calculate market income
        const baseIncomePerStall = 8;  // Base coins per minute per stall
        const qualityBonus = qualityLevel * 2;  // +2% per quality level
        const preservationBonus = preservationLevel * 1;  // +1% per preservation level
        const advertisingBonus = advertisingLevel * 3;  // +3% per advertising level
        const warehouseBonus = warehouseLevel * 8;  // +8% per warehouse level
        
        // Apply all modifiers
        incomePerMinute = stallCount * baseIncomePerStall * (1 + (qualityBonus + preservationBonus + advertisingBonus + warehouseBonus) / 100);
        collectionTime = 45;  // Fixed collection time for market
        maxStorage = 1500 * stallCount * (1 + (warehouseLevel / 5));
        
        // Estimate costs for ROI calculation
        const stallCost = 8000 * stallCount;
        const qualityCost = qualityLevel * 1200;
        const preservationCost = preservationLevel * 800;
        const advertisingCost = advertisingLevel * 2000;
        const warehouseCost = warehouseLevel * 2500;
        costEstimate = stallCost + qualityCost + preservationCost + advertisingCost + warehouseCost;
        break;
        
      case 'bank':
        const tellerCount = parseInt(document.getElementById('bank-tellers').value) || 1;
        const vaultLevel = parseInt(document.getElementById('bank-vault').value) || 0;
        const interestLevel = parseInt(document.getElementById('bank-interest').value) || 0;
        const investmentLevel = parseInt(document.getElementById('bank-investment').value) || 1;
        
        // Calculate bank income
        const baseIncomePerTeller = 12;  // Base coins per minute per teller
        const vaultBonus = vaultLevel * 1.5;  // +1.5% per vault level
        const interestBonus = interestLevel * 4;  // +4% per interest level
        const investmentBonus = investmentLevel * 3;  // +3% per investment level
        
        // Apply all modifiers
        incomePerMinute = tellerCount * baseIncomePerTeller * (1 + (vaultBonus + interestBonus + investmentBonus) / 100);
        collectionTime = 30;  // Fixed collection time for bank
        maxStorage = 2000 * tellerCount * (1 + (vaultLevel / 4));
        
        // Estimate costs for ROI calculation
        const tellerCost = 12000 * tellerCount;
        const vaultCost = vaultLevel * 2000;
        const interestCost = interestLevel * 4000;
        const investmentCost = investmentLevel * 5000;
        costEstimate = tellerCost + vaultCost + interestCost + investmentCost;
        break;
        
      case 'waterworld':
        const attractionCount = parseInt(document.getElementById('ww-attractions').value) || 1;
        const staffLevel = parseInt(document.getElementById('ww-staff').value) || 1;
        const exhibitsLevel = parseInt(document.getElementById('ww-exhibits').value) || 0;
        const concessionsLevel = parseInt(document.getElementById('ww-concessions').value) || 0;
        const marketingLevel = parseInt(document.getElementById('ww-marketing').value) || 0;
        
        // Calculate Water World income
        const baseIncomePerAttraction = 20;  // Base coins per minute per attraction
        const staffBonus = staffLevel * 2;  // +2% per staff level
        const exhibitsBonus = exhibitsLevel * 3;  // +3% per exhibits level
        const concessionsBonus = concessionsLevel * 5;  // +5% per concessions level
        const marketingBonus = marketingLevel * 4;  // +4% per marketing level
        
        // Apply all modifiers
        incomePerMinute = attractionCount * baseIncomePerAttraction * (1 + (staffBonus + exhibitsBonus + concessionsBonus + marketingBonus) / 100);
        collectionTime = 90;  // Fixed collection time for Water World
        maxStorage = 5000 * attractionCount * (1 + (staffLevel / 3));
        
        // Estimate costs for ROI calculation
        const attractionCost = 20000 * attractionCount;
        const staffCost = staffLevel * 3000;
        const exhibitsCost = exhibitsLevel * 5000;
        const concessionsCost = concessionsLevel * 7000;
        const marketingCost = marketingLevel * 4000;
        costEstimate = attractionCost + staffCost + exhibitsCost + concessionsCost + marketingCost;
        break;
    }
    
    // Calculate derived values
    const incomePerHour = incomePerMinute * 60;
    const incomePerDay = incomePerHour * 24;
    const roiDays = Math.ceil(costEstimate / incomePerDay) || 0;
    
    // Update output elements
    document.getElementById('business-output-minute').textContent = Math.round(incomePerMinute).toLocaleString();
    document.getElementById('business-output-hour').textContent = Math.round(incomePerHour).toLocaleString();
    document.getElementById('business-output-day').textContent = Math.round(incomePerDay).toLocaleString();
    document.getElementById('business-output-collection').textContent = Math.round(collectionTime);
    document.getElementById('business-output-storage').textContent = Math.round(maxStorage).toLocaleString();
    document.getElementById('business-output-roi').textContent = roiDays;
    
    // Visualize the income sources with a chart
    generateBusinessChart(activeBusinessType);
  }
  
  // Create a simple visualization of income sources
  function generateBusinessChart(businessType) {
    const legendElement = document.getElementById('business-legend');
    const chartElement = document.getElementById('business-chart');
    
    // Clear previous chart
    chartElement.innerHTML = '';
    legendElement.innerHTML = '';
    
    // Generate chart based on business type
    let chartData = [];
    
    switch(businessType) {
      case 'boat':
        chartData = [
          { label: 'Base Income', value: 40, color: '#4CAF50' },
          { label: 'Net Upgrades', value: 25, color: '#2196F3' },
          { label: 'Crew Bonus', value: 20, color: '#FF9800' },
          { label: 'Fisher Bonus', value: 15, color: '#9C27B0' }
        ];
        break;
      case 'market':
        chartData = [
          { label: 'Base Stalls', value: 35, color: '#4CAF50' },
          { label: 'Quality', value: 15, color: '#2196F3' },
          { label: 'Preservation', value: 10, color: '#FF9800' },
          { label: 'Advertising', value: 25, color: '#9C27B0' },
          { label: 'Warehouse', value: 15, color: '#795548' }
        ];
        break;
      case 'bank':
        chartData = [
          { label: 'Base Tellers', value: 30, color: '#4CAF50' },
          { label: 'Vault Security', value: 15, color: '#2196F3' },
          { label: 'Interest Rate', value: 40, color: '#FF9800' },
          { label: 'Investments', value: 15, color: '#9C27B0' }
        ];
        break;
      case 'waterworld':
        chartData = [
          { label: 'Base Attractions', value: 25, color: '#4CAF50' },
          { label: 'Staff', value: 10, color: '#2196F3' },
          { label: 'Exhibits', value: 20, color: '#FF9800' },
          { label: 'Concessions', value: 30, color: '#9C27B0' },
          { label: 'Marketing', value: 15, color: '#795548' }
        ];
        break;
    }
    
    // Create a simple stacked bar chart
    const chart = document.createElement('div');
    chart.style.display = 'flex';
    chart.style.width = '100%';
    chart.style.height = '100%';
    chart.style.borderRadius = '4px';
    chart.style.overflow = 'hidden';
    
    // Add segments to chart
    chartData.forEach(item => {
      const segment = document.createElement('div');
      segment.style.height = '100%';
      segment.style.width = `${item.value}%`;
      segment.style.backgroundColor = item.color;
      chart.appendChild(segment);
    });
    
    // Create legend
    chartData.forEach(item => {
      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';
      legendItem.innerHTML = `
        <span class="legend-color" style="background-color: ${item.color};"></span>
        <span class="legend-label">${item.label}</span>
      `;
      legendElement.appendChild(legendItem);
    });
    
    // Add the chart to the chart element
    chartElement.appendChild(chart);
  }
  
  // Run the initial calculation
  calculateBusinessIncome();
}

function initPirateCalculator() {
  console.log("Initializing Pirate Plunder Calculator");
  
  // Get references to the pirate calculator inputs
  const pirateInputs = document.querySelectorAll('#pirate-calculator input, #pirate-calculator select');
  
  // Create a throttled version of the calculate function for better performance
  const throttledCalculate = throttle(calculatePlunderResults, 100);
  
  // Add event listeners to all inputs
  pirateInputs.forEach(input => {
    input.addEventListener('input', throttledCalculate);
  });
  
  // Calculate plunder results based on inputs
  function calculatePlunderResults() {
    // Get input values
    const robChanceLevel = parseInt(document.getElementById('pirate-robchance').value) || 0;
    const robAmountLevel = parseInt(document.getElementById('pirate-robamount').value) || 0;
    const bonusChanceLevel = parseInt(document.getElementById('pirate-bonuschance').value) || 0;
    const crewSize = parseInt(document.getElementById('pirate-crew').value) || 1;
    
    const targetCoins = parseInt(document.getElementById('target-coins').value) || 10000;
    const protectionLevel = parseInt(document.getElementById('target-protection').value) || 0;
    const activityLevel = document.getElementById('target-activity').value;
    
    // Calculate success chance
    const baseSuccessChance = 30; // 30% base chance
    const robChanceBonus = robChanceLevel * 2; // +2% per level
    const crewBonus = crewSize * 3; // +3% per crew member
    const protectionPenalty = protectionLevel * 3; // -3% per protection level
    
    // Activity level adjustments
    let activityPenalty = 0;
    switch(activityLevel) {
      case 'low': activityPenalty = 0; break; // No penalty for inactive players
      case 'medium': activityPenalty = 10; break; // -10% for average players
      case 'high': activityPenalty = 25; break; // -25% for very active players
    }
    
    // Calculate final success chance (capped between 5% and 95%)
    let successChance = baseSuccessChance + robChanceBonus + crewBonus - protectionPenalty - activityPenalty;
    successChance = Math.min(95, Math.max(5, successChance));
    
    // Calculate potential loot
    const baseLootPercentage = 5; // 5% of target's coins
    const robAmountBonus = robAmountLevel * 0.5; // +0.5% per level
    const lootPercentage = baseLootPercentage + robAmountBonus;
    const potentialLoot = Math.round(targetCoins * (lootPercentage / 100));
    
    // Calculate bonus treasure chance
    const baseBonusChance = 1; // 1% base chance
    const bonusChanceBonus = bonusChanceLevel * 0.5; // +0.5% per level
    const bonusTreasureChance = baseBonusChance + bonusChanceBonus;
    
    // Calculate operation time
    const baseTime = 5; // 5 minutes base
    const timeReduction = crewSize * 0.3; // -0.3 minutes per crew member
    const operationTime = Math.max(1, baseTime - timeReduction);
    
    // Calculate risk of getting caught
    const baseRisk = 20; // 20% base risk
    const robChanceRisk = robChanceLevel * 0.5; // +0.5% per rob chance level
    const protectionBonus = protectionLevel * 1.5; // +1.5% per protection level
    const activityBonus = activityLevel === 'high' ? 15 : (activityLevel === 'medium' ? 5 : 0);
    
    // Calculate final risk (capped between 5% and 95%)
    let riskChance = baseRisk + robChanceRisk + protectionBonus + activityBonus;
    riskChance = Math.min(95, Math.max(5, riskChance));
    
    // Update output elements
    document.getElementById('pirate-output-success').textContent = `${successChance}%`;
    document.getElementById('pirate-output-loot').textContent = potentialLoot.toLocaleString();
    document.getElementById('pirate-output-bonus').textContent = `${bonusTreasureChance}%`;
    document.getElementById('pirate-output-time').textContent = operationTime.toFixed(1);
    document.getElementById('pirate-output-risk').textContent = `${riskChance}%`;
    
    // Update risk meter
    const riskMeterFill = document.getElementById('risk-meter-fill');
    riskMeterFill.style.width = `${riskChance}%`;
    
    // Change color based on risk level
    if (riskChance < 30) {
      riskMeterFill.style.backgroundColor = '#4CAF50'; // Green for low risk
    } else if (riskChance < 60) {
      riskMeterFill.style.backgroundColor = '#FF9800'; // Orange for medium risk
    } else {
      riskMeterFill.style.backgroundColor = '#F44336'; // Red for high risk
    }
  }
  
  // Run the initial calculation
  calculatePlunderResults();
}