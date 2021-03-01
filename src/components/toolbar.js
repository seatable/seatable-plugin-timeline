import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import intl from 'react-intl-universal';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { NAVIGATE, GRID_VIEWS, zIndexes, DATE_UNIT, DATE_FORMAT } from '../constants';
import * as EventTypes from '../constants/event-types';

const propTypes = {
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  isShowUsers: PropTypes.bool,
  eventBus: PropTypes.object,
  canNavigateToday: PropTypes.bool,
  onShowUsersToggle: PropTypes.func,
  onNavigate: PropTypes.func,
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
        <div className="current-date">
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

  onSelectGridView = (view) => {
    if (Object.prototype.toString.call(this.props.onSelectGridView) === '[object Function]') {
      this.props.onSelectGridView(view);
    }
  }

  onNavigate = (action) => {
    if (Object.prototype.toString.call(this.props.onNavigate) === '[object Function]') {
      this.props.onNavigate(action);
    }
  }

  getLeftPos = () => {
    let left = 0;
    const { settings, columns } = this.props;
    const { columns: configuredColumns } = settings;
    if (!configuredColumns) {
      // show the first column by default
      left = columns[0].width; 
    } else {
      const shownColumns = configuredColumns.filter(column => column.shown);
      shownColumns.forEach(column => {
        left += column.width;
      });
    }
    left = Math.max(left, 180);
    return left;
  }

  render() {
    let { onShowUsersToggle, isShowUsers, canNavigateToday } = this.props;
    let displaySelectedGridView = this.getDisplaySelectedGridView();
    return (
      <div className="timeline-toolbar">
        {isShowUsers && <div className="blank-zone" style={{zIndex: zIndexes.TOOLBAR_BLANK_ZONE}}></div>}
        <div className="toolbar-left" style={{zIndex: zIndexes.TOOLBAR, left: isShowUsers ? this.getLeftPos(): 0}}>
          <div className="toggle-drawer-btn" onClick={onShowUsersToggle}>
            <i className={`dtable-font ${isShowUsers ? 'dtable-icon-retract-com' : 'dtable-icon-open-com'}`}></i>
          </div>
          {this.renderCurrentDate()}
        </div>
        <div className="toolbar-right" style={{zIndex: zIndexes.TOOLBAR}}>
          <div className="btn-select-view">
            <Dropdown group isOpen={this.state.isSelectViewDropdownOpen} size="sm" toggle={this.onSelectViewToggle}>
              <DropdownToggle caret>
                {displaySelectedGridView}
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={this.onSelectGridView.bind(this, GRID_VIEWS.YEAR)}>{intl.get('Grid_view_year')}</DropdownItem>
                <DropdownItem onClick={this.onSelectGridView.bind(this, GRID_VIEWS.MONTH)}>{intl.get('Grid_view_month')}</DropdownItem>
                <DropdownItem onClick={this.onSelectGridView.bind(this, GRID_VIEWS.DAY)}>{intl.get('Grid_view_day')}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className="btn-switch-group">
            <span className="btn-switch-icon" onClick={this.onNavigate.bind(this, NAVIGATE.PREVIOUS)}>
              <i className="dtable-font dtable-icon-left"></i>
            </span>
            <span className="btn-switch-split-line"></span>
            <span className="btn-switch-icon" onClick={this.onNavigate.bind(this, NAVIGATE.NEXT)}>
              <i className="dtable-font dtable-icon-right"></i>
            </span>
          </div>
          <div
            className={`btn-today ${!canNavigateToday && 'btn-today-disabled'}`}
            onClick={canNavigateToday ? this.onNavigate.bind(this, NAVIGATE.TODAY) : undefined}
          >{intl.get('Today')}</div>
        </div>
      </div>
    );
  }
}

Toolbar.propTypes = propTypes;

export default Toolbar;
