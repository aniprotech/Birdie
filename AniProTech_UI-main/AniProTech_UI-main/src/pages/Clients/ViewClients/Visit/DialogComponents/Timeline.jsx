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

const Timeline = ({ events }) => {
  return (
    <Box className="bg-white rounded-md px-6 py-4 w-full">
      <MuiTimeline sx={{ pl: 0, m: 0 }}>
        {events.map((event, index) => (
          <TimelineItem
            key={index}
            sx={{
              minHeight: 'auto',
              '&::before': { display: 'none' },
              mb: 2, // Reduced vertical spacing between items
            }}
          >
            <TimelineSeparator>
              <TimelineDot
                sx={{
                  backgroundColor: '#909090',
                  width: 8,
                  height: 8,
                  margin: 0,
                  p: 0, // Remove any padding
                  my: 0.5, // Small vertical margin to help with alignment
                }}
              />
              {index !== events.length - 1 && (
                <TimelineConnector
                  sx={{
                    backgroundColor: '#909090',
                    width: '1px', // Thinner line
                    minHeight: 16, // Minimum height for the connector
                    mx: 'auto', // Center the connector
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
    </Box>
  );
};

Timeline.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default Timeline;