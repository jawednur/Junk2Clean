# Junk2CLEAN Website

Eco-friendly junk removal service website with modern hamburger navigation - built with HTML, CSS, and JavaScript, served via Express.

## ✨ Features

- 🍔 **Hamburger Navigation Menu** - Smooth slide-in navigation on all devices
- 📄 **Multi-Page Site** - Home, About Us, Pricing, and Contact pages
- 🎨 **Beautiful Design** - Desert-themed gradients with modern UI/UX
- 📱 **Fully Responsive** - Mobile-first design that works on all screen sizes
- 🔍 **SEO Optimized** - Complete meta tags, Open Graph, and structured data
- ♿ **Accessible** - ARIA labels and keyboard navigation support

## 🚀 Deploy to Railway

### Quick Deployment Steps:

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add Railway deployment configuration"
   git push origin main
   ```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose this repository
   - Railway will automatically detect the Node.js project
   - Click "Deploy"

3. **Wait for deployment**:
   - Railway will run `npm install` and `npm start`
   - Your site will be live in 1-2 minutes

4. **Get your URL**:
   - Click "Generate Domain" in Railway dashboard
   - Your site will be available at `https://your-project.up.railway.app`

### Custom Domain (Optional):
- In Railway dashboard, go to Settings → Domains
- Add your custom domain (e.g., `www.junk2clean.com`)
- Update your DNS records as instructed

## 🛠️ Local Development

To run locally:

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The site will be available at `http://localhost:3000`

## 📁 Project Structure

```
.
├── index.html              # Home page
├── about.html              # About Us page
├── pricing.html            # Pricing page
├── contact.html            # Contact page
├── server.js               # Express server with routing
├── package.json            # Node.js dependencies
├── Junk2CLEAN Logo Design.png  # Logo image
├── QUICK_START.md          # Quick start guide
├── IMPLEMENTATION_SUMMARY.md  # Implementation details
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🌐 Pages

- **Home** (`/`) - Hero section, services overview, testimonials, FAQ
- **About Us** (`/about.html`) - Company story, mission, values, impact
- **Pricing** (`/pricing.html`) - Transparent pricing tiers and details
- **Contact** (`/contact.html`) - Contact form, info, and service areas

## 🔧 Configuration

The server uses the `PORT` environment variable (automatically set by Railway). For local development, it defaults to port 3000.

## 📝 Notes

- Multi-page site with hamburger navigation menu
- All pages are static with no backend required
- Express serves HTML pages and static assets with proper routing
- All styling and JavaScript are inline in each HTML page
- Fully SEO optimized with meta tags and structured data
- Mobile-first responsive design
- Environment-friendly with minimal dependencies

## 🎨 Customization

See `QUICK_START.md` for details on:
- Updating contact information
- Changing colors and branding
- Adding Google Analytics
- Connecting the contact form

## 📞 Support

For issues with the website, contact: hello@junk2clean.com

