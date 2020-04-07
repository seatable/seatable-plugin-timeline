import React from 'react';
import PropTypes from 'prop-types';
import HeaderYears from '../header/header-years';
import HeaderMonths from '../header/header-months';
import ViewportRight from '../timeline-body/viewport-right';
import { dates } from '../../utils';
import { DATE_UNIT, DATE_FORMAT } from '../../constants';

const propTypes = {
  isShowUsers: PropTypes.bool,
  changedSelectedByScroll: PropTypes.bool,
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  rows: PropTypes.array,
  updateSelectedDate: PropTypes.func,
  onCanvasRightScroll: PropTypes.func,
};

class Month extends React.Component {

  setCanvasRightScroll = (scrollTop) => {
    this.viewportRight.setCanvasRightScroll(scrollTop);
  }

  updateScroll = (selectedDate) => {
    this.viewportRight.updateScroll({selectedDate});
  }

  renderHeaderYears = (props) => {
    let { overscanDates, columnWidth } = props;
    return <HeaderYears
      selectedGridView={this.props.selectedGridView}
      yearDates={dates.getUniqueDates(overscanDates, DATE_UNIT.MONTH, DATE_FORMAT.YEAR_MONTH)}
      columnWidth={columnWidth}
    />
  }

  renderHeaderDates = (props) => {
    let { overscanDates, rows, columnWidth } = props;
    return <HeaderMonths
      overscanDates={overscanDates}
      rows={rows}
      columnWidth={columnWidth}
    />
  }

  render() {
    let { isShowUsers, changedSelectedByScroll, rows, selectedGridView, selectedDate, updateSelectedDate, onCanvasRightScroll } = this.props;
    return (
      <div className="timeline-month-view">
        <ViewportRight
          ref={node => this.viewportRight = node}
          isShowUsers={isShowUsers}
          changedSelectedByScroll={changedSelectedByScroll}
          selectedGridView={selectedGridView}
          selectedDate={selectedDate}
          rows={rows}
          renderHeaderYears={this.renderHeaderYears}
          renderHeaderDates={this.renderHeaderDates}
          updateSelectedDate={updateSelectedDate}
          onCanvasRightScroll={onCanvasRightScroll}
        />
      </div>
    );
  }
}

Month.propTypes = propTypes;

export default Month;