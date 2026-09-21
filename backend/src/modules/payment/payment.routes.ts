import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from './payment.controller';

const router = express.Router();

router.get('/', auth('payment.read'), getAllPayments);
router.get('/:id', auth('payment.read'), getPaymentById);
router.post('/', auth('payment.create'), createPayment);
router.put('/:id', auth('payment.update'), updatePayment);
router.delete('/:id', auth('payment.delete'), deletePayment);

export const PaymentRoutes = router;
