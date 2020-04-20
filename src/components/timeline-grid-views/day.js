import React from 'react';
import PropTypes from 'prop-types';
import HeaderYears from '../header/header-years';
import HeaderDays from '../header/header-days';
import ViewportRight from '../timeline-body/viewport-right';

const propTypes = {
  isShowUsers: PropTypes.bool,
  changedSelectedByScroll: PropTypes.bool,
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  headerHeight: PropTypes.number,
  renderedRows: PropTypes.array,
  topOffset: PropTypes.number,
  bottomOffset: PropTypes.number,
  updateSelectedDate: PropTypes.func,
  onCanvasRightScroll: PropTypes.func,
  onViewportRightScroll: PropTypes.func,
  onRowExpand: PropTypes.func,
};

class Day extends React.Component {

  setCanvasRightScroll = (scrollTop) => {
    this.viewportRight.setCanvasRightScroll(scrollTop);
  }

  updateScroll = (selectedDate) => {
    this.viewportRight.updateScroll({selectedDate});
  }

  renderHeaderYears = (props) => {
    let { renderedDates, columnWidth } = props;
    return <HeaderYears
      selectedGridView={this.props.selectedGridView}
      yearDates={renderedDates}
      columnWidth={columnWidth}
    />
  }

  renderHeaderDates = (props) => {
    let { overscanDates, renderedRows, columnWidth } = props;
    return <HeaderDays
      overscanDates={overscanDates}
      renderedRows={renderedRows}
      columnWidth={columnWidth}
    />
  }

  render() {
    let { isShowUsers, changedSelectedByScroll, headerHeight, renderedRows, selectedGridView, selectedDate, updateSelectedDate, onCanvasRightScroll, onViewportRightScroll, onRowExpand, topOffset, bottomOffset } = this.props;
    return (
      <div className="timeline-day-view">
        <ViewportRight
          ref={node => this.viewportRight = node}
          isShowUsers={isShowUsers}
          changedSelectedByScroll={changedSelectedByScroll}
          selectedGridView={selectedGridView}
          selectedDate={selectedDate}
          headerHeight={headerHeight}
          renderedRows={renderedRows}
          topOffset={topOffset}
          bottomOffset={bottomOffset}
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

Day.propTypes = propTypes;

export default Day;