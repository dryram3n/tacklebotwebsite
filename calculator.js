document.addEventListener('DOMContentLoaded', () => {
    const calcContainer = document.getElementById('calculator');

    if (calcContainer) {
      // Constants for upgrades and game mechanics
      // Ideally, these would be imported from shared modules, but copied for now
      const SHOP_UPGRADES = {
          luck: { name: "Lucky Lure", description: "Increases chance of rare fish", maxLevel: 100, basePrice: 75, priceMultiplier: 1.18, effectPerLevel: 0.5 },
          speed: { name: "Quick Cast", description: "Reduces fishing time", maxLevel: 100, basePrice: 100, priceMultiplier: 1.18, effectPerLevel: 0.5 },
          multiCatch: { name: "Wide Net", description: "Chance to catch multiple fish", maxLevel: 100, basePrice: 150, priceMultiplier: 1.18, effectPerLevel: 0.3 },
          inventory: { name: "Tackle Box", description: "Increases inventory capacity", maxLevel: 20, basePrice: 300, priceMultiplier: 1.5, effectPerLevel: 5 },
          value: { name: "Fish Market Contacts", description: "Increases sell value of fish", maxLevel: 100, basePrice: 500, priceMultiplier: 1.25, effectPerLevel: 0.4 },
          explorer: { name: "Explorer's Map", description: "Unlocks new fishing locations", maxLevel: 10, basePrice: 5000, priceMultiplier: 2.5, effectPerLevel: 1 }
      };
      const RESEARCH_UPGRADES = {
          advancedLuck: { name: "Advanced Lure Technology", description: "Significantly boosts rare fish chances", maxLevel: 10, basePrice: 50000, priceMultiplier: 1.5, effectPerLevel: 2.0, researchTimeHours: 6, timeMultiplier: 1.25, requires: { luck: 25 } },
          efficiency: { name: "Fishing Efficiency", description: "Greatly reduces fishing time", maxLevel: 10, basePrice: 100000, priceMultiplier: 1.5, effectPerLevel: 2.5, researchTimeHours: 8, timeMultiplier: 1.3, requires: { speed: 30 } },
          masterNet: { name: "Master Fishing Net", description: "Higher chance for multiple catches", maxLevel: 10, basePrice: 150000, priceMultiplier: 1.5, effectPerLevel: 1.5, researchTimeHours: 12, timeMultiplier: 1.35, requires: { multiCatch: 40 } },
          treasureHunter: { name: "Treasure Hunter", description: "Increases chest spawn rate and value", maxLevel: 5, basePrice: 200000, priceMultiplier: 2.0, effectPerLevel: 10, researchTimeHours: 24, timeMultiplier: 1.5, requires: { value: 50 } },
          specialLure: { name: "Special Fish Attractor", description: "Increases special fish chance", maxLevel: 5, basePrice: 500000, priceMultiplier: 2.0, effectPerLevel: 5, researchTimeHours: 36, timeMultiplier: 1.5, requires: { luck: 60, value: 40 } }
      };
      // Updated fishing location data
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
          }
      };
      const SEASONS = {
          spring: { name: 'Spring', modifier: { common: 0.9, uncommon: 1.0, rare: 1.05, legendary: 1.05, mythic: 1.1, chimerical: 1.0 } },
          summer: { name: 'Summer', modifier: { common: 1.0, uncommon: 1.0, rare: 1.0, legendary: 1.05, mythic: 1.1, chimerical: 1.05 } },
          fall: { name: 'Fall', modifier: { common: 0.8, uncommon: 1.0, rare: 1.1, legendary: 1.15, mythic: 0.9, chimerical: 0.9 } },
          winter: { name: 'Winter', modifier: { common: 0.95, uncommon: 0.95, rare: 0.95, legendary: 1.05, mythic: 1.10, chimerical: 1.05 } }
      };
      const RARITY_WEIGHTS = { common: 0.608, uncommon: 0.218, rare: 0.099, legendary: 0.03, mythic: 0.025, chimerical: 0.02 };
      const SPECIAL_FISH_CHANCE = 0.005; // 0.5% base chance
      const BASE_INVENTORY = 20; // Default inventory size

      // Get references to the input and output elements in the HTML
      const inputs = {
        luck: document.getElementById('calc-luck'),
        speed: document.getElementById('calc-speed'),
        multiCatch: document.getElementById('calc-multiCatch'),
        inventory: document.getElementById('calc-inventory'),
        value: document.getElementById('calc-value'),
        explorer: document.getElementById('calc-explorer'),
        advancedLuck: document.getElementById('calc-advancedLuck'),
        efficiency: document.getElementById('calc-efficiency'),
        masterNet: document.getElementById('calc-masterNet'),
        treasureHunter: document.getElementById('calc-treasureHunter'),
        specialLure: document.getElementById('calc-specialLure'),
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
      };

      // Fill the location and season dropdowns with options
      function populateOptions() {
        // Locations
        inputs.location.innerHTML = ''; // Clear existing options first
        for (const key in FISHING_LOCATIONS) {
          const option = document.createElement('option');
          option.value = key;
          option.textContent = FISHING_LOCATIONS[key].name; // Use the display name
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
        // Set default season based on the current date (approximated)
        const currentMonth = new Date().getMonth(); // 0 = Jan, 11 = Dec
        let currentSeasonKey = 'winter'; // Default
        if (currentMonth >= 2 && currentMonth <= 4) currentSeasonKey = 'spring'; // Mar, Apr, May
        else if (currentMonth >= 5 && currentMonth <= 7) currentSeasonKey = 'summer'; // Jun, Jul, Aug
        else if (currentMonth >= 8 && currentMonth <= 10) currentSeasonKey = 'fall'; // Sep, Oct, Nov
        inputs.season.value = currentSeasonKey;
      }

      // Helper to safely get integer input values within bounds
      function getInputValue(element, maxVal = Infinity) {
        const value = parseInt(element.value, 10) || 0;
        return Math.max(0, Math.min(value, maxVal)); // Ensure value is between 0 and maxVal
      }

      // Main function to calculate and display all stats
      function calculateStats() {
        // Read all current input values
        const levels = {
          luck: getInputValue(inputs.luck, SHOP_UPGRADES.luck.maxLevel),
          speed: getInputValue(inputs.speed, SHOP_UPGRADES.speed.maxLevel),
          multiCatch: getInputValue(inputs.multiCatch, SHOP_UPGRADES.multiCatch.maxLevel),
          inventory: getInputValue(inputs.inventory, SHOP_UPGRADES.inventory.maxLevel),
          value: getInputValue(inputs.value, SHOP_UPGRADES.value.maxLevel),
          explorer: getInputValue(inputs.explorer, SHOP_UPGRADES.explorer.maxLevel),
          advancedLuck: getInputValue(inputs.advancedLuck, RESEARCH_UPGRADES.advancedLuck.maxLevel),
          efficiency: getInputValue(inputs.efficiency, RESEARCH_UPGRADES.efficiency.maxLevel),
          masterNet: getInputValue(inputs.masterNet, RESEARCH_UPGRADES.masterNet.maxLevel),
          treasureHunter: getInputValue(inputs.treasureHunter, RESEARCH_UPGRADES.treasureHunter.maxLevel),
          specialLure: getInputValue(inputs.specialLure, RESEARCH_UPGRADES.specialLure.maxLevel),
          level: getInputValue(inputs.level)
        };
        const selectedLocation = inputs.location.value;
        const selectedSeason = inputs.season.value;

        // Calculate individual stats based on levels and constants

        // Speed Reduction (%)
        const baseSpeed = levels.speed * SHOP_UPGRADES.speed.effectPerLevel;
        const efficiencyEffect = levels.efficiency * RESEARCH_UPGRADES.efficiency.effectPerLevel;
        const totalSpeedReduction = baseSpeed + efficiencyEffect;
        outputs.speed.textContent = `${totalSpeedReduction.toFixed(1)}%`;

        // Sell Value Bonus (%)
        const totalValueBonus = levels.value * SHOP_UPGRADES.value.effectPerLevel;
        outputs.value.textContent = `${totalValueBonus.toFixed(1)}%`;

        // Inventory Size
        const totalInventory = BASE_INVENTORY + (levels.inventory * SHOP_UPGRADES.inventory.effectPerLevel);
        outputs.inventory.textContent = `${totalInventory}`;

        // Multi-Catch Chance (%)
        const baseMultiCatch = levels.multiCatch * SHOP_UPGRADES.multiCatch.effectPerLevel;
        const masterNetEffect = levels.masterNet * RESEARCH_UPGRADES.masterNet.effectPerLevel;
        const totalMultiCatch = baseMultiCatch + masterNetEffect;
        outputs.multiCatch.textContent = `${totalMultiCatch.toFixed(1)}%`;

        // Special Fish Chance (%)
        const specialLureBoost = levels.specialLure * RESEARCH_UPGRADES.specialLure.effectPerLevel;
        const totalSpecialChance = (SPECIAL_FISH_CHANCE * 100) + specialLureBoost; // Base chance is 0.5%
        outputs.specialChance.textContent = `${totalSpecialChance.toFixed(1)}%`;

        // Treasure Hunter Bonus (%)
        const treasureBonus = levels.treasureHunter * RESEARCH_UPGRADES.treasureHunter.effectPerLevel;
        outputs.treasure.textContent = `${treasureBonus.toFixed(0)}%`; // Display as whole number

        // Unlocked Locations (Based on Explorer level only)
        const locationMapping = {
            0: ['pond'], 1: ['pond', 'river'], 2: ['pond', 'river', 'lake'], 3: ['pond', 'river', 'lake', 'ocean'],
            4: ['pond', 'river', 'lake', 'ocean', 'coral_reef'], 5: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss'],
            6: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss', 'sunken_city'],
            7: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss', 'sunken_city', 'vortex'],
            8: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss', 'sunken_city', 'vortex', 'cosmic_sea'],
            9: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss', 'sunken_city', 'vortex', 'cosmic_sea', 'temporal_tide'],
            10: ['pond', 'river', 'lake', 'ocean', 'coral_reef', 'abyss', 'sunken_city', 'vortex', 'cosmic_sea', 'temporal_tide', 'fishverse']
        };
        const unlocked = (locationMapping[levels.explorer] || ['pond'])
            .map(locId => FISHING_LOCATIONS[locId]?.name || locId) // Use display names
            .join(', ');
        outputs.locations.textContent = unlocked;

        // Calculate Luck Influence
        const baseLuck = levels.luck; // Shop luck level IS the base luck value used in the bot's catchFish function
        const advancedLuckEffect = levels.advancedLuck * RESEARCH_UPGRADES.advancedLuck.effectPerLevel;
        const levelLuck = Math.floor(levels.level / 10); // Luck bonus from player level (approximation)
        // The 'total' luck in fishEffects seems to be used for the *boost* calculation, not the raw luck value passed to catchFish.
        // The raw luck passed seems to be baseLuck + levelLuck. Advanced luck modifies the *outcome* later.
        const luckValueForBoostCalc = baseLuck + (advancedLuckEffect / 2) + levelLuck; // Used for rarity shift calculation (from fishEffects logic)
        const luckValueForRarityShift = baseLuck + levelLuck; // Approximation of the raw luck value passed to catchFish
        outputs.luck.textContent = `${luckValueForRarityShift} (Shop: ${baseLuck}, Level: ${levelLuck}) + ${advancedLuckEffect.toFixed(1)}% (Research)`;

        // Calculate Approximate Rarity Chances
        const locationData = FISHING_LOCATIONS[selectedLocation] || FISHING_LOCATIONS.pond;
        const seasonData = SEASONS[selectedSeason] || SEASONS.winter;
        const modifiedWeights = {};
        let totalWeight = 0;

        // Apply base weights, location/season modifiers, and location boosts
        for (const rarity in RARITY_WEIGHTS) {
            const baseWeight = RARITY_WEIGHTS[rarity];
            const locModifier = locationData.fishModifiers[rarity] || 1.0;
            const seasonModifier = seasonData.modifier[rarity] || 1.0;
            const locBoost = (locationData[`${rarity}Boost`] || 0) / 100.0; // Convert boost % to decimal

            let weight = baseWeight * locModifier * seasonModifier + locBoost;
            modifiedWeights[rarity] = Math.max(0, weight); // Ensure weight isn't negative
        }

        // Normalize weights so they sum to 1 before applying luck shift
        totalWeight = Object.values(modifiedWeights).reduce((sum, w) => sum + w, 0);
        if (totalWeight > 0) {
            for (const rarity in modifiedWeights) {
                modifiedWeights[rarity] /= totalWeight;
            }
        }

        // Apply Luck Shift (Approximation of the bot's logic)
        // Higher luck increases chances of rarer fish, decreases common/uncommon.
        // We use 'luckValueForBoostCalc' as it represents the overall luck influence on rarity distribution.
        const luckFactor = luckValueForBoostCalc * 0.0015; // This multiplier controls how strongly luck affects rarity shift

        // Calculate how much weight to shift *down* from common/uncommon
        const rarityValues = { common: 1, uncommon: 2, rare: 4, legendary: 8, mythic: 16, chimerical: 32 }; // Relative value of each rarity
        let totalShiftDown = 0;
        let totalShiftUpWeight = 0;

        ['common', 'uncommon'].forEach(rarity => {
            const shiftAmount = modifiedWeights[rarity] * luckFactor * (1 / rarityValues[rarity]); // Shift less from uncommon than common
            modifiedWeights[rarity] -= shiftAmount;
            totalShiftDown += shiftAmount;
            modifiedWeights[rarity] = Math.max(0.001, modifiedWeights[rarity]); // Prevent rarity chance going to absolute zero
        });

        // Calculate the total weighted value of rarer categories to distribute the shifted amount proportionally
        ['rare', 'legendary', 'mythic', 'chimerical'].forEach(rarity => {
            totalShiftUpWeight += modifiedWeights[rarity] * rarityValues[rarity];
        });

        // Distribute the shifted weight *up* to rarer categories based on their current weight and value
        if (totalShiftUpWeight > 0) {
            ['rare', 'legendary', 'mythic', 'chimerical'].forEach(rarity => {
                const proportion = (modifiedWeights[rarity] * rarityValues[rarity]) / totalShiftUpWeight;
                modifiedWeights[rarity] += totalShiftDown * proportion;
            });
        }

        // Final Normalization to ensure percentages sum precisely to 100% after shifts
        totalWeight = Object.values(modifiedWeights).reduce((sum, w) => sum + w, 0);
        if (totalWeight > 0) {
            for (const rarity in modifiedWeights) {
                modifiedWeights[rarity] /= totalWeight;
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

      // Add event listeners to recalculate whenever any input changes
      for (const key in inputs) {
        if (inputs[key]) { // Check if the element actually exists
          inputs[key].addEventListener('input', calculateStats);
        } else {
          console.warn(`Calculator input element not found: ${key}`);
        }
      }
    } // End of if(calcContainer) check
  }); // End of DOMContentLoaded listener