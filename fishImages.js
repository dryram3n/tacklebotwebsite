// Mapping of fish names to their image file paths
const FISH_IMAGES = {
    // Junk Items
    "Old Boot":"fishImages/Old Boot.png",
    "Rusty Can":"fishImages/Rusty Can.png",
    "Seaweed Clump":"fishImages/Seaweed Clump.png",
    "Plastic Bottle":"fishImages/Plastic Bottle.png",
    "Watterlogged Phone":"fishImages/Watterlogged Phone.png",
    "Rusted Fishing Hook":"fishImages/Rusted Fishing Hook.png",
    "Ancient Flip Flop":"fishImages/Ancient FlipFlop.png",
    "Tangled Fishing Line":"fishImages/Tangled Fishing Line.png",
    "Micheal Mackeral":"fishImages/Micheal Mackeral.png",

    // Common
    "Common Carp": "fishImages/Carp.png",
    "Dark Carp": "fishImages/Dark Carp.png",
    "Minnow": "fishImages/Minnow.png",
    "Dark Minnow": "fishImages/Dark Minnow.png",
    "Sardine": "fishImages/Sardine.png",
    "Hungry Sardine": "fishImages/hungry sardine.png", // Note: lowercase 'h' in filename
    "Sunfish": "fishImages/Sunfish.png",
    "Bluegill": "fishImages/Bluegill.png",
    "Perch": "fishImages/Perch.png",
    "Anchovy": "fishImages/Anchovy.png",
    "Mal Anchovy": "fishImages/Mal-Anchovy.png", // Note: hyphen in filename
    "Blobfish": "fishImages/Blobfish.png",

    // Uncommon
    "Bass": "fishImages/Bass.png",
    "Rainbow Trout": "fishImages/Rainbow Trout.png",
    "Catfish": "fishImages/Catfish.png",
    "Mackeral": "fishImages/Mackeral.png", // Often spelled Mackerel
    "Pike": "fishImages/Pike.png",
    "Snapper": "fishImages/Snapper.png",
    "Crappie": "fishImages/Crappie.png",
    "Luminous Eel": "fishImages/Luminous Eel.png",
    "Alluring Mermaid": "fishImages/Alluring Mermaid.png",
    "Transparant Shark": "fishImages/Transparent Shark.png", // Corrected spelling in filename

    // Rare
    "Salmon": "fishImages/Salmon.png",
    "Tuna": "fishImages/Tuna.png",
    "Swordfish": "fishImages/Swordfish.png",
    "Barracuda": "fishImages/Barracuda.png",
    "Piranha": "fishImages/Piranha.png",
    "Pufferfish": "fishImages/Pufferfish.png",
    "Mahi Mahi": "fishImages/Mahi-Mahi.png", // Note: hyphen in filename
    "Giant Sturgeon": "fishImages/Giant Sturgeon.png",
    "Electric Ray": "fishImages/Electric Ray.png",
    "Crystal Carp": "fishImages/Crystal Carp.png",
    "Crawfish": "fishImages/Crawfish.png",
    "Snail": "fishImages/Snail.png",

    // Legendary
    "Golden Koi": "fishImages/Golden Koi Fish.png", // Note: "Fish" added in filename
    "Gar": "fishImages/Gar.png",
    "Giant Catfish": "fishImages/Giant Catfish.png",
    "Fish O Legend": "fishImages/Fish-O-Legend.png", // Note: hyphens in filename
    "Ancient Dragon Fish": "fishImages/Ancient Dragon Fish.png",
    "Anglerfish": "fishImages/Anglerfish.png",
    "Ghostly Eel": "fishImages/Ghostly Eel.png",
    "Diamond Bass": "fishImages/Diamond Bass.png",
    "Prismatic Shark": "fishImages/Prismatic Shark.png",
    "Obsidian Marlin": "fishImages/Obsidian Marlin.png",
    "Gilded Coelacanth": "fishImages/Gilded Coelacanth.png",
    "Ethereal Seahorse": "fishImages/Ethereal Seahorse.png",

    // Mythic
    "Kraken": "fishImages/Kraken.png",
    "Rainbow Shark": "fishImages/Rainbow Shark.png",
    "Celestial Whale": "fishImages/Celestial Whale.png",
    "Starlight Jellyfish": "fishImages/Starlight Jellyfish.png",
    "Phoenix Fish": "fishImages/Phoenix Fish.png",
    "Galactic Ray": "fishImages/Galactic Ray.png",
    "Void Leviathan": "fishImages/Void Leviathan.png",
    "Benihana HotFish": "fishImages/Benihana HotFish.png",
    "NO NAME": "fishImages/NO NAME.png",
    "Aesthetic Spartan on a Fish": "fishImages/Aesthetic Spartan on a Fish.png",
    "Goldie": "fishImages/Goldie.png",
    "Ribbity": "fishImages/Ribbity.png",
    "Stained Glass Fish": "fishImages/Stained Glass Fish.png",

    // Chimerical
    "Dimensional Leviathan": "fishImages/Dimensional Leviathan.png",
    "Paradox Whale": "fishImages/Paradox Whale.png",
    "Quantum Kraken": "fishImages/Quantum Kraken.png",
    "Reality Ripper": "fishImages/Reality Ripper.png",
    "Time Serpent": "fishImages/Time Serpent.png",
    "Cosmic Angler": "fishImages/Cosmic Angler.png",
    "Void Maw": "fishImages/Void Maw.png",
    "Star Devourer": "fishImages/Star Devourer.png",
    "Goatfish": "fishImages/Goatfish.png",
    "Goldie X": "fishImages/Goldie X.png",
    "Frogo": "fishImages/Frogo.png",
    "Toxic Sludge Fish": "fishImages/Toxic Sludge Fish.png",

    // Seasonal Fish
    "Cherry Salmon": "fishImages/Cherry Salmon.png",
    "Rainbow Bloom": "fishImages/Rainbow Bloom.png",
    "Spring Carp": "fishImages/Spring Carp.png",
    "Dark Cherry Bass": "fishImages/Dark Cherry Bass.png",
    "Disaster Clam": "fishImages/Disaster Clam.png",
    "Lord Spring Fish": "fishImages/Lord Spring Fish.png",

    // Event Fish
    "Ronald Rizz": "fishImages/RonaldRizz.png",
    "Founder Flounder": "fishImages/April Fool Flounder.png",

    // Fallback placeholder image
    "placeholder": "fishImages/Anchovy.png"
};

// Make this data available globally on the window object
window.FISH_IMAGES = FISH_IMAGES;
// Log a simple message to confirm the data is loaded
console.log('FISH_IMAGES loaded successfully');