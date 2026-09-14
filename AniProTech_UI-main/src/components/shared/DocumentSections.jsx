import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const sections = [
  { id: 'client-information', label: 'Client information', path: 'information' },
  { id: 'needs-assessments', label: 'Needs assessments', path: 'needs-assessments' },
  { id: 'additional-assessments', label: 'Additional assessments', path: 'additional-assessments' },
  { id: 'auditing-documents', label: 'Auditing documents', path: 'auditing-documents' },
  { id: 'care-plan', label: 'Care plan', path: 'care-plan' },
  { id: 'task-planner', label: 'Task planner', path: 'task-planner' },
];

const DocumentSections = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="w-64 space-y-2">
      {sections.map((section) => (
        <Link
          key={section.id}
          to={section.path}
          className={`block w-full rounded-md px-4 py-2 text-[15px] transition-colors ${
            currentPath.includes(section.path)
              ? 'text-[#285bc7] font-medium'
              : 'text-[#666] hover:bg-gray-50'
          }`}
        >
          {section.label}
        </Link>
      ))}
    </nav>
  );
};

export default DocumentSections; 