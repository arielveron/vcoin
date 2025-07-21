# VCoin - Investment Tracking Application

A Next.js application for tracking student investments with an admin panel.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database & Admin Panel
```bash
npm run setup
```
This single command creates:
- VCoin database tables (classes, students, investments, interest rates)
- Sample data for testing
- Admin authentication system

### 3. Configure Environment
Copy `.env.example` to `.env.local` and configure:
```bash
# Database (your existing config)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vcoin_db
DB_USER=postgres
DB_PASSWORD=your-password

# Admin Panel (new)
NEXTAUTH_SECRET=your-random-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
ADMIN_EMAILS=your-email@gmail.com
```

### 4. Start Development
```bash
npm run dev
```

- **Main App**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

## 📖 Documentation

All detailed documentation is now organized in the `/documentation` folder:

- **[Admin Setup](documentation/ADMIN_SETUP.md)** - Detailed admin panel configuration guide
- **[Admin Complete](documentation/ADMIN_COMPLETE.md)** - Complete admin implementation details  
- **[Database Setup](documentation/DATABASE.md)** - Database configuration and setup details
- **[Student Authentication](documentation/STUDENT_AUTH_SETUP.md)** - Student auth system setup and features
- **[Implementation Improvements](documentation/IMPLEMENTATION_IMPROVEMENTS.md)** - Recent standardization improvements
- **[Copilot Instructions](documentation/copilot-instructions.md)** - AI coding agent guidelines

## 🏗️ Architecture

- **Frontend**: Next.js 15 with App Router
- **Database**: PostgreSQL with connection pooling
- **Authentication**: NextAuth.js with Google OAuth2
- **Styling**: Tailwind CSS
- **Pattern**: Server Components + Repository Pattern

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── admin/          # Admin panel
│   └── page.tsx        # Main application
├── repos/              # Data repositories
├── services/           # Business logic
├── types/              # TypeScript types
└── config/             # Database config
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
