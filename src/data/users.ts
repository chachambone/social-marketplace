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
const HASH = "$2b$10$w4tL7VEEFC96IGrKn2x7/ekIeCeXIXvfhrGBa8Sl1BXqOIKrJRMsO";

export const users: User[] = [
  {
    id: "buyer_demo_id",
    email: "buyer@bidhive.com",
    username: "DemoBuyer",
    password: HASH,
    userType: "buyer",
    createdAt: "2026-04-20T08:00:00.000Z",
    lastLogin: "2026-04-20T08:00:00.000Z"
  },
  {
    id: "seller_amara",
    email: "amara@bidhive.com",
    username: "Amara K.",
    password: HASH,
    userType: "seller",
    createdAt: "2026-04-20T08:00:00.000Z",
    lastLogin: "2026-04-20T08:00:00.000Z"
  },
  {
    id: "seller_kevin",
    email: "kevin@bidhive.com",
    username: "Kevin M.",
    password: HASH,
    userType: "seller",
    createdAt: "2026-04-20T08:00:00.000Z",
    lastLogin: "2026-04-20T08:00:00.000Z"
  },
  {
    id: "seller_zawadi",
    email: "zawadi@bidhive.com",
    username: "Zawadi W.",
    password: HASH,
    userType: "seller",
    createdAt: "2026-04-20T08:00:00.000Z",
    lastLogin: "2026-04-20T08:00:00.000Z"
  },
  {
    id: "seller_brian",
    email: "brian@bidhive.com",
    username: "Brian O.",
    password: HASH,
    userType: "seller",
    createdAt: "2026-04-20T08:00:00.000Z",
    lastLogin: "2026-04-20T08:00:00.000Z"
  },
  {
    id: "seller_jay",
    email: "jaychacha071@gmail.com",
    username: "Jay Chacha",
    password: HASH,
    userType: "seller",
    createdAt: "2026-04-20T08:00:00.000Z",
    lastLogin: "2026-04-20T08:00:00.000Z"
  }
];
