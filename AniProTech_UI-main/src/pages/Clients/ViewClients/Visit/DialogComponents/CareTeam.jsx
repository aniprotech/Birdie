import PropTypes from 'prop-types';
import { useState } from 'react';
import NoCarerAssigned from './CareTeam/NoCarerAssigned';
import AddCarerModal from './CareTeam/AddCarerModal';
import FindAlternative from './CareTeam/FindAlternative';
import SelectedCarerCard from './CarerCard';

const CareTeam = ({ careTeam, clientName }) => {
  const [showAddCarer, setShowAddCarer] = useState(false);
  const [showFindAlternative, setShowFindAlternative] = useState(false);
  const [selectedCarer, setSelectedCarer] = useState([]);

  console.log("selectedCarer",selectedCarer)

  const handleMoreOptions = () => {
    // Handle more options menu for the selected carer
    console.log('More options clicked for carer:', selectedCarer);
  };

  // If no care team assigned, show the NoCarerAssigned component
  if (!careTeam?.length) {
    return (
      <>
        <NoCarerAssigned 
          onFindAlternative={() => setShowFindAlternative(true)}
          onAllocateAnotherCarer={() => setShowAddCarer(true)}
        />

        {/* Add Carer Modal */}
        {showAddCarer && (
          <AddCarerModal 
            onCancel={() => setShowAddCarer(false)}
            setSelectedCarer={setSelectedCarer}
            onAssign={() => {
              // Handle assign logic here
              setShowAddCarer(false);
            }}
          />
        )}

        {/* Find Alternative View */}
        {showFindAlternative && (
          <FindAlternative 
            onClose={() => setShowFindAlternative(false)}
            clientName={clientName}
            date={new Date().toLocaleDateString()}
            time="09:00 - 09:30"
            requiredCarers={1}
            setSelectedCarer={setSelectedCarer}
          />
        )}

        {/* Show Selected Carer Card when a carer is selected */}
        {selectedCarer.length > 0 && (
          <div className="p-5">
            <SelectedCarerCard
              carers={selectedCarer}
              onMoreOptions={handleMoreOptions}
            />
          </div>
        )}
      </>
    );
  }

  // If care team is assigned, show the team members list
  return (
    <div className="p-5">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-customBlack1 mb-4">Care team</h2>
        <div className="space-y-3">
          {careTeam.map((member, index) => (
            <div key={index} className="flex items-center gap-2 text-customBlack1">
              <span className="material-icons text-gray-400 text-lg">person</span>
              <span>{member.firstName} {member.lastName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

CareTeam.propTypes = {
  careTeam: PropTypes.arrayOf(
    PropTypes.shape({
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
    })
  ),
  clientName: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
  }),
};

export default CareTeam;