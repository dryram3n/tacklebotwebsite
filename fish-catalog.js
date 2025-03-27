document.addEventListener('DOMContentLoaded', () => {
    // References to DOM elements
    const catalogContent = document.querySelector('.catalog-content');
    const catalogTabs = document.querySelectorAll('.catalog-tab');
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    const filterTags = document.querySelectorAll('.filter-tag');
    const fishModal = document.getElementById('fishModal');
    const fishDetailContent = document.getElementById('fishDetailContent');
    const closeModal = document.querySelector('.close-modal');
    const loadingIndicator = document.querySelector('.loading-indicator');
    
    // Add initialization guard to prevent multiple initializations
    let isInitialized = false;
    
    // Current state tracking
    let currentCategory = 'common';
    let currentLocationFilter = 'all';
    let searchTerm = '';
    
    // Initialize the catalog
    function initCatalog() {
        // Prevent multiple initializations
        if (isInitialized) {
            return;
        }
        
        // Check if FISH_DATA is loaded
        if (typeof FISH_DATA === 'undefined') {
            console.error('Fish data not loaded. Make sure fish-info.js is properly loaded before fish-catalog.js');
            // Try again after a short delay, but only once
            setTimeout(() => {
                if (!isInitialized && typeof FISH_DATA !== 'undefined') {
                    initCatalog();
                } else {
                    if (loadingIndicator) loadingIndicator.style.display = 'none';
                    catalogContent.innerHTML = '<div class="error-message">Failed to load fish data. Please refresh the page.</div>';
                }
            }, 2000);
            return;
        }
        
        // Set flag to prevent re-initialization
        isInitialized = true;
        
        // Set up event listeners
        setupEventListeners();
        
        // Load initial fish category
        displayFishByCategory(currentCategory);
        
        console.log('Fish catalog initialized');
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        // Category tab switching
        catalogTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.dataset.category;
                setActiveCategory(category);
                displayFishByCategory(category);
            });
        });
        
        // Search functionality
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') performSearch();
        });
        
        // Filter tags
        filterTags.forEach(tag => {
            tag.addEventListener('click', () => {
                filterTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                currentLocationFilter = tag.dataset.filter;
                displayFishByCategory(currentCategory);
            });
        });
        
        // Modal close button
        closeModal.addEventListener('click', () => {
            fishModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Re-enable scrolling
            document.body.classList.remove('modal-open');
        });
        
        // Close modal on click outside
        window.addEventListener('click', (e) => {
            if (e.target === fishModal) {
                fishModal.style.display = 'none';
                document.body.style.overflow = 'auto'; // Re-enable scrolling
                document.body.classList.remove('modal-open');
            }
        });
        
        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && fishModal.style.display === 'block') {
                fishModal.style.display = 'none';
                document.body.style.overflow = 'auto'; // Re-enable scrolling
                document.body.classList.remove('modal-open');
            }
        });
    }
    
    // Set active category tab
    function setActiveCategory(category) {
        catalogTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.category === category) {
                tab.classList.add('active');
            }
        });
        currentCategory = category;
    }
    
    // Display fish by category with optional filtering
    function displayFishByCategory(category) {
        // Prevent operation if not initialized
        if (!isInitialized) return;
        
        // Clear previous content
        catalogContent.innerHTML = '';
        
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
        
        // Add a short delay to avoid UI freezing and ensure loading indicator shows
        setTimeout(() => {
            try {
                // Get fish for the selected category
                let fishList = FISH_DATA[category] || [];
                
                // Apply location filter if not 'all'
                if (currentLocationFilter !== 'all') {
                    fishList = fishList.filter(fish => 
                        fish.locations && fish.locations.includes(currentLocationFilter)
                    );
                }
                
                // Apply search term if any
                if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    fishList = fishList.filter(fish => 
                        fish.name.toLowerCase().includes(term) || 
                        (fish.description && fish.description.toLowerCase().includes(term)) ||
                        (fish.lore && fish.lore.toLowerCase().includes(term))
                    );
                }
                
                // Update results count
                const resultsCount = document.getElementById('resultsCount');
                if (resultsCount) {
                    resultsCount.textContent = fishList.length > 0 
                        ? `Showing ${fishList.length} ${capitalizeFirst(category)} fish` 
                        : 'No results found';
                }
                
                // Display message if no fish found
                if (fishList.length === 0) {
                    catalogContent.innerHTML = `
                        <div class="no-results">
                            <p>No fish found matching your criteria. Try changing your filters or search term.</p>
                        </div>
                    `;
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'none';
                    }
                    return;
                }
                
                // Create fish cards
                fishList.forEach(fish => {
                    const fishCard = createFishCard(fish, category);
                    catalogContent.appendChild(fishCard);
                });
            } catch (error) {
                console.error('Error displaying fish:', error);
                catalogContent.innerHTML = `
                    <div class="error-message">
                        <p>There was an error loading the fish data. Please try refreshing the page.</p>
                    </div>
                `;
            } finally {
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
            }
        }, 10); // Small delay for UI responsiveness
    }
    
    // Create a fish card element
    function createFishCard(fish, category) {
        const card = document.createElement('div');
        card.className = `fish-card ${category}`;
        
        // Get fish image URL from the fishImages.js file if available
        let imageUrl = 'images/placeholder-fish.png'; // Default placeholder
        if (typeof FISH_IMAGES !== 'undefined' && FISH_IMAGES[fish.name]) {
            imageUrl = FISH_IMAGES[fish.name];
        }
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${fish.name}" class="fish-image" onerror="this.src='images/placeholder-fish.png'">
            <h3 class="fish-name">${fish.name}</h3>
            <p class="fish-rarity">${capitalizeFirst(fish.rarity || 'unknown')}</p>
            <p class="fish-value">Value: 🪙 ${fish.baseValue || '?'}</p>
        `;
        
        // Add click event to open detailed modal
        card.addEventListener('click', () => displayFishDetail(fish));
        
        return card;
    }
    
    // Display detailed fish information in modal
    function displayFishDetail(fish) {
        document.body.classList.add('modal-open'); // Add class to prevent background scrolling
        
        // Get fish image
        let imageUrl = 'images/placeholder-fish.png'; // Default placeholder
        if (typeof FISH_IMAGES !== 'undefined' && FISH_IMAGES[fish.name]) {
            imageUrl = FISH_IMAGES[fish.name];
        }
        
        // Get fish lore if available
        const getLore = () => {
            // Try to fetch from fish-info lore property
            if (fish.lore) return fish.lore;
            
            // Try to fetch from the custom getFishLore function if available
            if (typeof getFishLore === 'function') {
                const lore = getFishLore(fish.name);
                if (lore) return lore;
            }
            
            return 'Lore for this fish has yet to be discovered. Continue fishing to unlock more information!';
        };
        
        // Format locations if available
        let locationsHtml = '';
        if (fish.locations && fish.locations.length > 0) {
            locationsHtml = `
                <div class="fish-locations">
                    ${fish.locations.map(loc => {
                        const location = FISH_DATA.locations[loc];
                        return `<span class="location-tag">${location ? location.emoji : ''} ${location ? location.displayName : loc}</span>`;
                    }).join('')}
                </div>
            `;
        }
        
        // Format seasonal info if available
        let seasonalHtml = '';
        if (fish.seasonal) {
            const season = FISH_DATA.seasons[fish.seasonal];
            if (season) {
                seasonalHtml = `
                    <div class="seasonal-badge">
                        ${season.displayEmoji} ${season.name} Season Exclusive
                    </div>
                `;
            }
        }
        
        // Build modal content
        fishDetailContent.innerHTML = `
            <div class="fish-detail-header">
                <img src="${imageUrl}" alt="${fish.name}" class="fish-detail-image" 
                    onerror="this.src='images/placeholder-fish.png'">
                <h2 class="fish-detail-title">${fish.name}</h2>
                <span class="fish-detail-rarity" style="background-color: ${FISH_DATA.colors[fish.rarity]}; color: #fff;">
                    ${capitalizeFirst(fish.rarity || 'unknown')}
                </span>
                ${seasonalHtml}
            </div>
            
            <p class="fish-detail-description">${fish.description || 'No description available.'}</p>
            
            <div class="fish-detail-stats">
                ${fish.baseValue ? `
                    <div class="stat-item">
                        <div class="stat-label">Value</div>
                        <div class="stat-value">🪙 ${fish.baseValue}</div>
                    </div>
                ` : ''}
                
                ${fish.weightRange ? `
                    <div class="stat-item">
                        <div class="stat-label">Weight Range</div>
                        <div class="stat-value">${fish.weightRange.min}kg - ${fish.weightRange.max}kg</div>
                    </div>
                ` : ''}
                
                ${fish.lengthRange ? `
                    <div class="stat-item">
                        <div class="stat-label">Length Range</div>
                        <div class="stat-value">${fish.lengthRange.min}cm - ${fish.lengthRange.max}cm</div>
                    </div>
                ` : ''}
            </div>
            
            ${locationsHtml ? `
                <div class="stat-item">
                    <div class="stat-label">Found In</div>
                    ${locationsHtml}
                </div>
            ` : ''}
            
            <div class="fish-detail-lore">
                <h3 class="lore-title">📜 Lore</h3>
                <p class="lore-text">${getLore()}</p>
            </div>
        `;
        
        // Position modal at the top of the viewport and display it
        fishModal.style.display = 'block';
        window.scrollTo(0, 0); // Scroll to top when modal opens
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }
    
    // Perform search based on input value
    function performSearch() {
        searchTerm = searchInput.value.trim();
        displayFishByCategory(currentCategory);
    }
    
    // Helper function to capitalize first letter
    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    // Initialize the catalog when DOM is loaded - with error handling
    try {
        initCatalog();
    } catch (error) {
        console.error('Error initializing fish catalog:', error);
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (catalogContent) {
            catalogContent.innerHTML = '<div class="error-message">Failed to initialize fish catalog. Please refresh the page.</div>';
        }
    }
});
