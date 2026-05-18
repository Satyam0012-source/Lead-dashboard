import React, { useState } from 'react';
import { Lead, LeadFormData, LeadSource, LeadStatus } from '../../types';
import { Button, Input, Select } from '../ui';

interface LeadFormProps {
  initial?: Lead;
  onSubmit: (data: LeadFormData) => Promise<void>;
  loading?: boolean;
}

const STATUS_OPTIONS = [
  { label: 'New', value: 'New' },
  { label: 'Contacted', value: 'Contacted' },
  { label: 'Qualified', value: 'Qualified' },
  { label: 'Lost', value: 'Lost' },
];

const SOURCE_OPTIONS = [
  { label: 'Website', value: 'Website' },
  { label: 'Instagram', value: 'Instagram' },
  { label: 'Referral', value: 'Referral' },
];

interface FormErrors {
  name?: string;
  email?: string;
  source?: string;
}

export const LeadForm: React.FC<LeadFormProps> = ({ initial, onSubmit, loading }) => {
  const [form, setForm] = useState<LeadFormData>({
    name: initial?.name || '',
    email: initial?.email || '',
    status: initial?.status || 'New',
    source: initial?.source || 'Website',
    notes: initial?.notes || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email address';
    if (!form.source) e.source = 'Source is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: keyof LeadFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Full Name *"
        value={form.name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder="e.g. Rahul Sharma"
        error={errors.name}
      />
      <Input
        label="Email Address *"
        type="email"
        value={form.email}
        onChange={(e) => handleChange('email', e.target.value)}
        placeholder="rahul@example.com"
        error={errors.email}
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Status"
          value={form.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={STATUS_OPTIONS}
        />
        <Select
          label="Source *"
          value={form.source}
          onChange={(e) => handleChange('source', e.target.value)}
          options={SOURCE_OPTIONS}
          error={errors.source}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          placeholder="Add any additional notes..."
          maxLength={1000}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
        />
        <p className="text-xs text-gray-400 text-right">{form.notes?.length ?? 0}/1000</p>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {initial ? 'Update Lead' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
};
