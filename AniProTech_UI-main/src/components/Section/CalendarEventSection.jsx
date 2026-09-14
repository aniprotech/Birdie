import moment from "moment";
import PropTypes from "prop-types";

const CalendarEventSection = ({ event }) => {
    const isCompleted = event.resource.status === "Completed";

    return (
        <div className={`visit-event ${isCompleted ? "completed" : "scheduled"}`}>
            <div className="visit-time">
                {moment(event.start).format("h:mm")} – {moment(event.end).format("h:mma")}
            </div>
            <div className="visit-details">
                <div className="visit-icons">
                    <span className="task-icon">✓ {event.resource.tasks}</span>
                    {event.resource.medication && <span className="med-icon">💊 {event.resource.medication}</span>}
                    {event.resource.duration && <span className="time-icon">⏱ {event.resource.duration}</span>}
                </div>
                <div className="visit-status">
                    <span className={`status ${isCompleted ? "completed" : "scheduled"}`}>{event.resource.status}</span>
                    <span className="provider">{event.resource.provider}</span>
                </div>
            </div>
        </div>
    );
};

CalendarEventSection.propTypes = {
    event: PropTypes.shape({
      start: PropTypes.instanceOf(Date).isRequired,
      end: PropTypes.instanceOf(Date).isRequired,
      resource: PropTypes.shape({
        status: PropTypes.string.isRequired,
        tasks: PropTypes.string.isRequired,
        medication: PropTypes.string,
        duration: PropTypes.string,
        provider: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    };
    
export default CalendarEventSection;
