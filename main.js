// ============= MAIN JAVASCRIPT FOR A.M GARMENTS =============

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initializeShop();
    setupResponsiveFeatures();
    loadCart();
    setupCartIcon();
});

// Initialize shop
function initializeShop() {
    setupMobileMenu();
    setupCarousel();
    setupContactForm();
    setupProductCards();
}

// ============= RESPONSIVE FEATURES =============

function setupResponsiveFeatures() {
    // Handle window resize
    window.addEventListener('resize', function () {
        updateResponsiveElements();
    });

    // Initial setup
    updateResponsiveElements();
}

function updateResponsiveElements() {
    const isMobile = window.innerWidth <= 768;

    // Update hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (isMobile && hamburger && navMenu) {
        hamburger.style.display = 'flex';
    } else if (hamburger && navMenu) {
        hamburger.style.display = 'none';
        navMenu.classList.remove('active');
    }
}

// ============= MOBILE MENU =============

function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!hamburger || !navMenu) return;

    // Toggle menu
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        updateHamburgerIcon();
    });

    // Close menu when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            updateHamburgerIcon();
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            updateHamburgerIcon();
        }
    });
}

function updateHamburgerIcon() {
    const hamburger = document.getElementById('hamburger');
    const spans = hamburger.querySelectorAll('span');

    if (hamburger.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translateY(10px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-10px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

// ============= CAROUSEL FUNCTIONALITY =============

let currentSlide = 0;
let autoplayInterval = null;
const AUTOPLAY_DELAY = 5000; // 5 seconds

function setupCarousel() {
    const openCarouselBtn = document.getElementById('open-carousel');
    const closeCarouselBtn = document.getElementById('close-carousel');
    const carouselModal = document.getElementById('carousel-modal');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');

    if (openCarouselBtn) {
        openCarouselBtn.addEventListener('click', () => {
            carouselModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            currentSlide = 0;
            showSlide(currentSlide);
        });
    }

    if (closeCarouselBtn) {
        closeCarouselBtn.addEventListener('click', closeCarousel);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', previousSlide);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    // Build indicators
    buildIndicators();

    // Start autoplay
    startAutoplay();

    // Pause autoplay on hover
    const track = document.querySelector('.carousel-track');
    if (track) {
        track.addEventListener('mouseenter', pauseAutoplay);
        track.addEventListener('mouseleave', startAutoplay);
    }

    // Close modal when clicking outside
    if (carouselModal) {
        carouselModal.addEventListener('click', (e) => {
            if (e.target === carouselModal) {
                closeCarousel();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('carousel-modal');
        if (modal && modal.getAttribute('aria-hidden') === 'false') {
            if (e.key === 'ArrowLeft') previousSlide();
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'Escape') closeCarousel();
        }
    });
}

function showSlide(n) {
    const slides = document.querySelectorAll('.carousel-slide');
    
    if (n >= slides.length) currentSlide = 0;
    if (n < 0) currentSlide = slides.length - 1;

    slides.forEach(slide => slide.classList.remove('active'));
    slides[currentSlide].classList.add('active');

    // Add animation effect
    const track = document.querySelector('.carousel-track');
    if (track) {
        track.style.animation = 'none';
        setTimeout(() => {
            track.style.animation = 'fadeIn 0.3s ease';
        }, 10);
    }

    // Update indicators
    updateIndicators();

    // Attach slide action handlers
    attachSlideActions();
}

function nextSlide() {
    currentSlide++;
    showSlide(currentSlide);
}

function previousSlide() {
    currentSlide--;
    showSlide(currentSlide);
}

function closeCarousel() {
    const carouselModal = document.getElementById('carousel-modal');
    if (carouselModal) {
        carouselModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
    }
    pauseAutoplay();
}

// Indicators
function buildIndicators() {
    const indicators = document.querySelector('.carousel-indicators');
    const slides = document.querySelectorAll('.carousel-slide');
    if (!indicators || !slides) return;
    indicators.innerHTML = '';
    slides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = 'indicator-dot';
        dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
        dot.addEventListener('click', () => {
            currentSlide = idx;
            showSlide(currentSlide);
        });
        indicators.appendChild(dot);
    });
    updateIndicators();
}

function updateIndicators() {
    const dots = document.querySelectorAll('.indicator-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

function startAutoplay() {
    if (autoplayInterval) return;
    autoplayInterval = setInterval(() => {
        nextSlide();
    }, AUTOPLAY_DELAY);
}

function pauseAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
    }
}

// Slide action buttons
function attachSlideActions() {
    const activeSlide = document.querySelector('.carousel-slide.active');
    if (!activeSlide) return;

    const addBtn = activeSlide.querySelector('.btn-add-cart');
    const buyBtn = activeSlide.querySelector('.btn-buy-now');

    // Remove old listeners by cloning
    if (addBtn) {
        const newAdd = addBtn.cloneNode(true);
        addBtn.parentNode.replaceChild(newAdd, addBtn);
        newAdd.addEventListener('click', () => {
            const caption = activeSlide.querySelector('.slide-caption');
            const name = caption.dataset.name || caption.querySelector('h3')?.textContent || 'Product';
            const price = parseFloat(caption.dataset.price) || 0;
            const image = caption.dataset.image || activeSlide.querySelector('img')?.src || '';
            const category = caption.dataset.category || 'Carousel';
            window.addToCart(name, price, image, 'One Size', category);
            openCartDrawer();
        });
    }

    if (buyBtn) {
        const newBuy = buyBtn.cloneNode(true);
        buyBtn.parentNode.replaceChild(newBuy, buyBtn);
        newBuy.addEventListener('click', () => {
            const caption = activeSlide.querySelector('.slide-caption');
            const name = caption.dataset.name || caption.querySelector('h3')?.textContent || 'Product';
            const price = parseFloat(caption.dataset.price) || 0;
            const image = caption.dataset.image || activeSlide.querySelector('img')?.src || '';
            const category = caption.dataset.category || 'Carousel';
            window.addToCart(name, price, image, 'One Size', category);
            // short delay then go to checkout
            setTimeout(() => {
                window.goToCheckout();
            }, 300);
        });
    }
}

// Add fade animation
const carouselStyle = document.createElement('style');
carouselStyle.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(carouselStyle);

const cartDrawerStyle = document.createElement('style');
cartDrawerStyle.textContent = `
    .cart-drawer {
        position: fixed;
        right: 20px;
        top: 90px;
        width: 360px;
        max-width: calc(100% - 40px);
        max-height: calc(100vh - 120px);
        background: #ffffff;
        border: 1px solid #ddd;
        box-shadow: 0 18px 45px rgba(0,0,0,0.18);
        z-index: 2200;
        overflow-y: auto;
        border-radius: 16px;
        padding: 18px;
        font-family: inherit;
        display: none;
    }
    .cart-drawer.open {
        display: block;
    }
    .cart-drawer .cart-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 1rem;
    }
    .cart-drawer .cart-controls {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
    }
    .cart-drawer .cart-items {
        display: grid;
        gap: 1rem;
    }
    .cart-drawer .cart-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
    }
    .cart-drawer .cart-item img {
        width: 72px;
        height: 72px;
        object-fit: cover;
        border-radius: 12px;
    }
    .cart-drawer .item-info {
        flex: 1;
        min-width: 0;
    }
    .cart-drawer .item-name {
        font-weight: 700;
        margin-bottom: 0.35rem;
    }
    .cart-drawer .item-meta {
        font-size: 0.95rem;
        color: #555;
    }
    .cart-drawer .item-controls {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-end;
    }
    .cart-drawer .qty-input {
        width: 72px;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 0.4rem 0.5rem;
    }
    .cart-drawer button {
        cursor: pointer;
        border: none;
        border-radius: 10px;
        transition: background-color 0.2s ease, transform 0.2s ease;
    }
    .cart-drawer #checkout-now {
        width: 100%;
        padding: 0.95rem 1rem;
        background: #1a1a1a;
        color: #fff;
        font-weight: 700;
    }
    .cart-drawer #checkout-now:hover {
        background: #333;
    }
    .cart-drawer #close-cart {
        background: #eee;
        color: #333;
        padding: 0.6rem 1rem;
    }
    .cart-drawer .cart-footer {
        margin-top: 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
    }
`;
document.head.appendChild(cartDrawerStyle);

// ============= CONTACT FORM =============

function setupContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleContactSubmit(this);
        });
    }
}

function handleContactSubmit(form) {
    const formData = new FormData(form);
    const data = {
        name: form.querySelector('input[placeholder*="Name"]')?.value,
        email: form.querySelector('input[placeholder*="Email"]')?.value,
        message: form.querySelector('textarea')?.value
    };

    // Validate
    if (!data.name || !data.email || !data.message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    // Simulate form submission
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        console.log('Contact message:', data);
        showNotification('Thank you! We\'ll get back to you soon.', 'success');
        form.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

// ============= SHOPPING CART FUNCTIONALITY =============

let cart = [];
let cartSort = localStorage.getItem('cartSort') || 'name';

function loadCart() {
    const savedCart = localStorage.getItem('cart');
    cart = savedCart ? JSON.parse(savedCart) : [];
    updateCartDisplay();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

function addToCart(productName, price, image, size = 'One Size', category = 'General') {
    const existingItem = cart.find(item => item.name === productName && item.size === size && item.category === category);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: Date.now(),
            name: productName,
            price: price,
            quantity: 1,
            size: size,
            image: image,
            category: category
        });
    }

    saveCart();
    showNotification(`${productName} added to cart!`, 'success');
    updateCartIcon();
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    updateCartDisplay();
}

function updateQuantity(itemId, quantity) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity = Math.max(1, quantity);
        saveCart();
    }
}

function updateCartDisplay() {
    updateCartIcon();
    renderCartDrawer();
}

function setupCartIcon() {
    // This would be used if you have a cart icon in the header
    updateCartIcon();
}

function updateCartIcon() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartIcon = document.querySelector('.cart-icon-wrapper .cart-count');
    
    if (cartIcon) {
        if (totalItems > 0) {
            cartIcon.textContent = totalItems;
            cartIcon.style.display = 'flex';
        } else {
            cartIcon.style.display = 'none';
        }
    }
}

function openCartDrawer() {
    renderCartDrawer();
    const drawer = document.getElementById('cart-drawer');
    if (drawer) {
        drawer.classList.add('open');
        drawer.style.display = 'block';
    }
}

function getProductDataFromButton(button) {
    const productCard = button.closest('.product-card');
    if (!productCard) return null;

    const name = productCard.querySelector('h4')?.textContent.trim() || 'Product';
    const priceText = productCard.querySelector('.price')?.textContent || '0';
    const price = parseFloat(priceText.replace(/[^0-9\.\,]/g, '').replace(/,/g, '')) || 0;
    const image = productCard.querySelector('img')?.src || '';
    const sizeSelect = productCard.querySelector('.size-select');
    const size = sizeSelect?.value || 'One Size';
    const categoryTitle = productCard.closest('.product-category')?.querySelector('.category-title')?.textContent.trim();
    const category = categoryTitle || 'General';

    return { name, price, image, size, category };
}

function addProductToCart(button) {
    const product = getProductDataFromButton(button);
    if (!product) return;

    if (!product.size || product.size === 'Select Size') {
        showNotification('Please select a size before adding to cart.', 'warning');
        return;
    }

    addToCart(product.name, product.price, product.image, product.size, product.category);
    openCartDrawer();
}

function buyProductNow(button) {
    const product = getProductDataFromButton(button);
    if (!product) return;

    if (!product.size || product.size === 'Select Size') {
        showNotification('Please select a size before buying now.', 'warning');
        return;
    }

    addToCart(product.name, product.price, product.image, product.size, product.category);
    setTimeout(() => {
        window.goToCheckout();
    }, 150);
}

// ============= PRODUCT INTERACTIONS =============

function setupProductCards() {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        card.addEventListener('click', () => {
            const productName = card.querySelector('h4').textContent;
            const productPrice = card.dataset.price || 0;
            const productImage = card.querySelector('img').src;

            // You can add a modal or redirect to product detail page
            console.log('Product clicked:', productName);
        });

        // Add hover effect
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-15px)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });

    // Attach hover and interaction styling for product cards
    const productButtons = document.querySelectorAll('.product-button');
    productButtons.forEach(btn => {
        btn.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Render a cart drawer showing items grouped by category
function renderCartDrawer() {
    let drawer = document.getElementById('cart-drawer');
    if (!drawer) {
        drawer = document.createElement('aside');
        drawer.id = 'cart-drawer';
        drawer.className = 'cart-drawer';
        document.body.appendChild(drawer);
    }

    if (cart.length === 0) {
        drawer.innerHTML = `<div class="cart-empty"><h4>Your cart is empty</h4></div>`;
        return;
    }

    // Group by category
    const groups = {};
    cart.forEach(item => {
        const cat = item.category || 'General';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(item);
    });

    // Build HTML
    let html = `<div class="cart-header">
                    <h3>Your Cart</h3>
                    <div class="cart-controls">
                        <label for="cart-sort">Sort by</label>
                        <select id="cart-sort">
                            <option value="name">Name</option>
                            <option value="price-asc">Price: Low → High</option>
                            <option value="price-desc">Price: High → Low</option>
                            <option value="quantity">Quantity</option>
                        </select>
                        <button id="close-cart">Close</button>
                    </div>
                </div>`;
    for (const cat of Object.keys(groups)) {
        // sort items in this category according to cartSort
        groups[cat] = sortItems(groups[cat], cartSort);
        html += `<div class="cart-category"><h4>${cat}</h4><div class="cart-items">`;
        groups[cat].forEach(item => {
            html += `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-meta">Size: ${item.size} · PKR ${item.price}</div>
                    </div>
                    <div class="item-controls">
                        <input type="number" min="1" value="${item.quantity}" class="qty-input" data-id="${item.id}">
                        <button class="remove-item" data-id="${item.id}">Remove</button>
                    </div>
                </div>`;
        });
        html += '</div></div>';
    }

    const total = cart.reduce((s, it) => s + it.price * it.quantity, 0);
    html += `<div class="cart-footer"><div class="cart-total">Total: PKR ${total.toFixed(0)}</div><button id="checkout-now">Checkout</button></div>`;

    drawer.innerHTML = html;

    // Attach drawer controls
    const sortSelect = document.getElementById('cart-sort');
    if (sortSelect) {
        sortSelect.value = cartSort;
        sortSelect.addEventListener('change', (e) => {
            cartSort = e.target.value;
            localStorage.setItem('cartSort', cartSort);
            renderCartDrawer();
        });
    }
    document.getElementById('checkout-now')?.addEventListener('click', () => {
        window.goToCheckout();
    });

    document.getElementById('close-cart')?.addEventListener('click', () => {
        drawer.style.display = 'none';
    });

    // Quantity change handlers
    drawer.querySelectorAll('.qty-input').forEach(inp => {
        inp.addEventListener('change', (e) => {
            const id = parseInt(e.target.dataset.id, 10);
            const q = parseInt(e.target.value, 10) || 1;
            updateQuantity(id, q);
            renderCartDrawer();
        });
    });

    // Remove handlers
    drawer.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id, 10);
            removeFromCart(id);
            renderCartDrawer();
        });
    });

    drawer.style.display = 'block';
}

function sortItems(items, mode) {
    const copy = items.slice();
    switch (mode) {
        case 'price-asc':
            copy.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            copy.sort((a, b) => b.price - a.price);
            break;
        case 'quantity':
            copy.sort((a, b) => b.quantity - a.quantity);
            break;
        case 'name':
        default:
            copy.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }
    return copy;
}

// ============= SHOP PAGE FUNCTIONS =============

function goToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty. Please add items before checkout.', 'warning');
        return;
    }
    
    window.location.href = 'checkout.html';
}

// ============= UTILITY FUNCTIONS =============

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ============= RESPONSIVE FIXES =============

// Ensure proper viewport for mobile devices
function ensureResponsiveViewport() {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0';
        document.head.appendChild(meta);
    }
}

ensureResponsiveViewport();

// ============= SMOOTH SCROLLING =============

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

setupSmoothScroll();

// ============= EXPORT FUNCTIONS FOR GLOBAL USE =============

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.goToCheckout = goToCheckout;
window.showNotification = showNotification;
window.closeCarousel = closeCarousel;
window.addProductToCart = addProductToCart;
window.buyProductNow = buyProductNow;
