import express from 'express';
import auth from '../../../middlewares/auth';
import { getAllModules, getModuleById, updateModule } from './module.controller';

const router = express.Router();

router.use(auth());
router.get('/', getAllModules);
router.get('/:id', getModuleById);
router.put('/:id', updateModule);

export const ModuleRoutes = router;
