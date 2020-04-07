import React from 'react';
import PropTypes from 'prop-types';
import HeaderYears from '../header/header-years';
import HeaderYearMonths from '../header/header-year-months';
import ViewportRight from '../timeline-body/viewport-right';
import { dates } from '../../utils';
import { DATE_UNIT, DATE_FORMAT } from '../../constants';

const propTypes = {
  isShowUsers: PropTypes.bool,
  changedSelectedByScroll: PropTypes.bool,
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  headerHeight: PropTypes.number,
  rows: PropTypes.array,
  updateSelectedDate: PropTypes.func,
  onCanvasRightScroll: PropTypes.func,
};

class Year extends React.Component {

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
      yearDates={dates.getUniqueDates(overscanDates, DATE_UNIT.YEAR, DATE_FORMAT.YEAR)}
      columnWidth={columnWidth}
    />
  }

  renderHeaderDates = (props) => {
    let { overscanDates, rows, columnWidth } = props;
    return <HeaderYearMonths
      overscanDates={overscanDates}
      rows={rows}
      columnWidth={columnWidth}
    />
  }

  render() {
    let { isShowUsers, changedSelectedByScroll, headerHeight, rows, selectedGridView, selectedDate, updateSelectedDate, onCanvasRightScroll } = this.props;
    return (
      <div className="timeline-year-view">
        <ViewportRight
          ref={node => this.viewportRight = node}
          isShowUsers={isShowUsers}
          changedSelectedByScroll={changedSelectedByScroll}
          selectedGridView={selectedGridView}
          selectedDate={selectedDate}
          headerHeight={headerHeight}
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

Year.propTypes = propTypes;

export default Year;