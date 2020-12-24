import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ViewportLeft from './viewport-left';
import ViewportRight from './viewport-right';
import { zIndexes, HEADER_HEIGHT, ROW_HEIGHT } from '../../constants';
import * as EventTypes from '../../constants/event-types';
import { getViewportState, getVisibleBoundaries, getRowOverScanStartIdx, getRowOverScanEndIdx } from '../../utils/viewport-utils';

class Viewport extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    window.timelineViewport = this;
    let viewportHeight = this.viewport.offsetHeight - HEADER_HEIGHT;
    let { rows } = this.props;
    this.setState({
      ...getViewportState(viewportHeight, rows.length)
    });
    this.unsubscribeResetScrollTop = this.props.eventBus.subscribe(EventTypes.RESET_VIEWPORT_SCROLL_TOP, this.onResetViewportScrollTop);
  }

  componentWillUnmount() {
    this.unsubscribeResetScrollTop();
  }

  getRenderedRows = (rowOverScanStartIdx, rowOverScanEndIdx) => {
    let { rows } = this.props;
    let rowsLength = rows.length;
    if (rowOverScanStartIdx >= rowsLength || rowOverScanEndIdx > rowsLength) {
      return [];
    }
    let i = rowOverScanStartIdx, renderRows = [];
    while (i < rowOverScanEndIdx) {
      renderRows.push(rows[i]);
      i++;
    }
    return renderRows;
  }

  onViewportLeftScroll = (scrollTop) => {
    this.viewportRight && this.viewportRight.setCanvasRightScroll(scrollTop);
    this.updateScroll(scrollTop);
  }

  onCanvasRightScroll = (scrollTop) => {
    this.viewportLeft && this.viewportLeft.setCanvasLeftScroll(scrollTop);
    this.updateScroll(scrollTop);
  }

  onResetViewportScrollTop = () => {
    this.viewportLeft && this.viewportLeft.setCanvasLeftScroll(0);
    this.viewportRight && this.viewportRight.setCanvasRightScroll(0);
    this.updateScroll(0);
  }

  updateScroll = (scrollTop) => {
    this.scrollTop = scrollTop;
    let { rows } = this.props;
    let rowsCount = rows.length;
    let viewportHeight = this.viewport.offsetHeight - HEADER_HEIGHT;
    let { rowVisibleStartIdx, rowVisibleEndIdx } = getVisibleBoundaries(viewportHeight, scrollTop, rowsCount);
    let rowOverScanStartIdx = getRowOverScanStartIdx(rowVisibleStartIdx);
    let rowOverScanEndIdx = getRowOverScanEndIdx(rowVisibleEndIdx, rowsCount);
    this.setState({
      rowVisibleStartIdx,
      rowVisibleEndIdx,
      rowOverScanStartIdx,
      rowOverScanEndIdx
    });
  }

  render() {
    let { rowOverScanStartIdx, rowOverScanEndIdx } = this.state;
    let { isShowUsers, selectedGridView, selectedDate, gridStartDate, gridEndDate, rows, renderHeaderYears,
      renderHeaderDates, eventBus, onViewportRightScroll, updateSelectedDate, onRowExpand, changedSelectedByScroll } = this.props;
    const rowsCount = rows.length;
    const renderedRows = this.getRenderedRows(rowOverScanStartIdx, rowOverScanEndIdx);
    const topOffset = rowOverScanStartIdx > 0 ? rowOverScanStartIdx * ROW_HEIGHT : 0;
    const bottomOffset = (rowsCount - rowOverScanEndIdx) > 0 ? (rowsCount - rowOverScanEndIdx) * ROW_HEIGHT : 0;
    return (
      <div className="timeline-viewport" ref={ref => this.viewport = ref}>
        {isShowUsers &&
          <div className="left-pane-wrapper" style={{zIndex: zIndexes.LEFT_PANE_WRAPPER}}>
            <ViewportLeft
              ref={node => this.viewportLeft = node}
              renderedRows={renderedRows}
              topOffset={topOffset}
              bottomOffset={bottomOffset}
              onViewportLeftScroll={this.onViewportLeftScroll}
              eventBus={eventBus}
            />
          </div>
        }
        <ViewportRight
          ref={node => this.viewportRight = node}
          isShowUsers={isShowUsers}
          selectedGridView={selectedGridView}
          selectedDate={selectedDate}
          gridStartDate={gridStartDate}
          gridEndDate={gridEndDate}
          renderedRows={renderedRows}
          topOffset={topOffset}
          bottomOffset={bottomOffset}
          renderHeaderYears={renderHeaderYears}
          renderHeaderDates={renderHeaderDates}
          eventBus={eventBus}
          changedSelectedByScroll={changedSelectedByScroll}
          onViewportRightScroll={onViewportRightScroll}
          onCanvasRightScroll={this.onCanvasRightScroll}
          updateSelectedDate={updateSelectedDate}
          onRowExpand={onRowExpand}
        />
      </div>
    );
  }
}

Viewport.propTypes = {
  isShowUsers: PropTypes.bool,
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  gridStartDate: PropTypes.string,
  gridEndDate: PropTypes.string,
  rows: PropTypes.array,
  eventBus: PropTypes.object,
  changedSelectedByScroll: PropTypes.bool,
  renderHeaderYears: PropTypes.func,
  renderHeaderDates: PropTypes.func,
  onViewportRightScroll: PropTypes.func,
  updateSelectedDate: PropTypes.func,
  onRowExpand: PropTypes.func,
};

export default Viewport;