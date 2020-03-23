import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { dates } from '../utils';
import { DATE_UNIT, NAVIGATE } from '../constants';
import intl from 'react-intl-universal';
import '../locale';

const propTypes = {
  selectedDate: PropTypes.string,
  isShowUsers: PropTypes.bool,
  isToday: PropTypes.bool,
  onShowUsersToggle: PropTypes.func,
  onNavigate: PropTypes.func,
  onTimelineSettingToggle: PropTypes.func,
};

class TimelineToolbar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isSelectViewDropdownOpen: false
    };
  }

  onSelectViewToggle = () => {
    this.setState({isSelectViewDropdownOpen: !this.state.isSelectViewDropdownOpen});
  }

  render() {
    let { selectedDate, onShowUsersToggle, isShowUsers, isToday, onNavigate, onTimelineSettingToggle } = this.props;
    let year = dates.getDateWithUnit(selectedDate, DATE_UNIT.YEAR);
    let month = dates.getDateWithUnit(selectedDate, DATE_UNIT.MONTH);
    return (
      <div className="timeline-toolbar d-flex align-items-center justify-content-between">
        <div className="toolbar-left d-flex align-items-center">
          <div className="toggle-drawer-btn" onClick={onShowUsersToggle}>
            <i className={`dtable-font ${isShowUsers ? `dtable-icon-retract-com` : `dtable-icon-open-com`}`}></i>
          </div>
          <div className="current-date">{intl.get('Year_Month', {year, month})}</div>
        </div>
        <div className="toolbar-right d-flex align-items-center">
          <div className="btn-select-view">
            <Dropdown group isOpen={this.state.isSelectViewDropdownOpen} size="sm" toggle={this.onSelectViewToggle}>
              <DropdownToggle caret>
                {intl.get('Month')}
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem>{intl.get('Month')}</DropdownItem>
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
            className={`btn-today ${isToday && `btn-today-disabled`}`}
            onClick={!isToday ? onNavigate.bind(this, NAVIGATE.TODAY) : undefined}
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