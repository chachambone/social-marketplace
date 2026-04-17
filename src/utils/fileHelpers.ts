import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const dataDir = join(process.cwd(), 'data');

// Ensure data directory exists
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const itemsPath = join(dataDir, 'items.json');
const usersPath = join(dataDir, 'users.json');
const messagesPath = join(dataDir, 'messages.json');

export const readItems = () => {
  if (!existsSync(itemsPath)) {
    writeFileSync(itemsPath, JSON.stringify([], null, 2));
  }
  const data = readFileSync(itemsPath, 'utf-8');
  return JSON.parse(data);
};

export const writeItems = (items: any[]) => {
  writeFileSync(itemsPath, JSON.stringify(items, null, 2));
};

export const readUsers = () => {
  if (!existsSync(usersPath)) {
    writeFileSync(usersPath, JSON.stringify([], null, 2));
  }
  const data = readFileSync(usersPath, 'utf-8');
  return JSON.parse(data);
};

export const writeUsers = (users: any[]) => {
  writeFileSync(usersPath, JSON.stringify(users, null, 2));
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