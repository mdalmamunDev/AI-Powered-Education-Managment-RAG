import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllBookLoans,
  getBookLoanById,
  createBookLoan,
  updateBookLoan,
  deleteBookLoan,
} from './book-loan.controller';

const router = express.Router();

router.use(auth());
router.get('/', getAllBookLoans);
router.get('/:id', getBookLoanById);
router.post('/', createBookLoan);
router.put('/:id', updateBookLoan);
router.delete('/:id', deleteBookLoan);

export const BookLoanRoutes = router;
