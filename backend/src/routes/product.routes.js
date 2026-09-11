import { Router } from 'express';
import { listPublicProducts } from '../controllers/product.controller.js';

export const productRouter = Router();
productRouter.get('/', listPublicProducts);
