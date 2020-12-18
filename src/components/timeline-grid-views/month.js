import React from 'react';
import PropTypes from 'prop-types';
import HeaderYears from '../header/header-years';
import HeaderDaysRange from '../header/header-days-range';
import Grid from '../grid';

const propTypes = {
  isShowUsers: PropTypes.bool,
  isGroupView: PropTypes.bool,
  changedSelectedByScroll: PropTypes.bool,
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  gridStartDate: PropTypes.string,
  gridEndDate: PropTypes.string,
  rows: PropTypes.array,
  groups: PropTypes.array,
  eventBus: PropTypes.object,
  updateSelectedDate: PropTypes.func,
  onCanvasRightScroll: PropTypes.func,
  onViewportRightScroll: PropTypes.func,
  onRowExpand: PropTypes.func,
};

class Month extends React.Component {

  renderHeaderYears = (props) => {
    let { renderedDates, columnWidth } = props;
    return (
      <HeaderYears
        selectedGridView={this.props.selectedGridView}
        yearDates={renderedDates}
        columnWidth={columnWidth}
      />
    );
  }

  renderHeaderDates = (props) => {
    let { overScanDates, renderedDates, columnWidth } = props;
    return (
      <HeaderDaysRange
        overScanDates={overScanDates}
        renderedDates={renderedDates}
        columnWidth={columnWidth}
      />
    );
  }

  render() {
    let { isShowUsers, isGroupView, changedSelectedByScroll, selectedGridView, selectedDate, gridStartDate,
      gridEndDate, rows, groups, updateSelectedDate, onViewportLeftScroll, onCanvasRightScroll,
      onViewportRightScroll, onRowExpand, eventBus } = this.props;
    return (
      <div className="timeline-month-view">
        <Grid
          gridStartDate={gridStartDate}
          gridEndDate={gridEndDate}
          isShowUsers={isShowUsers}
          selectedGridView={selectedGridView}
          selectedDate={selectedDate}
          isGroupView={isGroupView}
          renderHeaderYears={this.renderHeaderYears}
          renderHeaderDates={this.renderHeaderDates}
          rows={rows}
          groups={groups}
          changedSelectedByScroll={changedSelectedByScroll}
          eventBus={eventBus}
          onViewportLeftScroll={onViewportLeftScroll}
          onViewportRightScroll={onViewportRightScroll}
          onCanvasRightScroll={onCanvasRightScroll}
          updateSelectedDate={updateSelectedDate}
          onRowExpand={onRowExpand}
        />
      </div>
    );
  }
}

Month.propTypes = propTypes;

export default Month;