import PropTypes from 'prop-types';
import { Users } from 'lucide-react';

const NoCarerAssigned = ({ onFindAlternative, onAllocateAnotherCarer }) => {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-customBlack1 text-lg poppins-medium">Assigned</h2>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm text-white bg-customBgDarkGrey rounded-lg px-2 py-1">
            <Users size={16} />
            <span>1 required</span>
          </span>
          <button 
            onClick={onFindAlternative}
            className="text-sm text-customTextLightNavy poppins-medium hover:text-customTextLightNavy/80 border border-customTextLightNavy rounded-lg px-4 py-1.5"
          >
            Find alternative
          </button>
        </div>
      </div>

      {/* Alert Box */}
      <div className="border border-customEventCardBorder rounded-lg p-4 bg-customEventNotStartedCardBg mb-4">
        <div className="flex items-start gap-3">
          <div className="text-customEventCardBorder">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12.5 7.5L7.5 12.5M7.5 7.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm text-customEventCardBorder poppins-medium mb-1">Carer required for this visit</h3>
            <p className="text-sm text-customEventCardBorder">Assign someone to make sure the visit can still go ahead.</p>
          </div>
        </div>
      </div>

      {/* Allocate Button */}
      <button
        onClick={onAllocateAnotherCarer}
        className="flex items-center gap-2 text-sm mt-5 text-customTextLightNavy poppins-medium hover:text-customTextLightNavy/80"
      >
        <span className="text-xl">+</span>
        <span>Allocate another type of carer</span>
      </button>
    </div>
  );
};

NoCarerAssigned.propTypes = {
  onFindAlternative: PropTypes.func.isRequired,
  onAllocateAnotherCarer: PropTypes.func.isRequired,
};

export default NoCarerAssigned; 