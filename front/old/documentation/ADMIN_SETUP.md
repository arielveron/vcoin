# VCoin Admin Panel - Quick Setup

Get your VCoin admin panel up and running in 3 steps!

## 🚀 Quick Start

### 1. Database Setup (One Command!)
```bash
npm run setup
```
This creates everything you need:
- VCoin database tables (classes, students, investments, interest rates)
- Sample data for testing
- Authentication tables for NextAuth.js v5 (Auth.js)

### 2. Configure Google OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth2 credentials
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy your Client ID and Secret

### 3. Environment Configuration

Copy `.env.example` to `.env.local` and set:
```bash
# Required for authentication
NEXTAUTH_SECRET=your-random-secret-here
GOOGLE_CLIENT_ID=your-google-client-id  
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Admin access (your email)
ADMIN_EMAILS=your-email@gmail.com

# Your existing database config
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vcoin_db
DB_USER=postgres
DB_PASSWORD=your-password
```

### 4. Start the App
```bash
npm run dev
```

Visit `http://localhost:3000/admin` and sign in with Google!

## 🎯 What You Get

### Admin Dashboard
- 📊 **Statistics**: Overview of all your data
- 🏫 **Classes Management**: Create, edit, delete classes
- 👨‍🎓 **Students Management**: Manage student records (coming soon)
- 💰 **Investments Management**: Track investments (coming soon)
- 📈 **Interest Rates**: Manage rate history (coming soon)

### Security Features
- 🔐 **NextAuth.js v5**: Latest Auth.js with Google OAuth2
- 🛡️ **Access Control**: Only allowed emails can access
- 🔒 **Server-side Protection**: All admin routes are protected
- 💾 **Database Sessions**: Secure session management

## 🛠️ Architecture

Follows your existing VCoin patterns:
- **Server Components** for data fetching
- **Repository Pattern** (Service → Repository → Database)
- **Server Actions** for form submissions
- **Your Database Config** (reuses existing connection)

## 🔧 Configuration Options

### Admin Access Control
```bash
# Allow specific emails
ADMIN_EMAILS=admin1@gmail.com,admin2@gmail.com

# Allow entire domains
ADMIN_DOMAINS=yourcompany.com,yourdomain.com

# Development mode (any Google account works)
NODE_ENV=development
```

### Security Notes
- **Development**: Any Google account can access (for testing)
- **Production**: Only whitelisted emails/domains can access
- **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`

## 📁 File Structure
```
src/app/admin/
├── page.tsx              # Dashboard
├── layout.tsx            # Admin layout  
├── classes/              # Classes management
├── auth/signin/          # Sign-in page
└── components/           # UI components
```

## 🐛 Troubleshooting

**"Access Denied"** → Check `ADMIN_EMAILS` configuration  
**OAuth Errors** → Verify Google credentials and redirect URI  
**Database Errors** → Run `npm run setup` again  
**Build Errors** → Check TypeScript errors with `npm run build`

## 🚀 What's Next?

The foundation is ready! You can now:
1. ✅ **Test classes management** 
2. 🔜 **Add students management** (following same pattern)
3. 🔜 **Add investments management**
4. 🔜 **Add interest rates management**
5. 🔜 **Customize UI and add features**

---

**Need help?** Check the existing VCoin patterns in `/src/repos/` and `/src/services/` for examples!
