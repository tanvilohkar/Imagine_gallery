// DOM Elements
const galleryItems = document.querySelectorAll('.gallery-item');
const filterBtns = document.querySelectorAll('.filter-btn');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDescription = document.getElementById('lightbox-description');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

// State Management
let currentImageIndex = 0;
let visibleImages = [];
let currentFilter = 'all';

// Initialize Gallery
function initGallery() {
    updateVisibleImages();
    setupEventListeners();
    addLoadingAnimation();
}

// Update visible images based on current filter
function updateVisibleImages() {
    visibleImages = Array.from(galleryItems).filter(item => {
        return currentFilter === 'all' || item.dataset.category === currentFilter;
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Gallery item clicks
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
    });

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => filterImages(btn));
    });

    // Lightbox controls
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', showPreviousImage);
    lightboxNext.addEventListener('click', showNextImage);

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyPress);

    // Close lightbox on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Touch gestures for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                showNextImage(); // Swipe left - next image
            } else {
                showPreviousImage(); // Swipe right - previous image
            }
        }
    }
}

// Filter Images
function filterImages(btn) {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Get filter category
    currentFilter = btn.dataset.category;

    // Add filtering animation
    galleryItems.forEach(item => {
        item.classList.add('filtering');
    });

    // Filter after animation delay
    setTimeout(() => {
        galleryItems.forEach(item => {
            item.classList.remove('filtering');
            if (currentFilter === 'all' || item.dataset.category === currentFilter) {
                item.classList.remove('hidden');
                item.classList.add('loaded');
            } else {
                item.classList.add('hidden');
                item.classList.remove('loaded');
            }
        });

        updateVisibleImages();
    }, 250);
}

// Open Lightbox
function openLightbox(index) {
    const clickedItem = galleryItems[index];
    
    // Check if item is visible
    if (clickedItem.classList.contains('hidden')) {
        return;
    }

    // Find index in visible images
    currentImageIndex = visibleImages.indexOf(clickedItem);
    
    if (currentImageIndex === -1) {
        return;
    }

    updateLightboxContent();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Close Lightbox
function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Update Lightbox Content
function updateLightboxContent() {
    if (visibleImages.length === 0) return;

    const currentItem = visibleImages[currentImageIndex];
    const img = currentItem.querySelector('img');
    const overlay = currentItem.querySelector('.overlay');
    const title = overlay.querySelector('h3').textContent;
    const description = overlay.querySelector('p').textContent;

    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt;
    lightboxTitle.textContent = title;
    lightboxDescription.textContent = description;

    // Update navigation buttons visibility
    updateNavigationButtons();
}

// Update Navigation Buttons
function updateNavigationButtons() {
    if (visibleImages.length <= 1) {
        lightboxPrev.style.display = 'none';
        lightboxNext.style.display = 'none';
    } else {
        lightboxPrev.style.display = 'block';
        lightboxNext.style.display = 'block';
    }
}

// Show Previous Image
function showPreviousImage() {
    if (visibleImages.length <= 1) return;

    currentImageIndex = (currentImageIndex - 1 + visibleImages.length) % visibleImages.length;
    updateLightboxContent();
}

// Show Next Image
function showNextImage() {
    if (visibleImages.length <= 1) return;

    currentImageIndex = (currentImageIndex + 1) % visibleImages.length;
    updateLightboxContent();
}

// Handle Keyboard Navigation
function handleKeyPress(e) {
    if (!lightbox.classList.contains('active')) return;

    switch (e.key) {
        case 'Escape':
            closeLightbox();
            break;
        case 'ArrowLeft':
            showPreviousImage();
            break;
        case 'ArrowRight':
            showNextImage();
            break;
    }
}

// Add Loading Animation
function addLoadingAnimation() {
    galleryItems.forEach((item, index) => {
        // Add staggered loading animation
        setTimeout(() => {
            item.classList.add('loaded');
        }, index * 100);
    });
}

// Image Lazy Loading (optional enhancement)
function setupLazyLoading() {
    const images = document.querySelectorAll('.gallery-item img');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    images.forEach(img => imageObserver.observe(img));
}

// Smooth Scroll for Filter Section
function smoothScrollToFilters() {
    const filtersSection = document.querySelector('.filters');
    if (filtersSection) {
        filtersSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    initGallery();
    setupLazyLoading();
});

// Handle Window Resize
window.addEventListener('resize', () => {
    // Update lightbox content on resize to ensure proper sizing
    if (lightbox.classList.contains('active')) {
        updateLightboxContent();
    }
});

// Prevent context menu on images (optional)
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

// Add touch feedback for mobile
if ('ontouchstart' in window) {
    galleryItems.forEach(item => {
        item.addEventListener('touchstart', () => {
            item.style.transform = 'scale(0.98)';
        });

        item.addEventListener('touchend', () => {
            setTimeout(() => {
                item.style.transform = '';
            }, 150);
        });
    });
}

// Performance optimization: Debounce resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedResize = debounce(() => {
    if (lightbox.classList.contains('active')) {
        updateLightboxContent();
    }
}, 250);

window.addEventListener('resize', debouncedResize);
