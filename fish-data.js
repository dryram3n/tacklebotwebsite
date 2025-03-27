// Fish data for the TackleBot website catalog

// Fish rarity colors (matching Discord bot)
const RARITY_COLORS = {
    common: '#ddbea9',
    uncommon: '#98d4bb',
    rare: '#98bcd4',
    legendary: '#f4cc71',
    mythic: '#c79de0',
    chimerical: '#cd7ae2',
    special: '#ffdb58',
    seasonal: '#f08080',
    junk: '#a9a9a9'
};

// Fishing locations
const FISHING_LOCATIONS = {
    pond: { displayName: "Pond", emoji: "🏞️" },
    river: { displayName: "River", emoji: "🌊" },
    lake: { displayName: "Lake", emoji: "⛰️" },
    ocean: { displayName: "Ocean", emoji: "🌊" },
    coral_reef: { displayName: "Coral Reef", emoji: "🪸" },
    abyss: { displayName: "Abyss", emoji: "🕳️" },
    sunken_city: { displayName: "Sunken City", emoji: "🏙️" },
    vortex: { displayName: "Vortex", emoji: "🌀" },
    cosmic_sea: { displayName: "Cosmic Sea", emoji: "✨" },
    temporal_tide: { displayName: "Temporal Tide", emoji: "⏳" }
};

// Seasons
const SEASONS = {
    spring: { name: "Spring", displayEmoji: "🌸" },
    summer: { name: "Summer", displayEmoji: "☀️" },
    fall: { name: "Fall", displayEmoji: "🍂" },
    winter: { name: "Winter", displayEmoji: "❄️" }
};

// Common Fish
const COMMON_FISH = [
    {
        name: "Common Carp",
        rarity: "common",
        baseValue: 10,
        locations: ["pond", "river", "lake"],
        weightRange: { min: 2, max: 15 },
        lengthRange: { min: 30, max: 80 },
        description: "A hardy fish found in freshwater ponds and lakes.",
        lore: "The Common Carp is one of the oldest domesticated fish species, with records dating back to ancient China over 2,000 years ago. They were initially bred for food, but their hardy nature and adaptability have made them popular in recreational fishing. Legend has it that particularly old carp can develop magical properties, especially those that swim upstream against strong currents."
    },
    {
        name: "Dark Carp",
        rarity: "common",
        baseValue: 15,
        locations: ["pond", "lake"],
        weightRange: { min: 3, max: 16 },
        lengthRange: { min: 30, max: 85 },
        description: "A shadowy variant that thrives in the darkest waters. Its eyes glow faintly.",
        lore: "Unlike their more common cousins, the Dark Carp is a viscious predator that loves to eat its own kind. They are often found in the darkest, most secluded parts of the water, where they can ambush unsuspecting prey. Their eyes glow faintly in the dark, giving them an eerie appearance that has earned them a fearsome reputation among fishermen."
    },
    {
        name: "Minnow",
        rarity: "common",
        baseValue: 5,
        locations: ["pond", "river"],
        weightRange: { min: 0.1, max: 0.3 },
        lengthRange: { min: 5, max: 10 },
        description: "Tiny and quick, often used as bait.",
        lore: "The Minnow is a small, silvery fish that is often used as bait by fishermen. They are known for their quick movements and their ability to evade capture. Minnows are an important part of the aquatic food chain, serving as prey for larger fish and birds."
    },
    // Add more common fish here
];

// Uncommon Fish
const UNCOMMON_FISH = [
    {
        name: "Bass",
        rarity: "uncommon",
        baseValue: 25,
        locations: ["lake", "river"],
        weightRange: { min: 1, max: 10 },
        lengthRange: { min: 20, max: 60 },
        description: "Known for its fighting spirit when hooked.",
        lore: "The Bass is a popular game fish known for its fighting spirit when hooked. It is prized by anglers for its size and strength, making it a challenging catch. Bass are found in both freshwater and saltwater environments and are known for their aggressive behavior and their ability to strike at fast-moving prey."
    },
    {
        name: "Rainbow Trout",
        rarity: "uncommon",
        baseValue: 30,
        locations: ["river", "lake"],
        weightRange: { min: 1, max: 8 },
        lengthRange: { min: 20, max: 70 },
        description: "Recognized by its colorful patterns.",
        lore: "The Rainbow Trout is recognized by its colorful patterns and its distinctive pink stripe. It is a popular game fish known for its size and its fighting spirit when hooked. Rainbow Trout are found in freshwater rivers and lakes and are prized by anglers for their beauty and taste."
    },
    // Add more uncommon fish here
];

// Rare Fish
const RARE_FISH = [
    {
        name: "Salmon",
        rarity: "rare",
        baseValue: 60,
        locations: ["river", "ocean"],
        weightRange: { min: 4, max: 25 },
        lengthRange: { min: 50, max: 120 },
        description: "Remarkable for swimming upstream to spawn.",
        lore: "The Salmon is remarkable for swimming upstream to spawn. It is known for its distinctive pink flesh and its ability to leap over obstacles in the water. Salmon are an important part of the aquatic ecosystem, serving as prey for bears, eagles, and other marine life."
    },
    {
        name: "Tuna",
        rarity: "rare",
        baseValue: 75,
        locations: ["ocean"],
        weightRange: { min: 50, max: 500 },
        lengthRange: { min: 100, max: 300 },
        description: "A large, powerful fish that's prized for its meat.",
        lore: "The Tuna is a large, powerful fish that's prized for its meat. It is known for its speed and strength in the water, as well as its distinctive flavor. Tuna are found in both tropical and temperate waters and are an important part of the marine ecosystem."
    },
    // Add more rare fish here
];

// Legendary Fish
const LEGENDARY_FISH = [
    {
        name: "Golden Koi",
        rarity: "legendary",
        baseValue: 200,
        locations: ["pond", "lake"],
        weightRange: { min: 5, max: 20 },
        lengthRange: { min: 40, max: 100 },
        description: "A symbol of good fortune and perseverance in many cultures.",
        lore: "The Golden Koi is a symbol of good fortune and perseverance in many cultures. It is a beautiful fish with scales that shimmer like gold, and is said to bring luck and prosperity to those who catch it. The Golden Koi is a creature of legend, with a beauty that transcends the physical world."
    },
    {
        name: "Ancient Dragon Fish",
        rarity: "legendary",
        baseValue: 500,
        locations: ["abyss", "river"],
        weightRange: { min: 100, max: 1000 },
        lengthRange: { min: 200, max: 800 },
        description: "Said to be as old as the mountains. Few have seen it and lived to tell.",
        lore: "The Ancient Dragon Fish is said to be as old as the mountains. Few have seen it and lived to tell the tale. It is a creature of immense power and wisdom, with scales that shimmer like precious gems. The Ancient Dragon Fish is a symbol of longevity and good fortune, and is said to bring prosperity to those who catch it."
    },
    // Add more legendary fish here
];

// Mythic Fish
const MYTHIC_FISH = [
    {
        name: "Kraken",
        rarity: "mythic",
        baseValue: 1000,
        locations: ["abyss", "ocean"],
        weightRange: { min: 500, max: 5000 },
        lengthRange: { min: 500, max: 2000 },
        description: "Not actually a fish, but a legendary sea monster from the deepest abyss.",
        lore: "The Kraken's origins are shrouded in mystery. Said to dwell in the deepest parts of the ocean, many sailors refuse to speak its name for fear of summoning this colossal beast. Some witnesses claim it can drag entire ships beneath the waves, while others insist it's merely a larger-than-average octopus whose size has been exaggerated through generations of retelling."
    },
    {
        name: "Rainbow Shark",
        rarity: "mythic",
        baseValue: 800,
        locations: ["coral_reef", "cosmic_sea"],
        weightRange: { min: 50, max: 300 },
        lengthRange: { min: 100, max: 300 },
        description: "A shark that's said to bring good luck to those who see it.",
        lore: "A sassy shark that is said to taste amazing. It is beautiful to see and is said to bring protection to those who see it. In mythos the shark is regarded as a protector of respectful sailors."
    },
    // Add more mythic fish here
];

// Chimerical Fish
const CHIMERICAL_FISH = [
    {
        name: "Dimensional Leviathan",
        rarity: "chimerical",
        baseValue: 5000,
        locations: ["vortex", "temporal_tide"],
        weightRange: { min: 1000, max: 10000 },
        lengthRange: { min: 1000, max: 5000 },
        description: "A creature that defies the laws of physics. It's said to exist in multiple dimensions at once.",
        lore: "The lord of the Leviathans, this creature fractures physics and warps dimensions. It is said to repair the dimensions it enters, but at the cost of the life of the creature. It is said to be the most powerful creature in the ocean."
    },
    {
        name: "Paradox Whale",
        rarity: "chimerical",
        baseValue: 4500,
        locations: ["temporal_tide"],
        weightRange: { min: 2000, max: 15000 },
        lengthRange: { min: 2000, max: 7000 },
        description: "A whale that's said to swim through time as easily as water.",
        lore: "A whale that appears to fix timelines and paradoxes. Ancient literature say that, when you catch a Paradox Whale, you will forget ever catching it. Sailors find themselves forgetting the entire day they caught it, and the fish is always gone."
    },
    // Add more chimerical fish here
];

// Seasonal Fish
const SEASONAL_FISH = [
    {
        name: "Cherry Salmon",
        rarity: "seasonal",
        baseValue: 150,
        locations: ["river", "lake"],
        weightRange: { min: 2, max: 10 },
        lengthRange: { min: 30, max: 80 },
        seasonal: "spring",
        description: "A fish that's said to bring good luck in the spring.",
        lore: "The Cherry Salmon appears only during spring, when cherry blossoms are in full bloom. Its scales have a subtle pink hue that matches the cherry trees. In Japan, catching this fish during the Hanami season is considered especially fortunate."
    },
    {
        name: "Sunfish Prime",
        rarity: "seasonal",
        baseValue: 180,
        locations: ["ocean"],
        weightRange: { min: 200, max: 1000 },
        lengthRange: { min: 170, max: 300 },
        seasonal: "summer",
        description: "A fish that's at the peak of its power in the summer.",
        lore: "Unlike the regular Sunfish, the Sunfish Prime appears only during the hottest days of summer. It seems to absorb the sun's energy, making its body almost too bright to look at directly. Old sailors claim these fish can create small heat waves in the water around them."
    },
    // Add more seasonal fish here
];

// Junk Items
const JUNK_ITEMS = [
    {
        name: "Old Boot",
        rarity: "junk",
        baseValue: 2,
        description: "A discarded boot that's been underwater for years.",
        lore: "This weathered boot has been home to various aquatic creatures over the years. Some fishermen consider finding an old boot lucky - at least you caught something!"
    },
    {
        name: "Rusty Can",
        rarity: "junk",
        baseValue: 1,
        description: "An old can that's been corroded by the sea.",
        lore: "Once containing food or drink, this can has become part of the underwater landscape. Environmentalists often organize cleanup events to remove such items from water bodies."
    },
    // Add more junk items here
];

// Combine all fish categories into one accessible object
const FISH_DATA = {
    common: COMMON_FISH,
    uncommon: UNCOMMON_FISH,
    rare: RARE_FISH,
    legendary: LEGENDARY_FISH,
    mythic: MYTHIC_FISH,
    chimerical: CHIMERICAL_FISH,
    seasonal: SEASONAL_FISH,
    junk: JUNK_ITEMS,
    colors: RARITY_COLORS,
    locations: FISHING_LOCATIONS,
    seasons: SEASONS
};

// Helper function to get all fish
function getAllFish() {
    const allFish = [];
    
    for (const category in FISH_DATA) {
        if (Array.isArray(FISH_DATA[category])) {
            FISH_DATA[category].forEach(fish => {
                allFish.push({
                    ...fish,
                    category: category
                });
            });
        }
    }
    
    return allFish;
}

// Export the data
window.FISH_DATA = FISH_DATA;
window.getAllFish = getAllFish;
