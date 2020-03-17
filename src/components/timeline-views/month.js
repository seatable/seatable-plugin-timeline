import React from 'react';
import PropTypes from 'prop-types';
import HeaderMonthDays from '../header/header-month-days';
import ViewportRight from '../timeline-body/viewport-right';

const propTypes = {
  isToday: PropTypes.bool,
  isShowUsers: PropTypes.bool,
  changedSelectedByScroll: PropTypes.bool,
  selectedView: PropTypes.string,
  selectedDate: PropTypes.string,
  rows: PropTypes.array,
  updateSelectedDate: PropTypes.func,
  onCanvasRightScroll: PropTypes.func,
};

class Month extends React.Component {

  setCanvasRightScroll = (scrollTop) => {
    this.viewportRight.setCanvasRightScroll(scrollTop);
  }

  renderHeaderDays = (props) => {
    let { isToday, overscanDays, rows } = props;
    return <HeaderMonthDays
      isToday={isToday}
      overscanDays={overscanDays}
      rows={rows}
    />
  }

  updateScroll = (selectedDate) => {
    this.viewportRight.updateScroll({selectedDate});
  }

  render() {
    let { isToday, isShowUsers, changedSelectedByScroll, rows, selectedView, selectedDate, updateSelectedDate, onCanvasRightScroll } = this.props;
    return (
      <div className="timeline-month-view">
        <ViewportRight
          ref={node => this.viewportRight = node}
          isToday={isToday}
          isShowUsers={isShowUsers}
          changedSelectedByScroll={changedSelectedByScroll}
          selectedView={selectedView}
          selectedDate={selectedDate}
          rows={rows}
          renderHeaderDays={this.renderHeaderDays}
          updateSelectedDate={updateSelectedDate}
          onCanvasRightScroll={onCanvasRightScroll}
        />
      </div>
    );
  }
}

Month.propTypes = propTypes;

export default Month;