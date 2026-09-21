import express from 'express';
import auth from '../../../middlewares/auth';
import { getAllModules, getModuleById, updateModule } from './module.controller';

const router = express.Router();

router.get('/', auth('module.read'), getAllModules);
router.get('/:id', auth('module.read'), getModuleById);
router.put('/:id', auth('module.update'), updateModule);

export const ModuleRoutes = router;
