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
  getSellerStats
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

export default router;