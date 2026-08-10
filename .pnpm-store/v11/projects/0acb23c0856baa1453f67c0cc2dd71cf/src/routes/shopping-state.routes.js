import { Router } from 'express';
import * as state from '../controllers/shopping-state.controller.js';
import { authenticate } from '../middleware/auth.js';

export const shoppingStateRouter = Router();
shoppingStateRouter.use(authenticate);
shoppingStateRouter.get('/', state.getShoppingState);
shoppingStateRouter.put('/:key', state.updateShoppingState);