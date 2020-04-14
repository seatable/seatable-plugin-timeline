import React from 'react';
import PropTypes from 'prop-types';
import HeaderYears from '../header/header-years';
import HeaderDaysRange from '../header/header-days-range';
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
  settings: PropTypes.object,
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
    let { overscanDates, columnWidth } = props;
    return <HeaderYears
      selectedGridView={this.props.selectedGridView}
      yearDates={dates.getUniqueDates(overscanDates, DATE_UNIT.MONTH, DATE_FORMAT.YEAR_MONTH)}
      columnWidth={columnWidth}
    />
  }

  renderHeaderDates = (props) => {
    let { overscanDates, rows, columnWidth } = props;
    return <HeaderDaysRange
      overscanDates={overscanDates}
      rows={rows}
      columnWidth={columnWidth}
    />
  }

  render() {
    let { isShowUsers, changedSelectedByScroll, headerHeight, rows, settings, selectedGridView, selectedDate, updateSelectedDate, onCanvasRightScroll, onViewportRightScroll, onRowExpand } = this.props;
    return (
      <div className="timeline-month-view">
        <ViewportRight
          ref={node => this.viewportRight = node}
          isShowUsers={isShowUsers}
          changedSelectedByScroll={changedSelectedByScroll}
          selectedGridView={selectedGridView}
          selectedDate={selectedDate}
          headerHeight={headerHeight}
          rows={rows}
          settings={settings}
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