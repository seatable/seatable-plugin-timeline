import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import intl from 'react-intl-universal';
import GroupItemRight from './group-item-right';
import { GRID_VIEWS, DATE_UNIT, DATE_FORMAT, zIndexes } from '../../constants';
import { isGroupExpanded } from '../../utils/group-viewport-utils';

const noEventsTips = <div className="no-events">{intl.get('There_are_no_records')}</div>;

class GroupCanvasRight extends Component {

  renderGroups = () => {
    let { selectedGridView, selectedDate, renderedDates, overScanDates, columnWidth, groupVisibleStartIdx,
      groups, foldedGroups } = this.props;
    if (groups.length === 0) {
      return noEventsTips;
    }
    return groups.map((group, index) => {
      const isExpanded = isGroupExpanded(foldedGroups, index + groupVisibleStartIdx);
      return (
        <GroupItemRight
          isExpanded={isExpanded}
          key={`group-item-right-${group.key}`}
          selectedGridView={selectedGridView}
          selectedDate={selectedDate}
          renderedDates={renderedDates}
          overScanDates={overScanDates}
          columnWidth={columnWidth}
          group={group}
          eventBus={this.props.eventBus}
          onRowExpand={this.props.onRowExpand}
          onModifyRow={this.props.onModifyRow}
        />
      );
    });
  }

  renderTodayMarkLine = () => {
    let { overScanDates, selectedGridView, columnWidth, groups } = this.props;
    if (groups.length === 0) return null;
    let today = moment();
    if (selectedGridView === GRID_VIEWS.YEAR) {
      today = today.startOf(DATE_UNIT.MONTH);
    }
    today = today.format(DATE_FORMAT.YEAR_MONTH_DAY);
    let todayIndex = overScanDates.indexOf(today);
    if (todayIndex < 0) return null;
    const lineStyle = {
      top: 0,
      height: '100%',
      left: todayIndex * columnWidth + columnWidth / 2,
      zIndex: zIndexes.TODAY_MARK_LINE,
    };
    return (
      <div className="today-mark-line" style={lineStyle}></div>
    );
  }

  onCanvasRightScroll = (evt) => {
    evt.stopPropagation();
    if (!this.activeScroll) {
      this.activeScroll = true;
      return;
    }
    this.props.onCanvasRightScroll(evt.target.scrollTop);
  }

  setCanvasRightScroll = (scrollTop) => {
    this.activeScroll = false;
    this.groupCanvasRight.scrollTop = scrollTop;
  }

  render() {
    let { overScanDates, columnWidth, topOffset, bottomOffset, startOffset, endOffset, groups } = this.props;
    const canvasRightStyle = {
      width: overScanDates.length * columnWidth + startOffset + endOffset,
      paddingLeft: startOffset,
      paddingRight: endOffset,
      zIndex: zIndexes.CANVAS_RIGHT
    };
    const groupsWrapperStyle = {paddingTop: topOffset, paddingBottom: bottomOffset};
    return (
      <div className="group-canvas-right" ref={ref => this.groupCanvasRight = ref} style={canvasRightStyle} onScroll={this.onCanvasRightScroll}>
        <div className="groups-wrapper" style={groupsWrapperStyle}>
          <div className="position-relative" style={{width: '100%', height: '100%'}}>
            {this.renderGroups()}
            {groups.length > 0 && this.renderTodayMarkLine()}
          </div>
        </div>
      </div>
    );
  }
}

GroupCanvasRight.propTypes = {
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  overScanDates: PropTypes.array,
  renderedDates: PropTypes.array,
  columnWidth: PropTypes.number,
  topOffset: PropTypes.number,
  bottomOffset: PropTypes.number,
  startOffset: PropTypes.number,
  endOffset: PropTypes.number,
  groupVisibleStartIdx: PropTypes.number,
  groups: PropTypes.array,
  foldedGroups: PropTypes.array,
  eventBus: PropTypes.object,
  onRowExpand: PropTypes.func,
  onCanvasRightScroll: PropTypes.func,
  onModifyRow: PropTypes.func,
};

export default GroupCanvasRight;
