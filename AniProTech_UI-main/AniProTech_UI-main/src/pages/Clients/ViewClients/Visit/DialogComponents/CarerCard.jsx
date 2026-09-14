import PropTypes from 'prop-types';
import { MoreHorizontal, Calendar, Phone, Clock, Info } from 'lucide-react';

const SelectedCarerCard = ({ carers, onMoreOptions }) => {
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  console.log("carers",carers)

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'out of hours':
        return 'bg-gray-100 text-gray-700';
      case 'busy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!carers?.length) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Other assigned carers</h3>

      <div className="space-y-4">
        {carers.map((carer, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 bg-white"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {getInitials(carer.firstName, carer.lastName)}
                  </span>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">
                    {carer.firstName} {carer.lastName}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => onMoreOptions(carer)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <MoreHorizontal size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                <span>{carer.visitsCount || 0} visits in the last 90 days</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} className="text-gray-400" />
                <span>{carer.phoneNumber || 'No phone number'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(carer.status)}`}>
                  {carer.status || 'Available'}
                </span>
              </div>

              {carer.introduction && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Info size={16} className="text-gray-400" />
                  <span>Introduction</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

SelectedCarerCard.propTypes = {
  carers: PropTypes.arrayOf(
    PropTypes.shape({
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      phoneNumber: PropTypes.string,
      visitsCount: PropTypes.number,
      status: PropTypes.string,
      introduction: PropTypes.string,
    })
  ).isRequired,
  onMoreOptions: PropTypes.func,
};

SelectedCarerCard.defaultProps = {
  onMoreOptions: () => {},
};

export default SelectedCarerCard;
