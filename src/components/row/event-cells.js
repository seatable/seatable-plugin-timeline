import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import EventCell from '../row/event-cell';
import EventFormatter from '../cell-formatter/event-formatter';
import { dates } from '../../utils';
import { getEventWidth, getEventLeft } from '../../utils/row-utils';
import { DATE_UNIT, GRID_VIEWS, zIndexes } from '../../constants';

const getEventsInRange = (selectedGridView, selectedDate, events, startDate, endDate) => {
  if (!Array.isArray(events)) {
    return [];
  }
  return events.filter(e => {
    let { start: eventStartDate, end: eventEndDate } = e;
    let isValidEvent = true;
    if (selectedGridView === GRID_VIEWS.YEAR) {
      isValidEvent = moment(eventEndDate).diff(eventStartDate, DATE_UNIT.MONTH) > 0;
    } else {
      isValidEvent = moment(eventEndDate).isSameOrAfter(eventStartDate);
    }
    return isValidEvent && (dates.isDateInRange(eventStartDate, startDate, endDate) ||
      dates.isDateInRange(eventEndDate, startDate, endDate) ||
      dates.isDateInRange(selectedDate, eventStartDate, eventEndDate));
  });
};

function EventCells({selectedGridView, selectedDate, overScanDates, events, columnWidth, onRowExpand}) {
  let overScanStartDate = overScanDates[0];
  let overScanEndDate = overScanDates[overScanDates.length - 1];
  let displayEvents = getEventsInRange(selectedGridView, selectedDate, events, overScanStartDate, overScanEndDate);
  return displayEvents.map((e) => {
    let { label, bgColor, textColor, start, end, row } = e;
    if (!row) return null;
    let width = getEventWidth(selectedGridView, columnWidth, start, end);
    let left = getEventLeft(selectedGridView, columnWidth, overScanStartDate, start);
    let { _id: rowId } = row;
    let formatterLabel = null, formatterStyle = {};
    if (width < 30) {
      formatterLabel = '';
      formatterStyle = {
        padding: 0
      };
    } else {
      formatterLabel = label;
      formatterStyle = {
        padding: '0 10px'
      };
    }
    return (
      <EventCell
        key={`timeline-event-cell-${rowId}`}
        style={{left, zIndex: zIndexes.EVENT_CELL, width}}
        row={row}
        id={`timeline_event_cell_${rowId}`}
        onRowExpand={onRowExpand}
        title={`${label}(${start} - ${end})`}
        width={width}
        formatter={
          <EventFormatter
            label={formatterLabel}
            bgColor={bgColor}
            textColor={textColor}
            formatterStyle={formatterStyle}
          />
        }
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
  onRowExpand: PropTypes.func,
};

export default EventCells;