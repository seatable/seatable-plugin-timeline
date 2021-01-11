import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ViewportLeft from './viewport-left';
import ViewportRight from './viewport-right';
import { zIndexes, HEADER_HEIGHT } from '../../constants';
import { getGroupViewportState, getGroupsHeight, getGroupVisibleBoundaries } from '../../utils/group-viewport-utils';
import * as EventTypes from '../../constants/event-types';

class GroupViewport extends Component {

  constructor(props) {
    super(props);
    this.state = {
      foldedGroups: [],
      groupVisibleStartIdx: 0,
      groupVisibleEndIdx: 0,
    };
    this.scrollTop = 0;
  }

  componentDidMount() {
    window.timelineViewport = this;
    let groupViewportHeight = this.groupViewport.offsetHeight - HEADER_HEIGHT;
    let { groups } = this.props;
    let { foldedGroups } = this.state;
    this.setState({
      ...getGroupViewportState(groupViewportHeight, groups, foldedGroups)
    });
    this.unsubscribeResetScrollTop = this.props.eventBus.subscribe(EventTypes.RESET_VIEWPORT_SCROLL_TOP, this.onResetViewportScrollTop);
  }

  componentWillUnmount() {
    this.unsubscribeResetScrollTop();
  }

  onResetViewportScrollTop = () => {
    this.viewportLeft && this.viewportLeft.setCanvasLeftScroll(0);
    this.viewportRight && this.viewportRight.setCanvasRightScroll(0);
    this.updateScroll(0);
  }

  onExpandGroupToggle = (groupIndex) => {
    let { groups } = this.props;
    let { foldedGroups, groupVisibleStartIdx: oldGroupVisibleStartIdx } = this.state;
    let newFoldedGroups = [...foldedGroups];
    let updatedGroupIndex = groupIndex + oldGroupVisibleStartIdx;
    let updatedGroup = groups[updatedGroupIndex];
    if (!updatedGroup) return;
    let targetIndex = newFoldedGroups.indexOf(updatedGroupIndex);
    if (targetIndex > -1) {
      newFoldedGroups.splice(targetIndex, 1);
    } else {
      newFoldedGroups.push(updatedGroupIndex);
    }
    let groupViewportHeight = this.groupViewport.offsetHeight - HEADER_HEIGHT;
    let { groupVisibleStartIdx, groupVisibleEndIdx } = getGroupVisibleBoundaries(groupViewportHeight, this.scrollTop, groups, newFoldedGroups);
    this.setState({
      foldedGroups: newFoldedGroups,
      groupVisibleStartIdx,
      groupVisibleEndIdx
    });
  }

  getRenderedGroups = (groups, groupVisibleStartIdx, groupVisibleEndIdx) => {
    let groupsLength = groups.length;
    if (groupVisibleStartIdx >= groupsLength || groupVisibleEndIdx > groupsLength) {
      return [];
    }
    let i = groupVisibleStartIdx, renderGroups = [];
    while (i <= groupVisibleEndIdx) {
      renderGroups.push(groups[i]);
      i++;
    }
    return renderGroups;
  }

  onViewportLeftScroll = (scrollTop) => {
    this.viewportRight && this.viewportRight.setCanvasRightScroll(scrollTop);
    this.updateScroll(scrollTop);
  }

  onCanvasRightScroll = (scrollTop) => {
    this.viewportLeft && this.viewportLeft.setCanvasLeftScroll(scrollTop);
    this.updateScroll(scrollTop);
  }

  updateScroll = (scrollTop) => {
    let { groups } = this.props;
    let { foldedGroups } = this.state;
    let groupViewportHeight = this.groupViewport.offsetHeight - HEADER_HEIGHT;
    let { groupVisibleStartIdx, groupVisibleEndIdx } = getGroupVisibleBoundaries(groupViewportHeight, scrollTop, groups, foldedGroups);
    this.scrollTop = scrollTop;
    this.setState({
      groupVisibleStartIdx,
      groupVisibleEndIdx,
    });
  }

  render() {
    let { gridStartDate, gridEndDate, isShowUsers, selectedGridView, selectedDate, renderHeaderYears,
      renderHeaderDates, updateSelectedDate, eventBus, onRowExpand, changedSelectedByScroll,
      onViewportRightScroll, groups, isRenderAll } = this.props;
    let { foldedGroups, groupVisibleStartIdx, groupVisibleEndIdx } = this.state;
    const groupsLen = groups.length;
    let renderedGroups, topOffset, bottomOffset;
    if (isRenderAll) {
      renderedGroups = [...groups];
      topOffset = 0;
      bottomOffset = 0;
    } else {
      renderedGroups = this.getRenderedGroups(groups, groupVisibleStartIdx, groupVisibleEndIdx);
      topOffset = groupVisibleStartIdx > 0 ? getGroupsHeight(groups, foldedGroups, 0, groupVisibleStartIdx) : 0;
      bottomOffset = (groupsLen - groupVisibleEndIdx) > 0 ? getGroupsHeight(groups, foldedGroups, groupVisibleEndIdx + 1, groupsLen) : 0;
    }
    return (
      <div className="timeline-group-viewport viewport" ref={ref => this.groupViewport = ref}>
        {isShowUsers &&
          <div className="left-pane-wrapper" style={{zIndex: zIndexes.LEFT_PANE_WRAPPER}}>
            <ViewportLeft
              ref={node => this.viewportLeft = node}
              isGroupView={true}
              groupVisibleStartIdx={groupVisibleStartIdx}
              groups={renderedGroups}
              foldedGroups={foldedGroups}
              topOffset={topOffset}
              bottomOffset={bottomOffset}
              onExpandGroupToggle={this.onExpandGroupToggle}
              onViewportLeftScroll={this.onViewportLeftScroll}
            />
          </div>
        }
        <ViewportRight
          ref={node => this.viewportRight = node}
          isShowUsers={isShowUsers}
          isGroupView={true}
          gridStartDate={gridStartDate}
          gridEndDate={gridEndDate}
          groupVisibleStartIdx={groupVisibleStartIdx}
          groups={renderedGroups}
          foldedGroups={foldedGroups}
          topOffset={topOffset}
          bottomOffset={bottomOffset}
          selectedGridView={selectedGridView}
          selectedDate={selectedDate}
          eventBus={eventBus}
          changedSelectedByScroll={changedSelectedByScroll}
          renderHeaderYears={renderHeaderYears}
          renderHeaderDates={renderHeaderDates}
          isRenderAll={isRenderAll}
          updateSelectedDate={updateSelectedDate}
          onRowExpand={onRowExpand}
          onCanvasRightScroll={this.onCanvasRightScroll}
          onViewportRightScroll={onViewportRightScroll}
        />
      </div>
    );
  }
}

GroupViewport.propTypes = {
  isShowUsers: PropTypes.bool,
  gridStartDate: PropTypes.string,
  gridEndDate: PropTypes.string,
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  groups: PropTypes.array,
  eventBus: PropTypes.object,
  changedSelectedByScroll: PropTypes.bool,
  renderHeaderYears: PropTypes.func,
  renderHeaderDates: PropTypes.func,
  updateSelectedDate: PropTypes.func,
  onViewportRightScroll: PropTypes.func,
  onRowExpand: PropTypes.func,
};

export default GroupViewport;