import express from 'express';
import auth from '../../middlewares/auth';
import { ask } from './assistant.controller';


const router = express.Router();

router.post('/ask', auth(), ask);

export const AssistantRoutes = router;
