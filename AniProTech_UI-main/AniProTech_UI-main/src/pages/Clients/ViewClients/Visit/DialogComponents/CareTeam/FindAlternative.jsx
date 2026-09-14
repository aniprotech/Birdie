import PropTypes from 'prop-types';
import { useState } from 'react';
import { ChevronDown, Search, Users } from 'lucide-react';
import DataTable from 'react-data-table-component';
import { customStyles } from '../../../../../../data/clients/clientVisitConstantData';

const caregiverColumns = [
  {
    name: 'Caregiver',
    selector: row => row.name,
    sortable: true,
  },
  {
    name: 'Availability',
    selector: row => row.availability,
    sortable: true,
    cell: row => (
      <span className="rounded-full bg-[#E0E5EB] px-3 py-1 text-xs text-[#3A4C66]">
        {row.availability}
      </span>
    ),
  },
  {
    name: 'Continuity',
    selector: row => row.continuity,
    sortable: true,
    cell: row => <span className="text-[#3A4C66]">{row.continuity}</span>,
  },
  {
    name: 'Group',
    selector: row => row.group,
    sortable: true,
    cell: row => (
      <span className="rounded-md bg-[#FFEDEC] px-2 py-1 text-xs text-[#A50D01]">
        {row.group}
      </span>
    ),
  },
];

const caregiverData = [
  { id: 1, name: 'Bhaskar Reddy', availability: 'Out of hours', continuity: '0%', group: 'Ungrouped' },
  { id: 2, name: 'Birdie Team', availability: 'Out of hours', continuity: '0%', group: 'Ungrouped' },
  { id: 3, name: 'Harika Maddi', availability: 'Out of hours', continuity: '0%', group: 'Ungrouped' },
  { id: 4, name: 'Kiran Kumar Reddy Pallela', availability: 'Out of hours', continuity: '0%', group: 'Ungrouped' },
  { id: 5, name: 'Sat (to add/ edit)', availability: 'Out of hours', continuity: '0%', group: 'Ungrouped' },
  { id: 6, name: 'Sindhu Akula', availability: 'Out of hours', continuity: '0%', group: 'Ungrouped' },
  { id: 7, name: 'Swarnalatha Kontham', availability: 'Out of hours', continuity: '0%', group: 'Ungrouped' },
  { id: 8, name: 'Kiran B', availability: 'Out of hours', continuity: '0%', group: 'Ungrouped' },
];

const FindAlternative = ({ onClose, clientName, date, time, requiredCarers,setSelectedCarer}) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [search, setSearch] = useState('');

  const handleAllocate = () => {
    if (!selectedRow) {
      alert("Please select a caregiver.");
    } else {
      setSelectedCarer((prev) => [...prev, selectedRow]);
      onClose();
    }
  };

  const conditionalRowStyles = [
    {
      when: row => selectedRow?.id === row.id,
      style: {
        backgroundColor: '#EBFFFB',
        borderLeft: '4px solid #007672',
        fontWeight: 500,
        transition: 'all 0.2s ease-in-out',
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-6xl max-h-[90vh] bg-white rounded shadow-lg flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg poppins-medium text-[#1D2939]">Allocate carer</h2>
          <div className="flex gap-4 text-sm text-[#667085]">
            <div className="flex items-center gap-1"><Users size={16} /> {clientName}</div>
            <div>{date}</div>
            <div>{time}</div>
            <div className="flex items-center gap-1"><Users size={16} /> {requiredCarers} required</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center px-6 py-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded border border-gray-300 pl-9 pr-3 py-2 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="border border-gray-300 rounded px-3 py-2 flex items-center gap-2 text-sm">
            All groups <ChevronDown size={16} />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto px-6">
          <DataTable
            columns={caregiverColumns}
            data={caregiverData.filter(row => row.name.toLowerCase().includes(search.toLowerCase()))}
            customStyles={customStyles}
            highlightOnHover
            pointerOnHover
            onRowClicked={(row) => setSelectedRow(row)}
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5,10]}
            conditionalRowStyles={conditionalRowStyles}
          />
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-4">
          <button onClick={onClose} className="text-[#007C89] hover:underline">Cancel</button>
          <button
            onClick={handleAllocate}
            className="bg-[#007C89] hover:bg-[#006e7b] text-white px-4 py-2 rounded"
          >
            Allocate carer
          </button>
        </div>
      </div>
    </div>
  );
};

FindAlternative.propTypes = {
  onClose: PropTypes.func.isRequired,
  clientName: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  requiredCarers: PropTypes.number.isRequired,
  onSelectCarer: PropTypes.func.isRequired,
};

export default FindAlternative;
