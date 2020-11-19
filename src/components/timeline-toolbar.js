import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Picker from '@seafile/seafile-calendar/lib/Picker';
import RangeCalendar from '@seafile/seafile-calendar/lib/RangeCalendar';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { NAVIGATE, GRID_VIEWS, zIndexs, DATE_UNIT, DATE_FORMAT } from '../constants';
import intl from 'react-intl-universal';

import '@seafile/seafile-calendar/assets/index.css';

const propTypes = {
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  isShowUsers: PropTypes.bool,
  canNavigateToday: PropTypes.bool,
  onShowUsersToggle: PropTypes.func,
  onNavigate: PropTypes.func,
  onTimelineSettingToggle: PropTypes.func,
  onSelectGridView: PropTypes.func,
};

class TimelineToolbar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedRangeDates: [moment(props.gridStartDate), moment(props.gridEndDate)],
      isSelectViewDropdownOpen: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.gridStartDate !== this.props.gridStartDate ||
      nextProps.gridEndDate !== this.props.gridEndDate) {
      this.setState({
        selectedRangeDates: [moment(nextProps.gridStartDate), moment(nextProps.gridEndDate)]
      });
    }
  }

  onSelectViewToggle = () => {
    this.setState({isSelectViewDropdownOpen: !this.state.isSelectViewDropdownOpen});
  }

  getDisplaySelectedGridView = () => {
    let { selectedGridView } = this.props;
    switch (selectedGridView) {
      case GRID_VIEWS.YEAR: {
        return intl.get('Grid_view_year');
      }
      case GRID_VIEWS.MONTH: {
        return intl.get('Grid_view_month');
      }
      default: {
        return intl.get('Grid_view_day');
      }
    }
  }

  renderDatePicker = () => {
    const { selectedRangeDates } = this.state;
    return (
      <Picker
        value={selectedRangeDates}
        calendar={this.renderRangeCalendar()}
        style={{ zIndex: zIndexs.RC_CALENDAR }}
        onOpenChange={this.onOpenChange}
        onChange={this.onDatePickerChange}
      >
        {
          ({ value }) => {
            return (
              <span>
                <input
                  readOnly
                  className="ant-calendar-picker-input ant-input"
                  value={value && value[0] && value[1] ? `${value[0].format('YYYY')} - ${value[1].format('YYYY')}` : ''}
                />
              </span>
            );
          }
        }
      </Picker>
    );
  }

  renderRangeCalendar = () => {
    const { selectedRangeDates } = this.state;
    return (
      <RangeCalendar
        className={'timeline-toolbar-range-calendar'}
        showToday={false}
        mode={[DATE_UNIT.YEAR, DATE_UNIT.YEAR]}
        format={DATE_FORMAT.YEAR}
        defaultValue={selectedRangeDates}
        onPanelChange={this.onChangeSelectedRangeDates}
      />
    );
  }

  disabledDate = (current) => {
    const { selectedRangeDates } = this.state;
    if (!selectedRangeDates || selectedRangeDates.length === 0) {
      return false;
    }
    const tooLate = selectedRangeDates[0] && current.diff(selectedRangeDates[0], DATE_UNIT.YEAR) > 3;
    const tooEarly = selectedRangeDates[1] && selectedRangeDates[1].diff(current, DATE_UNIT.YEAR) > 3;
    return tooEarly || tooLate;
  }

  onChangeSelectedRangeDates = (dates) => {
    this.setState({selectedRangeDates: dates});
  }

  onDatePickerChange = (dates) => {
    this.setState({selectedRangeDates: dates});
  }

  onOpenChange = (open) => {
    if (!open) {
      const { selectedRangeDates } = this.state;
      const { selectedGridView, gridStartDate, gridEndDate } = this.props;

      // not changed.
      if (selectedRangeDates[0].isSame(gridStartDate) &&
        selectedRangeDates[1].isSame(gridEndDate)) {
        return;
      }

      // not allowed date range.
      const startDate = selectedRangeDates[0].startOf(DATE_UNIT.YEAR).format(DATE_FORMAT.YEAR_MONTH_DAY);
      const endDate = selectedRangeDates[1].endOf(DATE_UNIT.YEAR).format(DATE_FORMAT.YEAR_MONTH_DAY);
      const diffs = selectedRangeDates[1].diff(selectedRangeDates[0], DATE_UNIT.YEAR);
      if ((selectedGridView === GRID_VIEWS.YEAR && diffs < 2) ||
        ((selectedGridView === GRID_VIEWS.MONTH || selectedGridView === GRID_VIEWS.DAY) &&
        selectedRangeDates[1].isBefore(selectedRangeDates[0]))
      ) {
        const { gridStartDate, gridEndDate } = this.props;
        this.setState({
          selectedRangeDates: [moment(gridStartDate), moment(gridEndDate)]
        });
        return;
      }

      this.props.updateSelectedRange(startDate, endDate);
    }
  }

  render() {
    let { onShowUsersToggle, isShowUsers, canNavigateToday, onNavigate, onTimelineSettingToggle } = this.props;
    let displaySelectedGridView = this.getDisplaySelectedGridView();
    return (
      <div className="timeline-toolbar d-flex align-items-center justify-content-between">
        <div className="toolbar-left d-flex justify-content-center position-absolute" style={{width: 40, zIndex: zIndexs.TOOLBAR}}>
          <div className="toggle-drawer-btn" onClick={onShowUsersToggle}>
            <i className={`dtable-font ${isShowUsers ? 'dtable-icon-retract-com' : 'dtable-icon-open-com'}`}></i>
          </div>
        </div>
        <div className="toolbar-right d-flex align-items-center position-absolute" style={{zIndex: zIndexs.TOOLBAR}}>
          <div className="btn-date-range d-flex">
            {this.renderDatePicker()}
          </div>
          <div className="btn-select-view">
            <Dropdown group isOpen={this.state.isSelectViewDropdownOpen} size="sm" toggle={this.onSelectViewToggle}>
              <DropdownToggle caret>
                {displaySelectedGridView}
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={this.props.onSelectGridView.bind(this, GRID_VIEWS.YEAR)}>{intl.get('Grid_view_year')}</DropdownItem>
                <DropdownItem onClick={this.props.onSelectGridView.bind(this, GRID_VIEWS.MONTH)}>{intl.get('Grid_view_month')}</DropdownItem>
                <DropdownItem onClick={this.props.onSelectGridView.bind(this, GRID_VIEWS.DAY)}>{intl.get('Grid_view_day')}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className="btn-switch-group">
            <span className="btn-switch-icon" onClick={onNavigate.bind(this, NAVIGATE.PREVIOUS)}>
              <i className="dtable-font dtable-icon-left"></i>
            </span>
            <span className="btn-switch-split-line"></span>
            <span className="btn-switch-icon" onClick={onNavigate.bind(this, NAVIGATE.NEXT)}>
              <i className="dtable-font dtable-icon-right"></i>
            </span>
          </div>
          <div
            className={`btn-today ${!canNavigateToday && 'btn-today-disabled'}`}
            onClick={canNavigateToday ? onNavigate.bind(this, NAVIGATE.TODAY) : undefined}
          >{intl.get('Today')}</div>
          <div className="btn-setting" id="btn_setting" onClick={onTimelineSettingToggle}>
            <i className="dtable-font dtable-icon-settings"></i>
          </div>
        </div>
      </div>
    );
  }
}

TimelineToolbar.propTypes = propTypes;

export default TimelineToolbar;