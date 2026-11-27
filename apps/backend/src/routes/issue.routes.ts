import {Router} from 'express';
import{getIssueHandler, getIssueByIdHandler} from '../controllers/issue.controller';

const router = Router();

router.get("/", getIssueHandler);
router.get("/:id", getIssueByIdHandler);

export default router;