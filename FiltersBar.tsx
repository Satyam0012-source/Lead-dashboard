import React from 'react';
import { Search, SlidersHorizontal, Download } from 'lucide-react';
import { LeadFilters, LeadSource, LeadStatus, SortOrder } from '../../types';
import { Input, Select, Button } from '../ui';

interface FiltersBarProps {
  filters: LeadFilters;
  onFilterChange: (filters: Partial<LeadFilters>) => void;
  onExport: () => void;
  exportLoading?: boolean;
  isAdmin?: boolean;
}

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'New', value: 'New' },
  { label: 'Contacted', value: 'Contacted' },
  { label: 'Qualified', value: 'Qualified' },
  { label: 'Lost', value: 'Lost' },
];

const SOURCE_OPTIONS = [
  { label: 'All Sources', value: '' },
  { label: 'Website', value: 'Website' },
  { label: 'Instagram', value: 'Instagram' },
  { label: 'Referral', value: 'Referral' },
];

const SORT_OPTIONS = [
  { label: 'Latest First', value: 'latest' },
  { label: 'Oldest First', value: 'oldest' },
];

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  onFilterChange,
  onExport,
  exportLoading,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by name or email..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Status */}
        <div className="w-40">
          <Select
            value={filters.status || ''}
            onChange={(e) =>
              onFilterChange({ status: e.target.value as LeadStatus | '', page: 1 })
            }
            options={STATUS_OPTIONS}
          />
        </div>

        {/* Source */}
        <div className="w-40">
          <Select
            value={filters.source || ''}
            onChange={(e) =>
              onFilterChange({ source: e.target.value as LeadSource | '', page: 1 })
            }
            options={SOURCE_OPTIONS}
          />
        </div>

        {/* Sort */}
        <div className="w-36">
          <Select
            value={filters.sort || 'latest'}
            onChange={(e) => onFilterChange({ sort: e.target.value as SortOrder })}
            options={SORT_OPTIONS}
          />
        </div>

        <div className="flex gap-2 ml-auto">
          {/* Reset */}
          <Button
            variant="ghost"
            size="sm"
            icon={<SlidersHorizontal className="w-4 h-4" />}
            onClick={() =>
              onFilterChange({ status: '', source: '', search: '', sort: 'latest', page: 1 })
            }
          >
            Reset
          </Button>

          {/* Export CSV */}
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={onExport}
            loading={exportLoading}
          >
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
};
