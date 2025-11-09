"use client";

import { FC } from "react";

type Column = { key: string; label: string };

interface AdminTableProps {
  columns: Column[];
  data: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export const AdminTable: FC<AdminTableProps> = ({ columns, data, onEdit, onDelete }) => {
  return (
    <table className="min-w-full bg-white shadow rounded">
      <thead className="bg-gray-200">
        <tr>
          {columns.map(col => (
            <th key={col.key} className="px-4 py-2 text-left">{col.label}</th>
          ))}
          <th className="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.id} className="border-t hover:bg-gray-50">
            {columns.map(col => (
              <td key={col.key} className="px-4 py-2">{item[col.key]}</td>
            ))}
            <td className="px-4 py-2 space-x-2">
              <button
                onClick={() => onEdit(item)}
                className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(item)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
