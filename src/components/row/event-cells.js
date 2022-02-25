import React from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import EventCell from '../row/event-cell';
import { dates } from '../../utils';
import { DATE_UNIT, GRID_VIEWS } from '../../constants';

const getEventsInRange = (selectedGridView, selectedDate, events, startDate, endDate) => {
  if (!Array.isArray(events)) {
    return [];
  }
  return events.filter(e => {
    const { start, end } = e;
    const { date: eventStartDate } = start;
    const { date: eventEndDate } = end;
    let isValidEvent = true;
    if (selectedGridView === GRID_VIEWS.YEAR) {
      isValidEvent = dayjs(eventEndDate).diff(eventStartDate, DATE_UNIT.MONTH) > 0;
    } else {
      isValidEvent = dayjs(eventEndDate).isSame(eventStartDate) || dayjs(eventEndDate).isAfter(eventStartDate);
    }
    return isValidEvent && (dates.isDateInRange(eventStartDate, startDate, endDate) ||
      dates.isDateInRange(eventEndDate, startDate, endDate) ||
      dates.isDateInRange(selectedDate, eventStartDate, eventEndDate));
  });
};

function EventCells(props) {
  const { selectedGridView, selectedDate, overScanDates, events, columnWidth } = props;
  let overScanStartDate = overScanDates[0];
  let overScanEndDate = overScanDates[overScanDates.length - 1];
  let displayEvents = getEventsInRange(selectedGridView, selectedDate, events, overScanStartDate, overScanEndDate);
  return displayEvents.map(event => {
    let { row } = event;
    if (!row) return null;

    return (
      <EventCell
        key={`timeline-event-cell-${row._id}`}
        event={event}
        overScanStartDate={overScanStartDate}
        selectedGridView={selectedGridView}
        columnWidth={columnWidth}
        eventBus={props.eventBus}
        onRowExpand={props.onRowExpand}
        onModifyRow={props.onModifyRow}
      />
    );
  });
}

EventCells.propTypes = {
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  overScanDates: PropTypes.array,
  events: PropTypes.array,
  columnWidth: PropTypes.number,
  eventBus: PropTypes.object,
  onRowExpand: PropTypes.func,
  onModifyRow: PropTypes.func,
};

export default EventCells;