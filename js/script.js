document.addEventListener('DOMContentLoaded', () => {
    initFishTank();
    highlightActiveTab();
    initGlitchEffects();
    initShop();
});

function initGlitchEffects() {
    const subliminalLayer = document.getElementById('subliminal-layer');
    const subliminalText = document.getElementById('subliminal-text');
    const body = document.body;
    
    // Safety check: if elements don't exist, don't run the effects
    if (!subliminalLayer || !subliminalText) return;
    
    const phrases = [
        "THE OCEAN HAS NO BOTTOM",
        "YOU ARE THE BAIT",
        "FISH REACT TO ME",
        "PLEASE DO NOT EAT THE PIXELS",
        "LOADING FISH_SOULS.DAT",
        "[adult fish]",
        "DON'T TAP THE GLASS",
        "THEY ARE WATCHING",
        "SWIM DOWN",
        "ERROR 404: OCEAN NOT FOUND",
        "JUST KEEP SWIMMING",
        "VOID_FISH_DETECTED",
        "CAST YOUR LINE INTO THE ABYSS",
        "DIGITAL WATER IS STILL WET",
        "OBEY THE KRAKEN"
    ];

    // Subliminal Messages
    setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance every check
            const phrase = phrases[Math.floor(Math.random() * phrases.length)];
            subliminalText.innerText = phrase;
            subliminalLayer.style.opacity = '1';
            
            // Random duration: sometimes short flash, sometimes readable
            let duration;
            if (Math.random() > 0.7) {
                // 30% chance to stay for 2-3 seconds
                duration = Math.random() * 1000 + 2000;
            } else {
                // 70% chance of quick flash (50-200ms)
                duration = Math.random() * 150 + 50;
            }
            
            setTimeout(() => {
                subliminalLayer.style.opacity = '0';
            }, duration);
        }
    }, 8000); // Check every 8 seconds

    // Text Glitch on Headings
    const headings = document.querySelectorAll('h1, h2, h3, .btn');
    setInterval(() => {
        if (Math.random() > 0.7) {
            const target = headings[Math.floor(Math.random() * headings.length)];
            const originalText = target.innerText;
            
            target.setAttribute('data-text', originalText);
            target.classList.add('glitch-active');
            
            setTimeout(() => {
                target.classList.remove('glitch-active');
            }, Math.random() * 500 + 200);
        }
    }, 5000);

    // Color Inversion Flash
    setInterval(() => {
        if (Math.random() > 0.95) { // Rare event
            body.classList.add('color-invert');
            setTimeout(() => {
                body.classList.remove('color-invert');
            }, 100); // Very quick flash
        }
    }, 12000);
}

function highlightActiveTab() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
            link.classList.add('active');
        }
    });
}

function initFishTank() {
    const tank = document.getElementById('fish-tank');
    if (!tank) return;

    // Fish configuration
    const fishImages = [
        'AceofClubsShark.png',
        'Aesthetic Spartan on a Fish.png',
        'Alluring Mermaid.png',
        'Anchovy.png',
        'Ancient Dragon Fish.png',
        'Ancient FlipFlop.png',
        'Anglerfish.png',
        'April Fool Flounder.png',
        'ArmoredWorm.png',
        'Autumn Koi.png',
        'Barracuda.png',
        'Bass.png',
        'Benihana HotFish.png',
        'Blobfish.png',
        'Bluegill.png',
        'BunyipFish.png',
        'Business Shark.png',
        'CanadianDolphin.png',
        'Carp.png',
        'Catfish.png',
        'Celestial Whale.png',
        'Cherry Salmon.png',
        'Cloud Mandrake.png',
        'Cosmic Angler.png',
        'Cosmic Crab.png',
        'CosmicOrcaWhale.png',
        'Crappie.png',
        'Crawfish.png',
        'Crystal Carp.png',
        'CthuluFish.png',
        'DallaBillFish.png',
        'Dark Carp.png',
        'Dark Cherry Bass.png',
        'Dark Minnow.png',
        'DevilBruiserFish.png',
        'Diamond Bass.png',
        'Dimensional Leviathan.png',
        'Disaster Clam.png',
        'Duke Worm-Wyrn.png',
        'Easter Bunny Fish.png',
        'Electric Ray.png',
        'EmberBass.png',
        'Ethereal Seahorse.png',
        'FallingShellfish.png',
        'Fish-O-Legend.png',
        'Frogo.png',
        'FrostBass.png',
        'FrozenMinnow.png',
        'Galactic Ray.png',
        'Gar.png',
        'GellyFish.png',
        'Ghostly Eel.png',
        'Giant Catfish.png',
        'Giant Sturgeon.png',
        'Gilded Coelacanth.png',
        'Goatfish.png',
        'Goblin Shark.png',
        'Golden Koi Fish.png',
        'GoldenMackeral.png',
        'Goldie X.png',
        'Goldie.png',
        'HeatEel.png',
        'hungry sardine.png',
        'IceMarlin.png',
        'Jack Fishington.png',
        'Jello Fish.png',
        'Kraken.png',
        'LightCherryBass.png',
        'Lord Spring Fish.png',
        'Lucky Whale Shark.png',
        'Luminous Eel.png',
        'Mackeral.png',
        'Magic Fish.png',
        'Mahi-Mahi.png',
        'Mal-Anchovy.png',
        'MapleSalmon.png',
        'MapleTrout.png',
        'Meh Plankton.png',
        'Micheal Mackeral.png',
        'Minnow.png',
        'Mr. Krabs.png',
        'Ninja Fish.png',
        'NO NAME.png',
        'Obsidian Marlin.png',
        'Old Boot.png',
        'Paradox Whale.png',
        'Perch.png',
        'Phoenix Fish.png',
        'Pike.png',
        'Piranha.png',
        'Plastic Bottle.png',
        'PoPRocketFish.png',
        'Prismatic Shark.png',
        'Pufferfish.png',
        'Quantum Kraken.png',
        'Rainbow Bloom.png',
        'Rainbow Shark.png',
        'Rainbow Trout.png',
        'Reality Ripper.png',
        'Ribbity.png',
        'RichKraken.png',
        'RonaldRizz.png',
        'Rusted Fishing Hook.png',
        'Rusty Can.png',
        'Salmon.png',
        'Sardine.png',
        'Seaweed Clump.png',
        'SlotWhale.png',
        'Snail.png',
        'Snapper.png',
        'Snowflake Pufferfish.png',
        'SnowFlounder.png',
        'Spring Carp.png',
        'Stained Glass Fish.png',
        'Star Devourer.png',
        'Starlight Jellyfish.png',
        'SummerClam.png',
        'SummerSquid.png',
        'Sunfish.png',
        'SunfishPrime.png',
        'SupaSeahorse.png',
        'Swordfish.png',
        'Tangled Fishing Line.png',
        'ThunderbirdFish.png',
        'Time Serpent.png',
        'Toxic Sludge Fish.png',
        'Transparent Shark.png',
        'TrippinFish.png',
        'TrueAngelFish.png',
        'Tuna.png',
        'VenomFish.png',
        'Void Leviathan.png',
        'Void Maw.png',
        'waterloggedphone.png',
        'WendigoFish.png',
        'WhimsyFish.png',
        'WhiskeyRiverFish.png'
    ];

    // Spawn bubbles
    setInterval(() => {
        createBubble(tank);
    }, 500);

    // Spawn fish
    // Initial population
    for(let i = 0; i < 5; i++) {
        createFish(tank, fishImages, true);
    }

    // Ongoing spawning
    setInterval(() => {
        const isMobile = window.innerWidth < 768;
        const maxFish = isMobile ? 8 : 15;
        if (document.querySelectorAll('.fish').length < maxFish) {
            createFish(tank, fishImages, false);
        }
    }, 3000);
}

function createBubble(container) {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    
    const size = Math.random() * 10 + 5; // 5px to 15px
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}vw`;
    bubble.style.animationDuration = `${Math.random() * 5 + 5}s`; // 5s to 10s
    
    container.appendChild(bubble);

    // Remove after animation
    setTimeout(() => {
        bubble.remove();
    }, 10000);
}

function createFish(container, images, randomX) {
    const fish = document.createElement('img');
    const randomImage = images[Math.floor(Math.random() * images.length)];
    fish.src = `fishImages/${randomImage}`;
    fish.classList.add('fish');

    // Random properties
    const direction = Math.random() > 0.5 ? 'right' : 'left';
    const topPos = Math.random() * 90; // 0 to 90vh
    const duration = Math.random() * 10 + 10; // 10s to 20s
    
    const isMobile = window.innerWidth < 768;
    const size = isMobile 
        ? Math.random() * 30 + 30  // 30px to 60px for mobile
        : Math.random() * 60 + 40; // 40px to 100px for desktop

    fish.style.top = `${topPos}vh`;
    fish.style.width = `${size}px`;
    
    // Set direction and animation
    if (direction === 'right') {
        fish.style.animation = `swimRight ${duration}s linear forwards`;
        // If image faces left by default, we might need to flip it. 
        // Assuming images face left (standard for fish sprites usually), 
        // if they swim right, we flip them horizontally.
        // Let's assume standard orientation is facing LEFT.
        // If they swim RIGHT, we need transform: scaleX(-1).
        // If they swim LEFT, we need transform: scaleX(1).
        // Wait, usually sprites face RIGHT or LEFT. Let's assume they face LEFT.
        // If they swim RIGHT (left -> right), they should face RIGHT. So flip.
        fish.style.transform = 'scaleX(-1)'; 
    } else {
        fish.style.animation = `swimLeft ${duration}s linear forwards`;
        fish.style.transform = 'scaleX(1)';
    }

    // Random starting X for initial population
    if (randomX) {
        const startX = Math.random() * 100;
        fish.style.left = `${startX}vw`;
        // Adjust animation to handle mid-screen start? 
        // CSS animation usually resets position. 
        // For simplicity, initial fish just use static position and maybe a different animation or just let them start from edge for now to avoid complexity.
        // Actually, let's just let them swim from edges for simplicity.
        fish.style.left = direction === 'right' ? '-150px' : '100vw';
    }

    container.appendChild(fish);

    // Remove after animation
    setTimeout(() => {
        fish.remove();
    }, duration * 1000);
}

function initShop() {
    const shopContainer = document.getElementById('shop-container');
    const shopItemsContainer = document.getElementById('shop-items');
    
    if (!shopContainer || !shopItemsContainer) return;

    // 10% chance to show a weird landing page instead of the shop
    if (Math.random() < 0.1) {
        renderWeirdLandingPage(shopContainer);
        return;
    }

    const currencies = ['Coins', 'Dabloons', 'LP'];
    const itemPrefixes = ['Cursed', 'Golden', 'Glitchy', 'Wet', 'Radioactive', 'Invisible', 'Spicy', 'Quantum', 'Void', 'Digital'];
    const itemNames = ['Fish Food', 'Hook', 'Bait', 'Net', 'Boat', 'Hat', 'Bucket', 'Worm', 'Pixel', 'Memory'];
    const fishImages = [
        'AceofClubsShark.png',
        'Aesthetic Spartan on a Fish.png',
        'Alluring Mermaid.png',
        'Anchovy.png',
        'Ancient Dragon Fish.png',
        'Ancient FlipFlop.png',
        'Anglerfish.png',
        'April Fool Flounder.png',
        'ArmoredWorm.png',
        'Autumn Koi.png',
        'Barracuda.png',
        'Bass.png',
        'Benihana HotFish.png',
        'Blobfish.png',
        'Bluegill.png',
        'BunyipFish.png',
        'Business Shark.png',
        'CanadianDolphin.png',
        'Carp.png',
        'Catfish.png',
        'Celestial Whale.png',
        'Cherry Salmon.png',
        'Cloud Mandrake.png',
        'Cosmic Angler.png',
        'Cosmic Crab.png',
        'CosmicOrcaWhale.png',
        'Crappie.png',
        'Crawfish.png',
        'Crystal Carp.png',
        'CthuluFish.png',
        'DallaBillFish.png',
        'Dark Carp.png',
        'Dark Cherry Bass.png',
        'Dark Minnow.png',
        'DevilBruiserFish.png',
        'Diamond Bass.png',
        'Dimensional Leviathan.png',
        'Disaster Clam.png',
        'Duke Worm-Wyrn.png',
        'Easter Bunny Fish.png',
        'Electric Ray.png',
        'EmberBass.png',
        'Ethereal Seahorse.png',
        'FallingShellfish.png',
        'Fish-O-Legend.png',
        'Frogo.png',
        'FrostBass.png',
        'FrozenMinnow.png',
        'Galactic Ray.png',
        'Gar.png',
        'GellyFish.png',
        'Ghostly Eel.png',
        'Giant Catfish.png',
        'Giant Sturgeon.png',
        'Gilded Coelacanth.png',
        'Goatfish.png',
        'Goblin Shark.png',
        'Golden Koi Fish.png',
        'GoldenMackeral.png',
        'Goldie X.png',
        'Goldie.png',
        'HeatEel.png',
        'hungry sardine.png',
        'IceMarlin.png',
        'Jack Fishington.png',
        'Jello Fish.png',
        'Kraken.png',
        'LightCherryBass.png',
        'Lord Spring Fish.png',
        'Lucky Whale Shark.png',
        'Luminous Eel.png',
        'Mackeral.png',
        'Magic Fish.png',
        'Mahi-Mahi.png',
        'Mal-Anchovy.png',
        'MapleSalmon.png',
        'MapleTrout.png',
        'Meh Plankton.png',
        'Micheal Mackeral.png',
        'Minnow.png',
        'Mr. Krabs.png',
        'Ninja Fish.png',
        'NO NAME.png',
        'Obsidian Marlin.png',
        'Old Boot.png',
        'Paradox Whale.png',
        'Perch.png',
        'Phoenix Fish.png',
        'Pike.png',
        'Piranha.png',
        'Plastic Bottle.png',
        'PoPRocketFish.png',
        'Prismatic Shark.png',
        'Pufferfish.png',
        'Quantum Kraken.png',
        'Rainbow Bloom.png',
        'Rainbow Shark.png',
        'Rainbow Trout.png',
        'Reality Ripper.png',
        'Ribbity.png',
        'RichKraken.png',
        'RonaldRizz.png',
        'Rusted Fishing Hook.png',
        'Rusty Can.png',
        'Salmon.png',
        'Sardine.png',
        'Seaweed Clump.png',
        'SlotWhale.png',
        'Snail.png',
        'Snapper.png',
        'Snowflake Pufferfish.png',
        'SnowFlounder.png',
        'Spring Carp.png',
        'Stained Glass Fish.png',
        'Star Devourer.png',
        'Starlight Jellyfish.png',
        'SummerClam.png',
        'SummerSquid.png',
        'Sunfish.png',
        'SunfishPrime.png',
        'SupaSeahorse.png',
        'Swordfish.png',
        'Tangled Fishing Line.png',
        'ThunderbirdFish.png',
        'Time Serpent.png',
        'Toxic Sludge Fish.png',
        'Transparent Shark.png',
        'TrippinFish.png',
        'TrueAngelFish.png',
        'Tuna.png',
        'VenomFish.png',
        'Void Leviathan.png',
        'Void Maw.png',
        'waterloggedphone.png',
        'WendigoFish.png',
        'WhimsyFish.png',
        'WhiskeyRiverFish.png'
    ];

    // Generate 6 to 12 random items
    const itemCount = Math.floor(Math.random() * 7) + 6;

    for (let i = 0; i < itemCount; i++) {
        const item = document.createElement('div');
        item.classList.add('shop-item');
        
        // 5% chance for an item to be glitchy
        if (Math.random() < 0.05) {
            item.classList.add('glitchy');
        }

        const name = `${getRandom(itemPrefixes)} ${getRandom(itemNames)}`;
        const price = Math.floor(Math.random() * 1000) + 10;
        const currency = getRandom(currencies);
        const image = getRandom(fishImages);

        item.innerHTML = `
            <img src="fishImages/${image}" alt="${name}">
            <h3>${name}</h3>
            <div class="price">${price} <span class="currency">${currency}</span></div>
            <button class="buy-btn" onclick="alert('ERROR: INSUFFICIENT ${currency.toUpperCase()}')">BUY NOW</button>
        `;

        shopItemsContainer.appendChild(item);
    }
}

function renderWeirdLandingPage(container) {
    container.innerHTML = '';
    container.classList.add('weird-landing');
    
    const messages = [
        "THERE IS NO SHOP",
        "THE FISH ARE SLEEPING",
        "OUT OF STOCK FOREVER",
        "YOU CANNOT BUY HAPPINESS",
        "CURRENCY IS A SOCIAL CONSTRUCT",
        "RETURN TO THE OCEAN",
        "404: COMMERCE NOT FOUND"
    ];

    const h1 = document.createElement('h1');
    h1.innerText = getRandom(messages);
    container.appendChild(h1);

    const p = document.createElement('p');
    p.innerText = "Please come back when the tide is right.";
    container.appendChild(p);
}

function getRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}
