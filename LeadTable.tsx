import React from 'react';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { Lead, UserRole } from '../../types';
import { Badge, Button } from '../ui';

interface LeadTableProps {
  leads: Lead[];
  role: UserRole;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  role,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-100">
        <thead>
          <tr className="bg-gray-50">
            {['Name', 'Email', 'Status', 'Source', 'Created At', 'Actions'].map((h) => (
              <th
                key={h}
                className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {leads.map((lead) => (
            <tr key={lead._id} className="hover:bg-gray-50/60 transition-colors">
              <td className="px-5 py-4">
                <span className="font-medium text-gray-900">{lead.name}</span>
              </td>
              <td className="px-5 py-4 text-sm text-gray-600">{lead.email}</td>
              <td className="px-5 py-4">
                <Badge type="status" value={lead.status} />
              </td>
              <td className="px-5 py-4">
                <Badge type="source" value={lead.source} />
              </td>
              <td className="px-5 py-4 text-sm text-gray-500">
                {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Eye className="w-4 h-4" />}
                    onClick={() => onView(lead)}
                    title="View"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Pencil className="w-4 h-4" />}
                    onClick={() => onEdit(lead)}
                    title="Edit"
                  />
                  {role === 'admin' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="w-4 h-4 text-red-500" />}
                      onClick={() => onDelete(lead)}
                      title="Delete"
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
