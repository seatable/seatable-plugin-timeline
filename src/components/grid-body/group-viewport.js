import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ViewportLeft from './viewport-left';
import ViewportRight from './viewport-right';
import { getGroupViewportState, getGroupsHeight, getGroupVisibleBoundaries } from '../../utils/group-viewport-utils';
import { zIndexes, HEADER_HEIGHT } from '../../constants';
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
    const { groups } = this.props;
    const { foldedGroups } = this.state;
    this.setState({
      ...getGroupViewportState(this.getViewportHeight(), groups, foldedGroups)
    });
    this.unsubscribeResetScrollTop = this.props.eventBus.subscribe(EventTypes.RESET_VIEWPORT_SCROLL_TOP, this.onResetViewportScrollTop);
  }

  componentWillUnmount() {
    this.unsubscribeResetScrollTop();
  }

  getViewportHeight = () => {
    return this.groupViewport.offsetHeight - HEADER_HEIGHT;
  }

  onResetViewportScrollTop = () => {
    this.viewportLeft && this.viewportLeft.setCanvasLeftScroll(0);
    this.viewportRight && this.viewportRight.setCanvasRightScroll(0);
    this.updateScroll(0);
  }

  onExpandGroupToggle = (groupIndex) => {
    const { groups } = this.props;
    const { foldedGroups, groupVisibleStartIdx: oldGroupVisibleStartIdx } = this.state;
    const updatedGroupIndex = groupIndex + oldGroupVisibleStartIdx;
    let newFoldedGroups = [...foldedGroups];
    if (!groups[updatedGroupIndex]) return;
    const targetIndex = newFoldedGroups.indexOf(updatedGroupIndex);
    if (targetIndex > -1) {
      newFoldedGroups.splice(targetIndex, 1);
    } else {
      newFoldedGroups.push(updatedGroupIndex);
    }
    this.setState({
      foldedGroups: newFoldedGroups,
      ...getGroupVisibleBoundaries(this.getViewportHeight(), this.scrollTop, groups, newFoldedGroups),
    });
  }

  getRenderedGroups = (groups, groupVisibleStartIdx, groupVisibleEndIdx) => {
    const groupsLength = groups.length;

    // can not get valid groups data if groupVisibleStartIdx or groupVisibleEndIdx is greater current groupsLength, then return empty list.
    if (groupVisibleStartIdx >= groupsLength || groupVisibleEndIdx >= groupsLength) {
      return [];
    }
    let i = groupVisibleStartIdx;
    let renderGroups = [];
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
    const { groups } = this.props;
    const { foldedGroups } = this.state;
    this.scrollTop = scrollTop;
    this.setState({
      ...getGroupVisibleBoundaries(this.getViewportHeight(), scrollTop, groups, foldedGroups),
    });
  }

  render() {
    const {
      gridStartDate, gridEndDate, isShowUsers, selectedGridView, selectedDate, renderHeaderYears,
      renderHeaderDates, updateSelectedDate, eventBus, onRowExpand, changedSelectedByScroll,
      onViewportRightScroll, groups, isRenderAll, columns, collaborators, settings,
    } = this.props;
    const { foldedGroups, groupVisibleStartIdx, groupVisibleEndIdx } = this.state;
    const groupsLen = groups.length;
    let renderedGroups;
    let topOffset;
    let bottomOffset;
    if (isRenderAll) {
      renderedGroups = [...groups];
      topOffset = 0;
      bottomOffset = 0;
    } else {
      renderedGroups = this.getRenderedGroups(groups, groupVisibleStartIdx, groupVisibleEndIdx);
      topOffset = groupVisibleStartIdx > 0 ? getGroupsHeight(groups, foldedGroups, 0, groupVisibleStartIdx) : 0;
      bottomOffset = (groupsLen - groupVisibleEndIdx) > 0 ? getGroupsHeight(groups, foldedGroups, groupVisibleEndIdx + 1, groupsLen) : 0;
    }
    const { display_as_swimlane } = settings;
    return (
      <div
        className={classnames('timeline-group-viewport viewport d-flex', {
          'is-swimlane': display_as_swimlane,
        })}
        ref={ref => this.groupViewport = ref}
      >
        {isShowUsers &&
          <div className="left-pane-wrapper" style={{zIndex: zIndexes.LEFT_PANE_WRAPPER}}>
            <ViewportLeft
              isGroupView
              ref={node => this.viewportLeft = node}
              groupVisibleStartIdx={groupVisibleStartIdx}
              groups={renderedGroups}
              foldedGroups={foldedGroups}
              topOffset={topOffset}
              bottomOffset={bottomOffset}
              onExpandGroupToggle={this.onExpandGroupToggle}
              onViewportLeftScroll={this.onViewportLeftScroll}
              columns={columns}
              columnsVisible={!display_as_swimlane}
              collaborators={collaborators}
              settings={settings}
              onModifyTimelineSettings={this.props.onModifyTimelineSettings}
              tableID={this.props.tableID}
              formulaRows={this.props.formulaRows}
            />
          </div>
        }
        <ViewportRight
          isGroupView
          ref={node => this.viewportRight = node}
          isShowUsers={isShowUsers}
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
          onModifyRow={this.props.onModifyRow}
        />
      </div>
    );
  }
}

GroupViewport.propTypes = {
  isRenderAll: PropTypes.bool,
  isShowUsers: PropTypes.bool,
  columns: PropTypes.array,
  collaborators: PropTypes.array,
  settings: PropTypes.object,
  tableID: PropTypes.string,
  formulaRows: PropTypes.object,
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
  onModifyRow: PropTypes.func,
  onModifyTimelineSettings: PropTypes.func,
};

export default GroupViewport;
