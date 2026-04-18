import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Try multiple possible paths for data
const possibleDataPaths = [
  join(process.cwd(), 'src', 'data'),     // src/data (your current location)
  join(process.cwd(), 'data'),            // root/data
  join(process.cwd(), 'server', 'data'),  // server/data
];

let dataDir = '';
for (const path of possibleDataPaths) {
  if (existsSync(path)) {
    dataDir = path;
    console.log(`✅ Found data directory: ${dataDir}`);
    break;
  }
}

// If no data directory found, create one in src/data
if (!dataDir) {
  dataDir = join(process.cwd(), 'src', 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  console.log(`📁 Created data directory: ${dataDir}`);
}

const itemsPath = join(dataDir, 'items.json');
const usersPath = join(dataDir, 'users.json');
const messagesPath = join(dataDir, 'messages.json');

console.log(`📦 Items path: ${itemsPath}`);
console.log(`👥 Users path: ${usersPath}`);
console.log(`💬 Messages path: ${messagesPath}`);

// Initialize default users if none exist
const getDefaultUsers = () => {
  return [
    {
      id: "1",
      email: "buyer@test.com",
      username: "buyer",
      password: "$2a$10$YourHashedPasswordHere", // You'll need to generate this
      userType: "buyer",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
    {
      id: "2",
      email: "seller@test.com",
      username: "seller",
      password: "$2a$10$YourHashedPasswordHere", // You'll need to generate this
      userType: "seller",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }
  ];
};

export const readItems = () => {
  if (!existsSync(itemsPath)) {
    console.log(`⚠️ items.json not found at ${itemsPath}, creating empty array`);
    writeFileSync(itemsPath, JSON.stringify([], null, 2));
  }
  const data = readFileSync(itemsPath, 'utf-8');
  const items = JSON.parse(data);
  console.log(`📖 Read ${items.length} items from ${itemsPath}`);
  return items;
};

export const writeItems = (items: any[]) => {
  writeFileSync(itemsPath, JSON.stringify(items, null, 2));
  console.log(`💾 Wrote ${items.length} items to ${itemsPath}`);
};

export const readUsers = () => {
  if (!existsSync(usersPath)) {
    console.log(`⚠️ users.json not found at ${usersPath}, creating with default users`);
    const defaultUsers = getDefaultUsers();
    writeFileSync(usersPath, JSON.stringify(defaultUsers, null, 2));
    return defaultUsers;
  }
  const data = readFileSync(usersPath, 'utf-8');
  const users = JSON.parse(data);
  console.log(`📖 Read ${users.length} users from ${usersPath}`);
  return users;
};

export const writeUsers = (users: any[]) => {
  writeFileSync(usersPath, JSON.stringify(users, null, 2));
  console.log(`💾 Wrote ${users.length} users to ${usersPath}`);
};

export const readMessages = () => {
  if (!existsSync(messagesPath)) {
    writeFileSync(messagesPath, JSON.stringify([], null, 2));
  }
  const data = readFileSync(messagesPath, 'utf-8');
  return JSON.parse(data);
};

export const writeMessages = (messages: any[]) => {
  writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
};