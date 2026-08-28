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

router.use(auth());
router.get('/', getAllLibraryBooks);
router.get('/:id', getLibraryBookById);
router.post('/', createLibraryBook);
router.put('/:id', updateLibraryBook);
router.delete('/:id', deleteLibraryBook);

export const LibraryBookRoutes = router;
