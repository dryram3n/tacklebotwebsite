document.addEventListener('DOMContentLoaded', () => {
    initFishTank();
    highlightActiveTab();
});

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
