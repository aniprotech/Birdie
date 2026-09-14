import PropTypes from 'prop-types';
import {
  Timeline as MuiTimeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
} from '@mui/lab';
import { Box } from '@mui/material';
import { Clock3, X } from 'lucide-react';

const ScheduleTimeLine = ({ events, onClose }) => {
  return (
    <Box className="fixed right-0 top-0 z-50 h-full w-[400px] border-l border-gray-200 bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <Clock3 size={18} className="text-customBlack1" />
          <h3 className="poppins-medium text-base text-customBlack">Activity</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-gray-500 transition hover:bg-gray-100 hover:text-black"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Timeline */}
      <div className="h-[calc(100%-64px)] overflow-y-auto px-4 py-3"> {/* 64px = approx header height */}
        <MuiTimeline sx={{ pl: 0, m: 0 }}>
          {events.map((event, index) => (
            <TimelineItem
              key={index}
              sx={{
                minHeight: 'auto',
                '&::before': { display: 'none' },
                mb: 2,
              }}
            >
              <TimelineSeparator>
                <TimelineDot
                  sx={{
                    backgroundColor: '#909090',
                    width: 8,
                    height: 8,
                    margin: 0,
                    p: 0,
                    my: 0.5,
                  }}
                />
                {index !== events.length - 1 && (
                  <TimelineConnector
                    sx={{
                      backgroundColor: '#909090',
                      width: '1px',
                      minHeight: 16,
                      mx: 'auto',
                    }}
                  />
                )}
              </TimelineSeparator>

              <TimelineContent sx={{ py: 0, px: 1.5 }}>
                <p className="text-sm font-medium text-customBlack">{event.title}</p>
                <p className="text-sm text-customBlack1">
                  by {event.author}, {event.time}
                </p>
              </TimelineContent>
            </TimelineItem>
          ))}
        </MuiTimeline>
      </div>
    </Box>
  );
};

ScheduleTimeLine.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ScheduleTimeLine;
