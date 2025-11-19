# Junk2CLEAN Admin Panel

A secure admin panel for managing contact form submissions from the Junk2CLEAN website, integrated into the main server.

## 🚀 Features

- **Secure Authentication**: Login system with session management
- **Real-time Updates**: Automatically refreshes when new contact requests come in
- **Contact Management**: View, update status, and delete contact requests
- **Dashboard Statistics**: See total, new, in-progress, and completed requests at a glance
- **Status Tracking**: Mark contacts as New → Contacted → Completed
- **Single Server**: Everything runs on one server - simple deployment
- **Modern UI**: Beautiful, responsive interface with smooth animations

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn

## 🔧 Installation

All dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## 🎯 Quick Start

### Start the Server

Just run one command:

```bash
npm start
# or
npm run dev
```

This starts everything on http://localhost:8080:
- Main website
- Admin panel at `/admin`
- All API endpoints

## 🔐 Default Login Credentials

**⚠️ IMPORTANT: Change these in production!**

- **Username:** `admin`
- **Password:** `admin123`

## 📁 File Structure

```
/Junk2Clean/
├── server.js              # Single server with website + admin (port 8080)
├── admin-login.html       # Admin login page
├── admin.html            # Admin dashboard
├── contact.html          # Contact form (with API integration)
├── data/
│   └── contacts.json     # Contact submissions storage
└── package.json          # Dependencies and scripts
```

## 🔄 How It Works

### Contact Form Submission Flow

1. User fills out contact form on website (`/contact.html`)
2. Form submits to `/api/contact` endpoint on main server
3. Contact data is saved to `data/contacts.json`
4. Admin panel automatically detects new submission (polling every 10 seconds)
5. Admin receives notification of new contact request

### Admin Panel Features

#### Dashboard Statistics
- **Total Requests**: All contact submissions
- **New Requests**: Unprocessed submissions
- **In Progress**: Contacts that have been reached out to
- **Completed**: Finished requests

#### Contact Card Actions
- **Mark as Contacted**: Update status from "New" to "Contacted"
- **Mark as Completed**: Update status from "Contacted" to "Completed"
- **Reopen**: Change "Completed" status back to "New"
- **Delete**: Permanently remove a contact request

#### Filtering
Filter contacts by status:
- All
- New
- In Progress (Contacted)
- Completed

## 🔒 Security Features

- **Session-based authentication**: Secure login with HTTP-only cookies
- **Protected routes**: All admin API endpoints require authentication
- **Password hashing**: Passwords are hashed using bcryptjs
- **Independent server**: Admin panel runs on separate port with different session

## 🛠️ Configuration

### Change Admin Credentials

Edit `admin-server.js`:

```javascript
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'your-username',
    passwordHash: process.env.ADMIN_PASSWORD_HASH || 'hashed-password'
};
```

Or use environment variables:

```bash
export ADMIN_USERNAME=youradmin
export ADMIN_PASSWORD_HASH=your-bcrypt-hash
```

To generate a bcrypt hash:

```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your-password', 10);
console.log(hash);
```

### Change Server Port

Set the `PORT` environment variable:

```bash
export PORT=3000
npm start
```

Or edit `server.js`:

```javascript
const PORT = process.env.PORT || 8080;
```

## 📊 API Endpoints

All endpoints are on the same server (Port 8080):

### Public Endpoints

- `POST /api/contact` - Submit contact form
  - Body: `{ name, phone, email, zip, when, time, items, location }`

### Admin Endpoints (Protected)

- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/auth-check` - Check authentication status
- `GET /api/admin/contacts` - Get all contacts (protected)
- `PATCH /api/admin/contacts/:id` - Update contact status (protected)
- `DELETE /api/admin/contacts/:id` - Delete contact (protected)
- `GET /api/admin/stats` - Get dashboard statistics (protected)

## 📱 Contact Data Structure

```json
{
  "id": "1763062237062",
  "timestamp": "2025-11-13T19:30:37.062Z",
  "name": "John Doe",
  "phone": "5551234567",
  "email": "john@example.com",
  "zip": "85301",
  "preferredDate": "2025-11-14",
  "preferredTime": "morning",
  "items": "Old furniture and appliances",
  "location": "Garage, ground level",
  "status": "new"
}
```

### Status Values
- `new` - Just submitted, not yet contacted
- `contacted` - Customer has been reached out to
- `completed` - Request fulfilled and closed

## 🎨 Customization

### Updating Colors

Both admin pages use CSS variables. Edit the `:root` section in `admin-login.html` or `admin.html`:

```css
:root {
    --teal: #5B9BA8;
    --teal-dark: #3D6E7A;
    --success: #43A047;
    /* ... */
}
```

### Adding Fields to Contact Form

1. Add input to `contact.html`
2. Update API handler in `server.js` (`/api/contact` endpoint)
3. Update contact card display in `admin.html` (renderContacts function)

## 🐛 Troubleshooting

### Admin Panel Won't Load

1. Check if server is running: `npm start`
2. Verify port 8080 is not in use
3. Go to http://localhost:8080/admin (not /admin.html directly)
4. Check browser console and server console for errors

### Can't Login

1. Verify credentials (default: admin/admin123)
2. Check browser console for errors
3. Clear cookies and try again

### Contact Form Not Submitting

1. Ensure main server is running on port 8080
2. Check browser console for fetch errors
3. Verify `data` directory exists and is writable

### Real-time Updates Not Working

The admin panel uses polling (checks every 10 seconds). If updates aren't showing:
1. Refresh the page manually
2. Check browser console for errors
3. Verify both servers are running

## 🚀 Production Deployment

### Before Deploying:

1. **Change default credentials**
2. **Enable HTTPS** (set `secure: true` in session cookies)
3. **Set strong session secret** (use environment variable)
4. **Restrict admin access** (firewall, VPN, IP whitelist)
5. **Use environment variables** for sensitive data
6. **Enable CORS properly** if admin panel is on different domain
7. **Add rate limiting** to prevent brute force attacks
8. **Set up proper logging**

### Environment Variables for Production:

```bash
NODE_ENV=production
PORT=8080
ADMIN_USERNAME=your-secure-username
ADMIN_PASSWORD_HASH=your-bcrypt-hash
SESSION_SECRET=your-very-long-random-secret
```

## 📝 License

MIT License - See main project LICENSE file

## 🆘 Support

For issues or questions about the admin panel, contact your development team.

---

**Last Updated:** November 2025
**Version:** 1.0.0

