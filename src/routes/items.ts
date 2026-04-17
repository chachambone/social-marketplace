import { Router } from 'express';
import { 
  getAllItems, 
  getItem, 
  createItem, 
  updateItem, 
  deleteItem,
  checkoutItem,
  confirmSale 
} from '../controllers/itemsController.js';

const router = Router();

router.get('/', getAllItems);
router.get('/:id', getItem);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.post('/:id/checkout', checkoutItem);
router.post('/:id/confirm-sale', confirmSale);

export default router;