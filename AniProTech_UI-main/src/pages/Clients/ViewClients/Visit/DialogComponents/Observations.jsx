import PropTypes from 'prop-types';

const Observations = ({ observations }) => {
  return (
    <div className="p-5">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Observations</h2>
        <div className="space-y-3">
          {observations.length > 0 ? (
            observations.map((observation, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900">
                    {observation.type}
                  </div>
                  <div className="text-xs text-gray-500">
                    {observation.time}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {observation.value}
                  {observation.unit && (
                    <span className="text-gray-500 ml-1">{observation.unit}</span>
                  )}
                </div>
                {observation.notes && (
                  <div className="text-sm text-gray-500 mt-2">
                    {observation.notes}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-500">No observations recorded</div>
          )}
        </div>
      </div>
    </div>
  );
};

Observations.propTypes = {
  observations: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      unit: PropTypes.string,
      time: PropTypes.string.isRequired,
      notes: PropTypes.string,
    })
  ).isRequired,
};

export default Observations; 