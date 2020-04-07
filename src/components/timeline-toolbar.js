import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { NAVIGATE, GRID_VIEWS, zIndexs } from '../constants';
import intl from 'react-intl-universal';
import '../locale';

const propTypes = {
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  isShowUsers: PropTypes.bool,
  isToday: PropTypes.bool,
  onShowUsersToggle: PropTypes.func,
  onNavigate: PropTypes.func,
  onTimelineSettingToggle: PropTypes.func,
  onSelectGridView: PropTypes.func,
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

  render() {
    let { onShowUsersToggle, isShowUsers, isToday, onNavigate, onTimelineSettingToggle } = this.props;
    let displaySelectedGridView = this.getDisplaySelectedGridView();
    return (
      <div className="timeline-toolbar d-flex align-items-center justify-content-between">
        <div className="toolbar-left d-flex justify-content-center position-absolute" style={{width: 40, zIndex: zIndexs.TOOLBAR}}>
          <div className="toggle-drawer-btn" onClick={onShowUsersToggle}>
            <i className={`dtable-font ${isShowUsers ? `dtable-icon-retract-com` : `dtable-icon-open-com`}`}></i>
          </div>
        </div>
        <div className="toolbar-right d-flex align-items-center position-absolute" style={{zIndex: zIndexs.TOOLBAR}}>
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