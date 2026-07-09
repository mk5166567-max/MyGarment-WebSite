# A.M Garments - E-Commerce Platform Setup Guide

## Overview
This is a complete e-commerce platform for A.M Garments with:
- **Fully Responsive Design** - Works on mobile, tablet, and desktop
- **Shopping Cart** - Add/remove items with local storage
- **Checkout System** - Multi-step checkout process
- **Payment Options** - EasyPaisa, JazzCash, and Cash on Delivery
- **Email Notifications** - Automated order confirmation emails via Gmail
- **Order Management** - Order tracking and receipt generation

---

## Project Structure

```
/newfolder 4/
├── my first project.html          # Home page
├── my first project.css           # Main styles
├── checkout.html                  # Checkout page
├── checkout.css                   # Checkout styles
├── main.js                        # Frontend JavaScript
├── checkout.js                    # Checkout functionality
├── email-service.js               # Backend email service (Node.js)
├── package.json                   # Node.js dependencies
├── .env                           # Environment variables
└── images/                        # Product images
```

---

## Files Description

### Frontend Files

#### 1. **my first project.html** (Home Page)
- Header with navigation
- Hero section with carousel
- Product catalog
- About section
- Contact form
- Footer

#### 2. **my first project.css** (Main Styles)
- Responsive design for all screen sizes
- Mobile-first approach
- Breakpoints: 480px, 768px, 1024px
- Professional color scheme (black & gold)

#### 3. **checkout.html** (Checkout Page)
- 4-step checkout process:
  1. Cart Review
  2. Shipping Information
  3. Payment Method Selection
  4. Order Confirmation
- Payment options: EasyPaisa, JazzCash, COD

#### 4. **checkout.css** (Checkout Styles)
- Responsive checkout layout
- Payment method styling
- Progress indicator
- Form styling

#### 5. **main.js** (Frontend JavaScript)
```javascript
Key Functions:
- setupMobileMenu()      // Mobile navigation
- setupCarousel()        // Product carousel
- addToCart()           // Add items to cart
- removeFromCart()      // Remove items
- goToCheckout()        // Navigate to checkout
- showNotification()    // User feedback
```

#### 6. **checkout.js** (Checkout Logic)
```javascript
Key Functions:
- loadCartItems()                // Load cart from localStorage
- calculateTotals()              // Calculate order totals
- validateShippingAndContinue() // Validate shipping form
- processPayment()              // Process order
- sendConfirmationEmail()       // Send confirmation
- generateOrderId()             // Create unique order IDs
- downloadReceipt()             // Generate receipt PDF
```

---

## Backend Setup - Email Service

### Prerequisites
- Node.js (v14 or higher)
- Gmail Account
- npm or yarn

### Installation Steps

#### 1. **Install Node.js**
- Download from https://nodejs.org/
- Install for your operating system

#### 2. **Create package.json**
In your project folder, create a `package.json` file with:

```json
{
  "name": "am-garments-email-service",
  "version": "1.0.0",
  "description": "Email service for A.M Garments",
  "main": "email-service.js",
  "scripts": {
    "start": "node email-service.js",
    "dev": "nodemon email-service.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "nodemailer": "^6.9.1",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "body-parser": "^1.20.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

#### 3. **Install Dependencies**
```bash
npm install
```

#### 4. **Create .env File**
Create a `.env` file in your project folder:

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password

# Server Configuration
PORT=3000
NODE_ENV=development

# Admin Email
ADMIN_EMAIL=your-email@gmail.com
```

#### 5. **Get Gmail App Password**
1. Go to https://myaccount.google.com/
2. Click "Security" in the left menu
3. Enable "2-Step Verification" if not already enabled
4. Search for "App passwords"
5. Select Mail and Windows Computer
6. Copy the generated password and paste in .env file

#### 6. **Run the Email Service**
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The service will run on `http://localhost:3000`

---

## Frontend Integration

### 1. **Add Main Script to HTML**
The main.js is already included at the bottom of `my first project.html`:
```html
<script src="main.js"></script>
```

### 2. **Cart Management**
```javascript
// Add item to cart
addToCart('Product Name', 2499, 'image.jpg', 'M');

// View cart (stored in localStorage)
const cart = JSON.parse(localStorage.getItem('cart'));

// Go to checkout
goToCheckout();
```

### 3. **Local Testing (Without Backend)**
- Checkout will work locally
- Emails will show in console logs
- Orders saved in browser localStorage

---

## Payment Methods Setup

### EasyPaisa
```
Account Number: 03008375665
Account Name: SAIM KHAN
Instructions: Send money directly to this account
```

### JazzCash
```
Account Number: 03008375665
Account Name: SAIM KHAN
Instructions: Send money directly to this account
```

### Cash on Delivery (COD)
```
Payment collected at delivery
No setup required
```

---

## Deployment Options

### Option 1: Deploy Backend on Heroku (Free)
1. Create account at https://heroku.com
2. Install Heroku CLI
3. Run: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set GMAIL_USER=your-email@gmail.com
   heroku config:set GMAIL_PASSWORD=your-app-password
   ```
5. Deploy: `git push heroku main`

### Option 2: Deploy on Vercel (Frontend Only - With Email API)
1. Create account at https://vercel.com
2. Connect your GitHub repository
3. Deploy main HTML/CSS/JS files
4. Use Firebase Functions or Vercel Functions for emails

### Option 3: Local Testing
- Run email service locally: `npm start`
- Update checkout.js to point to: `http://localhost:3000/api/send-email`
- Test checkout workflow

---

## Testing Checklist

### Frontend Testing
- [ ] Responsive design works on mobile (test with DevTools)
- [ ] Product carousel functions correctly
- [ ] Cart add/remove works
- [ ] Mobile menu toggles
- [ ] Contact form submits
- [ ] Checkout page loads

### Checkout Testing
- [ ] Step 1: Cart items display correctly
- [ ] Step 2: Shipping form validation works
- [ ] Step 3: Payment methods show
- [ ] Step 4: Confirmation displays order ID

### Backend Testing
1. Start email service: `npm start`
2. Test endpoint with curl:
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@email.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>"
  }'
```

---

## API Endpoints

### 1. Send Email
**POST** `/api/send-email`

Request:
```json
{
  "to": "customer@email.com",
  "subject": "Order Confirmation",
  "html": "<h1>Order Confirmed</h1>",
  "orderId": "ORD-123456"
}
```

Response:
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "message-id-string"
}
```

### 2. Send Payment Confirmation
**POST** `/api/send-payment-confirmation`

Request:
```json
{
  "customerEmail": "customer@email.com",
  "customerName": "John Doe",
  "orderId": "ORD-123456",
  "amount": 2699,
  "paymentMethod": "easypaisa"
}
```

### 3. Notify Admin
**POST** `/api/notify-admin`

Request:
```json
{
  "orderId": "ORD-123456",
  "customerName": "John Doe",
  "customerEmail": "customer@email.com",
  "orderTotal": 2699,
  "paymentMethod": "easypaisa"
}
```

### 4. Health Check
**GET** `/api/health`

Response:
```json
{
  "success": true,
  "message": "Email service is running"
}
```

---

## Responsive Design Features

### Mobile Optimization (< 768px)
- ✓ Hamburger menu navigation
- ✓ Stacked product cards
- ✓ Single-column checkout
- ✓ Touch-friendly buttons
- ✓ Optimized image sizes

### Tablet Optimization (768px - 1024px)
- ✓ 2-column product grid
- ✓ Adjusted typography
- ✓ Optimized spacing

### Desktop (> 1024px)
- ✓ Full navigation
- ✓ 3-column product grid
- ✓ Side-by-side checkout
- ✓ Hover effects

---

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Troubleshooting

### Email Not Sending
1. Check Gmail App Password is correct
2. Enable "Less secure app access" if 2FA not enabled
3. Check console for error messages
4. Verify email address format

### Checkout Not Working
1. Check browser console for JavaScript errors
2. Verify checkout.html loads properly
3. Check localStorage is enabled
4. Test in incognito mode

### Mobile Menu Not Working
1. Check screen width < 768px
2. Verify hamburger button is visible
3. Check main.js is loaded
4. Clear browser cache

### Cart Empty After Refresh
1. Check localStorage is enabled
2. Verify localStorage quota not exceeded
3. Test in private/incognito mode

---

## Contact & Support
- **Email**: Saimrk11@gmail.com
- **Phone**: +92 300 837 5665
- **Location**: Alrahim shopping centre, Hyderabad

---

## License
© 2026 A.M Garments. All Rights Reserved.
