import { Router, Request, Response } from 'express';

const router = Router();

// In-memory storage for messages
const messages: any[] = [];

// Get messages for an item (polling endpoint)
router.get('/item/:itemId/poll/:timestamp', (req: Request, res: Response) => {
  try {
    const itemId = req.params.itemId;
    const timestampParam = req.params.timestamp;
    
    // Ensure timestamp is a string
    const timestampStr = Array.isArray(timestampParam) ? timestampParam[0] : timestampParam;
    const since = new Date(timestampStr);
    
    // Check if timestamp is valid
    if (isNaN(since.getTime())) {
      return res.json({
        messages: [],
        lastTimestamp: timestampStr,
        hasNew: false,
        pollAgainAfter: 2000
      });
    }
    
    const newMessages = messages.filter((msg: any) => 
      msg.itemId === itemId && new Date(msg.timestamp) > since
    );
    
    res.json({
      messages: newMessages,
      lastTimestamp: newMessages.length > 0 ? newMessages[newMessages.length - 1].timestamp : timestampStr,
      hasNew: newMessages.length > 0,
      pollAgainAfter: 2000
    });
  } catch (error) {
    console.error('Error in polling:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get unread message count
router.get('/unread/:userId', (req: Request, res: Response) => {
  res.json({ total: 0, byItem: {} });
});

// Mark messages as read
router.post('/read', (req: Request, res: Response) => {
  res.json({ success: true });
});

// Delete a message
router.delete('/:id', (req: Request, res: Response) => {
  res.status(204).send();
});

export default router;