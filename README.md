# Junk2CLEAN Website

Eco-friendly junk removal service website - built with HTML, CSS, and JavaScript, served via Express.

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
├── index.html              # Main website HTML
├── server.js               # Express server configuration
├── package.json            # Node.js dependencies
├── Junk2CLEAN Logo Design.png  # Logo image
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🔧 Configuration

The server uses the `PORT` environment variable (automatically set by Railway). For local development, it defaults to port 3000.

## 📝 Notes

- The site is fully static with no backend required
- Express serves the HTML and static assets
- All styling and JavaScript are inline in `index.html`
- Environment-friendly with minimal dependencies

## 📞 Support

For issues with the website, contact: hello@junk2clean.com

