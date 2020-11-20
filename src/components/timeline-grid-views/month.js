import React from 'react';
import PropTypes from 'prop-types';
import HeaderYears from '../header/header-years';
import HeaderDaysRange from '../header/header-days-range';
import ViewportRight from '../timeline-body/viewport-right';

const propTypes = {
  isShowUsers: PropTypes.bool,
  changedSelectedByScroll: PropTypes.bool,
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  gridStartDate: PropTypes.string,
  gridEndDate: PropTypes.string,
  headerHeight: PropTypes.number,
  renderedRows: PropTypes.array,
  topOffset: PropTypes.number,
  bottomOffset: PropTypes.number,
  eventBus: PropTypes.object,
  updateSelectedDate: PropTypes.func,
  onCanvasRightScroll: PropTypes.func,
  onViewportRightScroll: PropTypes.func,
  onRowExpand: PropTypes.func,
};

class Month extends React.Component {

  setCanvasRightScroll = (scrollTop) => {
    this.viewportRight.setCanvasRightScroll(scrollTop);
  }

  updateScroll = (selectedDate) => {
    this.viewportRight.updateScroll({selectedDate});
  }

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
    let { overScanDates, renderedDates, renderedRows, columnWidth } = props;
    return (
      <HeaderDaysRange
        overScanDates={overScanDates}
        renderedDates={renderedDates}
        renderedRows={renderedRows}
        columnWidth={columnWidth}
      />
    );
  }

  render() {
    let { isShowUsers, changedSelectedByScroll, headerHeight, renderedRows, selectedGridView, selectedDate,
      gridStartDate, gridEndDate, updateSelectedDate, onCanvasRightScroll, onViewportRightScroll, onRowExpand,
      topOffset, bottomOffset, eventBus } = this.props;
    return (
      <div className="timeline-month-view">
        <ViewportRight
          ref={node => this.viewportRight = node}
          isShowUsers={isShowUsers}
          changedSelectedByScroll={changedSelectedByScroll}
          selectedGridView={selectedGridView}
          selectedDate={selectedDate}
          gridStartDate={gridStartDate}
          gridEndDate={gridEndDate}
          headerHeight={headerHeight}
          renderedRows={renderedRows}
          topOffset={topOffset}
          bottomOffset={bottomOffset}
          eventBus={eventBus}
          renderHeaderYears={this.renderHeaderYears}
          renderHeaderDates={this.renderHeaderDates}
          updateSelectedDate={updateSelectedDate}
          onCanvasRightScroll={onCanvasRightScroll}
          onViewportRightScroll={onViewportRightScroll}
          onRowExpand={onRowExpand}
        />
      </div>
    );
  }
}

Month.propTypes = propTypes;

export default Month;