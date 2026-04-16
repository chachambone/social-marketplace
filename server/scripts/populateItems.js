import { writeFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Your items data transformed
const itemsData = [
  // ── Amara (index 0) ──
  {
    sellerName: 'Amara',
    title: 'MacBook Pro 14" M3 — Space Grey',
    description: 'Bought in Dubai last December. Barely used — I switched back to a PC for work. M3 chip, 16GB RAM, 512GB SSD. Original box, charger and AppleCare receipt included. Screen is flawless.',
    starting_price: 195000,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    tags: ['macbook', 'apple', 'laptop', 'm3']
  },
  {
    sellerName: 'Amara',
    title: 'Sony WH-1000XM5 Headphones',
    description: 'Noise-cancelling headphones in near-perfect condition. Used for about 3 months then switched to earbuds. Comes with case, all cables and both earpads still sealed.',
    starting_price: 28000,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    tags: ['sony', 'headphones', 'audio', 'anc']
  },
  {
    sellerName: 'Amara',
    title: 'Samsung 65" QLED 4K TV',
    description: 'Moving house and can\'t fit this in the new place. 2022 model, QN65Q80B. Bought from iStore Karen. All remotes, original stand and wall-mount bracket included. Stunning picture.',
    starting_price: 95000,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
    tags: ['samsung', 'tv', '4k', 'qled']
  },
  {
    sellerName: 'Amara',
    title: 'Canon EOS R50 + 18-45mm Kit Lens',
    description: 'Perfect beginner mirrorless camera. 24MP APS-C sensor, 4K video, flip screen. Used for 4 months for content creation. Comes in original box with both batteries, charger, strap and lens hood.',
    starting_price: 72000,
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400',
    tags: ['canon', 'camera', 'content creation', 'vlog']
  },

  // ── Kevin (index 1) ──
  {
    sellerName: 'Kevin',
    title: 'iPhone 15 Pro Max 256GB — Natural Titanium',
    description: 'Upgraded to the 16 series. Phone is in excellent shape, used with a case from day one. Battery health 97%. Unlocked. Comes with original box and 20W charger.',
    starting_price: 145000,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
    tags: ['iphone', 'apple', 'smartphone', '15pro']
  },
  {
    sellerName: 'Kevin',
    title: 'Trek Marlin 5 Mountain Bike (Large)',
    description: 'Bought from Decathlon two seasons ago. Used on Karura trails every weekend. Recently serviced — new brake pads, chain and cassette. Rides beautifully. Helmet included if needed.',
    starting_price: 55000,
    image: 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=400',
    tags: ['trek', 'mtb', 'bike', 'cycling']
  },
  {
    sellerName: 'Kevin',
    title: 'DJI Mini 4 Pro Drone — Fly More Combo',
    description: 'Bought for a short film project, now gathering dust. Under 2 hours of total flight time. Includes 3 batteries, charging hub, ND filter kit and original carry case. No crashes ever.',
    starting_price: 82000,
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400',
    tags: ['dji', 'drone', 'photography', 'aerial']
  },
  {
    sellerName: 'Kevin',
    title: 'Nikon Z6 II Mirrorless Camera Body',
    description: 'Professional grade full-frame mirrorless. Shutter count ~8,000 (very low). Comes with body cap, 2× EN-EL15c batteries, dual charger, original box. Sensor is clean. Selling because I moved to Sony.',
    starting_price: 175000,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
    tags: ['nikon', 'camera', 'mirrorless', 'photography']
  },
  {
    sellerName: 'Kevin',
    title: 'Weber Spirit II E-310 Gas BBQ Grill',
    description: 'Three-burner gas grill in great shape. Used for two Christmases. Cleaned and serviced. Side tables intact, ignition works first time. Gas hose and regulator (Kenyan compatible) included. Perfect for a compound.',
    starting_price: 38000,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    tags: ['weber', 'bbq', 'grill', 'outdoor']
  },

  // ── Zawadi (index 2) ──
  {
    sellerName: 'Zawadi',
    title: 'L-Shaped Office Desk — Dark Walnut',
    description: 'Solid MDF desk with metal legs, 160×120cm. Perfect for a home office setup. Small scratch on the underside, invisible when set up. Disassembles easily. Pick up from South C.',
    starting_price: 18500,
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
    tags: ['desk', 'office', 'furniture', 'home']
  },
  {
    sellerName: 'Zawadi',
    title: 'Herman Miller Aeron Chair — Size B',
    description: 'The holy grail of office chairs. Bought from an expat who was leaving the country. Genuine HM — serial number verifiable. PostureFit SL lumbar support. All adjustments working perfectly.',
    starting_price: 65000,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    tags: ['herman miller', 'ergonomic', 'chair', 'office']
  },
  {
    sellerName: 'Zawadi',
    title: 'Vitamix 5200 Blender — Professional',
    description: 'The gold standard for smoothies, soups and nut butters. 2L container, all original parts. Runs perfectly. Selling because we got a Thermomix. Retails new at KSh 55k — grab a deal.',
    starting_price: 28000,
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400',
    tags: ['vitamix', 'blender', 'kitchen', 'appliance']
  },
  {
    sellerName: 'Zawadi',
    title: 'Fjällräven Kånken 17" Laptop Backpack',
    description: 'The iconic Swedish backpack in Ox Red. Fits a 17" laptop. Used for one semester at uni. Velvet laptop sleeve, all zips work perfectly. No stains or tears. Bought from Zalando for €110.',
    starting_price: 7500,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    tags: ['fjallraven', 'kanken', 'backpack', 'bag']
  },

  // ── Brian (index 3) ──
  {
    sellerName: 'Brian',
    title: 'PlayStation 5 Disc Edition + 3 Games',
    description: 'Barely used — bought it during the shortage hype, barely played it. Console in original box, DualSense controller, HDMI cable. Games included: God of War Ragnarök, Spider-Man 2, FIFA 24.',
    starting_price: 68000,
    image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400',
    tags: ['ps5', 'playstation', 'gaming', 'console']
  },
  {
    sellerName: 'Brian',
    title: 'Nike Air Jordan 1 High OG "Chicago" — UK 9',
    description: 'Authentic pair, bought from GOAT with authentication card. Worn twice indoors. Comes with original box and extra laces. No creasing, clean soles. Retails above KSh 40k — serious offers only.',
    starting_price: 35000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    tags: ['jordan', 'nike', 'sneakers', 'chicago']
  },
  {
    sellerName: 'Brian',
    title: 'Gaggia Classic Pro Espresso Machine',
    description: 'Entry-level prosumer espresso machine beloved by home baristas. Used for 8 months. Backflushed and descaled regularly. Comes with single & double baskets, tamper and portafilter. Makes excellent espresso.',
    starting_price: 32000,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    tags: ['gaggia', 'espresso', 'coffee', 'barista']
  },
  {
    sellerName: 'Brian',
    title: 'Kindle Paperwhite 11th Gen (16GB)',
    description: 'Waterproof, adjustable warm light. Read maybe 5 books on it before going back to physical books. Screen has zero scratches. Comes with USB-C cable and Amazon fabric cover worth KSh 3k.',
    starting_price: 8500,
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400',
    tags: ['kindle', 'ereader', 'amazon', 'books']
  },
  {
    sellerName: 'Brian',
    title: 'Peloton Bike+ (with shoes & mat)',
    description: 'Full setup — bike, cycling shoes (size 42), floor mat and 2 sets of weights. Subscription ended so selling everything. Barely 6 months old, immaculate condition. Buyer must be able to transport.',
    starting_price: 120000,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    tags: ['peloton', 'fitness', 'bike', 'exercise']
  },
  {
    sellerName: 'Brian',
    title: 'Montblanc Meisterstück 149 Fountain Pen',
    description: 'The classic. Nib size M (medium). Comes with original Montblanc box, converter and half a bottle of Midnight Blue ink. Bought as a gift, rarely used. A genuine collector\'s piece.',
    starting_price: 42000,
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400',
    tags: ['montblanc', 'fountain pen', 'luxury', 'writing']
  },
  {
    sellerName: 'Brian',
    title: 'Lego Technic Bugatti Chiron (42083)',
    description: 'Fully built and displayed (never played with). All 3,599 pieces present — cross-checked twice. Comes with original boxes (kept). Rare retired set. A stunning shelf piece for any Lego collector.',
    starting_price: 22000,
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400',
    tags: ['lego', 'technic', 'bugatti', 'collectible']
  }
];

// Create users mapping
const users = [
  { id: 'user_amara', name: 'Amara' },
  { id: 'user_kevin', name: 'Kevin' },
  { id: 'user_zawadi', name: 'Zawadi' },
  { id: 'user_brian', name: 'Brian' }
];

// Transform items to backend format
const transformedItems = itemsData.map((item, index) => {
  // Find seller ID
  const seller = users.find(u => u.name === item.sellerName);
  const sellerId = seller ? seller.id : `user_${index}`;
  
  return {
    id: uuidv4(),
    name: item.title,
    description: item.description,
    price: item.starting_price,
    image: item.image,
    sellerId: sellerId,
    sellerName: item.sellerName,
    status: 'active',
    highestOffer: null,
    highestOfferBuyer: null,
    createdAt: new Date().toISOString()
  };
});

// Write to items.json
const itemsPath = join(process.cwd(), 'server', 'data', 'items.json');
writeFileSync(itemsPath, JSON.stringify(transformedItems, null, 2));
console.log(`✅ Added ${transformedItems.length} items to ${itemsPath}`);

// Also update users.json with passwords
const usersPath = join(process.cwd(), 'server', 'data', 'users.json');
const usersWithPasswords = users.map(user => ({
  ...user,
  password: 'password123', // Simple password for testing
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
}));
writeFileSync(usersPath, JSON.stringify(usersWithPasswords, null, 2));
console.log(`✅ Updated users in ${usersPath}`);