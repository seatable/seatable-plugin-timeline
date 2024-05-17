import React, { Fragment } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import PropTypes from 'prop-types';
import shallowEqual from 'shallowequal';
import dayjs from 'dayjs';
import { CellType } from 'dtable-utils';
import EventFormatter from '../cell-formatter/event-formatter';
import { getEventPosition, getEventDaysByDisplacement, getEventLabel } from '../../utils/row-utils';
import { zIndexes, DATE_UNIT, GRID_VIEWS } from '../../constants';
import * as EventTypes from '../../constants/event-types';
import { MONTH_COLUMN_WIDTH } from '../../constants/column';

const eventStopPropagation = (event) => {
  if (!event) return;
  event.stopPropagation();
  event.preventDefault && event.preventDefault();
  event.nativeEvent && event.nativeEvent.stopImmediatePropagation && event.nativeEvent.stopImmediatePropagation();
};

class EventCell extends React.Component {

  constructor(props) {
    super(props);
    const { overScanStartDate, selectedGridView, columnWidth, event } = props;
    const { start, end, bgColor } = event;
    const { date: startDate } = start;
    const { date: endDate } = end;
    const { left, width } = getEventPosition(startDate, endDate, overScanStartDate, columnWidth, selectedGridView);
    const label = getEventLabel(width, event.label);
    this.state = {
      isDraggingEvent: false,
      isDraggingSide: false,
      start: startDate,
      end: endDate,
      width,
      left,
      label,
      bgColor,
    };
    this.draggingSideDirection = '';
  }

  componentDidMount() {
    this.unsubscribeTimeLineRightScroll = this.props.eventBus.subscribe(EventTypes.VIEWPORT_RIGHT_SCROLL, this.timeLineRightScroll);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { overScanStartDate, selectedGridView, columnWidth, event } = nextProps;
    const { start, end, bgColor } = event;
    const { date: startDate } = start;
    const { date: endDate } = end;
    const { left, width } = getEventPosition(startDate, endDate, overScanStartDate, columnWidth, selectedGridView);
    const label = getEventLabel(width, event.label);
    this.setState({ left, width, label, end: endDate, start: startDate, bgColor });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!shallowEqual(nextState, this.state)) return true;
    return false;
  }

  componentWillUnmount() {
    this.unsubscribeTimeLineRightScroll();
  }

  timeLineRightScroll = () => {
    if (this.state.isDraggingEvent) {
      this.onEventMouseUp();
      return;
    }
    if (this.state.isDraggingSide && this.draggingSideDirection === 'left') {
      this.onStartMouseUp();
      return;
    }
    if (this.state.isDraggingSide && this.draggingSideDirection === 'right') {
      this.onEndMouseUp();
      return;
    }
  };

  onRowExpand = (evt) => {
    evt.preventDefault();
    const { event } = this.props;
    const { row } = event;
    this.props.onRowExpand && this.props.onRowExpand(row);
  };

  onEventMouseDown = (evt) => {
    eventStopPropagation(evt);
    window.addEventListener('mousemove', this.onEventMouseMove);
    window.addEventListener('mouseup', this.onEventMouseUp);
    const { start, end, width, left } = this.state;
    this.distance = {
      disX: evt.clientX,
      start,
      end,
      width,
      left,
    };
    this.setState({ isDraggingEvent: true });
  };

  calculateEvent = () => {
    const displacementX = this.movingClientX - this.distance.disX;
    if (displacementX === 0) return;
    const { selectedGridView, event, columnWidth } = this.props;
    const displacement = displacementX / columnWidth;
    const displacementTime = Number(displacement.toFixed(0));
    const unit = selectedGridView === GRID_VIEWS.YEAR ? DATE_UNIT.MONTH : DATE_UNIT.DAY;
    const left = this.distance.left + displacementX;
    const { start: startObject, end: endObject } = event;
    const { column: startColumn } = startObject;
    const { column: endColumn } = endObject;
    const { data: startColumnData } = startColumn || {};
    const isStartIncludeHour = startColumnData && startColumnData.format && startColumnData.format.indexOf('HH:mm') > -1;
    const startFormat = isStartIncludeHour ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
    const start = dayjs(this.distance.start).add(displacementTime, unit).format(startFormat);
    let columnData = endColumn.data;
    if (endColumn.type === CellType.NUMBER) {
      const { column: startColumn } = startObject;
      const { data } = startColumn || {};
      columnData = data;
    }
    const isEndIncludeHour = columnData && columnData.format && columnData.format.indexOf('HH:mm') > -1;
    const endFormat = isEndIncludeHour ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
    const end = dayjs(this.distance.end).add(displacementTime, unit).format(endFormat);
    this.setState({ left, start, end });
  };

  onEventMouseMove = (evt) => {
    this.movingClientX = evt.clientX;
    if (!this.state.isDraggingEvent) return;
    eventStopPropagation(evt);
    this.calculateEvent();
  };

  onEventMouseUp = (evt) => {
    eventStopPropagation(evt);
    const { start, end, isDraggingEvent } = this.state;
    window.removeEventListener('mousemove', this.onEventMouseMove);
    window.removeEventListener('mouseup', this.onEventMouseUp);
    if (!isDraggingEvent) return;
    const { event, overScanStartDate, selectedGridView, columnWidth } = this.props;
    const { left } = getEventPosition(start, end, overScanStartDate, columnWidth, selectedGridView);
    this.setState({ left, isDraggingEvent: false });
    this.draggingSideDirection = '';
    this.distance = {};
    if (start === event.start.date) return;
    const { start: startObject, row, end: endObject } = event;
    const { column: startColumn = {} } = startObject;
    const { column: endColumn } = endObject;
    let update = { [startColumn.name]: start };
    if (endColumn.type === CellType.DATE) {
      update[endColumn.name] = end;
    }
    this.props.onModifyRow(row, update);
  };

  onStartMouseDown = (evt) => {
    eventStopPropagation(evt);
    window.addEventListener('mousemove', this.onStartMouseMove);
    window.addEventListener('mouseup', this.onStartMouseUp);
    const { start, end, width, left } = this.state;
    this.distance = {
      disX: evt.clientX,
      start,
      end,
      width,
      left,
    };
    this.draggingSideDirection = 'left';
    this.setState({ isDraggingSide: true });
  };

  calculateStartMove = () => {
    const displacementX = this.movingClientX - this.distance.disX;
    const { selectedGridView, event, columnWidth } = this.props;
    const displacementTime = Math.floor(displacementX / columnWidth);
    const unit = selectedGridView === GRID_VIEWS.YEAR ? DATE_UNIT.MONTH : DATE_UNIT.DAY;
    const { start: startObject } = event;
    const { column } = startObject;
    const { data } = column;
    const isIncludeHour = data && data.format && data.format.indexOf('HH:mm') > -1;
    const format = isIncludeHour ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
    const start = dayjs(this.distance.start).add(displacementTime, unit).format(format);
    const left = this.distance.left + displacementX;
    const width = this.distance.width - displacementX;
    if (width < Math.min(20, columnWidth)) return;
    this.setState({ start, left, width });
  };

  onStartMouseMove = (evt) => {
    this.movingClientX = evt.clientX;
    if (!this.state.isDraggingSide) return;
    if (this.draggingSideDirection !== 'left') return;
    eventStopPropagation(evt);
    this.calculateStartMove();
  };

  onStartMouseUp = (evt) => {
    window.removeEventListener('mousemove', this.onStartMouseMove);
    window.removeEventListener('mouseup', this.onStartMouseUp);
    eventStopPropagation(evt);
    const { start, end, isDraggingSide } = this.state;
    if (!isDraggingSide) return;
    const { event, overScanStartDate, selectedGridView, columnWidth } = this.props;
    const { left, width } = getEventPosition(start, end, overScanStartDate, columnWidth, selectedGridView);
    this.setState({ left, width, isDraggingSide: false });
    this.draggingSideDirection = '';
    this.distance = {};
    if (start === event.start.date) return;
    const { start: startObject, row, end: endObject } = event;
    const { column: startColumn = {} } = startObject;
    const { column: endColumn } = endObject;
    let update = { [startColumn.name]: start };
    if (endColumn.type === CellType.NUMBER) {
      let number = width / columnWidth;
      number = getEventDaysByDisplacement(selectedGridView, start, number);
      if (row[endColumn.name] !== number) {
        update[endColumn.name] = number;
      }
    }

    this.props.onModifyRow(row, update);
  };

  onEndMouseDown = (evt) => {
    eventStopPropagation(evt);
    window.addEventListener('mousemove', this.onEndMouseMove);
    window.addEventListener('mouseup', this.onEndMouseUp);
    const { start, end, width, left } = this.state;
    this.distance = {
      disX: evt.clientX,
      start,
      end,
      width,
      left,
    };
    this.draggingSideDirection = 'right';
    this.setState({ isDraggingSide: true });
  };

  calculateEndMove = () => {
    const displacementX = this.movingClientX - this.distance.disX;
    const { selectedGridView, event, columnWidth } = this.props;
    const displacementTime = Math.ceil(displacementX / columnWidth);
    const unit = selectedGridView === GRID_VIEWS.YEAR ? DATE_UNIT.MONTH : DATE_UNIT.DAY;
    const { start: startObject, end: endObject } = event;
    const { column: endColumn } = endObject;
    let columnData = endColumn.data;
    if (endColumn.type === CellType.NUMBER) {
      const { column: startColumn } = startObject;
      const { data } = startColumn || {};
      columnData = data;
    }
    const isIncludeHour = columnData && columnData.format && columnData.format.indexOf('HH:mm') > -1;
    const format = isIncludeHour ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
    const end = dayjs(this.distance.end).add(displacementTime, unit).format(format);
    const width = this.distance.width + displacementX;
    if (width < Math.min(20, columnWidth)) return;
    this.setState({ end, width });
  };

  onEndMouseMove = (evt) => {
    this.movingClientX = evt.clientX;
    if (!this.state.isDraggingSide) return;
    if (this.draggingSideDirection !== 'right') return;
    eventStopPropagation(evt);
    this.calculateEndMove();
  };

  onEndMouseUp = (evt) => {
    window.removeEventListener('mousemove', this.onEndMouseMove);
    window.removeEventListener('mouseup', this.onEndMouseUp);
    eventStopPropagation(evt);
    if (!this.state.isDraggingSide) return;
    const { event, overScanStartDate, selectedGridView, columnWidth } = this.props;
    const { start, end } = this.state;
    const { left, width } = getEventPosition(start, end, overScanStartDate, columnWidth, selectedGridView);
    this.setState({ left, width, isDraggingSide: false });
    this.draggingSideDirection = '';
    this.distance = {};
    if (end === event.start.end) return;
    const { end: endObject, row } = event;
    const { column } = endObject;
    const { type, name } = column;
    let update = { [name]: end };
    if (type === CellType.NUMBER) {
      let number = width / columnWidth;
      number = getEventDaysByDisplacement(selectedGridView, start, number);
      if (row[name] === number) return;
      update = { [name]: number };
    }
    this.props.onModifyRow(row, update);
  };

  renderNextPosition = ({ formatterStyle }) => {
    const { overScanStartDate, selectedGridView, columnWidth } = this.props;
    const { start, end } = this.state;
    const { left, width } = getEventPosition(start, end, overScanStartDate, columnWidth, selectedGridView);
    return (
      <div
        className="timeline-event-cell next-position"
        style={{
          left,
          width,
          zIndex: zIndexes.EVENT_CELL - 1,
        }}
      >
        <div className="cell-formatter grid-cell-type-single-select" style={formatterStyle}></div>
      </div>
    );
  };

  renderOldPosition = ({ formatterStyle }) => {
    const { event, overScanStartDate, selectedGridView, columnWidth } = this.props;
    const { label, bgColor } = this.state;
    const { textColor } = event;
    const { left, width } = getEventPosition(this.distance.start, this.distance.end, overScanStartDate, columnWidth, selectedGridView);
    return (
      <div
        className="timeline-event-cell old-position"
        style={{
          left,
          width,
          zIndex: zIndexes.EVENT_CELL - 2,
        }}
      >
        <EventFormatter
          label={label}
          bgColor={bgColor}
          textColor={textColor}
          formatterStyle={formatterStyle}
        />
      </div>
    );
  };

  canModifyWidth = () => {
    return this.state.width >= MONTH_COLUMN_WIDTH * 2; // easy to modify width or position
  };

  render() {
    const { event } = this.props;
    const { textColor, row } = event;
    const canEventDateBeChanged = event.start.canChange && event.end.canChange;
    const { start, end, isDraggingSide, left, width, label, bgColor, isDraggingEvent } = this.state;
    const { _id: rowId } = row;
    const canEventSideBeChanged = this.canModifyWidth();
    const canEventStartDateBeChanged = event.start.canChange && canEventSideBeChanged;
    const canEventEndDateBeChanged = event.end.canChange && canEventSideBeChanged;
    const formatterStyle = width < 30 ? { padding: 0 } : { padding: '0 10px' };
    const dragging = isDraggingSide || isDraggingEvent;
    return (
      <Fragment>
        <div
          className={`timeline-event-cell ${canEventDateBeChanged ? 'can-changed' : ''}`}
          id={`timeline_event_cell_${rowId}` || ''}
          style={{
            left,
            width,
            zIndex: dragging ? zIndexes.EVENT_CELL + 1 : zIndexes.EVENT_CELL,
          }}
          ref={ref => this.timeLineEventCellRef = ref}
          onDoubleClick={this.onRowExpand}
          onMouseDown={canEventDateBeChanged ? this.onEventMouseDown : () => {}}
        >
          {canEventStartDateBeChanged && (
            <div
              className={`timeline-event-cell-drag-left-line ${isDraggingSide && this.draggingSideDirection === 'left' ? 'isDraggingSide' : ''}`}
              onMouseDown={this.onStartMouseDown}
            >
              <div className="timeline-event-cell-drag-bg" style={{ backgroundColor: textColor }}></div>
            </div>
          )}
          <EventFormatter
            label={label}
            bgColor={bgColor}
            textColor={textColor}
            formatterStyle={formatterStyle}
            canEventDateBeChanged={canEventDateBeChanged}
            onEventMouseDown={this.onEventMouseDown}
          />
          {canEventEndDateBeChanged && (
            <div
              className={`timeline-event-cell-drag-right-line ${isDraggingSide && this.draggingSideDirection === 'right' ? 'isDraggingSide' : ''}`}
              onMouseDown={this.onEndMouseDown}
            >
              <div className="timeline-event-cell-drag-bg" style={{ backgroundColor: textColor }}></div>
            </div>
          )}
        </div>
        <UncontrolledTooltip
          placement="bottom"
          delay={100}
          fade={false}
          target={`timeline_event_cell_${rowId}`}
        >
          {`${start} - ${end}`}
        </UncontrolledTooltip>
        {dragging && this.renderNextPosition({ formatterStyle })}
        {isDraggingEvent && this.renderOldPosition({ formatterStyle })}
      </Fragment>
    );
  }
}

EventCell.propTypes = {
  event: PropTypes.object,
  overScanStartDate: PropTypes.string,
  selectedGridView: PropTypes.string,
  columnWidth: PropTypes.number,
  onRowExpand: PropTypes.func,
  eventBus: PropTypes.object,
  onModifyRow: PropTypes.func,
};

export default EventCell;
