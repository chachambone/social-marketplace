# 🐝 BidHive - Social Marketplace for Collectibles

A real-time social marketplace where buyers and sellers can negotiate prices, chat instantly, and close deals. Built with EJS for server-side rendering and Lit Web Components for interactive UI.

## ✨ Features

### For Buyers
- **Browse Items** - Search and filter products by category, price, and condition
- **Real-time Bidding** - Make offers on items with instant bid updates
- **Live Chat** - Direct messaging with sellers about specific items
- **Favorites** - Save items to watchlist for later
- **Secure Checkout** - Purchase items with payment confirmation

### For Sellers
- **Seller Dashboard** - Manage all listings from one place
- **Item Management** - Create, edit, and delete product listings
- **Bid Management** - View all bids and select winning offers
- **Real-time Chat** - Communicate with potential buyers
- **Sales Tracking** - Monitor revenue and pending sales

### Technical Highlights
- 🔌 **WebSocket Real-time Communication** - Instant chat and bid updates
- 🎨 **Hybrid Rendering** - EJS for SEO + Lit Components for interactivity
- 📱 **Fully Responsive** - Works flawlessly on mobile, tablet, and desktop
- 🎯 **TypeScript** - Type-safe code across client and server
- 💅 **Tailwind CSS** - Utility-first styling with dark mode support

## 🚀 Live Demo

[View Live Application](#) *(Add your deployed URL here)*

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/chachambone/bidhive-marketplace.git
cd bidhive-marketplace

### .env

`
PORT=3000
SESSION_SECRET=your-super-secret-session-key-change-this
API_URL=http://localhost:3000
NODE_ENV=development

`


4. Build the Project
bash
npm run build
5. Run the Application
Development Mode (with hot reload):

bash
npm run dev
Production Mode:

bash
npm start
6. Access the Application
text
http://localhost:3000
📁 Project Structure
text
bidhive-marketplace/
├── src/
│   ├── assets/          # Static assets (images, fonts)
│   ├── client/          # Lit Web Components
│   │   ├── components/  # Reusable Lit components
│   │   ├── services/    # API and WebSocket services
│   │   └── types/       # TypeScript type definitions
│   ├── server/          # Express backend
│   │   ├── middleware/  # Custom middleware
│   │   ├── routes/      # API routes
│   │   └── utils/       # Utility functions
│   ├── views/           # EJS templates
│   │   ├── pages/       # Page templates
│   │   └── components/  # EJS partials
│   └── scripts/         # Build scripts
├── public/              # Compiled assets
│   ├── css/            # Compiled CSS
│   └── js/             # Compiled JavaScript
├── sessions/            # File-based session storage
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
🏗️ Architecture
Hybrid Rendering
EJS Templates - Server-side rendered pages for SEO and initial load

Lit Components - Client-side web components for interactive features

Component Loader - Dynamic component loading system

Real-time Communication
WebSocket Server - Persistent connections for chat and bidding

HTTP API - REST endpoints for data persistence

Session Management - File-based session store for user auth

State Management
Component-Local State - Each Lit component manages its own @state

Local Storage - Persistent user preferences and favorites

Custom Events - Cross-component communication

🧪 Demo Accounts
Buyer Account
Email: buyer@bidhive.com

Password: buyer123

Seller Account
Email: seller@bidhive.com

Password: seller123

Or register your own account

🔧 Development Commands
Command	Description
npm run dev	Start development server with hot reload
npm run build	Build for production
npm start	Run production server
npm run build:css	Compile Tailwind CSS
npm run watch:ts:client	Watch and rebuild client TypeScript
npm run watch:ts:server	Watch and rebuild server TypeScript
🎯 Key Features Walkthrough
As a Buyer
Browse Items - Visit the homepage to see trending items

Search & Filter - Use search bar and filters to find specific items

Make an Offer - Click "Make Offer" on any item card

Chat with Seller - Use the built-in chat to negotiate

Purchase - Complete checkout when price is agreed

As a Seller
Access Dashboard - Click "Start Selling" or navigate to /seller/dashboard

Add Item - Click "Add New Item" and fill in details

Upload Images - Drag & drop or paste image URLs

Monitor Bids - View all incoming bids in real-time

Select Winner - Click on any bid to confirm the sale

🐛 Troubleshooting
Sessions Not Persisting
Ensure sessions/ directory exists and is writable

Check SESSION_SECRET in .env file

WebSocket Connection Failed
Verify server is running on port 3000

Check for firewall blocking WebSocket connections

Ensure API_URL in .env matches your server URL

Components Not Loading
Clear browser cache

Check browser console for import errors

Verify compiled JS exists in public/js/

Tailwind Styles Missing
Run npm run build:css to recompile

Check tailwind.config.js for content paths
