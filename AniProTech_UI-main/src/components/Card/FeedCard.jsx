import React from 'react';
import PropTypes from 'prop-types';

const FeedCard = ({ notification, className = '' }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-customFeedCardGreenText poppins-semibold text-sm';
      case 'in progress':
        return 'bg-[#FFF2EB] text-[#974211] poppins-semibold text-sm';
      case 'cancelled':
        return 'bg-[#FFF2EB] text-[#974211] poppins-semibold text-sm';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-md border border-customNavy/50 shadow ${className}`}>
      <div className='px-4 py-2'>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="font-medium">Visit</span>
            {notification.actionNeeded && (
              <span className="text-red-600 text-sm font-medium ml-2">
                Action Needed
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">{notification.date}</div>
            <div className="text-sm font-medium">{notification.time}</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-3">
          <div className="flex items-center space-x-1">
            <span className="text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </span>
            <span>{notification.alerts}</span>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center space-x-1">
            <span className="text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </span>
            <span>{notification.views}</span>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center space-x-1">
            <span className="text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
            <span>{notification.tasks}</span>
          </div>
        </div>
      </div>
      <div className={`rounded-md px-3 py-2 ${getStatusColor(notification.status)}`}>
        <div className="flex justify-between items-center">
          <span className="">{notification.status}</span>
          <span>{notification.duration} / {notification.totalDuration}</span>
        </div>
      </div>
    </div>
  );
};

FeedCard.propTypes = {
  notification: PropTypes.shape({
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    alerts: PropTypes.number.isRequired,
    views: PropTypes.number.isRequired,
    tasks: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    totalDuration: PropTypes.string.isRequired,
    actionNeeded: PropTypes.bool
  }).isRequired,
  className: PropTypes.string
};

export default FeedCard;