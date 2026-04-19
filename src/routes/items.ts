// routes/items.js - Add the new route
import { Router } from 'express';
import { 
  getAllItems, 
  getItem, 
  createItem, 
  updateItem, 
  deleteItem,
  checkoutItem,
  confirmSale, 
  getSellerItems,
  getSellerStats,
  getItemChatDetails  // Add this
} from '../controllers/itemsController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getAllItems);
router.get('/:id', getItem);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.post('/:id/checkout', checkoutItem);
router.post('/:id/confirm-sale', confirmSale);
router.get('/seller/:sellerId/stats', authenticateToken, getSellerStats);
router.get('/seller/:sellerId/items', authenticateToken, getSellerItems);
router.get('/:itemId/chat-details', authenticateToken, getItemChatDetails);  // Add this

export default router;