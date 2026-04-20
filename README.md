# BidHive - Social Marketplace

A **full-stack marketplace** for buying and selling collectible items with **real-time bidding** and **WebSocket chat**. Built with TypeScript, Lit, and Tailwind CSS.

## ��� Live Demo

**Production URL:** [https://bid-hive-marketplace.onrender.com](https://bid-hive-marketplace.onrender.com)

**Test Credentials:**
- Buyer: `buyer@example.com` / `password123`
- Seller: `seller@example.com` / `password123`

## ✨ Features

### Authentication & Security
- JWT-based authentication with 7-day expiry
- bcrypt password hashing (10 rounds)
- Role-based access (Buyer / Seller / Admin)
- Welcome emails via nodemailer

### Buyer Experience
- Browse marketplace with search functionality
- View item details and seller information
- Start real-time bidding with WebSocket chat
- Place bids and negotiate prices
- Responsive grid layout for all devices

### Seller Dashboard
- Real-time statistics (items, bids, chats, sales)
- Create and manage product listings
- Track highest bids on items
- Chat with potential buyers
- Delete or update listings

### Real-time Features
- WebSocket-powered chat for each item
- Instant bid notifications
- Connection status indicator
- Message history with timestamps
- Automatic reconnection on disconnect

### UI/UX
- 100% Tailwind CSS (no custom CSS files)
- Responsive design (mobile → desktop)
- Smooth sliding drawer for bidding
- Loading states and error handling
- Shadow DOM encapsulation

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Lit 3.x** | Web components with Shadow DOM |
| **Tailwind CSS 3** | Utility-first styling |
| **TypeScript** | Type safety |
| **WebSocket API** | Real-time communication |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js 20+** | JavaScript runtime |
| **Express 5.x** | Web framework |
| **TypeScript** | Type safety |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |
| **uuid** | ID generation |
| **nodemailer** | Email delivery |

### Development
| Tool | Purpose |
|------|---------|
| **Concurrently** | Run multiple watch processes |
| **Nodemon** | Auto-restart server |
| **PostCSS** | Tailwind processing |
| **Render** | Production hosting |

## Project Structure
social-marketplace/
├── src/
│ ├── controllers/ # Business logic (items, users)
│ ├── routes/ # API endpoints
│ ├── middleware/ # Auth, logger, error handling
│ ├── config/ # App configuration
│ ├── utils/ # Helpers (email, file)
│ ├── data/ # In-memory data stores
│ ├── views/ # EJS templates
│ └── types/ # TypeScript interfaces
├── public/
│ └── js/
│ └── components/ # Lit components
│ ├── LoginForm.ts
│ ├── ItemsGrid.ts
│ ├── SellerDashboard.ts
│ ├── bidDrawer.ts
│ └── ItemCard.ts
├── dist/ # Compiled output
├── ADR.md # Architecture decisions
├── render.yaml # Render deployment config
└── package.json

text

## Getting Started

### Prerequisites
- Node.js 20+
- npm 9+

### Installation

```bash
# Clone repository
git clone https://github.com/chachambone/social-marketplace.git
cd social-marketplace

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Build the project
npm run build

# Run development server
npm run dev
Environment Variables
env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-email@ethereal.email
SMTP_PASS=your-password
EMAIL_FROM=marketplace@yourdomain.com
��� Testing
bash
# Test API endpoints
curl http://localhost:3000/api/health

##  Test Accounts

**All passwords are: `password123`**

| Role | Email |
|------|-------|
| **Buyer** | `buyer@bidhive.com` |
| **Seller (Amara)** | `amara@bidhive.com` |
| **Seller (Kevin)** | `kevin@bidhive.com` |
| **Seller (Zawadi)** | `zawadi@bidhive.com` |
| **Seller (Brian)** | `brian@bidhive.com` |
| **Seller (Jay)** | `jaychacha071@gmail.com` |

### Quick Testing:

**Buyer Experience:**
- Email: `buyer@bidhive.com`
- Password: `password123`
- Test: Browse items, search, start bids, real-time chat

**Seller Experience:**
- Email: `amara@bidhive.com` (or any seller email)
- Password: `password123`
- Test: Dashboard stats, add items, manage products, respond to bids

��� Deployment
Deploy to Render
Push code to GitHub

Create new Web Service on Render

Connect your repository

Add environment variables

Deploy!

Render Configuration (render.yaml):

yaml
services:
  - type: web
    name: bid-hive-marketplace
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_VERSION
        value: 20.0.0
      - key: JWT_SECRET
        generateValue: true

��� API Endpoints

Authentication
Method	Endpoint	Description
POST	/api/users/register	Register new user
POST	/api/users/login	Login user
GET	/api/users/profile	Get user profile
Items
Method	Endpoint	Description
GET	/api/items	Get all items (with search)
GET	/api/items/:id	Get single item
POST	/api/items	Create new item (seller)
DELETE	/api/items/:id	Delete item (seller)
WebSocket
Endpoint	Description
ws://host/ws?itemId=&userId=	Real-time chat connection

��� Assessment Requirements Fulfilled

Requirement	Status
EJS for server-side rendering	✅
Lit components for interactivity	✅
Tailwind CSS for styling	✅
Search items by keyword	✅
Buyers propose alternative prices	✅ (via bids)
Direct messaging with WebSockets	✅
Checkout and payment flow	✅
Seller confirm payment and remove	✅
Public GitHub repository	✅
Live deployment	✅
ADR.md documentation	✅

��� Contributing

Fork the repository

Create feature branch (git checkout -b feature/amazing)

Commit changes (git commit -m 'Add amazing feature')

Push to branch (git push origin feature/amazing)

Open Pull Request

��� License
MIT License - see LICENSE file for details

��� Author
Marycharity Mbone

GitHub: @chachambone

Email: mbonemarycharity@gmail.com

��� Acknowledgments
InterIntel for the assessment opportunity

Lit team for excellent web components

Tailwind CSS for amazing utility classes

Render for free hosting

⭐ Star this repository if you find it useful!