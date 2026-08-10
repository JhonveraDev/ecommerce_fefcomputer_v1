import { Router } from 'express';
import * as orders from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.js';
export const orderRouter = Router();
orderRouter.use(authenticate);
orderRouter.get('/', orders.listOrders);
orderRouter.get('/:id', orders.orderDetail);