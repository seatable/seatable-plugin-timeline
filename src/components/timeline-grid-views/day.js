import React from 'react';
import PropTypes from 'prop-types';
import HeaderDays from '../header/header-days';
import ViewportRight from '../timeline-body/viewport-right';

const propTypes = {
  isShowUsers: PropTypes.bool,
  changedSelectedByScroll: PropTypes.bool,
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  rows: PropTypes.array,
  updateSelectedDate: PropTypes.func,
  onCanvasRightScroll: PropTypes.func,
};

class Day extends React.Component {

  setCanvasRightScroll = (scrollTop) => {
    this.viewportRight.setCanvasRightScroll(scrollTop);
  }

  updateScroll = (selectedDate) => {
    this.viewportRight.updateScroll({selectedDate});
  }

  renderHeaderDates = (props) => {
    let { overscanDates, rows, columnWidth } = props;
    return <HeaderDays
      overscanDates={overscanDates}
      rows={rows}
      columnWidth={columnWidth}
    />
  }

  render() {
    let { isShowUsers, changedSelectedByScroll, rows, selectedGridView, selectedDate, updateSelectedDate, onCanvasRightScroll } = this.props;
    return (
      <div className="timeline-day-view">
        <ViewportRight
          ref={node => this.viewportRight = node}
          isShowUsers={isShowUsers}
          changedSelectedByScroll={changedSelectedByScroll}
          selectedGridView={selectedGridView}
          selectedDate={selectedDate}
          rows={rows}
          renderHeaderDates={this.renderHeaderDates}
          updateSelectedDate={updateSelectedDate}
          onCanvasRightScroll={onCanvasRightScroll}
        />
      </div>
    );
  }
}

Day.propTypes = propTypes;

export default Day;