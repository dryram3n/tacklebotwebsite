// Colors used for different fish rarities (matches the Discord bot)
const RARITY_COLORS = {
    common: '#ddbea9',
    uncommon: '#98d4bb',
    rare: '#98bcd4',
    legendary: '#f4cc71',
    mythic: '#c79de0',
    chimerical: '#cd7ae2',
    special: '#ffdb58', // Kept for potential future use
    seasonal: '#f08080',
    junk: '#a9a9a9'
};

// Fishing location details (using updated display names)
const FISHING_LOCATIONS = {
    pond: { displayName: "Tranquil Pond", emoji: "🏞️" },
    river: { displayName: "Rushing River", emoji: "🌊" },
    lake: { displayName: "Misty Lake", emoji: "⛰️" },
    ocean: { displayName: "Deep Ocean", emoji: "🌊" },
    coral_reef: { displayName: "Coral Reef", emoji: "🪸" },
    abyss: { displayName: "The Abyss", emoji: "🕳️" },
    sunken_city: { displayName: "Sunken City", emoji: "🏙️" },
    vortex: { displayName: "Mystic Vortex", emoji: "🌀" },
    cosmic_sea: { displayName: "Cosmic Sea", emoji: "✨" },
    temporal_tide: { displayName: "Temporal Tide", emoji: "⏳" },
    fishverse: { displayName: "Fishverse", emoji: "🌌" }
};

// Season details
const SEASONS = {
    spring: { name: "Spring", displayEmoji: "🌸" },
    summer: { name: "Summer", displayEmoji: "☀️" },
    fall: { name: "Fall", displayEmoji: "🍂" },
    winter: { name: "Winter", displayEmoji: "❄️" }
};

// --- Fish Data Definitions ---
// Note: Rarity chances mentioned are approximate base chances before modifiers/luck.

// Common Fish (~50% base chance)
const COMMON_FISH = [
    {
        name: "Common Carp",
        rarity: "common",
        baseValue: 10,
        weightRange: { min: 1, max: 15 },
        lengthRange: { min: 20, max: 55 },
        locations: ["pond", "river", "lake", "fishverse"],
        description: "A hardy fish found in freshwater ponds and lakes.",
        lore: "The Common Carp is one of a kind, and is often found in ponds and lakes. It is a popular fish for beginners to catch."
    },
    {
        name: "Dark Carp",
        rarity: "common",
        baseValue: 15,
        weightRange: { min: 5, max: 35 },
        lengthRange: { min: 30, max: 80 },
        locations: ["coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A shadowy variant that thrives in the darkest waters. Its eyes glow faintly.",
        lore: "Unlike their more common cousins, the Dark Carp is a viscious predator that loves to eat its own kind. They are often found in the darkest, most secluded parts of the water, where they can ambush unsuspecting prey. Their eyes glow faintly in the dark, giving them an eerie appearance that has earned them a fearsome reputation among fishermen."
    },
    {
        name: "Minnow",
        rarity: "common",
        baseValue: 1,
        weightRange: { min: 0.1, max: 1 },
        lengthRange: { min: 5, max: 10 },
        locations: ["pond", "fishverse", "lake"],
        description: "Tiny and quick, often used as bait.",
        lore: "The Minnow is a small, silvery fish that is often used as bait by fishermen. They are known for their quick movements and their ability to evade capture. Minnows are an important part of the aquatic food chain, serving as prey for larger fish and birds."
    },
    {
        name: "Dark Minnow",
        rarity: "common",
        baseValue: 5,
        weightRange: { min: 0.2, max: 1 },
        lengthRange: { min: 8, max: 14 },
        locations: ["coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A small fish that prefers the shadows. It uses others for bait.",
        lore: "The Dark Minnow is a small, shadowy fish that prefers to stay hidden in the depths of the water. It is known for its elusive nature and its ability to blend in with its surroundings. Dark Minnows are often used as bait by fishermen, who prize them for their ability to attract larger fish. They have an errie look in their eyes... s̷̫̙̻̝̀̃̕a̶̛̼̖͛̈́͂̋̍͛v̵͕͔̻̅e̴̡̪͑ ̴̛͖̦̌̔̐̀̃͂̕m̴̝̰̝̟͖̼͔̀̂ȇ̵̟͖̩̟̃̿͑͆̈͘"
    },
    {
        name: "Sardine",
        rarity: "common",
        baseValue: 8,
        weightRange: { min: 0.2, max: 1.5 },
        lengthRange: { min: 10, max: 20 },
        locations: ["pond", "ocean", "fishverse"],
        description: "A small, silvery fish that travels in large schools.",
        lore: "The Sardine is a small, silvery fish that travels in large schools. They are known for their oily flesh and their distinctive flavor. Sardines are an important part of the marine ecosystem, serving as prey for larger fish and marine mammals. They are also a popular food source for humans, who enjoy them fresh, canned, or smoked."
    },
    {
        name: "Hungry Sardine",
        rarity: "common",
        baseValue: 12,
        weightRange: { min: 0.1, max: 0.95 },
        lengthRange: { min: 1, max: 4 },
        locations: ["coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A sardine that's always looking for its next meal.",
        lore: "The Hungry Sardine is as thin as paper, but is always eating in massive schools. They are known to be quite the gluttons, and will eat anything in sight. They are often used as bait, but be careful, they might just eat your hook!"
    },
    {
        name: "Sunfish",
        rarity: "common",
        baseValue: 14,
        weightRange: { min: 0.8, max: 10 },
        lengthRange: { min: 18, max: 38 },
        locations: ["pond", "fishverse"],
        description: "Named for its round shape and golden scales.",
        lore: "The Sunfish is named for its round shape and golden scales. It is a peaceful fish that spends its days basking in the sun near the water's surface. Sunfish are known for their gentle nature and their ability to coexist peacefully with other fish. They are an important part of the aquatic ecosystem, serving as both predator and prey."
    },
    {
        name: "Bluegill",
        rarity: "common",
        baseValue: 7,
        weightRange: { min: 0.3, max: 5 },
        lengthRange: { min: 10, max: 25 },
        locations: ["pond", "river", "fishverse", "lake"],
        description: "A small, colorful fish with a distinctive black spot on its gill cover.",
        lore: "The Bluegill is a small, colorful fish that is native to North America. It is known for its distinctive black spot on its gill cover, which gives it its name. Bluegills are popular among anglers for their fighting spirit and are often caught for sport. They are also an important part of the aquatic food chain, serving as prey for larger fish and birds."
    },
    {
        name: "Perch",
        rarity: "common",
        baseValue: 9,
        weightRange: { min: 0.4, max: 8 },
        lengthRange: { min: 15, max: 30 },
        locations: ["pond", "river", "fishverse", "lake"],
        description: "A predatory fish with sharp spines on its dorsal fin.",
        lore: "The Perch is a predatory fish with sharp spines on its dorsal fin. It is known for its aggressive behavior and its ability to catch small fish with ease. Perch are popular among anglers for their fighting spirit and are often caught for sport. They are an important part of the aquatic ecosystem, serving as both predator and prey."
    },
    {
        name: "Anchovy",
        rarity: "common",
        baseValue: 6,
        weightRange: { min: 0.1, max: 0.6 },
        lengthRange: { min: 8, max: 20 },
        locations: ["ocean", "fishverse"],
        description: "A small, oily fish that's often used in cooking.",
        lore: "Anchovies are small fish often used for bait or as a flavoring in cooking. They are known for their strong, salty taste and are a staple in many Mediterranean dishes. Despite their small size, anchovies are an important part of the marine ecosystem, serving as a food source for larger fish and marine mammals."
    },
    {
        name: "Mal Anchovy",
        rarity: "common",
        baseValue: 8,
        weightRange: { min: 0.2, max: 1 },
        lengthRange: { min: 10, max: 20 },
        locations: ["ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A mischievous anchovy that enjoys playing pranks on other fish.",
        lore: "The Mal Anchovy is a mischievous little fish that enjoys playing pranks on other fish. They are known to steal bait from fishermen and lead them on wild chases through the water. Despite their small size, Mal Anchovies are clever and quick, making them a challenge to catch. They are often found in schools, where they work together to outsmart their predators."
    },
    {
        name: "Blobfish",
        rarity: "common",
        baseValue: 15,
        weightRange: { min: 1, max: 3 },
        lengthRange: { min: 10, max: 30 },
        locations: ["abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A deep-sea fish with a gelatinous body and a face only a mother could love.",
        lore: "The Blobfish is a deep-sea fish that lives at depths of up to 900 meters. Its gelatinous body allows it to withstand the immense pressure of the deep ocean, but it looks quite different when brought to the surface. Due to the change in pressure, the Blobfish's body loses its shape and appears like a blob. Despite its unattractive appearance, the Blobfish is an important part of the deep-sea ecosystem."
    }
];

// Uncommon fish (~25% base chance)
const UNCOMMON_FISH = [
    {
        name: "Rainbow Trout",
        rarity: "uncommon",
        baseValue: 25,
        weightRange: { min: 0.5, max: 12 },
        lengthRange: { min: 15, max: 44 },
        locations: ["river", "fishverse", "lake"],
        description: "Recognized by its colorful patterns.",
        lore: "The Rainbow Trout is recognized by its colorful patterns and its distinctive pink stripe. It is a popular game fish known for its size and its fighting spirit when hooked. Rainbow Trout are found in freshwater rivers and lakes and are prized by anglers for their beauty and taste."
    },
    {
        name: "Bass",
        rarity: "uncommon",
        baseValue: 30,
        weightRange: { min: 1, max: 10 },
        lengthRange: { min: 20, max: 45 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "Known for its fighting spirit when hooked.",
        lore: "The Bass is a popular game fish known for its fighting spirit when hooked. It is prized by anglers for its size and strength, making it a challenging catch. Bass are found in both freshwater and saltwater environments and are known for their aggressive behavior and their ability to strike at fast-moving prey."
    },
    {
        name: "Catfish",
        rarity: "uncommon",
        baseValue: 35,
        weightRange: { min: 1, max: 20 },
        lengthRange: { min: 25, max: 85 },
        locations: ["pond", "river", "fishverse", "lake"],
        description: "A bottom-dwelling fish with barbels around its mouth.",
        lore: "The Catfish is a bottom-dwelling fish with barbels around its mouth that resemble a cat's whiskers. It is known for its whisker-like barbels and its ability to detect prey in murky waters. Catfish are popular among anglers for their size and their tasty flesh."
    },
    {
        name: "Mackeral", // Often spelled Mackerel
        rarity: "uncommon",
        baseValue: 28,
        weightRange: { min: 0.8, max: 12 },
        lengthRange: { min: 25, max: 45 },
        locations: ["ocean", "fishverse"],
        description: "A fast-swimming fish that's popular in many cuisines.",
        lore: "The Mackeral is a fast-swimming fish that is popular in many cuisines. It is known for its oily flesh and its distinctive flavor. Mackeral are found in both temperate and tropical waters and are an important part of the marine ecosystem."
    },
    {
        name: "Pike",
        rarity: "uncommon",
        baseValue: 32,
        weightRange: { min: 1.5, max: 8 },
        lengthRange: { min: 30, max: 95 },
        locations: ["pond", "river", "fishverse"],
        description: "A fierce predator with sharp teeth and a long body.",
        lore: "The Pike is a fierce predator with sharp teeth and a long body. It is known for its aggressive behavior and its ability to strike at fast-moving prey. Pike are popular among anglers for their size and their fighting spirit when hooked."
    },
    {
        name: "Snapper",
        rarity: "uncommon",
        baseValue: 38,
        weightRange: { min: 1, max: 10 },
        lengthRange: { min: 20, max: 50 },
        locations: ["ocean", "fishverse"],
        description: "A popular game fish with a distinctive red color.",
        lore: "The Snapper is a popular game fish with a distinctive red color and a mild, sweet flavor. It is prized by anglers for its size and its fighting spirit when hooked. Snapper are found in both tropical and temperate waters and are an important part of the marine ecosystem."
    },
    {
        name: "Crappie",
        rarity: "uncommon",
        baseValue: 22,
        weightRange: { min: 0.3, max: 6 },
        lengthRange: { min: 15, max: 45 },
        locations: ["pond", "river", "fishverse"],
        description: "A small fish with a funny name and a tasty reputation.",
        lore: "The Crappie is a small fish with a funny name and a tasty reputation. It is known for its delicate flavor and its flaky white flesh. Crappie are popular among anglers for their size and their fighting spirit when hooked."
    },
    {
        name: "Luminous Eel",
        rarity: "uncommon",
        baseValue: 40,
        weightRange: { min: 0.5, max: 6 },
        lengthRange: { min: 30, max: 120 },
        locations: ["abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A bioluminescent creature that glows in the dark.",
        lore: "The Luminous Eel is a bioluminescent creature that glows in the dark. It is known for its long, slender body and its ability to generate light through a chemical reaction in its skin. Luminous Eels are found in deep-sea environments where they use their glowing bodies to attract prey and communicate with other eels."
    },
    {
        name: "Alluring Mermaid",
        rarity: "uncommon",
        baseValue: 80,
        weightRange: { min: 4, max: 9 },
        lengthRange: { min: 18, max: 32 },
        locations: ["abyss", "vortex", "fishverse"],
        description: "A mysterious figure that's said to lure sailors to their doom.",
        lore: "A beautiful woman with a fish tail, the Alluring Mermaid is said to lure sailors to their doom with her enchanting voice and mesmerizing beauty. Legends tell of sailors who have followed her siren song to their deaths, only to find themselves trapped in her underwater kingdom forever."
    },
    {
        name: "Transparant Shark", // Often spelled Transparent
        rarity: "uncommon",
        baseValue: 125,
        weightRange: { min: 20, max: 55 },
        lengthRange: { min: 25, max: 55 },
        locations: ["abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A ghostly shark that's barely visible in the water.",
        lore: "The Transparant Shark is a ghostly shark that's barely visible in the water. It is known for its translucent appearance and its ability to blend in with its surroundings. It is extremely kind and rare, having no teeth and more resembling a whale than a shark."
    },
];

// Rare fish (~15% base chance)
const RARE_FISH = [
    {
        name: "Salmon",
        rarity: "rare",
        baseValue: 50,
        weightRange: { min: 2, max: 18 },
        lengthRange: { min: 25, max: 75 },
        locations: ["river", "ocean", "coral_reef", "fishverse"],
        description: "Remarkable for swimming upstream to spawn.",
        lore: "The Salmon is remarkable for swimming upstream to spawn. It is known for its distinctive pink flesh and its ability to leap over obstacles in the water. Salmon are an important part of the aquatic ecosystem, serving as prey for bears, eagles, and other marine life."
    },
    {
        name: "Tuna",
        rarity: "rare",
        baseValue: 45,
        weightRange: { min: 2, max: 20 },
        lengthRange: { min: 30, max: 85 },
        locations: ["ocean", "coral_reef", "fishverse"],
        description: "A large, powerful fish that's prized for its meat.",
        lore: "The Tuna is a large, powerful fish that's prized for its meat. It is known for its speed and strength in the water, as well as its distinctive flavor. Tuna are found in both tropical and temperate waters and are an important part of the marine ecosystem."
    },
    {
        name: "Swordfish",
        rarity: "rare",
        baseValue: 75,
        weightRange: { min: 4, max: 34 },
        lengthRange: { min: 40, max: 150 },
        locations: ["ocean", "fishverse"],
        description: "Named for its long, sword-like bill.",
        lore: "The Swordfish is named for its long, sword-like bill. It is known for its speed and agility in the water, as well as its distinctive appearance. Swordfish are found in tropical and temperate waters and are prized by anglers for their size and their fighting spirit when hooked."
    },
    {
        name: "Barracuda",
        rarity: "rare",
        baseValue: 60,
        weightRange: { min: 2.5, max: 35 },
        lengthRange: { min: 35, max: 150 },
        locations: ["abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A fearsome predator with sharp teeth and a sleek body.",
        lore: "The Barracuda is a fearsome predator with sharp teeth and a sleek body. It is known for its aggressive behavior and its ability to strike at fast-moving prey. Barracuda are popular among anglers for their size and their fighting spirit when hooked."
    },
    {
        name: "Piranha",
        rarity: "rare",
        baseValue: 65,
        weightRange: { min: 0.5, max: 8 },
        lengthRange: { min: 15, max: 45 },
        locations: ["river", "pond", "fishverse", "lake"],
        description: "A small but aggressive fish with razor-sharp teeth.",
        lore: "The Piranha is a small but aggressive fish with razor-sharp teeth. It is known for its ferocious behavior and its ability to strip prey to the bone in seconds. Piranhas are found in the rivers and lakes of South America and are feared by swimmers and fishermen alike."
    },
    {
        name: "Pufferfish",
        rarity: "rare",
        baseValue: 55,
        weightRange: { min: 0.3, max: 10 },
        lengthRange: { min: 10, max: 120 },
        locations: ["ocean", "fishverse"],
        description: "Inflates itself when threatened to appear larger and more dangerous.",
        lore: "The Pufferfish is a small fish that inflates itself when threatened to appear larger and more dangerous. It is known for its ability to puff up like a balloon and its toxic flesh, which can be deadly if not prepared properly. Pufferfish are found in tropical and subtropical waters and are an important part of the marine ecosystem."
    },
    {
        name: "Mahi Mahi",
        rarity: "rare",
        baseValue: 70,
        weightRange: { min: 3, max: 24 },
        lengthRange: { min: 40, max: 140 },
        locations: ["ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A colorful fish that's popular in sport fishing.",
        lore: "The Mahi Mahi is a colorful fish that's popular in sport fishing. It is known for its bright colors and its distinctive shape. Mahi Mahi are found in tropical and subtropical waters and are prized by anglers for their size and their acrobatic leaps when hooked."
    },
    {
        name: "Giant Sturgeon",
        rarity: "rare",
        baseValue: 85,
        weightRange: { min: 10, max: 100 },
        lengthRange: { min: 80, max: 250 },
        locations: ["river", "fishverse", "lake"],
        description: "A massive fish that's been swimming in these waters for centuries.",
        lore: "The Giant Sturgeon is a massive fish that's been swimming in these waters for centuries. It is known for its size and its longevity, with some individuals living for over 100 years. Giant Sturgeons are prized by anglers for their size and their fighting spirit when hooked."
    },
    {
        name: "Electric Ray",
        rarity: "rare",
        baseValue: 80,
        weightRange: { min: 2, max: 20 },
        lengthRange: { min: 30, max: 80 },
        locations: ["ocean", "abyss", "vortex", "fishverse"],
        description: "A fish that can generate an electric shock to stun its prey.",
        lore: "The Electric Ray is a fish that can generate an electric shock to stun its prey. It is known for its ability to produce electricity through special organs in its body. Electric Rays are found in both tropical and temperate waters and are an important part of the marine ecosystem."
    },
    {
        name: "Crystal Carp",
        rarity: "rare",
        baseValue: 90,
        weightRange: { min: 1, max: 14 },
        lengthRange: { min: 20, max: 95 },
        locations: ["coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A rare fish with scales that shimmer like crystal.",
        lore: "The Crystal Carp is a rare fish with scales that shimmer like crystal. It is known for its beauty and its mystical properties. Crystal Carps are said to bring good luck to those who catch them and are prized by collectors for their rarity."
    },
    {
        name: "Crawfish",
        rarity: "rare",
        baseValue: 40,
        weightRange: { min: 0.5, max: 15 },
        lengthRange: { min: 5, max: 20 },
        locations: ["pond", "river", "fishverse", "lake"],
        description: "A small crustacean that's often used as bait.",
        lore: "The Crawfish is a small crustacean that is often used as bait by fishermen. It is known for its bright red color and its ability to burrow into the mud. Crawfish are an important part of the aquatic food chain, serving as prey for larger fish and birds."
    },
    {
        name: "Snail",
        rarity: "rare",
        baseValue: 30,
        weightRange: { min: 0.1, max: 1 },
        lengthRange: { min: 1, max: 5 },
        locations: ["pond", "river", "fishverse", "lake"],
        description: "A slow-moving creature that's often found clinging to rocks.",
        lore: "The Snail is a slow-moving creature that's often found clinging to rocks. It is known for its spiral shell and its ability to retract into its shell for protection. Snails are an important part of the aquatic ecosystem, serving as food for fish and birds."
    }
];

// Legendary fish (~5% base chance)
const LEGENDARY_FISH = [
    {
        name: "Golden Koi",
        rarity: "legendary",
        baseValue: 100,
        weightRange: { min: 3, max: 24 },
        lengthRange: { min: 30, max: 100 },
        locations: ["pond", "river", "sunken_city", "fishverse", "lake"],
        description: "A symbol of good fortune and perseverance in many cultures.",
        lore: "The Golden Koi is a symbol of good fortune and perseverance in many cultures. It is a beautiful fish with scales that shimmer like gold, and is said to bring luck and prosperity to those who catch it. The Golden Koi is a creature of legend, with a beauty that transcends the physical world."
    },
    {
        name: "Gar",
        rarity: "legendary",
        baseValue: 110,
        weightRange: { min: 5, max: 30 },
        lengthRange: { min: 30, max: 100 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A prehistoric fish with a long, slender body and sharp teeth.",
        lore: "The Gar is a prehistoric fish with a long, slender body and sharp teeth. It is known for its aggressive behavior and its ability to survive in harsh conditions. Gars are an important part of the aquatic ecosystem, serving as both predator and prey."
    },
    {
        name: "Giant Catfish",
        rarity: "legendary",
        baseValue: 150,
        weightRange: { min: 10, max: 100 },
        lengthRange: { min: 80, max: 200 },
        locations: ["pond", "river", "fishverse", "lake"],
        description: "A massive catfish that's said to eat humans whole.",
        lore: "The Giant Catfish is a massive catfish that's said to eat humans whole. It is a fearsome predator with sharp teeth and a voracious appetite. The Giant Catfish is a creature of legend, with a reputation that strikes fear into the hearts of fishermen and sailors."
    },
    {
        name: "Fish O Legend",
        rarity: "legendary",
        baseValue: 200,
        weightRange: { min: 5, max: 250 },
        lengthRange: { min: 5, max: 250 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A fish that's said to grant wishes to those who catch it.",
        lore: "The Fish O Legend is a fish that's said to grant wishes to those who catch it. It is a creature of immense power and mystery, with the ability to make dreams come true. The Fish O Legend is a symbol of hope and possibility, and is sought after by fishermen and adventurers alike."
    },
    {
        name: "Ancient Dragon Fish",
        rarity: "legendary",
        baseValue: 250,
        weightRange: { min: 100, max: 350 },
        lengthRange: { min: 125, max: 280 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "Said to be as old as the mountains. Few have seen it and lived to tell.",
        lore: "The Ancient Dragon Fish is said to be as old as the mountains. Few have seen it and lived to tell the tale. It is a creature of immense power and wisdom, with scales that shimmer like precious gems. The Ancient Dragon Fish is a symbol of longevity and good fortune, and is said to bring prosperity to those who catch it."
    },
    {
        name: "Anglerfish",
        rarity: "legendary",
        baseValue: 120,
        weightRange: { min: 2, max: 50 },
        lengthRange: { min: 20, max: 150 },
        locations: ["abyss", "vortex", "fishverse"],
        description: "A deep-sea fish with a bioluminescent lure that attracts prey.",
        lore: "The Anglerfish is a deep-sea fish with a bioluminescent lure that attracts prey. It is known for its grotesque appearance and its ability to survive in the extreme conditions of the deep ocean. Anglerfish are an important part of the deep-sea ecosystem, serving as both predator and prey."
    },
    {
        name: "Ghostly Eel",
        rarity: "legendary",
        baseValue: 180,
        weightRange: { min: 8, max: 55 },
        lengthRange: { min: 70, max: 180 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "Appears translucent in moonlight. Some say it's the spirit of drowned sailors.",
        lore: "The Ghostly Eel is a translucent creature that appears only in moonlight. It is said to be the spirit of drowned sailors, haunting the waters in search of redemption. The Ghostly Eel is a mysterious and elusive creature, with a beauty that belies its tragic past."
    },
    {
        name: "Diamond Bass",
        rarity: "legendary",
        baseValue: 400,
        weightRange: { min: 5, max: 20 },
        lengthRange: { min: 40, max: 85 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "Its scales shimmer like precious gems. Extremely rare and valuable.",
        lore: "The Diamond Bass is a legendary fish with scales that shimmer like precious gems. It is said to be the most beautiful fish in the world, with a value that exceeds that of diamonds. The Diamond Bass is a symbol of pure luck."
    },
    {
        name: "Prismatic Shark",
        rarity: "legendary",
        baseValue: 500,
        weightRange: { min: 20, max: 100 },
        lengthRange: { min: 100, max: 200 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A shark that refracts light into a rainbow of colors.",
        lore: "The Prismatic Shark is a shark that refracts light into a rainbow of colors. It is a creature of immense beauty and power, with the ability to mesmerize those who gaze upon it. The Prismatic Shark is a symbol of magic and wonder, and is said to bring good luck to those who encounter it."
    },
    {
        name: "Obsidian Marlin",
        rarity: "legendary",
        baseValue: 275,
        weightRange: { min: 15, max: 80 },
        lengthRange: { min: 90, max: 180 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A sleek jet-black fish that's said to bring bad luck to those who see it.",
        lore: "The Obsidian Marlin is a sleek jet-black fish that's said to bring bad luck to those who see it. It is a creature of darkness and mystery, with a reputation that strikes fear into the hearts of sailors and fishermen. The Obsidian Marlin is a symbol of danger and death, and is best avoided by those who value their lives."
    },
    {
        name: "Gilded Coelacanth",
        rarity: "legendary",
        baseValue: 280,
        weightRange: { min: 10, max: 50 },
        lengthRange: { min: 60, max: 150 },
        locations: ["abyss", "vortex", "fishverse"],
        description: "A living fossil with scales of pure gold.",
        lore: "The Gilded Coelacanth is a living fossil with scales of pure gold. It is said to be a creature of immense value and power, with the ability to bring wealth and prosperity to those who catch it. The Gilded Coelacanth is a symbol of abundance and good fortune."
    },
    {
        name: "Ethereal Seahorse",
        rarity: "legendary",
        baseValue: 230,
        weightRange: { min: 0.5, max: 5 },
        lengthRange: { min: 20, max: 50 },
        locations: ["vortex", "fishverse"],
        description: "A mystical creature that's said to carry dreams on its back.",
        lore: "The Ethereal Seahorse is a mystical creature that's said to carry dreams on its back. It is a symbol of imagination and creativity, with a beauty that transcends the physical world. The Ethereal Seahorse is a rare and elusive creature, appearing only to those who believe in its magic."
    }
];

// Mythic fish (~1% base chance)
const MYTHIC_FISH = [
    {
        name: "Kraken",
        rarity: "mythic",
        baseValue: 750,
        weightRange: { min: 50, max: 800 },
        lengthRange: { min: 10, max: 300 },
        locations: ["vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "Not actually a fish, but a legendary sea monster from the deepest abyss.",
        lore: "The Kraken's origins are shrouded in mystery. Said to dwell in the deepest parts of the ocean, many sailors refuse to speak its name for fear of summoning this colossal beast. Some witnesses claim it can drag entire ships beneath the waves, while others insist it's merely a larger-than-average octopus whose size has been exaggerated through generations of retelling."
    },
    {
        name: "Rainbow Shark",
        rarity: "mythic",
        baseValue: 1000,
        weightRange: { min: 30, max: 300 },
        lengthRange: { min: 25, max: 150 },
        locations: ["cosmic_sea", "temporal_tide", "fishverse"],
        description: "A shark that's said to bring good luck to those who see it.",
        lore: "A sassy shark that is said to taste amazing. It is beautiful to see and is said to bring protection to those who see it. In mythos the shark is regarded as a protector of respectful sailors."
    },
    {
        name: "Celestial Whale",
        rarity: "mythic",
        baseValue: 1200,
        weightRange: { min: 100, max: 1000 },
        lengthRange: { min: 200, max: 500 },
        locations: ["vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A whale that's said to swim among the stars.",
        lore: "The Celestial Whale is a whale that's said to swim among the stars. It's a creature of immense power and mystery, with the ability to traverse the cosmos. The Celestial Whale is a symbol of the heavens, and is said to bring the call of the end."
    },
    {
        name: "Starlight Jellyfish",
        rarity: "mythic",
        baseValue: 550,
        weightRange: { min: 5, max: 20 },
        lengthRange: { min: 10, max: 500 },
        locations: ["vortex", "fishverse"],
        description: "A glowing jellyfish that's said to guide lost sailors home.",
        lore: "A glowing jellyfish that has been recorded to guide lost sailors home. It is unkown why they do this, and scientists are baffled. They have never been known to sting a human, and rather tickle them."
    },
    {
        name: "Phoenix Fish",
        rarity: "mythic",
        baseValue: 1600,
        weightRange: { min: 10, max: 50 },
        lengthRange: { min: 60, max: 120 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A fish that's reborn from its own ashes. A symbol of renewal and rebirth.",
        lore: "Reborn from an under water volcano, the Phoenix Fish is regarded as a symbol of renewal and growth. This species of fish evolved inside an active volcano becoming heavily resistant to heat. They are said to taste amazing but are illegal to eat due to a strange effect they have on the human body."
    },
    {
        name: "Galactic Ray",
        rarity: "mythic",
        baseValue: 700,
        weightRange: { min: 20, max: 800 },
        lengthRange: { min: 70, max: 150 },
        locations: ["vortex", "fishverse"],
        description: "A fish that's said to have traveled through the stars.",
        lore: "The Galactic Ray is a fish that's said to have traveled through the stars. It's a creature of immense beauty and power, with the ability to refract light into a rainbow of colors. The Galactic Ray is a symbol of the cosmos, and is said to bring good luck to those who encounter it."
    },
    {
        name: "Void Leviathan",
        rarity: "mythic",
        baseValue: 1000,
        weightRange: { min: 150, max: 5000 },
        lengthRange: { min: 300, max: 8000 },
        locations: ["cosmic_sea", "temporal_tide", "fishverse"],
        description: "A creature from the darkest depths of the ocean. Its gaze is said to drive sailors mad",
        lore: "An unkown creature that appeared from the darkest depths of the ocean. It is said when one is found in the waters, that a cataclysmic event is soon to follow. It is said to drive sailors mad with its gaze."
    },
    {
        name: "Benihana HotFish",
        rarity: "mythic",
        baseValue: 1000,
        weightRange: { min: 69, max: 420 },
        lengthRange: { min: 69, max: 420 },
        locations: ["vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A fish that's always on fire. Literally.",
        lore: "The Benihana HotFish is a fish that's always on fire. Literally. It's unclear how it got this way, but it's a sight to behold. It's said that the Benihana HotFish can cook its own meals with its fiery body. The water steams around it as the flames never really go out."
    },
    {
        name: "NO NAME",
        rarity: "mythic",
        baseValue: 5,
        weightRange: { min: 1, max: 1 },
        lengthRange: { min: 1, max: 1 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A fish that's so mysterious, it doesn't even have a name.",
        lore: "A fish with no name. Scientists have tried doing research on it, but the fish always seems to poof out of existence. It's said that the fish is so mysterious, it doesn't even have a name. It's a mystery that may never be solved."
    },
    {
        name: "Aesthetic Spartan on a Fish",
        rarity: "mythic",
        baseValue: 10000,
        weightRange: { min: 1000, max: 5000 },
        lengthRange: { min: 1000, max: 5000 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "We don't know how he got in the game, but he's here.",
        lore: "A mysterious figure that's said to be a Spartan warrior riding a fish. It's unclear how he got into the game, but he's here, and he's ready to fight. He also eat's a lot of bananas..."
    },
    {
        name: "Goldie",
        rarity: "mythic",
        baseValue: 27,
        weightRange: { min: 5000, max: 5000 },
        lengthRange: { min: 5000, max: 5000 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A fish that's worth its weight in gold. (Not really, but it's shiny!)",
        lore: "A gigantic goldfish that survived off eating gold in a sewer. It's scales adapted the gold look and was carried down via the gene pool. At first thought to be worth its weight in gold, it was quickly found to be worthless. Both its scales fake gold, and its meat poisonous."
    },
    {
        name: "Ribbity",
        rarity: "mythic",
        baseValue: 500,
        weightRange: { min: 0.5, max: 50 },
        lengthRange: { min: 0.6, max: 20 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A frog that's pretending to be a fish. Don't tell it the truth.",
        lore: "A strange frog that believes it is a fish and wears a fish costume made of fish parts. It has shown advanced thinking similar to humans and is said to be able to communicate with humans. It's a strange creature that is obsessed with fish."
    },
    {
        name: "Stained Glass Fish",
        rarity: "mythic",
        baseValue: 200,
        weightRange: { min: 1, max: 100 },
        lengthRange: { min: 1, max: 100 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A fish that's as colorful as a stained glass window.",
        lore: "A fish that not only resembles a stained glass window, but is of the same material. It is said that this fish would be found by those selected to save the world. It is very valuable."
    },
];

// Chimerical fish (~0.3% base chance - rarest)
const CHIMERICAL_FISH = [
    {
        name: "Dimensional Leviathan",
        rarity: "chimerical",
        baseValue: 5000,
        weightRange: { min: 50, max: 800 },
        lengthRange: { min: 150, max: 300 },
        locations: ["vortex", "pond", "river", "ocean", "abyss", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A creature that defies the laws of physics. It's said to exist in multiple dimensions at once.",
        lore: "The lord of the Leviathans, this creature fractures physics and warps dimensions. It is said to repair the dimensions it enters, but at the cost of the life of the creature. It is said to be the most powerful creature in the ocean."
    },
    {
        name: "Paradox Whale",
        rarity: "chimerical",
        baseValue: 6500,
        weightRange: { min: 80, max: 800 },
        lengthRange: { min: 25, max: 350 },
        locations: ["abyss", "vortex", "temporal_tide", "fishverse"],
        description: "A whale that's said to swim through time as easily as water.",
        lore: "A whale that appears to fix timelines and paradoxes. Ancient literature say that, when you catch a Paradox Whale, you will forget ever catching it. Sailors find themselves forgetting the entire day they caught it, and the fish is always gone."
    },
    {
        name: "Quantum Kraken",
        rarity: "chimerical",
        baseValue: 5500,
        weightRange: { min: 100, max: 800 },
        lengthRange: { min: 25, max: 400 },
        locations: ["vortex", "temporal_tide", "fishverse"],
        description: "A creature that's both here and not here at the same time.",
        lore: "A mystery to science, the Quantum Kraken is said to exist everywhere and no where at the same time. It is considered to be Cthulhu or of kin to him. Religious scholars say that the Quantum Kraken is the end of days, and that it will bring the end."
    },
    {
        name: "Reality Ripper",
        rarity: "chimerical",
        baseValue: 8500,
        weightRange: { min: 20, max: 800 },
        lengthRange: { min: 50, max: 200 },
        locations: ["abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A fish that's said to tear holes in the fabric of reality.",
        lore: "A fish that is pure evil and rips through all reality. Legendary anglers say that once caught a universe is reborn. Some believe if enough are caught, you could time travel."
    },
    {
        name: "Time Serpent",
        rarity: "chimerical",
        baseValue: 9750,
        weightRange: { min: 40, max: 800 },
        lengthRange: { min: 50, max: 320 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A serpent that's said to be as old as time itself.",
        lore: "A mysterious serpent that pulls anglers back to their realities. It is considered very valuable as the creature sheds its skin to escape leaving behind a value skin that can be used for time travel."
    },
    {
        name: "Cosmic Angler",
        rarity: "chimerical",
        baseValue: 10520,
        weightRange: { min: 15, max: 250 },
        lengthRange: { min: 50, max: 150 },
        locations: ["cosmic_sea", "temporal_tide", "fishverse"],
        description: "A fish that's said to lure stars from the sky.",
        lore: "A fish that is said to lure stars down for it and its kin to eat. This fish can only be found in mythical areas of legend. This fish has been known to communicate to humans via telepathy."
    },
    {
        name: "Void Maw",
        rarity: "chimerical",
        baseValue: 12500,
        weightRange: { min: 25, max: 500 },
        lengthRange: { min: 10, max: 600 },
        locations: ["cosmic_sea", "temporal_tide", "fishverse"],
        description: "A creature that devours light and matter alike.",
        lore: "A fish of pure despair and agony. Once caught a sliver of your soul vanishes. It is said that the fish is the key to the end of the world."
    },
    {
        name: "Star Devourer",
        rarity: "chimerical",
        baseValue: 11700,
        weightRange: { min: 500, max: 2000 },
        lengthRange: { min: 400, max: 1200 },
        locations: ["cosmic_sea", "temporal_tide", "fishverse"],
        description: "A fish that's said to consume entire galaxies.",
        lore: "A fish found via the hubble telescope. It was caught eating a small moon, and then traveling in and out of nearby black holes. It is said that the fish is the key to understanding the universe."
    },
    {
        name: "Goatfish",
        rarity: "chimerical",
        baseValue: 15000,
        weightRange: { min: 10250, max: 10250 },
        lengthRange: { min: 4000, max: 4000 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A fish that's half-goat, half-fish. It's not sure which it prefers.",
        lore: "A fish that wears a Cool Guy hat and sunglasses. It is said that he is the goat and a legend amongst its peers. It is said that he is the most popular fish in the ocean, and is the only fish that can speak to humans without them freaking out."
    },
    {
        name: "Goldie X",
        rarity: "chimerical",
        baseValue: 15000,
        weightRange: { min: 5000, max: 25000 },
        lengthRange: { min: 5000, max: 25000 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A mutated Goldie that's even shinier than the original.",
        lore: "A mutated Goldie that is much more angry and aggressive. Its face resembles that of a KISS band member. It is extremely poisonous but is built of a special molecule capable of powering cities for years. It is said that the fish is the key to the future."
    },
    {
        name: "Frogo",
        rarity: "chimerical",
        baseValue: 15000,
        weightRange: { min: 100, max: 1000 },
        lengthRange: { min: 100, max: 1000 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "Much like Ribbity, but with a more frog-like appearance.",
        lore: "Just like its cousin Ribbity, Frogo is a frog that believes it is a fish. It is much more intelligent than Ribbity, and is known to have casual conversations with humans, and translate the language of fish. When asked about why it wants to be a fish, most Frogo's respond with 'They are the ones who will save us all.'"
    },
    {
        name: "Toxic Sludge Fish",
        rarity: "chimerical",
        baseValue: 10000,
        weightRange: { min: 0.1, max: 1000 },
        lengthRange: { min: 0.1, max: 1000 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "Did you really think I was a body builder?",
        lore: "A fish mutated by the genes of Ronald Rizz. The fish loves body building and is found in a lot of under water gyms. It is said this fish is incapable of dying."
    }
];

// Seasonal fish (available only during specific seasons)
const SEASONAL_FISH = [
    // Spring
    {
        name: "Cherry Salmon",
        rarity: "rare", // Rarity confirmed from detailed list
        baseValue: 125,
        weightRange: { min: 2, max: 24 },
        lengthRange: { min: 30, max: 75 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        seasonal: "spring",
        description: "A fish that's said to bring good luck in the spring.",
        lore: "The Cherry Salmon appears only during spring, when cherry blossoms are in full bloom. Its scales have a subtle pink hue that matches the cherry trees. In Japan, catching this fish during the Hanami season is considered especially fortunate."
    },
    {
        name: "Rainbow Bloom",
        rarity: "legendary",
        baseValue: 500,
        weightRange: { min: 5, max: 25 },
        lengthRange: { min: 25, max: 75 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        seasonal: "spring",
        description: "A fish whose scales bloom with vibrant colors in spring.",
        lore: "This fish absorbs the essence of spring flowers, causing its scales to shift through a dazzling array of colors. It's said to only appear when the first spring flowers bloom after a long winter."
    },
    {
        name: "Spring Carp",
        rarity: "uncommon",
        baseValue: 45,
        weightRange: { min: 2, max: 25 },
        lengthRange: { min: 25, max: 65 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        seasonal: "spring",
        description: "A common carp variant that is more active during spring.",
        lore: "The Spring Carp emerges from its winter sluggishness with renewed vigor. They are known for their energetic leaps and are often seen near blooming water lilies."
    },
    {
        name: "Dark Cherry Bass",
        rarity: "common", // Rarity confirmed from detailed list
        baseValue: 25,
        weightRange: { min: 1, max: 10 },
        lengthRange: { min: 20, max: 50 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        seasonal: "spring",
        description: "A bass with dark scales and a hint of cherry blossom pink.",
        lore: "This elusive bass prefers the shaded areas beneath cherry trees overhanging the water. Its dark scales provide camouflage, but flashes of pink appear when it moves in the dappled sunlight."
    },
    {
        name: "Disaster Clam",
        rarity: "mythic",
        baseValue: 5000,
        weightRange: { min: 1, max: 5 },
        lengthRange: { min: 1, max: 5 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        seasonal: "spring",
        description: "A clam that seems to cause minor inconveniences when opened.",
        lore: "Legend says opening this clam brings about small, localized 'disasters' - a sudden gust of wind, a dropped fishing rod, a tangled line. It's debated whether it's truly cursed or just attracts clumsiness."
    },
    {
        name: "Lord Spring Fish",
        rarity: "chimerical",
        baseValue: 10000,
        weightRange: { min: 1000, max: 5000 },
        lengthRange: { min: 1000, max: 5000 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        seasonal: "spring",
        description: "An ancient entity embodying the chaotic energy of spring.",
        lore: "This powerful being awakens only in spring, its presence causing rapid growth and unpredictable weather. It's less a fish and more a force of nature, rarely seen and impossible to truly 'catch'."
    },
    // Summer
    {
        name: "Sunfish Prime",
        rarity: "legendary", // Rarity confirmed from detailed list
        baseValue: 130, // Value adjusted
        weightRange: { min: 8, max: 40 },
        lengthRange: { min: 25, max: 80 },
        locations: ["river", "pond", "ocean", "vortex", "abyss", "fishverse", "lake"],
        seasonal: "summer",
        description: "A fish that's at the peak of its power in the summer.",
        lore: "Unlike the regular Sunfish, the Sunfish Prime appears only during the hottest days of summer. It seems to absorb the sun's energy, making its body almost too bright to look at directly. Old sailors claim these fish can create small heat waves in the water around them."
    },
    {
        name: "Heat Eel",
        rarity: "rare",
        baseValue: 100,
        weightRange: { min: 3, max: 24 },
        lengthRange: { min: 70, max: 120 },
        locations: ["river", "pond", "ocean", "vortex", "abyss", "fishverse", "lake"],
        seasonal: "summer",
        description: "An eel that thrives in warm summer waters, radiating heat.",
        lore: "This eel prefers the warmest parts of the water, often found near thermal vents or sun-baked shallows. Touching it feels surprisingly warm, and it's said they can slightly raise the temperature of small ponds."
    },
    {
        name: "Golden Mackeral", // Often spelled Mackerel
        rarity: "uncommon",
        baseValue: 40,
        weightRange: { min: 1, max: 6 },
        lengthRange: { min: 20, max: 38 },
        locations: ["river", "pond", "ocean", "vortex", "abyss", "fishverse", "lake"],
        seasonal: "summer",
        description: "A mackerel variant with shimmering golden scales, active in summer.",
        lore: "Catching the sunlight, the Golden Mackerel flashes brilliantly as it darts through the water. They are most active during the long days of summer, feeding near the surface."
    },
    // Fall
    {
        name: "Autumn Koi",
        rarity: "rare",
        baseValue: 100,
        weightRange: { min: 4, max: 25 },
        lengthRange: { min: 35, max: 90 },
        locations: ["river", "pond", "ocean", "vortex", "abyss", "fishverse", "lake"],
        seasonal: "fall",
        description: "A koi with scales resembling fallen autumn leaves.",
        lore: "This beautiful koi's scales shift through hues of red, orange, and gold, perfectly mimicking the colors of fall foliage. They are often found swimming gracefully among fallen leaves on the water's surface."
    },
    {
        name: "Maple Trout",
        rarity: "legendary",
        baseValue: 220,
        weightRange: { min: 5, max: 90 },
        lengthRange: { min: 40, max: 85 },
        locations: ["river", "pond", "ocean", "vortex", "abyss", "fishverse", "lake"],
        seasonal: "fall",
        description: "A trout with patterns like maple leaves, appearing in autumn.",
        lore: "Said to taste faintly of maple syrup (though this is likely a myth), the Maple Trout is a prized catch in autumn. Its unique patterns make it highly sought after by collectors."
    },
    {
        name: "Ember Bass",
        rarity: "uncommon",
        baseValue: 45,
        weightRange: { min: 2, max: 15 },
        lengthRange: { min: 30, max: 55 },
        locations: ["river", "pond", "ocean", "vortex", "abyss", "fishverse", "lake"],
        seasonal: "fall",
        description: "A bass with fiery orange and red markings, active during fall.",
        lore: "This bass becomes particularly vibrant as the weather cools, its markings resembling glowing embers. They are known to be more aggressive during the fall feeding season."
    },
    // Winter
    {
        name: "Frost Bass",
        rarity: "rare",
        baseValue: 100,
        weightRange: { min: 3, max: 15 },
        lengthRange: { min: 25, max: 70 },
        locations: ["river", "pond", "ocean", "vortex", "abyss", "fishverse", "lake"],
        seasonal: "winter",
        description: "A bass with icy blue patterns, adapted to cold winter waters.",
        lore: "The Frost Bass thrives in near-freezing temperatures. Its scales have a crystalline structure that glitters like ice, and it moves sluggishly compared to its warmer-weather cousins."
    },
    {
        name: "Ice Marlin",
        rarity: "legendary",
        baseValue: 215,
        weightRange: { min: 15, max: 50 },
        lengthRange: { min: 100, max: 460 },
        locations: ["river", "pond", "ocean", "vortex", "abyss", "fishverse", "lake"],
        seasonal: "winter",
        description: "A marlin whose bill and fins seem to be made of solid ice.",
        lore: "An incredibly rare sight, the Ice Marlin is rumored to appear only during the coldest winters. Its icy bill is said to be sharp enough to cut through frozen surfaces. Catching one requires immense patience and luck."
    },
    {
        name: "Snow Flounder",
        rarity: "uncommon",
        baseValue: 35,
        weightRange: { min: 1, max: 5 },
        lengthRange: { min: 20, max: 40 },
        locations: ["river", "pond", "ocean", "vortex", "abyss", "fishverse", "lake"],
        seasonal: "winter",
        description: "A flounder with white camouflage, blending perfectly with snowy riverbeds.",
        lore: "This flounder adapts its coloration to match snowy or icy bottoms, making it nearly invisible. It buries itself just beneath the silt or snow, waiting to ambush smaller prey."
    }
];

// Junk Items (caught occasionally instead of fish)
const JUNK_ITEMS = [
    {
        name: "Old Boot",
        rarity: "junk", // Rarity is 'junk'
        baseValue: 1,
        weightRange: { min: 0.3, max: 0.8 },
        lengthRange: { min: 15, max: 25 },
        locations: ["pond", "river", "ocean", "lake"],
        description: "A discarded boot that's been underwater for years.",
        lore: "This weathered boot has been home to various aquatic creatures over the years. Some fishermen consider finding an old boot lucky - at least you caught something!"
    },
    {
        name: "Rusty Can",
        rarity: "junk",
        baseValue: 1,
        weightRange: { min: 0.1, max: 0.3 },
        lengthRange: { min: 10, max: 15 },
        locations: ["pond", "river", "ocean", "lake"],
        description: "An old can that's been corroded by the sea.",
        lore: "Once containing food or drink, this can has become part of the underwater landscape. Environmentalists often organize cleanup events to remove such items from water bodies."
    },
    {
        name: "Seaweed Clump",
        rarity: "junk",
        baseValue: 1,
        weightRange: { min: 0.2, max: 0.5 },
        lengthRange: { min: 20, max: 40 },
        locations: ["pond", "river", "ocean", "abyss", "vortex"],
        description: "A tangled mass of seaweed. Not very useful.",
        lore: "Just a bunch of seaweed. Sometimes small critters hide inside, but mostly it just gets tangled on your hook."
    },
    {
        name: "Plastic Bottle",
        rarity: "junk",
        baseValue: 1,
        weightRange: { min: 0.1, max: 0.2 },
        lengthRange: { min: 15, max: 25 },
        locations: ["pond", "river", "ocean"],
        description: "A plastic bottle floating aimlessly. Remember to recycle!",
        lore: "Sadly, a common sight in many waterways. Finding this is a reminder to keep our fishing spots clean."
    },
    {
        name: "Waterlogged Phone",
        rarity: "junk",
        baseValue: 3, // Slightly more valuable for the humor
        weightRange: { min: 0.1, max: 0.2 },
        lengthRange: { min: 12, max: 18 },
        locations: ["pond", "river", "ocean", "lake"],
        description: "Someone's unfortunate smartphone, now waterlogged.",
        lore: "Oops! Looks like someone had a bad day. Maybe there are some juicy secrets left on it? Probably not."
    },
    {
        name: "Rusted Fishing Hook",
        rarity: "junk",
        baseValue: 1,
        weightRange: { min: 0.05, max: 0.1 },
        lengthRange: { min: 5, max: 7 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "An old, rusted hook lost by another angler.",
        lore: "A reminder of past fishing attempts. Be careful, it might still be sharp!"
    },
    {
        name: "Ancient Flip Flop",
        rarity: "junk",
        baseValue: 2,
        weightRange: { min: 0.2, max: 0.4 },
        lengthRange: { min: 20, max: 30 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A single flip flop, looking quite ancient.",
        lore: "Where is its other half? A mystery lost to the depths. Perhaps it belonged to a legendary beachgoer."
    },
    {
        name: "Tangled Fishing Line",
        rarity: "junk",
        baseValue: 1,
        weightRange: { min: 0.1, max: 0.2 },
        lengthRange: { min: 50, max: 100 }, // Length represents the line length
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A frustrating tangle of someone else's fishing line.",
        lore: "The bane of many anglers. Untangling this mess is often more trouble than it's worth."
    },
    {
        name: "Micheal Mackeral", // Often spelled Mackerel
        rarity: "junk",
        baseValue: 1,
        weightRange: { min: 0.1, max: 0.3 },
        lengthRange: { min: 0.1, max: 0.3 },
        locations: ["pond", "river", "lake", "ocean", "coral_reef", "abyss", "sunken_city", "vortex", "cosmic_sea", "temporal_tide", "fishverse"],
        description: "A very tiny, insignificant mackerel. Probably not worth eating.",
        lore: "Is this even a real fish? It's so small! Maybe it's just a baby... or maybe it's just Micheal."
    }
];

// --- End Fish Data Definitions ---


// Combine all fish/item data into one main object for easy access
const FISH_DATA = {
    common: COMMON_FISH,
    uncommon: UNCOMMON_FISH,
    rare: RARE_FISH,
    legendary: LEGENDARY_FISH,
    mythic: MYTHIC_FISH,
    chimerical: CHIMERICAL_FISH,
    seasonal: SEASONAL_FISH,
    junk: JUNK_ITEMS,
    colors: RARITY_COLORS, // Rarity color map
    locations: FISHING_LOCATIONS, // Location details map
    seasons: SEASONS // Season details map
};

// Helper function to get a flat list of all fish/items
function getAllFish() {
    const allFish = [];
    const categoriesToInclude = ['common', 'uncommon', 'rare', 'legendary', 'mythic', 'chimerical', 'seasonal', 'junk'];

    categoriesToInclude.forEach(category => {
        if (FISH_DATA[category] && Array.isArray(FISH_DATA[category])) {
            FISH_DATA[category].forEach(fish => {
                // Add the category name to each fish object for easier filtering later
                allFish.push({
                    ...fish,
                    category: category // Ensure the category is explicitly part of the object
                });
            });
        } else {
            console.warn(`Category "${category}" not found or not an array in FISH_DATA.`);
        }
    });

    return allFish;
}

// Make the data globally accessible via the window object
window.FISH_DATA = FISH_DATA;
window.getAllFish = getAllFish;

// Log confirmation that data is loaded
console.log('FISH_DATA loaded successfully');