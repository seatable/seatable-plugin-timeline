import React from 'react';
import PropTypes from 'prop-types';
import HeaderYears from '../header/header-years';
import HeaderDays from '../header/header-days';
import { dates } from '../../utils';
import { DATE_UNIT, DATE_FORMAT } from '../../constants';
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

class Day extends React.Component {

  renderHeaderYears = (props) => {
    let { overScanDates, columnWidth } = props;
    return (
      <HeaderYears
        selectedGridView={this.props.selectedGridView}
        yearDates={dates.getUniqueDates(overScanDates, DATE_UNIT.MONTH, DATE_FORMAT.YEAR_MONTH)}
        columnWidth={columnWidth}
      />
    );
  }

  renderHeaderDates = (props) => {
    let { overScanDates, columnWidth } = props;
    return (
      <HeaderDays
        overScanDates={overScanDates}
        columnWidth={columnWidth}
      />
    );
  }

  render() {
    return (
      <div className="timeline-day-view timeline-grid-view">
        <Grid
          {...this.props}
          renderHeaderYears={this.renderHeaderYears}
          renderHeaderDates={this.renderHeaderDates}
        />
      </div>
    );
  }
}

Day.propTypes = propTypes;

export default Day;
