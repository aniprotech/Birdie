import PropTypes from 'prop-types';

const Alerts = ({ alerts }) => {
  return (
    <div className="p-5">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Alerts</h2>
        <div className="space-y-3">
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                <span className="text-red-500">⚠️</span>
                <div>
                  <div className="text-sm font-medium text-red-700">
                    {alert.title}
                  </div>
                  {alert.description && (
                    <div className="text-sm text-red-600 mt-1">
                      {alert.description}
                    </div>
                  )}
                  <div className="text-xs text-red-500 mt-1">
                    {alert.time}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500">No alerts raised</div>
          )}
        </div>
      </div>
    </div>
  );
};

Alerts.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      time: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default Alerts; 