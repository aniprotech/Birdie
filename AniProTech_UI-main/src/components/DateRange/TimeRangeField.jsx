import React from 'react';

const TimeRangeField = ({
  label,
  required = false,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  error,
  internalError = null, // external error from parent
  setInternalError = null,
}) => {
  // Helper: Strip seconds from HH:mm:ss string for displaying in input
  const stripSeconds = (time) => {
    if (!time) return '';
    return time.length === 8 ? time.slice(0, 5) : time; // "HH:mm:ss" -> "HH:mm"
  };

  // Parse "HH:mm:ss" or "HH:mm" to minutes for comparison
  const timeToMinutes = (time) => {
    if (!time) return null;
    const [hh, mm] = time.split(':');
    return parseInt(hh, 10) * 60 + parseInt(mm, 10);
  };

  // Internal validation error message
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  if (startMins !== null && endMins !== null && endMins <= startMins) {
    setInternalError('End time cannot be earlier than or equal to start time');
  }
  else{
    setInternalError(null);
  }

  // When user changes time, append ":00" seconds before sending back
  const handleStartTimeChange = (value) => {
    if (value.length === 5) {
      onStartTimeChange(value + ':00');
    } else {
      onStartTimeChange(value);
    }
  };

  const handleEndTimeChange = (value) => {
    if (value.length === 5) {
      onEndTimeChange(value + ':00');
    } else {
      onEndTimeChange(value);
    }
  };

  return (
    <div className="w-full max-w-md">
      <label className="block text-sm poppins-medium text-customTextGrey mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-2">
        {/* Start Time Picker */}
        <div className="relative w-full">
          <input
            type="time"
            value={stripSeconds(startTime)}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            className={`w-full border rounded-md text-sm cursor-pointer px-3 py-2 ${
              internalError || error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>

        <span className="text-gray-500 text-sm">to</span>

        {/* End Time Picker */}
        <div className="relative w-full">
          <input
            type="time"
            value={stripSeconds(endTime)}
            onChange={(e) => handleEndTimeChange(e.target.value)}
            className={`w-full border rounded-md text-sm cursor-pointer px-3 py-2 ${
              internalError || error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
      </div>

      {/* Show internal error first, then external */}
      {(internalError || error) && (
        <p className="text-xs text-red-600 mt-1">{internalError || error}</p>
      )}
    </div>
  );
};

export default TimeRangeField;
