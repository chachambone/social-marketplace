// Auto-generated users
// Password for all accounts: password123

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  userType: 'buyer' | 'seller' | 'admin';
  createdAt: string;
  lastLogin: string;
}

// Hash for "password123"
const Hash = "$2b$10$jOxtcIWFAJrINoaaAy1g2uQDzoyCE7W34mnF.IZF0Eo067rg3MeGC";

export const users: User[] = [
  {
    id: "buyer_demo_id",
    email: "buyer@bidhive.com",
    username: "DemoBuyer",
    password: Hash,
    userType: "buyer",
    createdAt: "2026-04-20T08:00:00.000Z",
    lastLogin: "2026-04-20T08:00:00.000Z"
  },
  {
    id: "seller_amara",
    email: "amara@bidhive.com",
    username: "Amara K.",
    password: Hash,
    userType: "seller",
    createdAt: "2026-04-20T08:00:00.000Z",
    lastLogin: "2026-04-20T08:00:00.000Z"
  },
  {
    id: "seller_kevin",
    email: "kevin@bidhive.com",
    username: "Kevin M.",
    password: Hash,
    userType: "seller",
    createdAt: "2026-04-20T08:00:00.000Z",
    lastLogin: "2026-04-20T08:00:00.000Z"
  },
  {
    id: "seller_zawadi",
    email: "zawadi@bidhive.com",
    username: "Zawadi W.",
    password: Hash,
    userType: "seller",
    createdAt: "2026-04-20T08:00:00.000Z",
    lastLogin: "2026-04-20T08:00:00.000Z"
  },
  {
    id: "seller_brian",
    email: "brian@bidhive.com",
    username: "Brian O.",
    password: Hash,
    userType: "seller",
    createdAt: "2026-04-20T08:00:00.000Z",
    lastLogin: "2026-04-20T08:00:00.000Z"
  },
  {
    id: "seller_jay",
    email: "jaychacha071@gmail.com",
    username: "Jay Chacha",
    password: Hash,
    userType: "seller",
    createdAt: "2026-04-20T08:00:00.000Z",
    lastLogin: "2026-04-20T08:00:00.000Z"
  }
];
