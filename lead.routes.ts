import { Router } from 'express';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCSV,
} from '../controllers/lead.controller';
import { authenticate, authorize } from '../middleware/auth';
import { leadValidation, leadQueryValidation } from '../validators';

const router = Router();

// All lead routes require authentication
router.use(authenticate);

router.get('/', leadQueryValidation, getLeads);
router.get('/export', exportLeadsCSV);                          // Admin + sales (filtered)
router.get('/:id', getLead);
router.post('/', leadValidation, createLead);
router.put('/:id', leadValidation, updateLead);
router.delete('/:id', authorize('admin'), deleteLead);         // Admin only delete

export default router;
