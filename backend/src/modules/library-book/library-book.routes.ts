import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllLibraryBooks,
  getLibraryBookById,
  createLibraryBook,
  updateLibraryBook,
  deleteLibraryBook,
} from './library-book.controller';

const router = express.Router();

router.get('/', auth('library-book.read'), getAllLibraryBooks);
router.get('/:id', auth('library-book.read'), getLibraryBookById);
router.post('/', auth('library-book.create'), createLibraryBook);
router.put('/:id', auth('library-book.update'), updateLibraryBook);
router.delete('/:id', auth('library-book.delete'), deleteLibraryBook);

export const LibraryBookRoutes = router;
