import { Router } from 'express';
import { authorize, authenticate } from '../middleware/auth.js';
import { ROLES } from '../constants/roles.js';
import * as sales from '../controllers/admin-sales.controller.js';

export const adminSalesRouter = Router();
adminSalesRouter.use(authenticate, authorize(ROLES.ADMIN));
adminSalesRouter.get('/analytics', sales.salesAnalytics);
adminSalesRouter.get('/', sales.listSales);
adminSalesRouter.get('/notifications', sales.listNotifications);
adminSalesRouter.patch('/notifications/:id/read', sales.markNotificationRead);
adminSalesRouter.patch('/:id/status', sales.updateSaleStatus);
adminSalesRouter.get('/:id', sales.saleDetail);
