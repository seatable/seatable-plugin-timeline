import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Viewport from './timeline-body/viewport';
import GroupViewport from './timeline-body/group-viewport';

class Grid extends Component {

  renderViewport = () => {
    let { isGroupView, gridStartDate, gridEndDate, isShowUsers, selectedGridView, selectedDate, renderHeaderYears,
      renderHeaderDates, rows, groups, eventBus, changedSelectedByScroll, onViewportRightScroll, updateSelectedDate,
      onRowExpand } = this.props;
    let CustomViewport = Viewport;
    let baseProps = { gridStartDate, gridEndDate, isShowUsers, selectedGridView, selectedDate,
      renderHeaderYears, renderHeaderDates, changedSelectedByScroll, eventBus, updateSelectedDate,
      onRowExpand, onViewportRightScroll };
    let customProps = {};
    if (isGroupView) {
      CustomViewport = GroupViewport;
      customProps = { groups };
    } else {
      customProps = { rows };
    }
    return (
      <CustomViewport
        {...baseProps}
        {...customProps}
      />
    );
  }

  render() {
    return this.renderViewport();
  }
}

Grid.propTypes = {
  isShowUsers: PropTypes.bool,
  isGroupView: PropTypes.bool,
  changedSelectedByScroll: PropTypes.bool,
  gridStartDate: PropTypes.string,
  gridEndDate: PropTypes.string,
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  rows: PropTypes.array,
  groups: PropTypes.array,
  eventBus: PropTypes.object,
  renderHeaderYears: PropTypes.func,
  renderHeaderDates: PropTypes.func,
  onViewportRightScroll: PropTypes.func,
  updateSelectedDate: PropTypes.func,
  onRowExpand: PropTypes.func,
};

export default Grid;