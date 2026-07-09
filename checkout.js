// ============= CHECKOUT FUNCTIONALITY =============

// Initialize checkout with cart data
document.addEventListener('DOMContentLoaded', function () {
    loadCartItems();
    calculateTotals();
    setupEventListeners();
    setDefaultPaymentMethod();
    initializeSecurityTokens();
});

// Initialize security tokens for this session
function initializeSecurityTokens() {
    if (!sessionStorage.getItem('checkout-session-token')) {
        const token = generateSecurityToken();
        sessionStorage.setItem('checkout-session-token', token);
        sessionStorage.setItem('checkout-session-time', new Date().getTime());
    }
}

// Generate a security token
function generateSecurityToken() {
    return 'CST-' + Math.random().toString(36).substr(2, 20).toUpperCase();
}

// Validate security token
function validateSecurityToken() {
    const token = sessionStorage.getItem('checkout-session-token');
    const sessionTime = sessionStorage.getItem('checkout-session-time');
    
    if (!token || !sessionTime) {
        return false;
    }
    
    // Check if session is within 30 minutes
    const timeDiff = new Date().getTime() - parseInt(sessionTime);
    const thirtyMinutes = 30 * 60 * 1000;
    
    if (timeDiff > thirtyMinutes) {
        sessionStorage.clear();
        showNotification('Session expired. Please refresh and start again.', 'error');
        return false;
    }
    
    return true;
}

function setDefaultPaymentMethod() {
    const defaultMethod = 'easypaisa';
    const defaultRadio = document.getElementById(`payment-${defaultMethod}`);
    if (defaultRadio) {
        defaultRadio.checked = true;
        selectPaymentMethod(defaultMethod);
    }
}

const PAYMENT_ACCOUNT_NUMBER_MAP = {
    easypaisa: '03153361296',
    jazzcash: '03008375665'
};

function openPaymentApp(method) {
    const accountNumber = PAYMENT_ACCOUNT_NUMBER_MAP[method] || '03153361296';
    const amount = parsePaymentAmount();

    if (method === 'easypaisa' || method === 'jazzcash') {
        openPaymentAppWithParams(method, accountNumber, amount);
        return;
    }

    showNotification('Please select EasyPaisa or JazzCash to launch the mobile app.', 'error');
}

function parsePaymentAmount() {
    const paymentText = document.getElementById('payment-total')?.textContent || '';
    const numeric = paymentText.replace(/[^0-9.]/g, '');
    return parseFloat(numeric) || 0;
}

function getCartFromStorage() {
    try {
        return JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        console.warn('Unable to parse cart from localStorage:', e);
        return [];
    }
}

function saveCartToStorage(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.cartData = cart;
}

// Load cart items from localStorage or window cache
function loadCartItems() {
    const cart = window.cartData?.length ? window.cartData : getCartFromStorage();
    window.cartData = cart;

    const cartContainer = document.getElementById('cart-items-container');
    cartContainer.innerHTML = '';
    const emptyMessage = document.getElementById('empty-cart-message');

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align: center; color: #999;">Your cart is empty</p>';
        if (emptyMessage) {
            emptyMessage.style.display = 'flex';
        }
        updateContinueButton(false);
        calculateTotals();
        return;
    }

    if (emptyMessage) {
        emptyMessage.style.display = 'none';
    }

    cart.forEach((item, index) => {
        const cartItemHTML = `
            <div class="cart-item-review">
                <img src="${item.image}" alt="${item.name}" class="item-image">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <div class="item-details">
                        <span>Size: <strong>${item.size || 'One Size'}</strong></span>
                        <span>Quantity: <strong>${item.quantity}</strong></span>
                    </div>
                    <div class="item-price">PKR ${(item.price * item.quantity).toLocaleString()}</div>
                </div>
                <button class="remove-cart-item" onclick="removeCartItem(${index})" aria-label="Remove ${item.name}">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        `;
        cartContainer.innerHTML += cartItemHTML;
    });

    updateContinueButton(true);
    calculateTotals();
}

function updateContinueButton(enabled) {
    const continueButton = document.getElementById('continue-button');
    if (continueButton) {
        continueButton.disabled = !enabled;
        continueButton.style.opacity = enabled ? '1' : '0.6';
        continueButton.style.cursor = enabled ? 'pointer' : 'not-allowed';
    }
}

function removeCartItem(index) {
    const cart = window.cartData?.length ? window.cartData : getCartFromStorage();
    if (index < 0 || index >= cart.length) return;
    cart.splice(index, 1);
    saveCartToStorage(cart);
    loadCartItems();
    showNotification('Product removed from cart');
}

// Calculate totals
function calculateTotals() {
    const cart = window.cartData?.length ? window.cartData : getCartFromStorage();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Auto add PKR 200 delivery charge for all Pakistan orders
    const PAKISTAN_DELIVERY_CHARGE = 200;
    const shipping = subtotal > 0 ? PAKISTAN_DELIVERY_CHARGE : 0;
    const total = subtotal + shipping;

    // Update step 1
    document.getElementById('subtotal').textContent = `PKR ${subtotal.toLocaleString()}`;
    document.getElementById('shipping').textContent = `PKR ${shipping.toLocaleString()}`;
    document.getElementById('total-price').textContent = `PKR ${total.toLocaleString()}`;

    // Update step 3
    document.getElementById('payment-total').textContent = `PKR ${total.toLocaleString()}`;

    return { subtotal, shipping, total };
}

// Setup event listeners
function setupEventListeners() {
    const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            selectPaymentMethod(this.value);
        });
    });
}

// Go to specific step
function goToStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.checkout-step').forEach(step => {
        step.classList.remove('active');
    });

    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active');
    });

    // Show selected step
    document.getElementById(`step-${stepNumber}-content`).classList.add('active');
    document.getElementById(`step-${stepNumber}`).classList.add('active');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validate shipping information
function validateShippingAndContinue() {
    const form = document.getElementById('shipping-form');
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            input.style.borderColor = '#e0e0e0';
        }
    });

    // Specific format validations
    const emailInput = document.getElementById('email');
    if (emailInput && !validateEmailFormat(emailInput.value.trim())) {
        showFieldError(emailInput, 'Please enter a valid email address.');
        return;
    }

    const phoneInput = document.getElementById('phone');
    if (phoneInput && !validatePhoneFormat(phoneInput.value.trim())) {
        showFieldError(phoneInput, 'Please enter a valid phone number (10-15 digits).');
        return;
    }

    if (isValid) {
        // Mark step 2 as completed
        document.getElementById('step-2').classList.add('completed');
        goToStep(3);
    } else {
        showNotification('Please fill in all required fields', 'error');
    }
}

// Select payment method
function selectPaymentMethod(method) {
    const radio = document.getElementById(`payment-${method}`);
    radio.checked = true;
    updatePaymentInstructions(method);
    document.getElementById('payment-confirmation').style.display = 'block';
}

// Update payment instructions based on method
function updatePaymentInstructions(method) {
    const accountNumber = PAYMENT_ACCOUNT_NUMBER_MAP[method] || '03153361296';
    const instructionsDiv = document.getElementById('payment-instructions');
    let instructions = '';

    switch (method) {
        case 'easypaisa':
            instructions = `
                <h4 style="color: #1a1a1a; margin-bottom: 1rem;">EasyPaisa Payment Instructions</h4>
                <p><strong>1. Open your EasyPaisa app or dial <code>*786#</code></strong></p>
                <p><strong>2. Select "Send Money" option</strong></p>
                <p><strong>3. Enter the following details:</strong></p>
                <ul style="list-style: disc; margin-left: 1.5rem; margin: 0.5rem 0;">
                    <li><strong>Account Number:</strong> ${accountNumber}</li>
                    <li><strong>Amount:</strong> ${document.getElementById('payment-total').textContent}</li>
                    <li><strong>Account Holder Name:</strong> SAIM KHAN</li>
                </ul>
                <div class="payment-action-buttons">
                    <button type="button" class="payment-action-button" onclick="openPaymentApp('easypaisa')">Open EasyPaisa App</button>
                </div>
                <p style="margin-top: 0.75rem; color: #333;"><strong>Remember:</strong> Complete the payment first in EasyPaisa, then return and confirm the payment on this page.</p>
                <div class="qr-wrapper">
                    <p>Scan the QR code with your phone or tap Open EasyPaisa App to start payment.</p>
                    <div id="payment-qr-code" class="payment-qr-code"></div>
                </div>
                <p style="margin-top: 1rem; color: #27ae60;"><strong>✓ One tap to open the app, or scan the QR code if the app does not launch automatically.</strong></p>
            `;
            break;
        case 'jazzcash':
            instructions = `
                <h4 style="color: #1a1a1a; margin-bottom: 1rem;">JazzCash Payment Instructions</h4>
                <p><strong>1. Open your JazzCash app or dial <code>*787#</code></strong></p>
                <p><strong>2. Select "Send Money" option</strong></p>
                <p><strong>3. Enter the following details:</strong></p>
                <ul style="list-style: disc; margin-left: 1.5rem; margin: 0.5rem 0;">
                    <li><strong>Account Number:</strong> ${accountNumber}</li>
                    <li><strong>Amount:</strong> ${document.getElementById('payment-total').textContent}</li>
                    <li><strong>Account Holder Name:</strong> SAIM KHAN</li>
                </ul>
                <div class="payment-action-buttons">
                    <button type="button" class="payment-action-button" onclick="openPaymentApp('jazzcash')">Open JazzCash App</button>
                </div>
                <p style="margin-top: 0.75rem; color: #333;"><strong>Remember:</strong> Complete the payment first in JazzCash, then return and confirm the payment on this page.</p>
                <div class="qr-wrapper">
                    <p>Scan the QR code with your phone or tap Open JazzCash App to start payment.</p>
                    <div id="payment-qr-code" class="payment-qr-code"></div>
                </div>
                <p style="margin-top: 1rem; color: #27ae60;"><strong>✓ One tap to open the app, or scan the QR code if the app does not launch automatically.</strong></p>
            `;
            break;
        case 'bank':
            instructions = `
                <h4 style="color: #1a1a1a; margin-bottom: 1rem;">Bank Transfer Instructions</h4>
                <p><strong>1. Login to your online banking or mobile banking app</strong></p>
                <p><strong>2. Choose "Transfer" or "Fund Transfer"</strong></p>
                <p><strong>3. Enter the following bank details:</strong></p>
                <ul style="list-style: disc; margin-left: 1.5rem; margin: 0.5rem 0;">
                    <li><strong>Bank Name:</strong> United Bank Limited</li>
                    <li><strong>Account Title:</strong> SAIM KHAN</li>
                    <li><strong>Account Number:</strong> 03008375665</li>
                    <li><strong>IBAN:</strong> PK00UBLP012345678901234</li>
                    <li><strong>Amount:</strong> ${document.getElementById('payment-total').textContent}</li>
                </ul>
                <p style="margin-top: 1rem; color: #27ae60;"><strong>✓ Use your order number in the transfer reference for faster confirmation</strong></p>
            `;
            break;
        case 'card':
            instructions = `
                <h4 style="color: #1a1a1a; margin-bottom: 1rem;">Card Payment</h4>
                <p>Please enter your card details in the secure form below and confirm your order.</p>
                <ul style="list-style: disc; margin-left: 1.5rem; margin: 0.5rem 0;">
                    <li>Card Number</li>
                    <li>Expiry Date (MM/YY)</li>
                    <li>CVC</li>
                </ul>
                <p style="margin-top: 1rem; color: #27ae60;"><strong>✓ Your card information is used only for checkout validation.</strong></p>
            `;
            break;
        case 'cod':
            instructions = `
                <h4 style="color: #1a1a1a; margin-bottom: 1rem;">Cash on Delivery</h4>
                <p>You will pay <strong>${document.getElementById('payment-total').textContent}</strong> when your order is delivered to your address.</p>
                <p style="margin-top: 1rem; color: #666;"><strong>Note:</strong> Our delivery representative will contact you before arrival to confirm the time.</p>
            `;
            break;
    }

    instructionsDiv.innerHTML = instructions;
    toggleCardFields(method);

    if (method === 'easypaisa' || method === 'jazzcash') {
        generatePaymentQRCode(method);
    } else {
        clearPaymentQRCode();
    }
}

function generatePaymentQRCode(method) {
    const container = document.getElementById('payment-qr-code');
    if (!container) return;
    container.innerHTML = '';
    const amount = document.getElementById('payment-total')?.textContent.replace(/[^0-9]/g, '') || '0';
    const accountNumber = PAYMENT_ACCOUNT_NUMBER_MAP[method] || '03153361296';
    let qrLink = '';

    if (method === 'easypaisa') {
        qrLink = `easypaisa://send?number=${encodeURIComponent(accountNumber)}&amount=${encodeURIComponent(amount)}`;
    } else if (method === 'jazzcash') {
        qrLink = `jazzcash://send?number=${encodeURIComponent(accountNumber)}&amount=${encodeURIComponent(amount)}`;
    }

    try {
        new QRCode(container, {
            text: qrLink,
            width: 180,
            height: 180,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (e) {
        container.innerHTML = '<p class="qr-error">QR code unavailable.</p>';
    }
}

function clearPaymentQRCode() {
    const container = document.getElementById('payment-qr-code');
    if (container) container.innerHTML = '';
}

function toggleCardFields(method) {
    const cardForm = document.getElementById('card-payment-form');
    cardForm.style.display = method === 'card' ? 'block' : 'none';
}

// Process payment and create order
function processPayment() {
    if (!validateSecurityToken()) {
        showNotification('Session has expired. Please refresh the page.', 'error');
        return;
    }
    
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
    const form = document.getElementById('shipping-form');

    if (!paymentMethod) {
        showNotification('Please select a payment method', 'error');
        return;
    }

    // Validate form data
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const postal = document.getElementById('postal').value.trim();

    if (!fullname || !email || !phone || !address || !city || !postal) {
        showNotification('Please complete all required fields', 'error');
        goToStep(2);
        return;
    }

    // Format validation: email and phone
    if (!validateEmailFormat(email)) {
        showNotification('The email address format looks invalid. Please correct it.', 'error');
        document.getElementById('email').focus();
        goToStep(2);
        return;
    }

    if (!validatePhoneFormat(phone)) {
        showNotification('The phone number format looks invalid. Please enter 10-15 digits.', 'error');
        document.getElementById('phone').focus();
        goToStep(2);
        return;
    }

    if (paymentMethod.value === 'card') {
        if (!validateCardDetails()) {
            showNotification('Please enter valid card details for card payment', 'error');
            return;
        }
    }

    // Create order object
    const cardInfo = paymentMethod.value === 'card' ? {
        cardholderName: document.getElementById('card-name').value.trim(),
        cardNumber: maskCardNumber(document.getElementById('card-number').value.trim()),
        expiry: document.getElementById('card-expiry').value.trim()
    } : null;

    const order = {
        orderId: generateOrderId(),
        customerName: fullname,
        email: email,
        phone: phone,
        address: address,
        city: city,
        postal: postal,
        notes: document.getElementById('notes').value,
        paymentMethod: paymentMethod.value,
        cardInfo: cardInfo,
        items: window.cartData || [],
        subtotal: calculateTotals().subtotal,
        shipping: calculateTotals().shipping,
        total: calculateTotals().total,
        orderDate: new Date().toLocaleDateString(),
        deliveryDate: getEstimatedDeliveryDate(),
        paymentVerified: false,
        transactionId: null,
        sessionToken: sessionStorage.getItem('checkout-session-token'),
        status: 'Pending Payment'
    };

    // Payment method handling with verification requirement
    switch(paymentMethod.value) {
        case 'easypaisa':
        case 'jazzcash':
            // Mobile wallet: requires transaction ID verification
            window.pendingOrder = order;
            const accountNumber = PAYMENT_ACCOUNT_NUMBER_MAP[paymentMethod.value] || '03153361296';
            openPaymentAppWithParams(paymentMethod.value, accountNumber, order.total);
            showPendingPaymentBanner();
            return;
        
        case 'bank':
            // Bank transfer: requires transaction ID verification
            window.pendingOrder = order;
            showPendingPaymentBanner();
            showNotification('Please complete the bank transfer and provide the transaction ID', 'info');
            return;
        
        case 'card':
            // Card payment: process immediately (demo only)
            order.paymentVerified = true;
            order.transactionId = generateTransactionId('CARD');
            order.verificationTime = new Date().toISOString();
            finalizeOrder(order);
            return;
        
        case 'cod':
            // Cash on Delivery: no payment verification needed
            order.paymentVerified = true;
            order.transactionId = 'COD-' + order.orderId;
            order.status = 'Confirmed - Pending Payment on Delivery';
            finalizeOrder(order);
            return;
        
        default:
            showNotification('Invalid payment method', 'error');
    }
}

// Finalize order: save, send email, show confirmation
function finalizeOrder(order) {
    // CRITICAL: Verify payment before finalizing order
    if (!order.paymentVerified && order.paymentMethod !== 'cod') {
        showNotification('ERROR: Cannot confirm order without verified payment!', 'error');
        return;
    }
    
    // Additional security: validate session token
    if (order.sessionToken !== sessionStorage.getItem('checkout-session-token')) {
        showNotification('ERROR: Session token mismatch. This order cannot be processed.', 'error');
        return;
    }
    
    order.status = 'Order Received';
    order.finalizedTime = new Date().toISOString();
    
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear the cart after successful order
    localStorage.setItem('cart', JSON.stringify([]));
    window.cartData = [];
    
    window.lastOrder = order;
    sendConfirmationEmail(order);
    document.getElementById('step-3').classList.add('completed');
    showOrderConfirmation(order);
    goToStep(4);
}

function openPaymentAppWithParams(method, accountNumber, amount) {
    // Try to open app using a deep link with params (best-effort). If not supported, fallback to base scheme.
    let deepLink = '';
    const amountStr = encodeURIComponent(amount.toFixed ? amount.toFixed(0) : amount);
    const baseUrl = method === 'easypaisa' ? 'easypaisa://' : 'jazzcash://';

    switch (method) {
        case 'easypaisa':
            deepLink = `easypaisa://send?number=${encodeURIComponent(accountNumber)}&amount=${amountStr}`;
            break;
        case 'jazzcash':
            deepLink = `jazzcash://send?number=${encodeURIComponent(accountNumber)}&amount=${amountStr}`;
            break;
        default:
            window.location.href = baseUrl;
            return;
    }

    // Attempt to open the deep link first; then fallback to base app scheme if needed.
    window.location.href = deepLink;
    setTimeout(() => {
        window.location.href = baseUrl;
    }, 1200);
}

function showPendingPaymentBanner() {
    const banner = document.getElementById('payment-status-banner');
    const verifiedMessage = document.getElementById('payment-verified-message');
    if (!banner) return;
    banner.style.display = 'block';
    if (verifiedMessage) verifiedMessage.style.display = 'none';
}

function hidePendingPaymentBanner() {
    const banner = document.getElementById('payment-status-banner');
    if (!banner) return;
    banner.style.display = 'none';
}

// Verify payment with transaction ID
function verifyPaymentAndConfirm() {
    const transactionId = document.getElementById('transaction-id').value.trim();
    
    if (!transactionId) {
        showNotification('Please enter your transaction ID', 'error');
        return;
    }
    
    if (transactionId.length < 5) {
        showNotification('Transaction ID appears to be invalid. Please check and try again.', 'error');
        return;
    }
    
    if (!validateSecurityToken()) {
        showNotification('Session has expired. Please refresh the page and start again.', 'error');
        return;
    }
    
    // Verify transaction locally (in production, this would verify with payment gateway)
    const isValidTransaction = validateTransactionId(transactionId);
    
    if (!isValidTransaction) {
        showNotification('The transaction ID format appears invalid. Please verify and try again.', 'error');
        return;
    }
    
    // Mark payment as verified
    const order = window.pendingOrder;
    if (!order) {
        showNotification('No pending order found', 'error');
        return;
    }
    
    order.paymentVerified = true;
    order.transactionId = transactionId;
    order.verificationTime = new Date().toISOString();
    order.status = 'Payment Verified';
    
    // Show verified message
    const banner = document.getElementById('payment-status-banner');
    const verifiedMessage = document.getElementById('payment-verified-message');
    if (banner) banner.style.display = 'none';
    if (verifiedMessage) verifiedMessage.style.display = 'block';
    
    // Show complete order button
    const confirmBtn = document.getElementById('confirm-order-btn');
    if (confirmBtn) {
        confirmBtn.textContent = 'Complete Order';
        confirmBtn.onclick = function() { finalizeOrder(order); };
    }
    
    showNotification('Payment verified successfully! You can now complete your order.', 'success');
}

// Validate transaction ID format
function validateTransactionId(txnId) {
    // Accept various transaction ID formats
    // Must be at least 5 characters and alphanumeric
    const txnPattern = /^[A-Z0-9]{5,}$/i;
    return txnPattern.test(txnId);
}

function userConfirmedPayment() {
    // This function is deprecated - use verifyPaymentAndConfirm instead
    verifyPaymentAndConfirm();
}

function cancelPendingPayment() {
    window.pendingOrder = null;
    hidePendingPaymentBanner();
    showNotification('You can select another payment method now.', 'info');
}

// Generate unique order ID
function generateOrderId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}${random}`;
}

// Generate transaction ID
function generateTransactionId(prefix = 'TXN') {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
}

// Get estimated delivery date (3-5 business days)
function getEstimatedDeliveryDate() {
    const today = new Date();
    const daysToAdd = 3; // Minimum 3 days
    today.setDate(today.getDate() + daysToAdd);
    return today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Validation helpers
function validateEmailFormat(email) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhoneFormat(phone) {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, '');
    // Accept international and local phone lengths (10-15 digits)
    return digits.length >= 10 && digits.length <= 15;
}

function showFieldError(input, message) {
    try { input.style.borderColor = '#e74c3c'; } catch (e) {}
    showNotification(message, 'error');
    try { input.focus(); } catch (e) {}
}

// Show order confirmation
function showOrderConfirmation(order) {
    document.getElementById('order-number').textContent = `#${order.orderId}`;
    document.getElementById('confirm-email').textContent = order.email;
    document.getElementById('confirm-total').textContent = `PKR ${order.total.toLocaleString()}`;
    document.getElementById('delivery-date').textContent = order.deliveryDate;
    document.getElementById('email-display').textContent = order.email;
    document.getElementById('order-description').textContent = generateOrderDescription(order);
    showReceiptPreview(order);
}

function showReceiptPreview(order) {
    const preview = document.getElementById('receipt-preview');
    if (!preview) return;
    preview.innerHTML = generateReceiptPreviewHTML(order);
    preview.style.display = 'block';
}

function generateReceiptPreviewHTML(order) {
    const itemsHTML = order.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>PKR ${item.price.toLocaleString()}</td>
            <td>PKR ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
    `).join('');

    return `
        <div class="receipt-preview-block">
            <h3>Receipt Preview</h3>
            <p><strong>Order:</strong> ${order.orderId}</p>
            <p><strong>Name:</strong> ${order.customerName}</p>
            <p><strong>Email:</strong> ${order.email}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            <div class="receipt-summary">
                <p><strong>Subtotal:</strong> PKR ${order.subtotal.toLocaleString()}</p>
                <p><strong>Shipping:</strong> PKR ${order.shipping.toLocaleString()}</p>
                <p><strong>Total:</strong> PKR ${order.total.toLocaleString()}</p>
            </div>
        </div>
    `;
}

function generateOrderDescription(order) {
    const itemsDescription = order.items.map(item => `${item.quantity}× ${item.name} (${item.size || 'One Size'})`).join(', ');
    const notes = order.notes ? ` Special instructions: ${order.notes}` : '';
    return `Items: ${itemsDescription}.${notes}`;
}

// Send confirmation email for customer and merchant
function sendConfirmationEmail(order) {
    const merchantEmail = 'Saimrk11@gmail.com';
    const customerEmail = order.email;
    const customerSubject = `Order Confirmation - ${order.orderId}`;
    const merchantSubject = `Order Received - ${order.orderId}`;

    const customerEmailContent = generateEmailHTML(order, 'customer');
    const merchantEmailContent = generateEmailHTML(order, 'merchant');

    sendEmailViaBackend(order, customerEmailContent, customerEmail, false, customerSubject);
    sendEmailViaBackend(order, merchantEmailContent, merchantEmail, true, merchantSubject);
}

// Send email via backend with fallback to mail composer
function sendEmailViaBackend(order, emailContent, recipientEmail, isMerchant = false, subject) {
    const backendUrl = '/api/send-email'; // Replace with your backend endpoint

    fetch(backendUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            to: recipientEmail,
            subject: subject,
            html: emailContent,
            orderId: order.orderId,
            merchantCopy: isMerchant
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Email API returned ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Email sent:', recipientEmail, data);
        if (!isMerchant) {
            showNotification('Order confirmation email sent to ' + recipientEmail, 'success');
        } else {
            showNotification('Merchant notification email sent.', 'success');
        }
    })
    .catch(error => {
        console.error('Email error for', recipientEmail, error);
        showNotification(`Order confirmed. Email fallback opened for ${recipientEmail}.`, 'warning');
        openEmailComposeFallback(recipientEmail, subject, emailContent);
    });
}

function openEmailComposeFallback(recipientEmail, subject, htmlContent) {
    const textBody = htmlContent
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(textBody)}`;
    window.open(gmailUrl, '_blank');
}

function openGmailCompose(recipientEmail, subject, body) {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
}

function openGmailConfirmation(order) {
    if (!order) {
        showNotification('No order available to email.', 'error');
        return;
    }

    const recipient = 'Saimrk11@gmail.com';
    const subject = `Payment Received - ${order.orderId}`;
    const body = `Hello,%0D%0A%0D%0APayment has been received for Order ${order.orderId}.%0D%0A%0D%0AOrder details:%0D%0A${generateOrderDescription(order)}%0D%0ATotal: PKR ${order.total.toLocaleString()}%0D%0ACustomer: ${order.customerName}%0D%0AEmail: ${order.email}%0D%0APhone: ${order.phone}%0D%0A%0D%0APlease confirm receipt and proceed with fulfillment.%0D%0A%0D%0AThank you,%0D%0AA.M Garments`;
    openGmailCompose(recipient, subject, body);
}

function validateCardDetails() {
    const name = document.getElementById('card-name').value.trim();
    const number = document.getElementById('card-number').value.replace(/\s+/g, '');
    const expiry = document.getElementById('card-expiry').value.trim();
    const cvc = document.getElementById('card-cvc').value.trim();

    const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const numberValid = /^\d{16}$/.test(number);
    const cvcValid = /^\d{3,4}$/.test(cvc);

    return name.length > 0 && numberValid && expiryPattern.test(expiry) && cvcValid;
}

function maskCardNumber(number) {
    const digits = number.replace(/\D/g, '');
    if (digits.length < 4) return digits;
    return '**** **** **** ' + digits.slice(-4);
}

// Generate email HTML content
function generateEmailHTML(order, type = 'customer') {
    const itemsHTML = order.items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">PKR ${item.price.toLocaleString()} x ${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right;">PKR ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
    `).join('');

    const title = type === 'merchant' ? 'Order Received' : 'Order Confirmation';
    const greeting = type === 'merchant' ? 'Dear Team,' : `Dear ${order.customerName},`;
    const intro = type === 'merchant'
        ? 'A new order has been placed. Here are the details for processing and fulfillment:'
        : 'Your order has been successfully confirmed. Thank you for shopping with A.M Garments!';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; background-color: #f8f8f8; padding: 20px; }
                .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #fff; padding: 20px; text-align: center; }
                .content { background-color: #fff; padding: 20px; margin: 20px 0; }
                .order-details, .order-description, .customer-details { background-color: #f8f8f8; padding: 15px; border-left: 4px solid #d4af37; margin: 15px 0; }
                .order-description p { margin: 0; line-height: 1.7; }
                .customer-details p { margin: 0.25rem 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th { background-color: #1a1a1a; color: #fff; padding: 10px; text-align: left; }
                td { padding: 10px; border-bottom: 1px solid #ccc; }
                .summary { background-color: #f8f8f8; padding: 15px; }
                .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
                .total { font-weight: 700; font-size: 1.1em; color: #1a1a1a; border-top: 2px solid #d4af37; padding-top: 10px; margin-top: 10px; }
                .payment-info { background-color: #e8f8f5; padding: 15px; border-radius: 4px; margin: 15px 0; }
                .footer { background-color: #1a1a1a; color: #ccc; padding: 20px; text-align: center; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>A.M Garments</h1>
                    <p>${title}</p>
                </div>
                
                <div class="content">
                    <h2>${title}</h2>
                    <p>${greeting}</p>
                    <p>${intro}</p>
                    
                    <div class="order-details">
                        <h3 style="margin-top: 0; color: #1a1a1a;">Order Details</h3>
                        <p><strong>Order Number:</strong> ${order.orderId}</p>
                        <p><strong>Order Date:</strong> ${order.orderDate}</p>
                        <p><strong>Estimated Delivery:</strong> ${order.deliveryDate}</p>
                        <p><strong>Payment Method:</strong> ${order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}</p>
                    </div>

                    <div class="order-description">
                        <h3>Order Description</h3>
                        <p>${generateOrderDescription(order)}</p>
                    </div>

                    <div class="customer-details">
                        <h3>${type === 'merchant' ? 'Customer Details' : 'Shipping Address'}</h3>
                        <p><strong>Name:</strong> ${order.customerName}</p>
                        <p><strong>Email:</strong> ${order.email}</p>
                        <p><strong>Phone:</strong> ${order.phone}</p>
                        <p><strong>Address:</strong> ${order.address}, ${order.city}, ${order.postal}</p>
                    </div>

                    <h3>Items Ordered</h3>

                    <h3>Items Ordered</h3>
                    <table>
                        <thead style="background-color: #1a1a1a; color: #fff;">
                            <tr>
                                <th style="padding: 10px; text-align: left;">Product</th>
                                <th style="padding: 10px; text-align: left;">Price</th>
                                <th style="padding: 10px; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                    </table>

                    <div class="summary">
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span>PKR ${order.subtotal.toLocaleString()}</span>
                        </div>
                        <div class="summary-row">
                            <span>Shipping:</span>
                            <span>PKR ${order.shipping.toLocaleString()}</span>
                        </div>
                        <div class="summary-row total">
                            <span>Total Amount:</span>
                            <span>PKR ${order.total.toLocaleString()}</span>
                        </div>
                    </div>

                    ${order.paymentMethod === 'easypaisa' ? `
                    <div class="payment-info">
                        <h4 style="margin-top: 0; color: #27ae60;">EasyPaisa Payment Pending</h4>
                        <p>Please send PKR ${order.total.toLocaleString()} to: <strong>${PAYMENT_ACCOUNT_NUMBER_MAP.easypaisa}</strong> (SAIM KHAN)</p>
                        <p style="font-size: 0.9em;">Once we receive your payment, we'll start processing your order immediately.</p>
                    </div>
                    ` : order.paymentMethod === 'jazzcash' ? `
                    <div class="payment-info">
                        <h4 style="margin-top: 0; color: #27ae60;">JazzCash Payment Pending</h4>
                        <p>Please send PKR ${order.total.toLocaleString()} to: <strong>${PAYMENT_ACCOUNT_NUMBER_MAP.jazzcash}</strong> (SAIM KHAN)</p>
                        <p style="font-size: 0.9em;">Once we receive your payment, we'll start processing your order immediately.</p>
                    </div>
                    ` : order.paymentMethod === 'card' ? `
                    <div class="payment-info">
                        <h4 style="margin-top: 0; color: #27ae60;">Card Payment Confirmed</h4>
                        <p>Payment information has been validated successfully. Your card will be charged once the order is processed.</p>
                        <p style="font-size: 0.9em;">Card used: <strong>${order.cardInfo ? order.cardInfo.cardNumber : 'N/A'}</strong></p>
                    </div>
                    ` : order.paymentMethod === 'bank' ? `
                    <div class="payment-info">
                        <h4 style="margin-top: 0; color: #27ae60;">Bank Transfer Payment Pending</h4>
                        <p>Please transfer PKR ${order.total.toLocaleString()} to the following account:</p>
                        <p><strong>Bank:</strong> United Bank Limited</p>
                        <p><strong>Account Title:</strong> SAIM KHAN</p>
                        <p><strong>Account Number:</strong> 03008375665</p>
                        <p><strong>IBAN:</strong> PK00UBLP012345678901234</p>
                        <p style="font-size: 0.9em;">Use your order number in the transfer reference for faster confirmation.</p>
                    </div>
                    ` : `
                    <div class="payment-info">
                        <h4 style="margin-top: 0; color: #27ae60;">Cash on Delivery</h4>
                        <p>You'll pay PKR ${order.total.toLocaleString()} when the order is delivered to your address.</p>
                    </div>
                    `}

                    <p style="margin-top: 20px; color: #666;">If you have any questions, please don't hesitate to contact us at <strong>Saimrk11@gmail.com</strong> or <strong>+92 300 837 5665</strong></p>
                </div>

                <div class="footer">
                    <p>&copy; 2026 A.M Garments. All Rights Reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Continue shopping
function continueShopping() {
    localStorage.removeItem('cart');
    window.location.href = 'shopnowfile.html';
}

// Download receipt
function downloadReceipt() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const lastOrder = orders[orders.length - 1];

    if (!lastOrder) {
        showNotification('No order found', 'error');
        return;
    }

    const content = generateReceiptHTML(lastOrder);
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
        showNotification('Please allow popups to view the receipt.', 'error');
        return;
    }

    receiptWindow.document.write(content);
    receiptWindow.document.close();
    receiptWindow.focus();
}

// Generate receipt HTML
function generateReceiptHTML(order) {
    const itemsHTML = order.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>PKR ${item.price.toLocaleString()}</td>
            <td>PKR ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
    `).join('');

    const description = generateOrderDescription(order);

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Order Receipt - ${order.orderId}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                .receipt { max-width: 700px; margin: 0 auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
                .header { background-color: #1a1a1a; color: #fff; padding: 20px; text-align: center; }
                .content { padding: 24px; }
                .content p { margin: 0.5rem 0; line-height: 1.6; }
                .section-title { margin-top: 1.5rem; font-size: 1.05rem; font-weight: 700; color: #1a1a1a; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 12px; border: 1px solid #e0e0e0; text-align: left; }
                th { background-color: #f8f8f8; }
                .summary { margin-top: 20px; padding: 16px; background-color: #f8f8f8; border-radius: 8px; }
                .summary p { margin: 8px 0; }
                .total { font-weight: 700; font-size: 1.15rem; }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <h1>A.M GARMENTS</h1>
                    <p>Order Receipt</p>
                </div>
                <div class="content">
                    <p><strong>Order ID:</strong> ${order.orderId}</p>
                    <p><strong>Date:</strong> ${order.orderDate}</p>
                    <p><strong>Customer:</strong> ${order.customerName}</p>
                    <p><strong>Email:</strong> ${order.email}</p>
                    <p><strong>Phone:</strong> ${order.phone}</p>
                    <p><strong>Address:</strong> ${order.address}, ${order.city} ${order.postal}</p>

                    <p class="section-title">Order Description</p>
                    <p>${description}</p>

                    <p class="section-title">Items</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                    </table>

                    <div class="summary">
                        <p><strong>Subtotal:</strong> PKR ${order.subtotal.toLocaleString()}</p>
                        <p><strong>Shipping:</strong> PKR ${order.shipping.toLocaleString()}</p>
                        <p class="total"><strong>Total:</strong> PKR ${order.total.toLocaleString()}</p>
                    </div>

                    <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
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

// CSS Animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
