import express from 'express';
import { addFile, getAllFiles, getFileById } from '../controller/file.controller.js';
import { upload } from '../middleware/file.middleware.js';
import { isTeacher, protectRoute } from '../middleware/auth.middleware.js';
import  {getContentQuiz, getContentSummary} from "../controller/ai.controller.js";

const router = express.Router();

router.post('/addfile', protectRoute, isTeacher, upload.single('file'), addFile);
router.get('/', getAllFiles);
router.get('/:id', getFileById);
router.get("/:id/summary",getContentSummary)
router.get("/:id/quiz",getContentQuiz)
export default router;
