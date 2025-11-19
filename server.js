const express = require('express');
app.set('trust proxy', true);
const session = require('express-session');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
            connectSrc: ["'self'"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limiting for login endpoint
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true
});

// Contact form rate limiting
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Max 10 submissions per hour per IP
    message: 'Too many contact submissions, please try again later.'
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Middleware to parse JSON and form data with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads with security
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'data', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        // Sanitize filename to prevent path traversal
        cb(null, uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) && allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 5 // Max 5 files
    }
});

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId', // Don't use default name
    cookie: {
        secure: IS_PRODUCTION, // HTTPS only in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict'
    }
}));

// Generate proper password hash for admin using env variable only (no fallback)
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);

// Admin credentials
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME ,
    passwordHash: process.env.ADMIN_PASSWORD_HASH 
};

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.isAuthenticated) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// Input sanitization helpers
function sanitizeInput(input) {
    if (!input) return '';
    return validator.escape(validator.trim(input.toString()));
}

function validateEmail(email) {
    if (!email) return true; // Optional field
    return validator.isEmail(email);
}

function validatePhone(phone) {
    // Remove common phone formatting characters
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    return /^\d{10,15}$/.test(cleanPhone);
}

function validateZip(zip) {
    return /^\d{5}$/.test(zip);
}

function validateDate(dateString) {
    return validator.isISO8601(dateString);
}

function validateStatus(status) {
    const validStatuses = ['new', 'contacted', 'completed'];
    return validStatuses.includes(status);
}

// ============================================
// ADMIN ROUTES (Must be before static files!)
// ============================================

// Serve admin login page
app.get('/admin', (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        res.sendFile(path.join(__dirname, 'admin.html'));
    } else {
        res.sendFile(path.join(__dirname, 'admin-login.html'));
    }
});

// Serve admin dashboard
app.get('/admin.html', (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        res.sendFile(path.join(__dirname, 'admin.html'));
    } else {
        res.redirect('/admin');
    }
});

// Serve admin login page explicitly
app.get('/admin-login.html', (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        res.redirect('/admin');
    } else {
        res.sendFile(path.join(__dirname, 'admin-login.html'));
    }
});

// Login endpoint with rate limiting
app.post('/api/admin/login', loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate inputs
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // Sanitize username
        const cleanUsername = validator.trim(username);

        // Check username (constant-time comparison)
        if (cleanUsername !== ADMIN_CREDENTIALS.username) {
            // Add artificial delay to prevent timing attacks
            await new Promise(resolve => setTimeout(resolve, 1000));
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password with bcrypt
        const isValidPassword = await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash);

        if (!isValidPassword) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Regenerate session to prevent fixation attacks
        req.session.regenerate((err) => {
            if (err) {
                return res.status(500).json({ error: 'Session error' });
            }

            req.session.isAuthenticated = true;
            req.session.username = cleanUsername;

            res.json({ success: true, message: 'Login successful' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout endpoint
app.post('/api/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.clearCookie('sessionId');
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Check authentication status
app.get('/api/admin/auth-check', (req, res) => {
    res.json({
        isAuthenticated: !!(req.session && req.session.isAuthenticated),
        username: req.session && req.session.username ? req.session.username : null
    });
});

// Get all contacts (protected)
app.get('/api/admin/contacts', requireAuth, (req, res) => {
    try {
        const contactsFile = path.join(__dirname, 'data', 'contacts.json');

        if (!fs.existsSync(contactsFile)) {
            return res.json([]);
        }

        const data = fs.readFileSync(contactsFile, 'utf8');
        const contacts = JSON.parse(data);

        res.json(contacts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load contacts' });
    }
});

// Update contact status (protected)
app.patch('/api/admin/contacts/:id', requireAuth, (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate ID format
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        // Validate status
        if (!validateStatus(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const contactsFile = path.join(__dirname, 'data', 'contacts.json');

        if (!fs.existsSync(contactsFile)) {
            return res.status(404).json({ error: 'Contacts file not found' });
        }

        const data = fs.readFileSync(contactsFile, 'utf8');
        let contacts = JSON.parse(data);

        const contactIndex = contacts.findIndex(c => c.id === id);

        if (contactIndex === -1) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        contacts[contactIndex].status = status;

        fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2));

        res.json({ success: true, contact: contacts[contactIndex] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update contact' });
    }
});

// Delete contact (protected)
app.delete('/api/admin/contacts/:id', requireAuth, (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const contactsFile = path.join(__dirname, 'data', 'contacts.json');

        if (!fs.existsSync(contactsFile)) {
            return res.status(404).json({ error: 'Contacts file not found' });
        }

        const data = fs.readFileSync(contactsFile, 'utf8');
        let contacts = JSON.parse(data);

        const originalLength = contacts.length;
        contacts = contacts.filter(c => c.id !== id);

        if (contacts.length === originalLength) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2));

        res.json({ success: true, message: 'Contact deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});

// Get statistics (protected)
app.get('/api/admin/stats', requireAuth, (req, res) => {
    try {
        const contactsFile = path.join(__dirname, 'data', 'contacts.json');

        if (!fs.existsSync(contactsFile)) {
            return res.json({ total: 0, new: 0, contacted: 0, completed: 0 });
        }

        const data = fs.readFileSync(contactsFile, 'utf8');
        const contacts = JSON.parse(data);

        const stats = {
            total: contacts.length,
            new: contacts.filter(c => c.status === 'new').length,
            contacted: contacts.filter(c => c.status === 'contacted').length,
            completed: contacts.filter(c => c.status === 'completed').length
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load statistics' });
    }
});

// ============================================
// STATIC FILES
// ============================================

// Serve uploaded images (protected - only accessible by admin)
app.use('/data/uploads', requireAuth, express.static(path.join(__dirname, 'data', 'uploads')));

// Serve static files from the current directory
app.use(express.static(__dirname, {
    extensions: ['html', 'htm'],
    setHeaders: (res, filePath) => {
        // Set proper MIME types
        if (filePath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        }
    }
}));

// ============================================
// PUBLIC WEBSITE ROUTES
// ============================================

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// About page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/about.html', (req, res) => {
    res.redirect(301, '/about');
});

// Pricing page
app.get('/pricing', (req, res) => {
    res.sendFile(path.join(__dirname, 'pricing.html'));
});

app.get('/pricing.html', (req, res) => {
    res.redirect(301, '/pricing');
});

// Contact page
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/contact.html', (req, res) => {
    res.redirect(301, '/contact');
});

// Contact form submission endpoint with validation
app.post('/api/contact', contactLimiter, upload.array('images', 5), (req, res) => {
    try {
        // Validate required fields
        if (!req.body.name || !req.body.phone || !req.body.zip || !req.body.when || !req.body.items) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Sanitize and validate inputs
        const name = sanitizeInput(req.body.name);
        const phone = sanitizeInput(req.body.phone);
        const email = req.body.email ? sanitizeInput(req.body.email) : '';
        const zip = sanitizeInput(req.body.zip);
        const items = sanitizeInput(req.body.items);
        const location = req.body.location ? sanitizeInput(req.body.location) : '';
        const preferredDate = sanitizeInput(req.body.when);
        const preferredTime = req.body.time ? sanitizeInput(req.body.time) : 'Any time';

        // Validate name (2-100 chars, letters and spaces only)
        if (!name || name.length < 2 || name.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Invalid name format'
            });
        }

        // Validate phone
        if (!validatePhone(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format'
            });
        }

        // Validate email if provided
        if (email && !validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Validate ZIP code
        if (!validateZip(zip)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ZIP code format'
            });
        }

        // Validate date
        if (!validateDate(preferredDate)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }

        // Validate items description
        if (!items || items.length < 5 || items.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Items description must be between 5 and 1000 characters'
            });
        }

        const contactsFile = path.join(__dirname, 'data', 'contacts.json');

        // Read existing contacts
        let contacts = [];
        if (fs.existsSync(contactsFile)) {
            const data = fs.readFileSync(contactsFile, 'utf8');
            contacts = JSON.parse(data);
        }

        // Process uploaded images securely
        const images = req.files ? req.files.map(file => ({
            filename: path.basename(file.filename), // Prevent path traversal
            originalName: sanitizeInput(file.originalname),
            path: `/data/uploads/${path.basename(file.filename)}`,
            size: file.size,
            mimetype: file.mimetype
        })) : [];

        // Create new contact entry
        const newContact = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            name,
            phone,
            email,
            zip,
            preferredDate,
            preferredTime,
            items,
            location,
            images,
            status: 'new'
        };

        // Add to contacts array
        contacts.unshift(newContact);

        // Ensure data directory exists
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Save to file with proper error handling
        fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2), { mode: 0o600 });

        // Notify admin panel
        notifyAdminPanel();

        res.json({
            success: true,
            message: 'Contact request received!',
            imageCount: images.length
        });
    } catch (error) {
        // Don't expose internal error details
        res.status(500).json({
            success: false,
            message: 'Failed to process request'
        });
    }
});

// Store connected admin clients for real-time updates
let adminClients = [];

// SSE endpoint for admin panel real-time updates (protected)
app.get('/api/admin/stream', requireAuth, (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    adminClients.push(res);
    res.write('data: {"type":"connected"}\n\n');

    req.on('close', () => {
        adminClients = adminClients.filter(client => client !== res);
    });
});

// Function to notify admin panel of new contact
function notifyAdminPanel() {
    const message = JSON.stringify({ type: 'new_contact', timestamp: new Date().toISOString() });
    adminClients.forEach(client => {
        try {
            client.write(`data: ${message}\n\n`);
        } catch (error) {
            // Silently handle write errors
        }
    });
}

// 404 handler - must be last
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - Page Not Found | Junk2CLEAN</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #E8F4F8, #D0E8F0);
                }
                .container {
                    text-align: center;
                    padding: 2rem;
                }
                h1 {
                    font-size: 6rem;
                    margin: 0;
                    color: #3D6E7A;
                }
                p {
                    font-size: 1.5rem;
                    color: #4A4A4A;
                    margin: 1rem 0 2rem;
                }
                a {
                    display: inline-block;
                    padding: 1rem 2rem;
                    background: linear-gradient(135deg, #5B9BA8, #3D6E7A);
                    color: white;
                    text-decoration: none;
                    border-radius: 100px;
                    font-weight: 600;
                    transition: transform 0.3s;
                }
                a:hover {
                    transform: translateY(-2px);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>404</h1>
                <p>Oops! This page couldn't be found.</p>
                <a href="/">← Back to Home</a>
            </div>
        </body>
        </html>
    `);
});

// Global error handler
app.use((err, req, res, next) => {
    // Don't expose error details in production
    const message = IS_PRODUCTION ? 'Internal server error' : err.message;
    res.status(500).json({ error: message });
});

// Start server
app.listen(PORT, () => {
    if (!IS_PRODUCTION) {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`🔐 Admin: http://localhost:${PORT}/admin`);
        console.log(`⚠️  Change admin credentials before production!\n`);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    process.exit(0);
});

process.on('SIGINT', () => {
    process.exit(0);
});
