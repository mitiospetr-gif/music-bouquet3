javascript
// ===== Utility Functions =====

// Base64URL encode/decode (safe for URLs)
function base64URLEncode(str) {
    return btoa(encodeURIComponent(str))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function base64URLDecode(str) {
    // Add padding if needed
    const padding = '='.repeat((4 - str.length % 4) % 4);
    const base64 = (str + padding)
        .replace(/\-/g, '+')
        .replace(/\_/g, '/');
    return decodeURIComponent(atob(base64));
}

// Generate unique ID
function generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== Form Handling =====

const form = document.getElementById('bouquetForm');
const resultSection = document.getElementById('resultSection');
const giftLinkInput = document.getElementById('giftLink');
const copyLinkBtn = document.getElementById('copyLink');
const openLinkBtn = document.getElementById('openLink');
const createNewBtn = document.getElementById('createNew');

if (form) {
    form.addEventListener('submit', handleFormSubmit);
}

if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', copyLink);
}

if (openLinkBtn) {
    openLinkBtn.addEventListener('click', openLink);
}

if (createNewBtn) {
    createNewBtn.addEventListener('click', createNew);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        greetingText: document.getElementById('greetingText').value.trim(),
        trackName: document.getElementById('trackName').value.trim(),
        youtubeLink: document.getElementById('youtubeLink').value.trim(),
        yandexLink: document.getElementById('yandexLink').value.trim(),
        author: document.getElementById('author').value.trim(),
        bouquetStyle: document.getElementById('bouquetStyle').value,
        createdAt: new Date().toISOString()
    };
    
    // Validate at least one link
    if (!formData.youtubeLink && !formData.yandexLink) {
        showToast('Добавьте хотя бы одну ссылку (YouTube или Яндекс.Диск)');
        return;
    }
    
    // Encode data to URL-safe string
    const encodedData = base64URLEncode(JSON.stringify(formData));
    
    // Generate gift URL
    const giftUrl = `${window.location.origin}/gift/${encodedData}`;
    
    // Show result section
    giftLinkInput.value = giftUrl;
    resultSection.style.display = 'block';
    
    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    showToast('Подарок создан!');
}

function copyLink() {
    giftLinkInput.select();
    giftLinkInput.setSelectionRange(0, 99999); // Mobile support
    
    try {
        navigator.clipboard.writeText(giftLinkInput.value);
        showToast('Ссылка скопирована!');
    } catch (err) {
        // Fallback for older browsers
        document.execCommand('copy');
        showToast('Ссылка скопирована!');
    }
}

function openLink() {
    window.open(giftLinkInput.value, '_blank');
}

function createNew() {
    form.reset();
    resultSection.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== Gift Page Loading =====

async function loadGift() {
    // Get encoded data from URL path
    const pathParts = window.location.pathname.split('/');
    const encodedData = pathParts[pathParts.length - 1];
    
    if (!encodedData || encodedData === 'gift.html') {
        showError('Ссылка недействительна');
        return;
    }
    
    try {
        const decodedData = base64URLDecode(encodedData);
        const giftData = JSON.parse(decodedData);
        
        displayGift(giftData);
    } catch (error) {
        console.error('Error loading gift:', error);
        showError('Не удалось загрузить подарок. Ссылка может быть повреждена.');
    }
}

function displayGift(data) {
    // Set document title
    document.title = `🌸 ${data.trackName} - Music Bouquet`;
    
    // Set bouquet image
    const bouquetImage = document.getElementById('bouquetImage');
    if (bouquetImage) {
        bouquetImage.src = `/public/images/bouquets/${data.bouquetStyle}.webp`;
        bouquetImage.alt = data.trackName;
    }
    
    // Set greeting text
    const greetingTextEl = document.getElementById('greetingText');
    if (greetingTextEl && data.greetingText) {
        greetingTextEl.textContent = data.greetingText;
    }
    
    // Set track name
    const trackNameEl = document.getElementById('trackName');
    if (trackNameEl) {
        trackNameEl.textContent = data.trackName;
    }
    
    // Set YouTube button
    const youtubeBtn = document.getElementById('youtubeBtn');
    if (youtubeBtn) {
        if (data.youtubeLink) {
            youtubeBtn.href = data.youtubeLink;
            youtubeBtn.style.display = 'flex';
        } else {
            youtubeBtn.style.display = 'none';
        }
    }
    
    // Set Yandex Disk button
    const yandexBtn = document.getElementById('yandexBtn');
    if (yandexBtn) {
        if (data.yandexLink) {
            yandexBtn.href = data.yandexLink;
            yandexBtn.style.display = 'flex';
        } else {
            yandexBtn.style.display = 'none';
        }
    }
    
    // Set author text
    const authorTextEl = document.getElementById('authorText');
    if (authorTextEl && data.author) {
        authorTextEl.textContent = data.author;
    } else if (authorTextEl) {
        authorTextEl.style.display = 'none';
    }
}

function showError(message) {
    const container = document.querySelector('.gift-container');
    if (container) {
        container.innerHTML = `
            <div class="result-card">
                <h3>😔 Ошибка</h3>
                <p>${message}</p>
                <a href="/" class="btn-generate" style="display: inline-block; margin-top: 20px; text-decoration: none; padding: 14px 28px;">
                    Создать новый подарок
                </a>
            </div>
        `;
    }
}

// ===== Image Preloading =====

function preloadImages() {
    const styles = ['classic1', 'classic2', 'romantic1', 'romantic2', 'elegant1', 'elegant2'];
    styles.forEach(style => {
        const img = new Image();
        img.src = `/public/images/bouquets/${style}.webp`;
    });
}

// Preload images on main page
if (document.getElementById('bouquetForm')) {
    window.addEventListener('load', preloadImages);
}

// ===== Service Worker for PWA (optional) =====

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // You can add a service worker here for offline support
        // navigator.serviceWorker.register('/sw.js');
    });
}

// ===== Analytics (optional) =====

function trackEvent(eventName, eventData = {}) {
    // Add your analytics here (Google Analytics, Yandex Metrica, etc.)
    console.log(`Event: ${eventName}`, eventData);
}

// Track form submission
if (form) {
    form.addEventListener('submit', () => {
        trackEvent('gift_created');
    });
}

// Track gift views
if (document.querySelector('.gift-page')) {
    trackEvent('gift_viewed', {
        url: window.location.href
    });
}
