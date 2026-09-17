import { Router } from 'express';
import * as payments from '../controllers/payment.controller.js';

export const paymentRouter = Router();
paymentRouter.post('/wompi/checkout', payments.createWompiCheckout);
paymentRouter.post('/wompi/webhook', payments.receiveWompiEvent);
