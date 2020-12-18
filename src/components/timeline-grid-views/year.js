import React from 'react';
import PropTypes from 'prop-types';
import HeaderYears from '../header/header-years';
import HeaderYearMonths from '../header/header-year-months';
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

class Year extends React.Component {

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
    let { overScanDates, columnWidth } = props;
    return (
      <HeaderYearMonths
        overScanDates={overScanDates}
        columnWidth={columnWidth}
      />
    );
  }

  render() {
    let { isShowUsers, isGroupView, changedSelectedByScroll, rows, groups, selectedGridView, selectedDate,
      gridStartDate, gridEndDate, updateSelectedDate, onViewportLeftScroll, onCanvasRightScroll,
      onViewportRightScroll, onRowExpand, eventBus } = this.props;
    return (
      <div className="timeline-year-view">
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

Year.propTypes = propTypes;

export default Year;