document.addEventListener('DOMContentLoaded', () => {
    // Get references to important elements on the page
    const catalogContent = document.querySelector('.catalog-content');
    const catalogTabs = document.querySelectorAll('.catalog-tab');
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    const filterTags = document.querySelectorAll('.filter-tag');
    const fishModal = document.getElementById('fishModal');
    const fishDetailContent = document.getElementById('fishDetailContent');
    const closeModal = document.querySelector('.close-modal');
    const loadingIndicator = document.querySelector('.loading-indicator');

    // Flag to prevent running initialization multiple times
    let isInitialized = false;    // Track the current filter/search state
    let currentCategory = 'common'; // Default category
    let currentLocationFilter = 'all'; // Default location
    let currentSeasonFilter = 'all'; // Default season
    let currentRarityFilter = 'all'; // Default rarity
    let searchTerm = '';

    // Initialize the fish catalog functionality
    function initCatalog() {
        // Only run initialization once
        if (isInitialized) {
            return;
        }

        // Check if the main fish data (FISH_DATA) is loaded
        if (typeof FISH_DATA === 'undefined') {
            console.error('Fish data (FISH_DATA) not loaded. Make sure fish-info.js is loaded before fish-catalog.js');
            // Try checking again after a short delay, just in case of loading order issues
            setTimeout(() => {
                if (!isInitialized && typeof FISH_DATA !== 'undefined') {
                    initCatalog();
                } else {
                    // If still not loaded, show an error message
                    if (loadingIndicator) loadingIndicator.style.display = 'none';
                    catalogContent.innerHTML = '<div class="error-message">Failed to load fish data. Please refresh the page.</div>';
                }
            }, 2000);
            return;
        }

        // Mark as initialized
        isInitialized = true;

        // Set up all the button clicks and input listeners
        setupEventListeners();

        // Load the initial view (default category)
        displayFishByCategory(currentCategory);

        console.log('Fish catalog initialized');
    }    // Set up event listeners for tabs, search, filters, and modal
    function setupEventListeners() {
        // Category tab clicks
        catalogTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.dataset.category;
                setActiveCategory(category);
                displayFishByCategory(category); // Refresh display with new category
            });
        });

        // Search button click and Enter key press
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') performSearch();
        });

        // Location filter tag clicks
        const locationFilters = document.querySelectorAll('#locationFilters .filter-tag');
        locationFilters.forEach(tag => {
            tag.addEventListener('click', () => {
                // Update active state visually
                locationFilters.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                // Update filter state and refresh display
                currentLocationFilter = tag.dataset.filter;
                displayFishByCategory(currentCategory);
            });
        });

        // Season filter tag clicks
        const seasonFilters = document.querySelectorAll('#seasonFilters .filter-tag');
        seasonFilters.forEach(tag => {
            tag.addEventListener('click', () => {
                // Update active state visually
                seasonFilters.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                // Update filter state and refresh display
                currentSeasonFilter = tag.dataset.filter;
                displayFishByCategory(currentCategory);
            });
        });

        // Rarity filter tag clicks
        const rarityFilters = document.querySelectorAll('#rarityFilters .filter-tag');
        rarityFilters.forEach(tag => {
            tag.addEventListener('click', () => {
                // Update active state visually
                rarityFilters.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                // Update filter state and refresh display
                currentRarityFilter = tag.dataset.filter;
                displayFishByCategory(currentCategory);
            });
        });

        // Modal close button click - Fixed by adding direct DOM access
        if (closeModal) {
            closeModal.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Close modal button clicked");
                fishModal.style.display = 'none';
                document.body.style.overflow = 'auto'; // Allow background scrolling again
                document.body.classList.remove('modal-open'); // Remove body class
            });
        } else {
            console.error("Close modal button not found");
        }

        // Close modal if user clicks outside the modal content area
        window.addEventListener('click', (e) => {
            if (e.target === fishModal) {
                fishModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                document.body.classList.remove('modal-open');
            }
        });

        // Close modal if user presses the Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && fishModal.style.display === 'block') {
                fishModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                document.body.classList.remove('modal-open');
            }
        });
    }

    // Update the visual state of the category tabs
    function setActiveCategory(category) {
        catalogTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.category === category) {
                tab.classList.add('active');
            }
        });
        currentCategory = category; // Update the current category state
    }    // Display fish cards based on the current category, location filter, and search term
    function displayFishByCategory(category) {
        if (!isInitialized) return; // Don't run if not initialized

        catalogContent.innerHTML = ''; // Clear previous fish cards
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block'; // Show loading spinner
        }

        // Use a small timeout to allow the loading indicator to render before potentially heavy filtering/DOM manipulation
        setTimeout(() => {
            try {
                // Get the list of fish for the selected category
                let fishList = FISH_DATA[category] || [];

                // Apply location filter if one is selected (and not 'all')
                if (currentLocationFilter !== 'all') {
                    fishList = fishList.filter(fish =>
                        fish.locations && fish.locations.includes(currentLocationFilter)
                    );
                }
                
                // Apply season filter if one is selected (and not 'all')
                if (currentSeasonFilter !== 'all') {
                    fishList = fishList.filter(fish =>
                        fish.seasons && fish.seasons.includes(currentSeasonFilter)
                    );
                }
                
                // Apply rarity filter if one is selected (and not 'all')
                if (currentRarityFilter !== 'all') {
                    fishList = fishList.filter(fish =>
                        fish.rarity === currentRarityFilter
                    );
                }

                // Apply search term filter if there's a search term entered
                if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    fishList = fishList.filter(fish =>
                        fish.name.toLowerCase().includes(term) ||
                        (fish.description && fish.description.toLowerCase().includes(term)) ||
                        (fish.lore && fish.lore.toLowerCase().includes(term))
                    );
                }

                // Update the results count display
                const resultsCount = document.getElementById('resultsCount');
                if (resultsCount) {
                    resultsCount.textContent = fishList.length > 0
                        ? `Showing ${fishList.length} ${capitalizeFirst(category)} fish`
                        : 'No results found';
                }

                // If no fish match the criteria, display a message
                const noResultsElement = document.getElementById('noResults');
                if (fishList.length === 0) {
                    if (noResultsElement) noResultsElement.style.display = 'block';
                    if (loadingIndicator) loadingIndicator.style.display = 'none';
                    return; // Stop processing
                } else {
                    if (noResultsElement) noResultsElement.style.display = 'none';
                }

                // Create and append a card for each fish in the filtered list
                fishList.forEach(fish => {
                    const fishCard = createFishCard(fish, category); // Pass category here
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
                // Hide loading indicator regardless of success or error
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
            }
        }, 10); // Small delay (10ms) for UI responsiveness
    }

    // Create the HTML structure for a single fish card
    function createFishCard(fish, category) {
        const card = document.createElement('div');
        // Use the fish's inherent rarity for border styling, but add 'event' class if applicable
        const cardRarityClass = fish.rarity || category; // Use fish's rarity if defined, else category
        card.className = `fish-card ${cardRarityClass}`;
        if (category === 'event') {
            card.classList.add('event'); // Add specific event class if needed for other styles
        }

        // Get the fish image URL from FISH_IMAGES, use placeholder if not found
        let imageUrl = 'images/placeholder-fish.png'; // Default placeholder
        if (typeof FISH_IMAGES !== 'undefined' && FISH_IMAGES[fish.name]) {
            imageUrl = FISH_IMAGES[fish.name];
        }

        card.innerHTML = `
            <img src="${imageUrl}" alt="${fish.name}" class="fish-image" onerror="this.src='images/placeholder-fish.png'">
            <h3 class="fish-name">${fish.name}</h3>
            <p class="fish-rarity">${capitalizeFirst(fish.rarity || category)}</p>
            <p class="fish-value">${fish.baseValue ? `🪙 ${fish.baseValue}` : 'Value: ?'}</p>
        `;

        // Add click listener to open the details modal for this fish
        card.addEventListener('click', () => displayFishDetail(fish));

        return card;
    }

    // Populate and display the fish details modal
    function displayFishDetail(fish) {
        document.body.classList.add('modal-open'); // Add class to prevent background scrolling

        // Get fish image URL
        let imageUrl = 'images/placeholder-fish.png'; // Default placeholder
        if (typeof FISH_IMAGES !== 'undefined' && FISH_IMAGES[fish.name]) {
            imageUrl = FISH_IMAGES[fish.name];
        }

        // Get fish lore text
        const getLore = () => {
            if (fish.lore) return fish.lore;
            return 'Lore for this fish has yet to be discovered. Continue fishing!';
        };

        // Format the locations list into HTML tags
        let locationsHtml = '';
        if (fish.locations && fish.locations.length > 0) {
            locationsHtml = `
                <div class="fish-locations">
                    ${fish.locations.map(locKey => {
                        const locationInfo = FISH_DATA.locations[locKey];
                        const emoji = locationInfo ? locationInfo.emoji : '';
                        const name = locationInfo ? locationInfo.displayName : locKey;
                        return `<span class="location-tag">${emoji} ${name}</span>`;
                    }).join('')}
                </div>
            `;
        }

        // Format seasonal badge if the fish is seasonal
        let seasonalHtml = '';
        if (fish.seasonal) {
            const seasonInfo = FISH_DATA.seasons[fish.seasonal];
            if (seasonInfo) {
                seasonalHtml = `
                    <div class="seasonal-badge">
                        ${seasonInfo.displayEmoji} ${seasonInfo.name} Season Exclusive
                    </div>
                `;
            }
        }

        // Format event badge if the fish is an event fish
        let eventHtml = '';
        if (fish.event && fish.startDate && fish.endDate) {
            const formatEventDate = (dateString) => {
                try {
                    // Format as Month Day (e.g., Apr 1)
                    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
                } catch (e) {
                    console.error("Error formatting event date:", e);
                    return 'N/A';
                }
            };
            const startDateFormatted = formatEventDate(fish.startDate);
            const endDateFormatted = formatEventDate(fish.endDate);
            // Check if the event is currently active
            const now = new Date();
            const isActive = now >= new Date(fish.startDate) && now <= new Date(fish.endDate);

            eventHtml = `
                <div class="event-badge ${isActive ? 'active-event' : ''}">
                    🎉 Event: ${fish.event} (${startDateFormatted} - ${endDateFormatted})${isActive ? ' (Active!)' : ''}
                </div>
            `;
        }

        // Build the inner HTML for the modal content area
        fishDetailContent.innerHTML = `
            <div class="fish-detail-header">
                <img src="${imageUrl}" alt="${fish.name}" class="fish-detail-image"
                    onerror="this.src='images/placeholder-fish.png'">
                <h2 id="fishDetailTitle" class="fish-detail-title">${fish.name}</h2>
                <span class="fish-detail-rarity" style="background-color: ${FISH_DATA.colors[fish.rarity] || '#ccc'}; color: #fff;">
                    ${capitalizeFirst(fish.rarity || 'event')}
                </span>
                ${seasonalHtml}
                ${eventHtml}
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

        // Display the modal and scroll to the top
        fishModal.style.display = 'block';
        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling while modal is open
    }

    // Trigger fish display update based on the search input value
    function performSearch() {
        searchTerm = searchInput.value.trim(); // Update the search term state
        displayFishByCategory(currentCategory); // Refresh the display
    }

    // Simple helper function to capitalize the first letter of a string
    function capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Attempt to initialize the catalog, with error handling
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