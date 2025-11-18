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
            
            // Random duration for the flash (very short to short)
            const duration = Math.random() * 200 + 50; // 50ms to 250ms
            
            setTimeout(() => {
                subliminalLayer.style.opacity = '0';
            }, duration);
        }
    }, 5000); // Check every 5 seconds

    // Text Glitch on Headings
    const headings = document.querySelectorAll('h1, h2, h3, .btn');
    setInterval(() => {
        if (Math.random() > 0.6) {
            const target = headings[Math.floor(Math.random() * headings.length)];
            const originalText = target.innerText;
            
            target.setAttribute('data-text', originalText);
            target.classList.add('glitch-active');
            
            setTimeout(() => {
                target.classList.remove('glitch-active');
            }, Math.random() * 500 + 200);
        }
    }, 3000);

    // Color Inversion Flash
    setInterval(() => {
        if (Math.random() > 0.95) { // Rare event
            body.classList.add('color-invert');
            setTimeout(() => {
                body.classList.remove('color-invert');
            }, 100); // Very quick flash
        }
    }, 8000);
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
        'Bass.png',
        'Golden Koi Fish.png',
        'Rainbow Trout.png',
        'Cosmic Angler.png',
        'Business Shark.png'
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
        if (document.querySelectorAll('.fish').length < 15) {
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
    const size = Math.random() * 60 + 40; // 40px to 100px

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
        'Bass.png',
        'Golden Koi Fish.png',
        'Rainbow Trout.png',
        'Cosmic Angler.png',
        'Business Shark.png'
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
