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

router.get('/', auth('book-loan.read'), getAllBookLoans);
router.get('/:id', auth('book-loan.read'), getBookLoanById);
router.post('/', auth('book-loan.create'), createBookLoan);
router.put('/:id', auth('book-loan.update'), updateBookLoan);
router.delete('/:id', auth('book-loan.delete'), deleteBookLoan);

export const BookLoanRoutes = router;
