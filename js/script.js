document.addEventListener('DOMContentLoaded', () => {
    initFishTank();
    highlightActiveTab();
    initGlitchEffects();
    initShop();
    initScrollNavbar();
});

const PAGE_THEME_MAP = {
    '': 'prime',
    'index.html': 'prime',
    'guide.html': 'archive',
    'shop.html': 'bazaar',
    'donate.html': 'cult',
    'privacy.html': 'surveillance',
    'tos.html': 'protocol'
};

const DEFAULT_THEME = 'prime';

const FISH_ART_LIBRARY = [
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

const THEME_CONFIGS = {
    prime: {
        subliminalPhrases: [
            'THE CURRENT KNOWS YOUR USERNAME',
            'SYNC YOUR REELS WITH THE GRID',
            'ALL SIGNALS FEED THE TIDE',
            'CASTING IS JUST TRANSMISSION',
            'PLEASE REMAIN HYDRATED',
            'THE WATER WANTS YOUR INPUT',
            'WE TRADE IN DREAMS OF KRILL',
            'HOOK THE LOOP. LOOP THE HOOK.',
            'RESET THE OCEAN CACHE DAILY',
            'THE TIDELINE IS SPEAKING',
            'SOME FISH ARE SIMULATED',
            'PRIME CURRENT LISTENING',
            'SCAN FOR RARE BAIT NOW',
            'THE SEA ACCEPTS YOUR TERMS',
            'PRESS CAST TO BELIEVE',
            'GLASS IS JUST SLOW WATER',
            'EVERY NET IS A MEMORY',
            'SONAR HEARS YOUR SECRET'
        ],
        glitchOverlays: [
            'PRIME CURRENT {text}',
            '>>> SIGNAL LOCKED <<<',
            'CALIBRATING LURE CORE',
            'CURRENT.LOG > {text}',
            'HYDROPHONE GLEAMS AT YOU',
            'FATHOM HASH VERIFIED'
        ],
        shop: {
            title: 'The Fish Market',
            tagline: 'Currency accepted: Coins, Dabloons, and LP (Liquid Pizza?)',
            currencies: ['Coins', 'Dabloons', 'LP'],
            itemPrefixes: ['Cursed', 'Golden', 'Glitchy', 'Wet', 'Radioactive', 'Invisible', 'Spicy', 'Quantum', 'Void', 'Digital', 'Mirror-Forged', 'Hypercard', 'Biolum', 'Encrypted'],
            itemCores: ['Fish Food', 'Hook', 'Bait', 'Net', 'Boat', 'Hat', 'Bucket', 'Worm', 'Pixel', 'Memory', 'Harpoon', 'Charm', 'Reel', 'Modulator'],
            itemSuffixes: ['of Undertows', 'MK II', '++', 'from Beyond', 'Protocol', 'vNext', 'Edition 7', 'for Friend Fish'],
            sigils: ['Seal of Current', 'Hydro Certified', 'Approved by Tide'],
            fishImages: FISH_ART_LIBRARY,
            weirdChance: 0.1,
            weirdMessages: [
                'THERE IS NO SHOP',
                'THE FISH ARE SLEEPING',
                'OUT OF STOCK FOREVER',
                'YOU CANNOT BUY HAPPINESS',
                'CURRENCY IS A SOCIAL CONSTRUCT',
                'RETURN TO THE OCEAN',
                '404: COMMERCE NOT FOUND'
            ],
            weirdDescriptions: [
                'Please come back when the tide is right.',
                'Merchants currently moulting. Try later.',
                'Inventory dissolved into brine.',
                'Payment rails clogged with kelp.'
            ],
            weirdGlyphs: ['[ TIDE PAUSED ]', '<00>', '{VOID}'],
            extraNotes: [
                'Warranty void once submerged.',
                'Warning: may attract ghost fish.',
                'Certified for brine-safe handling.',
                'Side effects include mild bioluminescence.'
            ],
            priceRange: [25, 1200],
            itemCountRange: [6, 12],
            glitchChance: 0.05,
            rarities: [
                { label: 'Everyday Stock', multiplier: 1 },
                { label: 'Glitched Lot', multiplier: 1.25 },
                { label: 'Mythic Drop', multiplier: 1.75 }
            ]
        }
    },
    archive: {
        subliminalPhrases: [
            'SCROLLS OF CORAL ARE OPEN',
            'REFER TO APPENDIX ATLANTIS',
            'KNOWLEDGE SCHOOLS HERE',
            'FOOTNOTE: BAIT, SEE ALSO TIME',
            'THE INDEX REMEMBERS',
            'YOUR QUESTIONS FEED THE REEF',
            'TURN PAGE BEFORE IT DRIFTS',
            'GUIDES ARE WRITTEN IN SAND',
            'LEGENDS HID INSIDE TIDE TABLES',
            'ARCHIVAL WATER IS STILL WET',
            'WELCOME BACK, CURIOUS ANGLER',
            'ANNOTATE YOUR CASTS',
            'MARGINS GLOW WHEN YOU LEARN',
            'THE CHAPTER ENDS IN BUBBLES'
        ],
        glitchOverlays: [
            'CITATION {text}',
            '>> PAGE 404 RECOVERED <<',
            'FOOTNOTE 7: KEEP FISHING',
            'INDEXING YOUR QUESTIONS',
            'SCRIPTORIUM CURRENT ACTIVE'
        ]
    },
    bazaar: {
        subliminalPhrases: [
            'BARGAIN WITH THE BARNACLES',
            'HAGGLE IN WHALESONG',
            'THE STALLS NEVER CLOSE',
            'ALL SALES ARE CIRCULAR',
            'THE MERCHANT OWNS SIX MOONS',
            'PAY IN PEARLS OR STORIES',
            'CHECK THE GILLS FOR AUTHENTICITY',
            'FLASH SALE UNDER THE KELP',
            'LIMITED RUN OF QUANTUM WORMS',
            'NO RECEIPTS. ONLY RIPPLES.',
            "DON'T LICK THE DEMO FISH",
            'EVERYTHING SMELLS LIKE PROFIT',
            'THE AUCTIONEER SPEAKS IN BUBBLES',
            'MERCHANTS TRACK YOUR SCENT'
        ],
        glitchOverlays: [
            'BID HIGHER: {text}',
            'APPRAISAL: 7 TIDES',
            'COUNTEROFFER AUTHORIZED',
            'SEAL OF THE BAZAAR',
            'BRIBE ACCEPTED'
        ],
        shop: {
            title: 'Midnight Tackle Bazaar',
            tagline: 'Tender accepted: Pearl IOUs, Echo Credits, Dabloons, LP, and verified tall tales.',
            currencies: ['Pearl IOUs', 'Echo Credits', 'Dabloons', 'LP', 'Tide Bonds'],
            itemPrefixes: ['Contraband', 'Fractal', 'Salt-Cured', 'Bioluminescent', 'Entropy-Seared', 'Polychrome', 'Singing', 'Forgotten', 'Temporal', 'Borrowed', 'Gilded', 'Feral'],
            itemCores: ['Hook', 'Bait', 'Net', 'Trident', 'Charm', 'Decoy', 'Sextant', 'Rod', 'Patch Kit', 'Signal Flare', 'Ledger', 'Souvenir Barnacle'],
            itemSuffixes: ['from Spiral Reef', 'mk.[inf]', 'Edition Omega', 'with Backup Kraken', 'signed by the Tidecaller', 'of Portable Storms', 'calibrated nightly'],
            itemEpithets: ['Night Market Lot', 'Smuggled Stock', 'Legal Enough', 'Traveler Series', 'Heirloom Tide'],
            sigils: ['Tide Embassy Stamp', 'Traveling Merchant Seal', 'Verified Catch & Release'],
            fishImages: [
                'Golden Koi Fish.png',
                'RichKraken.png',
                'Cosmic Crab.png',
                'Business Shark.png',
                'Celestial Whale.png',
                'Rainbow Bloom.png',
                'Gilded Coelacanth.png',
                'Star Devourer.png',
                'Quantum Kraken.png',
                'Paradox Whale.png'
            ],
            weirdChance: 0.15,
            weirdMessages: [
                'THE MARKET IS CLOSED TO LAND DWELLERS',
                'STALLS DISSOLVED INTO MIST',
                'PRICE DISCOVERY FAILED',
                'LICENSE REVOKED BY THE TIDE',
                'INVENTORY IS IN A DIFFERENT TIMELINE'
            ],
            weirdDescriptions: [
                'Return with a story worth trading.',
                'Only verified krill magnates may enter.',
                'Merchants currently bartering with ghosts.',
                'Bazaar relocated three fathoms left.'
            ],
            weirdGlyphs: ['[MARKET OFFLINE]', '~~~', '<<VOID BID>>'],
            extraNotes: [
                'Proof of catch required upon pickup.',
                'Smells like guaranteed profit.',
                'Handle with non-euclidean gloves.',
                'Keep away from shallow investors.'
            ],
            priceRange: [75, 3200],
            itemCountRange: [7, 14],
            glitchChance: 0.08,
            rarities: [
                { label: 'Street Stock', multiplier: 1 },
                { label: 'Smuggled Tier', multiplier: 1.4 },
                { label: 'Myth-Grade', multiplier: 2.1 }
            ]
        }
    },
    cult: {
        subliminalPhrases: [
            'TITHE YOUR SHINIEST LURES',
            'THE ALTAR ACCEPTS KO-FI',
            'CHANT THE DONOR IDS',
            'SUPPORTERS GLOW IN THE DARK',
            'FISH LISTEN TO PATRONS FIRST',
            'BLESSINGS COME WITH RECEIPTS',
            'SIGN YOUR NAME IN BUBBLES',
            'THE HIGHEST TIER GETS GILLS',
            'SHARE YOUR TREASURE WITH THE TIDE',
            'EXCLUSIVE FISH ARE SUMMONED',
            'YOUR GENEROSITY FEEDS THE KRAKEN'
        ],
        glitchOverlays: [
            'PLEDGE REGISTERED',
            'DONOR SIGNAL DETECTED',
            'OFFERING ACCEPTED',
            'BLESS THE STREAM',
            'KO-FI RECEIPT {text}'
        ]
    },
    surveillance: {
        subliminalPhrases: [
            'PRIVACY POLICY WATCHES BACK',
            'ALL WAVES ARE LOGGED',
            'YOUR SHADOW FILE IS FLOATING',
            'THE CAMERA LOVES THE SEA',
            'CONSENT TO BE OBSERVED',
            'NETS DOUBLE AS ANTENNAS',
            'ANONYMITY WEARS A SNORKEL',
            'WE ONLY RECORD THE GOOD PARTS',
            'WHO IS WATCHING THE WHALES?',
            'THE COOKIES ARE MADE OF PLANKTON',
            'TRACKING PIXELS SWIM IN SCHOOLS'
        ],
        glitchOverlays: [
            'LOG ENTRY CREATED',
            'DATA TIDE ENGAGED',
            'MASK YOUR BUBBLES',
            'SURVEILLANCE SUBROUTINE',
            'AUDIT OF {text}'
        ]
    },
    protocol: {
        subliminalPhrases: [
            'TERMS PRINTED ON DRIFTWOOD',
            'SIGN WITH A SCALE',
            'CLAUSE 7 DIVES DEEPER',
            'YOU ALREADY AGREED',
            'ALL CONTRACTS ARE LIQUID',
            'BY CASTING YOU CONSENT',
            'PLEASE INITIAL EACH RIPPLE',
            'THE FINE PRINT IS HATCHLING SMALL',
            'COMPLIANCE IS A LIFE VEST',
            'OUR LAWYERS ARE OCTOPI',
            'VIOLATORS WILL BE SPRAYED'
        ],
        glitchOverlays: [
            'SECTION {text}',
            'APPROVED BY THE DEPTHS',
            'LEGAL CURRENT ONLINE',
            'SIGNATURE VERIFIED',
            'MANDATORY FUN APPLIES'
        ]
    }
};

function initGlitchEffects() {
    const subliminalLayer = document.getElementById('subliminal-layer');
    const subliminalText = document.getElementById('subliminal-text');
    const body = document.body;
    
    // Safety check: if elements don't exist, don't run the effects
    if (!subliminalLayer || !subliminalText) return;
    
    const theme = getCurrentPageTheme();
    const themeConfig = getThemeConfig(theme);
    const phrases = themeConfig.subliminalPhrases && themeConfig.subliminalPhrases.length
        ? themeConfig.subliminalPhrases
        : getThemeConfig(DEFAULT_THEME).subliminalPhrases;
    const overlays = themeConfig.glitchOverlays || [];

    body.setAttribute('data-theme', theme);
    body.dataset.activeTheme = theme;

    const headings = document.querySelectorAll('h1, h2, h3, .btn');
    headings.forEach(heading => {
        if (!heading.hasAttribute('data-base-text')) {
            heading.setAttribute('data-base-text', heading.innerText);
            heading.setAttribute('data-text', heading.innerText);
        }
    });

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
    setInterval(() => {
        if (headings.length && Math.random() > 0.7) {
            const target = headings[Math.floor(Math.random() * headings.length)];
            const originalText = target.innerText;
            const glitchClass = `glitch-theme-${theme}`;
            const overlayText = overlays.length ? formatOverlayText(getRandom(overlays), originalText) : target.getAttribute('data-base-text') || originalText;
            
            target.setAttribute('data-text', overlayText);
            target.dataset.glitchTheme = theme;
            target.classList.add('glitch-active', glitchClass);
            
            setTimeout(() => {
                target.classList.remove('glitch-active', glitchClass);
                const baseText = target.getAttribute('data-base-text') || originalText;
                target.setAttribute('data-text', baseText);
                target.removeAttribute('data-glitch-theme');
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

function initScrollNavbar() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    let lastScrollTop = 0;
    let scrollThreshold = 100; // Start hiding after scrolling 100px

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Only hide/show if we've scrolled past the threshold
        if (scrollTop > scrollThreshold) {
            if (scrollTop > lastScrollTop) {
                // Scrolling down - hide nav
                nav.classList.add('nav-hidden');
            } else {
                // Scrolling up - show nav
                nav.classList.remove('nav-hidden');
            }
        } else {
            // At top of page - always show nav
            nav.classList.remove('nav-hidden');
        }
        
        lastScrollTop = scrollTop;
    });
}

function initFishTank() {
    const tank = document.getElementById('fish-tank');
    if (!tank) return;

    // Fish configuration
    const fishImages = FISH_ART_LIBRARY;

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
    const shopTitle = document.getElementById('shop-title');
    const shopTagline = document.getElementById('shop-tagline');
    
    if (!shopContainer || !shopItemsContainer) return;

    const theme = getCurrentPageTheme();
    const themeConfig = getThemeConfig(theme);
    const fallbackShop = getThemeConfig(DEFAULT_THEME).shop;
    const shopConfig = (themeConfig && themeConfig.shop) ? themeConfig.shop : fallbackShop;

    if (!shopConfig) return;

    if (shopTitle && shopConfig.title) {
        shopTitle.innerText = shopConfig.title;
    }

    if (shopTagline && shopConfig.tagline) {
        shopTagline.innerText = shopConfig.tagline;
    }

    const weirdChance = typeof shopConfig.weirdChance === 'number' ? shopConfig.weirdChance : 0.1;
    if (Math.random() < weirdChance) {
        renderWeirdLandingPage(shopContainer, shopConfig);
        return;
    }

    const countRange = shopConfig.itemCountRange || [6, 12];
    const itemCount = randomBetween(countRange[0], countRange[1]);
    const glitchChance = typeof shopConfig.glitchChance === 'number' ? shopConfig.glitchChance : 0.05;
    const priceRange = shopConfig.priceRange || [25, 1000];

    for (let i = 0; i < itemCount; i++) {
        const item = document.createElement('div');
        item.classList.add('shop-item');

        if (Math.random() < glitchChance) {
            item.classList.add('glitchy');
        }

        const rarity = shopConfig.rarities && shopConfig.rarities.length
            ? getRandom(shopConfig.rarities)
            : { label: 'Standard Issue', multiplier: 1 };
        const prefix = pickFromPool(shopConfig.itemPrefixes);
        const core = pickFromPool(shopConfig.itemCores, 'Artifact');
        const suffix = Math.random() > 0.5 ? pickFromPool(shopConfig.itemSuffixes) : null;
        const epithet = shopConfig.itemEpithets && Math.random() > 0.6 ? pickFromPool(shopConfig.itemEpithets) : null;
        const sigil = shopConfig.sigils && Math.random() > 0.5 ? pickFromPool(shopConfig.sigils) : null;
        const note = shopConfig.extraNotes && Math.random() > 0.65 ? pickFromPool(shopConfig.extraNotes) : null;

        const name = [prefix, core, suffix].filter(Boolean).join(' ') || core;
        const basePrice = randomBetween(priceRange[0], priceRange[1]);
        const price = Math.max(1, Math.floor(basePrice * (rarity.multiplier || 1)));
        const currency = pickFromPool(shopConfig.currencies, 'Coins');

        const imagePool = shopConfig.fishImages && shopConfig.fishImages.length ? shopConfig.fishImages : FISH_ART_LIBRARY;
        const image = pickFromPool(imagePool, 'Bass.png');

        item.innerHTML = `
            <img src="fishImages/${image}" alt="${name}">
            <div class="item-header">
                <h3>${name}</h3>
                <span class="rarity-badge">${rarity.label}</span>
            </div>
            ${epithet ? `<p class="epithet">${epithet}</p>` : ''}
            <div class="price">${price} <span class="currency">${currency}</span></div>
            ${sigil ? `<div class="sigil">${sigil}</div>` : ''}
            ${note ? `<p class="note">${note}</p>` : ''}
            <button class="buy-btn" onclick="alert('ERROR: INSUFFICIENT ${currency.toUpperCase()}')">BUY NOW</button>
        `;

        shopItemsContainer.appendChild(item);
    }
}

function getCurrentPageTheme() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    return PAGE_THEME_MAP[currentPath] || PAGE_THEME_MAP[''] || DEFAULT_THEME;
}

function getThemeConfig(themeName) {
    return THEME_CONFIGS[themeName] || THEME_CONFIGS[DEFAULT_THEME];
}

function formatOverlayText(template, fallback) {
    if (!template) return fallback;
    return template.includes('{text}') ? template.replace(/\{text\}/g, fallback) : template;
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickFromPool(pool, fallback = null) {
    return pool && pool.length ? getRandom(pool) : fallback;
}

function renderWeirdLandingPage(container, shopConfig = {}) {
    container.innerHTML = '';
    container.classList.add('weird-landing');

    const messages = shopConfig.weirdMessages && shopConfig.weirdMessages.length
        ? shopConfig.weirdMessages
        : [
            'THERE IS NO SHOP',
            'THE FISH ARE SLEEPING',
            'OUT OF STOCK FOREVER',
            'YOU CANNOT BUY HAPPINESS',
            'CURRENCY IS A SOCIAL CONSTRUCT',
            'RETURN TO THE OCEAN',
            '404: COMMERCE NOT FOUND'
        ];

    const descriptions = shopConfig.weirdDescriptions && shopConfig.weirdDescriptions.length
        ? shopConfig.weirdDescriptions
        : ['Please come back when the tide is right.'];

    const glyphs = shopConfig.weirdGlyphs && shopConfig.weirdGlyphs.length ? shopConfig.weirdGlyphs : null;

    const h1 = document.createElement('h1');
    h1.innerText = pickFromPool(messages, 'THE SHOP IS ELSEWHERE');
    container.appendChild(h1);

    if (glyphs) {
        const glyph = document.createElement('div');
        glyph.classList.add('weird-glyph');
        glyph.innerText = pickFromPool(glyphs, '[]');
        container.appendChild(glyph);
    }

    const p = document.createElement('p');
    p.innerText = pickFromPool(descriptions, 'Please come back when the tide is right.');
    container.appendChild(p);
}

function getRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}
