import { Response } from 'express';
import { FilterQuery } from 'mongoose';
import { Parser } from 'json2csv';
import { Lead, ILeadDocument } from '../models/Lead';
import { AuthRequest, LeadFilters, LeadStatus, LeadSource } from '../types';
import { sendSuccess, sendError } from '../utils/response';

const buildLeadQuery = (filters: LeadFilters): FilterQuery<ILeadDocument> => {
  const query: FilterQuery<ILeadDocument> = {};

  if (filters.status) query.status = filters.status;
  if (filters.source) query.source = filters.source;

  if (filters.search) {
    const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    query.$or = [{ name: regex }, { email: regex }];
  }

  return query;
};

export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      status,
      source,
      search,
      sort = 'latest',
      page = 1,
      limit = 10,
    } = req.query as unknown as LeadFilters;

    const filters: LeadFilters = {
      status: status as LeadStatus | undefined,
      source: source as LeadSource | undefined,
      search: search as string | undefined,
      sort,
      page: Number(page),
      limit: Number(limit),
    };

    // Sales users only see their own leads
    const baseQuery = buildLeadQuery(filters);
    if (req.user?.role === 'sales') {
      baseQuery.createdBy = req.user.userId;
    }

    const sortOrder = filters.sort === 'oldest' ? 1 : -1;
    const skip = (filters.page! - 1) * filters.limit!;

    const [leads, total] = await Promise.all([
      Lead.find(baseQuery)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(filters.limit!),
      Lead.countDocuments(baseQuery),
    ]);

    const totalPages = Math.ceil(total / filters.limit!);

    sendSuccess(res, 200, 'Leads fetched successfully', leads, {
      total,
      page: filters.page!,
      limit: filters.limit!,
      totalPages,
      hasNextPage: filters.page! < totalPages,
      hasPrevPage: filters.page! > 1,
    });
  } catch (error) {
    sendError(res, 500, 'Failed to fetch leads', error);
  }
};

export const getLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!lead) {
      sendError(res, 404, 'Lead not found');
      return;
    }

    // Sales users can only view their own leads
    if (
      req.user?.role === 'sales' &&
      lead.createdBy._id.toString() !== req.user.userId
    ) {
      sendError(res, 403, 'Access denied');
      return;
    }

    sendSuccess(res, 200, 'Lead fetched', lead);
  } catch (error) {
    sendError(res, 500, 'Failed to fetch lead', error);
  }
};

export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.create({
      ...req.body,
      createdBy: req.user?.userId,
    });

    sendSuccess(res, 201, 'Lead created successfully', lead);
  } catch (error) {
    sendError(res, 500, 'Failed to create lead', error);
  }
};

export const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      sendError(res, 404, 'Lead not found');
      return;
    }

    // Sales users can only update their own leads
    if (
      req.user?.role === 'sales' &&
      lead.createdBy.toString() !== req.user.userId
    ) {
      sendError(res, 403, 'Access denied');
      return;
    }

    const updated = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    sendSuccess(res, 200, 'Lead updated successfully', updated);
  } catch (error) {
    sendError(res, 500, 'Failed to update lead', error);
  }
};

export const deleteLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      sendError(res, 404, 'Lead not found');
      return;
    }

    // Only admins or the creator can delete
    if (
      req.user?.role === 'sales' &&
      lead.createdBy.toString() !== req.user.userId
    ) {
      sendError(res, 403, 'Access denied');
      return;
    }

    await lead.deleteOne();
    sendSuccess(res, 200, 'Lead deleted successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to delete lead', error);
  }
};

export const exportLeadsCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, source, search } = req.query as Partial<LeadFilters>;
    const baseQuery = buildLeadQuery({ status, source, search });

    if (req.user?.role === 'sales') {
      baseQuery.createdBy = req.user.userId;
    }

    const leads = await Lead.find(baseQuery)
      .populate<{ createdBy: { name: string; email: string } }>('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const fields = [
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Status', value: 'status' },
      { label: 'Source', value: 'source' },
      { label: 'Notes', value: 'notes' },
      { label: 'Created By', value: (row: Record<string, unknown>) => {
        const creator = row.createdBy as { name?: string } | undefined;
        return creator?.name ?? '';
      }},
      { label: 'Created At', value: (row: Record<string, unknown>) =>
        new Date(row.createdAt as string).toLocaleDateString() },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(leads as Record<string, unknown>[]);

    res.header('Content-Type', 'text/csv');
    res.attachment('leads-export.csv');
    res.send(csv);
  } catch (error) {
    sendError(res, 500, 'Failed to export leads', error);
  }
};
