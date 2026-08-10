import { Router } from 'express';
import * as accountController from '../controllers/account.controller.js';
import { authenticate } from '../middleware/auth.js';

export const accountRouter = Router();
accountRouter.use(authenticate);
accountRouter.put('/profile', accountController.profile);
accountRouter.get('/addresses', accountController.listAddresses);
accountRouter.post('/addresses', accountController.createAddress);
accountRouter.put('/addresses/:id', accountController.updateAddress);
accountRouter.delete('/addresses/:id', accountController.deleteAddress);