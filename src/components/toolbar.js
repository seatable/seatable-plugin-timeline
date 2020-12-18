import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { NAVIGATE, GRID_VIEWS, zIndexes, DATE_UNIT, DATE_FORMAT } from '../constants';
import * as EventTypes from '../constants/event-types';

import intl from 'react-intl-universal';

const propTypes = {
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  isShowUsers: PropTypes.bool,
  eventBus: PropTypes.object,
  canNavigateToday: PropTypes.bool,
  onShowUsersToggle: PropTypes.func,
  onNavigate: PropTypes.func,
  onTimelineSettingToggle: PropTypes.func,
  onSelectGridView: PropTypes.func,
};

class Toolbar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isSelectViewDropdownOpen: false,
      currentDate: moment(props.selectedDate).format(DATE_FORMAT.YEAR_MONTH),
    };
    this.viewportRightScrollLeft = 0;
  }

  componentDidMount() {
    this.unsubscribeGridHorizontalScroll = this.props.eventBus.subscribe(EventTypes.VIEWPORT_RIGHT_SCROLL, this.viewportRightScroll);
  }

  componentWillUnmount() {
    this.unsubscribeGridHorizontalScroll();
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

  renderCurrentDate = () => {
    const { selectedGridView } = this.props;
    if (selectedGridView === GRID_VIEWS.DAY) {
      const { currentDate } = this.state;
      return (
        <div className="current-date d-flex align-items-center">
          <span className="year">{moment(currentDate).format(DATE_FORMAT.YEAR)}</span>
          -
          <span className="month" ref={ref => this.currentDateOfMonth = ref}>{moment(currentDate).format(DATE_FORMAT.MONTH)}</span>
        </div>
      );
    }
    return null;
  }

  onSelectViewToggle = () => {
    this.setState({isSelectViewDropdownOpen: !this.state.isSelectViewDropdownOpen});
  }

  viewportRightScroll = ({visibleStartDate, scrollLeft}) => {
    const { selectedGridView } = this.props;
    const { currentDate } = this.state;
    if (selectedGridView === GRID_VIEWS.DAY) {
      let newDate;
      if (scrollLeft - this.viewportRightScrollLeft > 0) {
        // scroll ro right.
        newDate = moment(visibleStartDate).add(2, DATE_UNIT.DAY);
      } else if (scrollLeft - this.viewportRightScrollLeft <= 0) {
        // scroll to left.
        newDate = moment(visibleStartDate).add(1, DATE_UNIT.DAY);
      }
      const formattedNewDate = newDate.format(DATE_FORMAT.YEAR_MONTH);
      if (formattedNewDate === currentDate) {
        return;
      }
      this.setState({currentDate: formattedNewDate});
    }
  }

  render() {
    let { onShowUsersToggle, isShowUsers, canNavigateToday, onNavigate, onTimelineSettingToggle } = this.props;
    let displaySelectedGridView = this.getDisplaySelectedGridView();
    return (
      <div className="timeline-toolbar d-flex position-relative align-items-center justify-content-between">
        {isShowUsers && <div className="blank-zone position-absolute" style={{zIndex: zIndexes.TOOLBAR_BLANK_ZONE}}></div>}
        <div className="toolbar-left d-flex justify-content-center position-absolute" style={{zIndex: zIndexes.TOOLBAR, left: isShowUsers ? 180 : 0}}>
          <div className="toggle-drawer-btn" onClick={onShowUsersToggle}>
            <i className={`dtable-font ${isShowUsers ? 'dtable-icon-retract-com' : 'dtable-icon-open-com'}`}></i>
          </div>
          {this.renderCurrentDate()}
        </div>
        <div className="toolbar-right d-flex align-items-center position-absolute" style={{zIndex: zIndexes.TOOLBAR}}>
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

Toolbar.propTypes = propTypes;

export default Toolbar;