const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Root route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// About page routes
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

// Pricing page routes
app.get('/pricing', (req, res) => {
    res.sendFile(path.join(__dirname, 'pricing.html'));
});

app.get('/pricing.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pricing.html'));
});

// Contact page routes
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

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

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Junk2CLEAN server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📄 Available pages:`);
    console.log(`   - http://localhost:${PORT}/`);
    console.log(`   - http://localhost:${PORT}/about.html`);
    console.log(`   - http://localhost:${PORT}/pricing.html`);
    console.log(`   - http://localhost:${PORT}/contact.html`);
});

