// TackleBot Website - Modern Interactive JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initHamburgerMenu();
    initSmoothScrolling();
    initScrollAnimations();
    initButtonEffects();
    initParallaxEffect();
    initFloatingFishAnimation();
    addBackToTop();
    initFormHandling();
    initWikiSections();
    initPanelAccordions();
    initTankFish();
    
    // Add loading screen
    hideLoadingScreen();
});

// Hamburger menu toggle for mobile navigation
function initHamburgerMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
            navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking a link (for better UX)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navLinks.contains(event.target)) {
                navLinks.classList.remove('open');
                navToggle.classList.remove('active');
            }
        });
    }
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if href is just "#"
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active navigation
                updateActiveNav(href);
            }
        });
    });
}

// Update active navigation item
function updateActiveNav(href) {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === href) {
            link.classList.add('active');
        }
    });
}

// Scroll animations for sections
function initScrollAnimations() {
    const sections = document.querySelectorAll('section');
    const features = document.querySelectorAll('.feature-item');
    const commands = document.querySelectorAll('.command-item');
    
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered animation delays
                setTimeout(() => {
                    entry.target.classList.add('fade-in');
                }, index * 100);
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    [...sections, ...features, ...commands].forEach(element => {
        observer.observe(element);
    });
}

// Button ripple effects with improved performance
function initButtonEffects() {
    const buttons = document.querySelectorAll('.button, .donation-link');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.4);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.8s ease-out;
                pointer-events: none;
                z-index: 1000;
            `;
            
            // Add ripple animation keyframes if not already added
            if (!document.querySelector('#ripple-styles')) {
                const style = document.createElement('style');
                style.id = 'ripple-styles';
                style.textContent = `
                    @keyframes ripple {
                        to {
                            transform: scale(2.5);
                            opacity: 0;
                        }
                    }
                    .button, .donation-link {
                        position: relative;
                        overflow: hidden;
                    }
                `;
                document.head.appendChild(style);
            }
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.remove();
                }
            }, 800);
        });
    });
}

// Update navigation based on scroll position
function updateNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Initialize scroll-based navigation updates
window.addEventListener('scroll', throttle(updateNavOnScroll, 100));

// Parallax effect for floating fish
function initParallaxEffect() {
    const floatingFish = document.querySelectorAll('.floating-fish');
    
    if (floatingFish.length === 0) return;
    
    window.addEventListener('scroll', throttle(() => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        
        floatingFish.forEach((fish, index) => {
            const rate = scrolled * (-0.2 - index * 0.1);
            fish.style.transform = `translateY(${rate}px) rotate(${scrolled * 0.01}deg)`;
        });
    }, 16)); // 60fps
}

// Enhanced floating fish animation
function initFloatingFishAnimation() {
    const floatingFish = document.querySelectorAll('.floating-fish');
    
    floatingFish.forEach((fish, index) => {
        // Add random delays and variations
        const delay = Math.random() * 2;
        const duration = 6 + Math.random() * 4;
        const amplitude = 15 + Math.random() * 10;
        
        fish.style.animationDelay = `${delay}s`;
        fish.style.animationDuration = `${duration}s`;
        fish.style.setProperty('--float-amplitude', `${amplitude}px`);
    });
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Loading screen management
function hideLoadingScreen() {
    // Remove any existing loading screens
    const existingLoader = document.querySelector('.page-loader');
    if (existingLoader) {
        existingLoader.style.opacity = '0';
        setTimeout(() => {
            existingLoader.remove();
        }, 300);
    }
}

// Back to top functionality with modern styling
function addBackToTop() {
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '↗️';
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        transform: translateY(100px);
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    `;
    
    document.body.appendChild(backToTop);
    
    window.addEventListener('scroll', throttle(() => {
        if (window.pageYOffset > 400) {
            backToTop.style.opacity = '1';
            backToTop.style.transform = 'translateY(0)';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.transform = 'translateY(100px)';
        }
    }, 100));
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Hover effect
    backToTop.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.1)';
        this.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)';
    });
    
    backToTop.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
        this.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
    });
}

// Enhanced form handling with modern validation
function initFormHandling() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#ef4444';
                    input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                    
                    // Add shake animation
                    input.style.animation = 'shake 0.5s ease-in-out';
                    setTimeout(() => {
                        input.style.animation = '';
                    }, 500);
                } else {
                    input.style.borderColor = '#10b981';
                    input.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showNotification('Please fill in all required fields.', 'error');
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    this.style.borderColor = '#ef4444';
                } else {
                    this.style.borderColor = '#d1d5db';
                }
            });
        });
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        padding: 16px 24px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        max-width: 300px;
    `;
    
    if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    } else if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
    }
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Slide out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

// Loading animation
function showLoading() {
    const loading = document.createElement('div');
    loading.innerHTML = '🎣 Loading...';
    loading.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.9);
        padding: 20px;
        border-radius: 10px;
        font-size: 18px;
        z-index: 10000;
    `;
    loading.id = 'loading';
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.remove();
    }
}

// ----- Wiki renderer -----
const wikiSectionsData = [
    {
        id: 'wiki-overview',
        icon: '🌊',
        title: 'TackleBot Overview',
        navSubtitle: 'Core gameplay pillars',
        description: 'TackleBot is a chill-but-deep Discord RPG built around fishing, collection, light business sims, and social play. Everything is synced to your Discord ID with hourly autosaves, so this wiki focuses on the systems that matter when planning long-term progress.',
        tags: ['Season 6 meta', 'New Players', 'v1.0 Wiki'],
        highlights: [
            'Base cast timer is 30s, reduced by Quick Cast tiers, pets, and temporary boosts.',
            'Inventory, upgrades, and cosmetics persist through SQLite + JSON mirrors; nothing is wiped between seasons.',
            'XP thresholds unlock Explorer and Special map tiers, research nodes, fish pass milestones, and super store slots.'
        ],
        cards: [
            {
                title: 'Daily Flow',
                body: 'Stack the following touchpoints for best value every day:',
                bullets: [
                    '✅ `/fish cast`, `/fish inventory`, and `/fish sellall` to keep coins moving.',
                    '📈 Claim login + vote streaks for 2× fish pass XP and stash multipliers.',
                    '🏦 Reinforce rods/lures/companies before hopping offline so timers work while you rest.'
                ]
            },
            {
                title: 'Progression Gates',
                body: 'Level 5 unlocks Sunlit Pier, 15 unlocks Midnight Trench, 25 opens Ember Depths, and 45 grants Special Map requests. Research Lab tiers also require specific challenge completions.',
                bullets: [
                    'Explorer Map tier 1: Level 12 + 25k coins.',
                    'Explorer Map tier 3: Level 30 plus 250 Mythic fish caught.',
                    'Special Map tier 2: Finish 10 seasonal challenges and own Explorer Map tier 3.'
                ]
            },
            {
                title: 'Quality-of-Life Systems',
                body: 'Auto-care scheduler, backup manager, and UI bridge keep your data consistent. Use `/notice push` or `/announce` to keep communities informed, and `/bug report` when something looks off.',
                bullets: [
                    'All slash commands support ephemeral responses for clutter-free channels.',
                    'Retry utilities silently recover rate-limit errors, so you rarely lose progress.',
                    'Helper prompts remind you when a command is locked behind level gates.'
                ]
            }
        ],
        tables: [
            {
                title: 'System snapshot',
                columns: ['System', 'What it tracks', 'Unlocked by'],
                rows: [
                    ['Fish Profile', 'XP, level, inventory, biographies, sell multipliers', 'Automatically created on first `/fish cast`'],
                    ['Challenge Board', 'Hourly, daily, weekly, seasonal, cosmic tasks', 'Command `/fish challenge` after level 8'],
                    ['Fish Pass', 'Seasonal XP track with free + premium reward ladders', 'Open once you complete any seasonal challenge'],
                    ['Seasonal Badges', 'Unique frames + profile cosmetics', 'Top 100 leaderboard finish or special event clears']
                ]
            }
        ],
        callout: 'Pro tip: `/vote` every 12 hours for a 2× pass XP booster and +10% sell value stacking with Market Contacts.'
    },
    {
        id: 'wiki-fishing-atlas',
        icon: '🗺️',
        title: 'Fishing Atlas',
        navSubtitle: 'Locations & rarities',
        description: 'Locations are split between cozy starter biomes, Explorer Map travel zones, and Special Map anomalies. Each biome layers rarity weights, weather scripts, and encounter tables for message-in-a-bottle events, lore drops, and mini bosses.',
        tags: ['Locations', 'Rarities', 'Explorer Map'],
        cards: [
            {
                title: 'Biome families',
                body: 'Each family modifies base loot tables and challenge rolls.',
                bullets: [
                    'Pond & Pier (Tranquil Pond, Sunlit Pier) = fast casts, common fish, perfect for quests.',
                    'Deepwater (Midnight Trench, Aurora Glacier, Ember Depths) = slower casts, Epic/Cosmic weighting, lore drops.',
                    'Special anomalies (Junk Island, Memory Island, Cryptid Cove, Surface Casino) = event fish, cosmetics, gambler tokens.'
                ]
            },
            {
                title: 'Seasonal rotations',
                body: 'Seasonal maps refresh every six weeks with rotating Mythic + Cosmic fish pools, ecology requirements, and challenge modifiers.',
                bullets: [
                    'Season 6 rotation adds Starlit Reef and Umi Station with ecology quotas.',
                    'Winter events buff Aurora Glacier drop rates by +25%.',
                    'Cryptid Cove only appears after you complete the Hunt badge questline.'
                ]
            }
        ],
        tables: [
            {
                title: 'Key locations',
                columns: ['Location', 'Unlock requirement', 'Signature catches', 'Notes'],
                rows: [
                    ['Tranquil Pond', 'Default starting zone', 'Minnow, Pond Koi, Mudcat', 'Fastest cast time, ideal for quests/tutorials.'],
                    ['Sunlit Pier', 'Level 5 + Wide Net tier 1', 'Sunlit Snapper, Tide Seahorse', 'First zone with Rare research items.'],
                    ['Midnight Trench', 'Level 15 + Explorer Map tier 1', 'Midnight Angler, Abyssal Ray', 'Unlocks lore scroll drops and bottle events.'],
                    ['Ember Depths', 'Level 25 + challenge streak ≥ 10', 'Magma Carp, Ember Eel', 'Passive burn aura damages rods unless you own Heat Shield upgrade.'],
                    ['Aurora Glacier', 'Level 35 + pet happiness ≥ Friendly', 'Prism Cod, Aurora Leviathan', 'Holds best XP per catch during winter rotation.'],
                    ['Special Map: Junk Island', 'Special Map tier 1', 'Refurbished Relics, Scrapfin', 'Contains junk currency for `/business recycle`.'],
                    ['Special Map: Memory Island', 'Special Map tier 2', 'Memory Jelly, Echo Ray', 'Each cast retells lore and awards Collector XP.'],
                    ['Surface Casino', 'Special Map tier 3 + `/fish gamble` unlock', 'Chipfish, Neon Whale', 'Every catch awards wager tickets used in `/fish gamble`.']
                ]
            }
        ],
        highlights: [
            'Explorer Map tiers also boost catch size, so even old zones pay better once you upgrade.',
            'Seasonal ecology tasks (via `/ecosystem`) require you to balance captures across habitats to avoid population crashes.'
        ],
        callout: 'Bring Wide Net tier 4 + pets that boost multi-catch before farming Aurora Glacier for Fish Pass XP.'
    },
    {
        id: 'wiki-gear-upgrades',
        icon: '⚙️',
        title: 'Gear, Research & Consumables',
        navSubtitle: 'Shop progression',
        description: 'Coins feed into a loop of permanent shop upgrades, research tech, and consumables. Upgrades stack multiplicatively with pets and seasonal perks, so investing early pays off for every future catch.',
        tags: ['Shop', 'Research Lab', 'Items'],
        cards: [
            {
                title: 'Shop upgrades',
                body: 'Purchased with coins via `/fish shop` and `/fish upgrade`.',
                bullets: [
                    'Lucky Lure increases rare+ odds per tier.',
                    'Quick Cast shaves 2–5 seconds off base timer each tier.',
                    'Explorer/Special Maps unlock entire location groups while also buffing sell multipliers there.'
                ]
            },
            {
                title: 'Research lab',
                body: 'Research points drop from challenges and business milestones. `/business research` handles unlocks.',
                bullets: [
                    'Advanced Lure Tech (5 tiers) adds flat rarity weight that stacks with Lucky Lure.',
                    'Precision Nets increase multi-catch chance and inventory cap.',
                    'Enhanced Storage stops fish rotting while offline and raises sellall batch size.'
                ]
            },
            {
                title: 'Consumables',
                body: 'Short bursts of power drawn from shop, bottle events, or Top.gg voting.',
                bullets: [
                    'Premium Bait: +15% rarity, 30 minutes real time.',
                    'Chum Bucket: +30% multi-catch for 50 casts.',
                    'Auto-Chilla: fully automates caretaking for 24 hours.'
                ]
            }
        ],
        tables: [
            {
                title: 'Permanent upgrades at a glance',
                columns: ['Upgrade', 'Impact', 'Max tier', 'Cost curve'],
                rows: [
                    ['Lucky Lure', '+5% rare chance per tier', '10', 'Starts 1,500 coins → +20% each tier'],
                    ['Quick Cast', '-2s cast time per tier', '8', '5,000 coins, doubles every two tiers'],
                    ['Wide Net', '+1 inventory row per tier', '6', '7,500 coins, adds research materials'],
                    ['Tackle Box', '+25 inventory slots per tier', '5', 'Flat 10,000 coins'],
                    ['Market Contacts', '+3% sell value per tier', '10', '15,000 coins scaling with inflation'],
                    ['Explorer Map', 'Unlocks new biomes + +5% sell value there', '3', '25,000 → 75,000 coins + story quests'],
                    ['Special Map', 'Unlocks anomaly islands + event drops', '3', '50,000 coins + ecology milestones']
                ]
            },
            {
                title: 'Popular consumables',
                columns: ['Item', 'Effect', 'Source'],
                rows: [
                    ['Premium Bait', '+15% rare for 30 minutes', 'Fish Shop loyalty tab'],
                    ['Chum Bucket', '+30% multi-catch for 50 casts', 'Message-in-a-bottle or Super Store'],
                    ['Boost-A Cola', '-10s rod cooldown, stackable twice', 'Vote reward track'],
                    ['Payout Ticket', '+25% sell value next transaction', 'Business daily task'],
                    ['Cosmic Lure', 'Guarantees next Mythic or Cosmic catch', 'Cryptid Cove quests'],
                    ['Auto-Chilla', '24h auto pet care + +5% pet mood', 'Pet Shop prestige tab']
                ]
            }
        ],
        callout: 'Save at least one Payout Ticket for double-whammy with Market Contacts tier 10 and rare fish selling parties.'
    },
    {
        id: 'wiki-pets',
        icon: '🦭',
        title: 'Pets & Companions',
        navSubtitle: 'Caretaking bonuses',
        description: 'Pets sit at the heart of late-game optimization. They provide luck, value, and multi-catch bonuses while unlocking pet farm automation and seasonal cosmetics.',
        tags: ['Pets', 'Eggs', 'Auto-care'],
        cards: [
            {
                title: 'Rarity bands',
                body: 'Common → Uncommon → Rare → Epic → Mythic → Cosmic. Each jump adds base stat rolls and cosmetic flair.'
            },
            {
                title: 'Caretaking loop',
                body: 'Mood decays every 6 hours. Feed snacks, run `/pet play`, or enable Auto-Care to avoid penalties.'
            },
            {
                title: 'Field roles',
                body: 'Slot up to three active pets with unique traits: Lucky, Multi-Catch, Value Booster, Ecology Helper, or Challenge Runner.'
            }
        ],
        tables: [
            {
                title: 'Pet rarity quick guide',
                columns: ['Rarity', 'Draw rate', 'Primary bonus', 'Notes'],
                rows: [
                    ['Common', '45%', '+3% sell or +1 inventory', 'Starter eggs only'],
                    ['Uncommon', '25%', '+5% luck or +5% XP', 'Unlock pet work mini-jobs'],
                    ['Rare', '15%', '+8% luck + secondary stat', 'Eligible for farm assignments'],
                    ['Epic', '8%', '+12% luck + +10% multi-catch', 'Unlocks aura cosmetics'],
                    ['Mythic', '5%', '+18% luck + unique passive (e.g., auto sell commons)', 'Triggers Mythic caretaker quests'],
                    ['Cosmic', '2%', '+25% luck + +25% sell + custom emote', 'Only from Ultra eggs or special events']
                ]
            }
        ],
        highlights: [
            'Egg types: Standard, Multi, Mega, Ultra. Ultra guarantees at least Epic with pity for Cosmic at 90 pulls.',
            'Pet Farm lets you station pets for resource drip (bottles, research parts, clan favors).'
        ],
        callout: 'Keep Auto-Care Scheduler running before maintenance windows so you never fall below Friendly mood (which costs -10% luck).' 
    },
    {
        id: 'wiki-economy',
        icon: '🏦',
        title: 'Economy & Progression',
        navSubtitle: 'Companies, stores, pass',
        description: 'Once you master fishing, the macro economy systems multiply your income: Fishing Companies, Super Stores, Research Lab expansions, Fish Pass, and Bank mechanics.',
        tags: ['Economy', 'Business', 'Fish Pass'],
        cards: [
            {
                title: 'Fishing Companies',
                body: 'Own up to three companies. Each has boats, crew morale, and remote expeditions that collect coins even offline.'
            },
            {
                title: 'Super Stores',
                body: 'Businesses like Fish Processing Plant, Aquarium Shop, Tourism Company, and Research Facility. Upgrade shelves and marketing to increase hourly payouts.'
            },
            {
                title: 'Fish Pass & XP',
                body: '60-level seasonal pass with free/premium tracks. XP sources: fishing, challenges, clans, Top.gg votes, ecology missions.'
            }
        ],
        tables: [
            {
                title: 'High-value systems',
                columns: ['System', 'Loop', 'Why it matters'],
                rows: [
                    ['Fishing Company', 'Assign captains → run voyages → collect coins + research parts', 'Best AFK income; synergy with Business Research Helper'],
                    ['Super Store', 'Stock shelves hourly, upgrade departments, advertise', '+25% sell bonus for server + donation perks unlocking cosmetics'],
                    ['Bank Accounts', 'Deposit coins for interest, unlock loans at higher tiers', 'Lets you front-load expensive upgrades (interest compounds daily).'],
                    ['Research Lab', 'Spend points from challenges/companies to unlock tech', 'Permanent multipliers for fishing + businesses.'],
                    ['Fish Pass', '60 levels, prestige tokens after finishing track', 'Rewards include premium bait, cosmetics, Auto-Chilla, and coins.'],
                    ['Vote Rewards', '`/vote` freebies every 12h', 'Delivers Boost-A Cola, Chum Buckets, and pass XP.']
                ]
            }
        ],
        highlights: [
            'Clan boosts stack with personal bonuses; keep clan tasks cleared for whole server perks.',
            'Top.gg votes trigger webhook in `topggService` giving instant rewards even if the bot is mid-maintenance.'
        ],
        callout: 'Before prestige, empty shops and companies so you do not leave payouts uncollected. The backup manager will remind you, but the wiki recommends double-checking.'
    },
    {
        id: 'wiki-social-commands',
        icon: '🤝',
        title: 'Social Systems & Commands',
        navSubtitle: 'Slash command directory',
        description: 'TackleBot ships with 40+ slash commands spanning fishing, gambling, business, clan, pet, and moderation utilities. Social systems keep communities collaborating through notices, bosses, and clan wars.',
        tags: ['Commands', 'Social', 'Clan'],
        cards: [
            {
                title: 'Clans & factions',
                body: 'Create or join clans to unlock shared vaults, boosts, and raid bosses. `/clan create`, `/clan overview`, `/clan donate` keep everything transparent.'
            },
            {
                title: 'Server bosses',
                body: 'Timed encounters triggered via `/serverboss start`. Rewards include boss-exclusive fish, emotes, and Super Store investment points.'
            },
            {
                title: 'Messaging systems',
                body: '`/announce`, `/notice`, `/bug`, and Message-in-a-Bottle keep feedback loops tight between devs and communities.'
            }
        ],
        tables: [
            {
                title: 'Command families',
                columns: ['Category', 'Flagship commands', 'What they do'],
                rows: [
                    ['Fishing', '`/fish cast`, `/fish inventory`, `/fish sellall`, `/fish shop`', 'Core gameplay, upgrades, and challenge board.'],
                    ['Business', '`/business status`, `/business upgrade`, `/business research`', 'Manage companies, research nodes, payouts.'],
                    ['Pets', '`/pet draw`, `/pet work`, `/pet farm`, `/pet upgrade`', 'Gacha, care, farm tasks, and stat upgrades.'],
                    ['Economy', '`/bank deposit`, `/bank withdraw`, `/bank loan`', 'Secure coins, earn interest, leverage debt responsibly.'],
                    ['Fun & Gamble', '`/fish gamble`, `/fun rizz`, `/fun vibe`', 'Casino-style mini games and lightweight social commands.'],
                    ['Support', '`/help`, `/bug`, `/notice`, `/vote`, `/donate`', 'Documentation, bug reporting, announcements, and funding.']
                ]
            }
        ],
        highlights: [
            'Modal flows (bug reports, clan applications) use Discord modals so you never lose data mid-type.',
            'Retry utilities wrap every slash command reply to prevent Discord API hiccups from breaking UX.'
        ],
        callout: 'Need something that is not listed? Pop into the support server via the footer link and tag the dev team.'
    }
];

function initWikiSections() {
    const navContainer = document.querySelector('[data-nav]');
    const contentContainer = document.getElementById('wikiContent');
    if (!navContainer || !contentContainer || wikiSectionsData.length === 0) {
        return;
    }

    renderWikiNav(navContainer, wikiSectionsData);
    renderWikiContent(contentContainer, wikiSectionsData);
    bindWikiNav(navContainer);
    observeWikiSections(navContainer);
    handleWikiDeepLink(navContainer);
}

// Collapsible panels on landing screen
function initPanelAccordions() {
    const panels = document.querySelectorAll('[data-panel]');
    if (!panels.length) return;

    panels.forEach(panel => {
        const toggle = panel.querySelector('.panel-toggle');
        const body = panel.querySelector('.panel-body');

        if (!toggle || !body) return;

        toggle.addEventListener('click', () => handlePanelToggle(panel, toggle, body));
        toggle.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggle.click();
            }
        });
    });
}

function handlePanelToggle(panel, toggle, body) {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    const nextState = !isExpanded;

    toggle.setAttribute('aria-expanded', nextState);
    panel.classList.toggle('open', nextState);
    body.hidden = !nextState;
}

// Fish tank background rotation
function initTankFish() {
        const container = document.getElementById('tankFish');
        if (!container) return;

        container.innerHTML = '';

        const sprites = [
            { src: 'fishImages/Celestial Whale.png', size: [90, 130] },
            { src: 'fishImages/Phoenix Fish.png', size: [70, 105] },
            { src: 'fishImages/Diamond Bass.png', size: [60, 95] },
            { src: 'fishImages/Starlight Jellyfish.png', size: [70, 110] },
            { src: 'fishImages/Rainbow Trout.png', size: [80, 120] },
            { src: 'fishImages/Golden Koi Fish.png', size: [75, 115] },
            { src: 'fishImages/Ethereal Seahorse.png', size: [65, 100] },
            { src: 'fishImages/Crystal Carp.png', size: [70, 110] },
            { src: 'fishImages/Luminous Eel.png', size: [90, 140] },
            { src: 'fishImages/Prismatic Shark.png', size: [100, 150] },
            { src: 'fishImages/Stained Glass Fish.png', size: [80, 120] },
            { src: 'fishImages/Rainbow Bloom.png', size: [70, 105] }
        ];

        const visibleCount = Math.min(5, sprites.length);
        const selection = shuffleArray(sprites).slice(0, visibleCount);

        selection.forEach((fish, index) => {
            const img = document.createElement('img');
            const size = randomBetween(fish.size[0], fish.size[1]);
            img.src = fish.src;
            img.alt = '';
            img.loading = 'lazy';
            img.style.width = `${size}px`;
            img.style.top = `${randomBetween(5, 70)}%`;
            img.style.left = `${randomBetween(-5, 65)}%`;
            img.style.animationDuration = `${randomBetween(25, 45)}s`;
            img.style.animationDelay = `${index * 1.5}s`;
            img.style.animationName = Math.random() > 0.5 ? 'swimAcrossReverse' : 'swimAcross';

            container.appendChild(img);
        });

    function shuffleArray(array) {
        const copy = [...array];
        for (let i = copy.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    function randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }
}

function renderWikiNav(container, sections) {
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    sections.forEach((section, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'wiki-nav-item';
        if (index === 0) {
            button.classList.add('active');
        }
        button.dataset.target = section.id;
        const icon = document.createElement('span');
        icon.textContent = section.icon;
        const label = document.createElement('div');
        label.innerHTML = `<strong>${section.title}</strong>${section.navSubtitle ? `<br><small>${section.navSubtitle}</small>` : ''}`;
        button.appendChild(icon);
        button.appendChild(label);
        fragment.appendChild(button);
    });
    container.appendChild(fragment);
}

function renderWikiContent(container, sections) {
    container.innerHTML = '';
    sections.forEach(section => {
        const article = document.createElement('article');
        article.className = 'wiki-section';
        article.id = section.id;

        const header = document.createElement('div');
        header.className = 'wiki-section-header';

        const heading = document.createElement('h3');
        heading.textContent = `${section.icon} ${section.title}`;
        header.appendChild(heading);

        if (section.tags && section.tags.length) {
            const meta = document.createElement('div');
            meta.className = 'wiki-section-meta';
            section.tags.forEach(tag => {
                const pill = document.createElement('span');
                pill.className = 'wiki-pill';
                pill.textContent = tag;
                meta.appendChild(pill);
            });
            header.appendChild(meta);
        }

        article.appendChild(header);

        if (section.description) {
            const description = document.createElement('p');
            description.textContent = section.description;
            article.appendChild(description);
        }

        if (section.highlights && section.highlights.length) {
            const list = document.createElement('ul');
            list.className = 'wiki-list';
            section.highlights.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                list.appendChild(li);
            });
            article.appendChild(list);
        }

        if (section.cards && section.cards.length) {
            const grid = document.createElement('div');
            grid.className = 'wiki-card-grid';
            section.cards.forEach(card => {
                const cardEl = document.createElement('div');
                cardEl.className = 'wiki-card';
                const cardTitle = document.createElement('h4');
                cardTitle.textContent = card.title;
                cardEl.appendChild(cardTitle);
                if (card.body) {
                    const cardBody = document.createElement('p');
                    cardBody.textContent = card.body;
                    cardEl.appendChild(cardBody);
                }
                if (card.bullets && card.bullets.length) {
                    const bulletList = document.createElement('ul');
                    card.bullets.forEach(bullet => {
                        const li = document.createElement('li');
                        li.textContent = bullet;
                        bulletList.appendChild(li);
                    });
                    cardEl.appendChild(bulletList);
                }
                grid.appendChild(cardEl);
            });
            article.appendChild(grid);
        }

        if (section.tables && section.tables.length) {
            section.tables.forEach(table => {
                const wrapper = document.createElement('div');
                wrapper.className = 'wiki-table-wrapper';
                const tableTitle = document.createElement('h4');
                tableTitle.textContent = table.title;
                wrapper.appendChild(tableTitle);
                const tableEl = document.createElement('table');
                tableEl.className = 'wiki-table';
                const thead = document.createElement('thead');
                const headRow = document.createElement('tr');
                table.columns.forEach(column => {
                    const th = document.createElement('th');
                    th.textContent = column;
                    headRow.appendChild(th);
                });
                thead.appendChild(headRow);
                tableEl.appendChild(thead);

                const tbody = document.createElement('tbody');
                table.rows.forEach(row => {
                    const tr = document.createElement('tr');
                    row.forEach(cell => {
                        const td = document.createElement('td');
                        td.textContent = cell;
                        tr.appendChild(td);
                    });
                    tbody.appendChild(tr);
                });
                tableEl.appendChild(tbody);
                wrapper.appendChild(tableEl);
                article.appendChild(wrapper);
            });
        }

        if (section.callout) {
            const callout = document.createElement('div');
            callout.className = 'wiki-callout';
            callout.textContent = section.callout;
            article.appendChild(callout);
        }

        container.appendChild(article);
    });
}

function bindWikiNav(container) {
    container.addEventListener('click', event => {
        const target = event.target.closest('.wiki-nav-item');
        if (!target) {
            return;
        }
        const sectionId = target.dataset.target;
        activateWikiNav(container, sectionId);
        scrollWikiTo(sectionId);
        history.replaceState(null, '', `#${sectionId}`);
    });
}

function scrollWikiTo(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) {
        return;
    }
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function activateWikiNav(container, sectionId) {
    const buttons = container.querySelectorAll('.wiki-nav-item');
    buttons.forEach(button => {
        button.classList.toggle('active', button.dataset.target === sectionId);
    });
}

function observeWikiSections(container) {
    const sections = document.querySelectorAll('.wiki-section');
    if (sections.length === 0) {
        return;
    }
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activateWikiNav(container, entry.target.id);
            }
        });
    }, {
        threshold: 0.35,
        rootMargin: '-10% 0px -55% 0px'
    });
    sections.forEach(section => observer.observe(section));
}

function handleWikiDeepLink(container) {
    const syncFromHash = () => {
        const hash = window.location.hash.replace('#', '');
        if (!hash) {
            return;
        }
        const sectionExists = document.getElementById(hash);
        if (!sectionExists) {
            return;
        }
        activateWikiNav(container, hash);
        scrollWikiTo(hash);
    };

    if (window.location.hash) {
        requestAnimationFrame(syncFromHash);
    }

    window.addEventListener('hashchange', syncFromHash);
}

// Export functions for potential use in other scripts
window.TackleBotWebsite = {
    showLoading,
    hideLoading,
    updateActiveNav,
    initButtonEffects,
    showNotification,
    throttle
};

// Add CSS animations for shake effect
if (!document.querySelector('#shake-styles')) {
    const style = document.createElement('style');
    style.id = 'shake-styles';
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
}
