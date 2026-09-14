import React from 'react';
import FeedCard from '../../../../../components/Card/FeedCard';

const ClientAllFeedNotification = () => {
  // Example notifications data
  const notifications = [
    {
      date: '28 May 2024',
      time: '07:31',
      alerts: 0,
      views: 1,
      tasks: 9,
      duration: '58 mins',
      totalDuration: '1 hour',
      status: 'Completed',
      actionNeeded: true
    },
    {
      date: '27 May 2024',
      time: '07:33',
      alerts: 0,
      views: 1,
      tasks: 9,
      duration: '1 hour 5 mins',
      totalDuration: '1 hour',
      status: 'In Progress',
      actionNeeded: false
    }
  ];

  return (
    <div className="w-full min-h-screen bg-customCarerFeedBg bg-opacity-10 pt-14 px-5 ">
      <div className="max-w-7xl mx-auto grid gap-4 grid-cols-1 ">
        {notifications.map((notification, index) => (
          <div key={index} className="w-full ">
            <FeedCard 
              notification={notification}
              className="h-full transition-transform hover:scale-102 hover:shadow-lg"
            />
          </div>
        ))}
      </div>
      {notifications.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No notifications available
        </div>
      )}
    </div>
  );
};

export default ClientAllFeedNotification;