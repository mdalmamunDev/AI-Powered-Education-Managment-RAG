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

router.use(auth());
router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.post('/', createPayment);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

export const PaymentRoutes = router;
