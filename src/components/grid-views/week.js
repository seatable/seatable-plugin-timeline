import React from 'react';
import PropTypes from 'prop-types';
import HeaderYears from '../header/header-years';
import HeaderWeekDays from '../header/header-week-days';
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
  onViewportRightScroll: PropTypes.func,
  onRowExpand: PropTypes.func,
};

class Week extends React.Component {

  renderHeaderYears = (props) => {
    const { renderedDates, columnWidth } = props;
    const { selectedGridView } = this.props;
    return (
      <HeaderYears
        selectedGridView={selectedGridView}
        yearDates={renderedDates}
        columnWidth={columnWidth}
      />
    );
  }

  renderHeaderDates = (props) => {
    const { overScanDates, columnWidth } = props;
    return (
      <HeaderWeekDays
        overScanDates={overScanDates}
        columnWidth={columnWidth}
      />
    );
  }

  render() {
    return (
      <div className="timeline-week-view timeline-gird-view">
        <Grid
          {...this.props}
          renderHeaderYears={this.renderHeaderYears}
          renderHeaderDates={this.renderHeaderDates}
        />
      </div>
    );
  }
}

Week.propTypes = propTypes;

export default Week;
