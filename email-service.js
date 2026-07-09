// ============= A.M GARMENTS EMAIL SERVICE =============
// Node.js/Express Backend for Sending Order Confirmation Emails
// Install required packages: npm install express nodemailer cors dotenv body-parser

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure Nodemailer with Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER || 'Saimrk11@gmail.com',
        pass: process.env.GMAIL_PASSWORD || 'your-app-password' // Use App Password, not regular password
    }
});

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.log('Email service error:', error);
    } else {
        console.log('Email service ready:', success);
    }
});

// ============= EMAIL SENDING ENDPOINT =============

app.post('/api/send-email', async (req, res) => {
    try {
        const { to, subject, html, orderId } = req.body;

        // Validate input
        if (!to || !subject || !html) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: to, subject, html'
            });
        }

        // Email options
        const mailOptions = {
            from: process.env.GMAIL_USER || 'Saimrk11@gmail.com',
            to: to,
            subject: subject,
            html: html,
            replyTo: 'Saimrk11@gmail.com'
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log(`Email sent successfully to ${to}:`, info.messageId);

        // Log order confirmation
        if (orderId) {
            console.log(`Order confirmation email sent for order: ${orderId}`);
        }

        res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message
        });
    }
});

// ============= ALTERNATIVE EMAIL ENDPOINT FOR PAYMENTS =============

app.post('/api/send-payment-confirmation', async (req, res) => {
    try {
        const { customerEmail, customerName, orderId, amount, paymentMethod } = req.body;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 500px; margin: 0 auto; background-color: #f8f8f8; padding: 20px; }
                    .header { background-color: #1a1a1a; color: #fff; padding: 20px; text-align: center; }
                    .content { background-color: #fff; padding: 20px; }
                    .amount { font-size: 2em; color: #d4af37; font-weight: bold; text-align: center; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>A.M Garments</h1>
                        <p>Payment Received</p>
                    </div>
                    <div class="content">
                        <h2>Thank You for Your Payment!</h2>
                        <p>Dear ${customerName},</p>
                        <p>We have successfully received your payment for order <strong>${orderId}</strong></p>
                        
                        <div class="amount">PKR ${amount.toLocaleString()}</div>
                        
                        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                        <p>Your order has been confirmed and will be processed shortly. You will receive tracking information via email once your item ships.</p>
                        
                        <p>If you have any questions, please contact us at <strong>Saimrk11@gmail.com</strong></p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: process.env.GMAIL_USER || 'Saimrk11@gmail.com',
            to: customerEmail,
            subject: `Payment Received - Order ${orderId}`,
            html: html,
            replyTo: 'Saimrk11@gmail.com'
        };

        const info = await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'Payment confirmation email sent',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('Error sending payment confirmation email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send payment confirmation email',
            error: error.message
        });
    }
});

// ============= ORDER NOTIFICATION ENDPOINT =============

app.post('/api/notify-admin', async (req, res) => {
    try {
        const { orderId, customerName, customerEmail, orderTotal, paymentMethod } = req.body;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; }
                    .header { background-color: #d4af37; color: #1a1a1a; padding: 20px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New Order Received!</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p><strong>Order ID:</strong> ${orderId}</p>
                        <p><strong>Customer Name:</strong> ${customerName}</p>
                        <p><strong>Customer Email:</strong> ${customerEmail}</p>
                        <p><strong>Order Total:</strong> PKR ${orderTotal}</p>
                        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                        <p>Please process this order as soon as possible.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: process.env.GMAIL_USER || 'Saimrk11@gmail.com',
            to: process.env.ADMIN_EMAIL || 'Saimrk11@gmail.com',
            subject: `New Order Received - ${orderId}`,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'Admin notification sent'
        });

    } catch (error) {
        console.error('Error sending admin notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send admin notification',
            error: error.message
        });
    }
});

// ============= HEALTH CHECK ENDPOINT =============

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Email service is running'
    });
});

// ============= SERVER START =============

app.listen(PORT, () => {
    console.log(`A.M Garments Email Service running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ============= ERROR HANDLING =============

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
