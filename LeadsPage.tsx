import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { FiltersBar } from '../../components/leads/FiltersBar';
import { LeadTable } from '../../components/leads/LeadTable';
import { LeadForm } from '../../components/leads/LeadForm';
import { Pagination } from '../../components/leads/Pagination';
import { Button, Modal, Spinner, EmptyState, Badge } from '../../components/ui';
import { Lead, LeadFilters, LeadFormData } from '../../types';
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead } from '../../hooks/useLeads';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuthStore } from '../../store/authStore';
import { leadsApi } from '../../api';
import toast from 'react-hot-toast';

export const LeadsPage: React.FC = () => {
  const { user } = useAuthStore();

  // ─── Filters state ───────────────────────────────────────────────────────
  const [rawFilters, setRawFilters] = useState<LeadFilters>({
    status: '',
    source: '',
    search: '',
    sort: 'latest',
    page: 1,
    limit: 10,
  });

  const debouncedSearch = useDebounce(rawFilters.search, 400);

  const activeFilters: LeadFilters = {
    ...rawFilters,
    search: debouncedSearch,
  };

  const updateFilters = useCallback((partial: Partial<LeadFilters>) => {
    setRawFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  // ─── Data ────────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useLeads(activeFilters);
  const leads: Lead[] = data?.data || [];
  const meta = data?.meta;

  // ─── Mutations ───────────────────────────────────────────────────────────
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const deleteMutation = useDeleteLead();

  // ─── Modal state ─────────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const handleCreate = async (data: LeadFormData) => {
    await createMutation.mutateAsync(data);
    setCreateOpen(false);
  };

  const handleUpdate = async (data: LeadFormData) => {
    if (!editLead) return;
    await updateMutation.mutateAsync({ id: editLead._id, data });
    setEditLead(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget._id);
    setDeleteTarget(null);
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await leadsApi.exportCSV({
        status: activeFilters.status,
        source: activeFilters.source,
        search: activeFilters.search,
      });
    } catch {
      toast.error('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          {meta && (
            <p className="text-sm text-gray-500 mt-0.5">{meta.total} leads total</p>
          )}
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
          Add Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <FiltersBar
          filters={rawFilters}
          onFilterChange={updateFilters}
          onExport={handleExport}
          exportLoading={exportLoading}
          isAdmin={user?.role === 'admin'}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <Spinner className="py-20" />
      ) : isError ? (
        <EmptyState
          title="Something went wrong"
          description="Failed to load leads. Please try again."
        />
      ) : leads.length === 0 ? (
        <EmptyState
          title="No leads found"
          description="Try adjusting your filters or add a new lead."
          action={
            <Button onClick={() => setCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Add Lead
            </Button>
          }
        />
      ) : (
        <>
          <LeadTable
            leads={leads}
            role={user?.role || 'sales'}
            onView={setViewLead}
            onEdit={setEditLead}
            onDelete={setDeleteTarget}
          />
          {meta && (
            <Pagination meta={meta} onPageChange={(page) => updateFilters({ page })} />
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add New Lead">
        <LeadForm onSubmit={handleCreate} loading={createMutation.isPending} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editLead} onClose={() => setEditLead(null)} title="Edit Lead">
        {editLead && (
          <LeadForm
            initial={editLead}
            onSubmit={handleUpdate}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!viewLead} onClose={() => setViewLead(null)} title="Lead Details">
        {viewLead && (
          <div className="space-y-4 text-sm">
            {[
              { label: 'Name', value: viewLead.name },
              { label: 'Email', value: viewLead.email },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-gray-500 mb-0.5">{label}</p>
                <p className="font-medium text-gray-900">{value}</p>
              </div>
            ))}
            <div className="flex gap-6">
              <div>
                <p className="text-gray-500 mb-1">Status</p>
                <Badge type="status" value={viewLead.status} />
              </div>
              <div>
                <p className="text-gray-500 mb-1">Source</p>
                <Badge type="source" value={viewLead.source} />
              </div>
            </div>
            {viewLead.notes && (
              <div>
                <p className="text-gray-500 mb-0.5">Notes</p>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{viewLead.notes}</p>
              </div>
            )}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-gray-500 text-xs">
                Created by{' '}
                <span className="font-medium text-gray-700">{viewLead.createdBy?.name}</span>
                {' · '}
                {new Date(viewLead.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Lead">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900">{deleteTarget?.name}</span>? This
            action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
