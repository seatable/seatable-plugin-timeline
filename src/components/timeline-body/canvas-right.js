import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import EventRow from '../row/event-row';
import EventCells from '../row/event-cells';
import BgCells from '../row/bg-cells';
import { DATE_UNIT, DATE_FORMAT, zIndexes, GRID_VIEWS, ROW_HEIGHT } from '../../constants';
import intl from 'react-intl-universal';
import '../../locale';

class CanvasRight extends React.Component {

  renderRows = () => {
    let { selectedGridView, selectedDate, overScanDates, columnWidth, renderedRows,
      renderedDates, onRowExpand } = this.props;
    if (renderedRows.length === 0) {
      return <div className="no-events d-flex align-items-center justify-content-center">{intl.get('There_are_no_records')}</div>;
    }
    let bgRows = [], eventRows = [];
    let bgCells = (
      <BgCells
        selectedGridView={selectedGridView}
        columnWidth={columnWidth}
        renderedDates={renderedDates}
      />
    );
    Array.isArray(renderedRows) && renderedRows.forEach((r) => {
      const rowName = r.name;
      bgRows.push(
        <EventRow
          key={`events-bg-row-${rowName}`}
          cells={bgCells}
        />
      );
      eventRows.push(
        <EventRow
          key={`timeline-events-row-${rowName}`}
          cells={
            <EventCells
              selectedGridView={selectedGridView}
              selectedDate={selectedDate}
              overScanDates={overScanDates}
              events={r.events}
              columnWidth={columnWidth}
              onRowExpand={onRowExpand}
            />
          }
        />
      );
    });
    return (
      <React.Fragment>
        <div className="events-bg position-absolute" style={{zIndex: zIndexes.EVENTS_BG, paddingBottom: '200px'}}>
          {bgRows}
        </div>
        <div className="events-rows position-absolute" style={{paddingBottom: '200px'}}>
          {eventRows}
        </div>
      </React.Fragment>
    );
  }

  renderTodayMarkLine = () => {
    let { overScanDates, selectedGridView, columnWidth, renderedRows } = this.props;
    let renderedRowsLen = renderedRows.length;
    if (renderedRowsLen === 0) return null;
    let today = moment();
    if (selectedGridView === GRID_VIEWS.YEAR) {
      today = today.startOf(DATE_UNIT.MONTH);
    }
    today = today.format(DATE_FORMAT.YEAR_MONTH_DAY);
    let todayIndex = overScanDates.indexOf(today);
    if (todayIndex < 0) return null;
    let left = todayIndex * columnWidth + columnWidth / 2;
    let height = renderedRowsLen * ROW_HEIGHT;
    return (
      <div
        className="today-mark-line position-absolute"
        style={{
          top: 0,
          height,
          left,
          zIndex: zIndexes.TODAY_MARK_LINE,
        }}
      >
      </div>
    );
  }

  onViewportRightScroll = (event) => {
    let scrollLeft = event.target.scrollLeft;
    let scrollTop = event.target.scrollTop;
    this.setViewportRightScroll({scrollLeft, scrollTop});
    this.props.onViewportRightScroll({scrollLeft, scrollTop});
  }

  setViewportRightScroll = ({scrollLeft, scrollTop}) => {
    this.viewportRight.scrollLeft = scrollLeft;
    this.viewportRight.scrollTop = scrollTop;
  }

  onCanvasRightScroll = (evt) => {
    evt.stopPropagation();
    if (!this.activeScroll) {
      this.activeScroll = true;
      return;
    }
    this.props.onCanvasRightScroll(evt.target.scrollTop);
  }

  setCanvasRightScroll = (scrollTop) => {
    this.activeScroll = false;
    this.canvasRight.scrollTop = scrollTop;
  }

  render() {
    let { columnWidth, startOffset, endOffset, overScanDates, topOffset, bottomOffset } = this.props;
    let canvasRightStyle = {
      width: overScanDates.length * columnWidth + startOffset + endOffset,
      paddingLeft: startOffset,
      paddingRight: endOffset,
      zIndex: zIndexes.CANVAS_RIGHT
    };
    return (
      <div
        className="canvas-right h-100 position-relative"
        ref={ref => this.canvasRight = ref}
        style={canvasRightStyle}
        onScroll={this.onCanvasRightScroll}
      >
        <div
          className="event-rows-wrapper"
          style={{
            paddingTop: topOffset,
            paddingBottom: bottomOffset,
          }}
        >
          <div className="position-relative" style={{width: '100%', height: '100%'}}>
            {this.renderRows()}
            {this.renderTodayMarkLine()}
          </div>
        </div>
      </div>
    );
  }
}

CanvasRight.propTypes = {
  renderedRows: PropTypes.array,
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  columnWidth: PropTypes.number,
  startDateOfMonth: PropTypes.string,
  endDateOfMonth: PropTypes.string,
  topOffset: PropTypes.number,
  bottomOffset: PropTypes.number,
  onViewportRightScroll: PropTypes.func,
  onRowExpand: PropTypes.func,
};

export default CanvasRight;