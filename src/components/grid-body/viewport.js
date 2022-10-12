import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ViewportLeft from './viewport-left';
import ViewportRight from './viewport-right';
import { getViewportState, getVisibleBoundaries, getRowOverScanStartIdx, getRowOverScanEndIdx } from '../../utils/viewport-utils';
import { zIndexes, HEADER_HEIGHT, ROW_HEIGHT } from '../../constants';
import * as EventTypes from '../../constants/event-types';

class Viewport extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    window.timelineViewport = this;
    const { rows } = this.props;
    this.setState({
      ...getViewportState(this.getViewportHeight(), rows.length)
    });
    this.unsubscribeResetScrollTop = this.props.eventBus.subscribe(EventTypes.RESET_VIEWPORT_SCROLL_TOP, this.onResetViewportScrollTop);
  }

  componentWillUnmount() {
    this.unsubscribeResetScrollTop();
  }

  getViewportHeight = () => {
    return this.viewport.offsetHeight - HEADER_HEIGHT;
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
    const { rows } = this.props;
    const rowsCount = rows.length;
    const { rowVisibleStartIdx, rowVisibleEndIdx } = getVisibleBoundaries(this.getViewportHeight(), scrollTop, rowsCount);
    const rowOverScanStartIdx = getRowOverScanStartIdx(rowVisibleStartIdx);
    const rowOverScanEndIdx = getRowOverScanEndIdx(rowVisibleEndIdx, rowsCount);
    this.setState({
      rowVisibleStartIdx,
      rowVisibleEndIdx,
      rowOverScanStartIdx,
      rowOverScanEndIdx
    });
  }

  render() {
    const { rowOverScanStartIdx, rowOverScanEndIdx } = this.state;
    const {
      isShowUsers, selectedGridView, selectedDate, gridStartDate, gridEndDate, rows, renderHeaderYears,
      renderHeaderDates, eventBus, onViewportRightScroll, updateSelectedDate, onRowExpand, changedSelectedByScroll,
      isRenderAll, columns, collaborators,
    } = this.props;
    const rowsCount = rows.length;
    let renderedRows;
    let topOffset;
    let bottomOffset;
    if (isRenderAll) {
      renderedRows = [...rows];
      topOffset = 0;
      bottomOffset = 0;
    } else {
      renderedRows = this.getRenderedRows(rowOverScanStartIdx, rowOverScanEndIdx);
      topOffset = rowOverScanStartIdx > 0 ? rowOverScanStartIdx * ROW_HEIGHT : 0;
      bottomOffset = (rowsCount - rowOverScanEndIdx) > 0 ? (rowsCount - rowOverScanEndIdx) * ROW_HEIGHT : 0;
    }
    return (
      <div className="timeline-viewport viewport d-flex" ref={ref => this.viewport = ref}>
        {isShowUsers &&
          <div className="left-pane-wrapper" style={{zIndex: zIndexes.LEFT_PANE_WRAPPER}}>
            <ViewportLeft
              columnsVisible
              ref={node => this.viewportLeft = node}
              renderedRows={renderedRows}
              topOffset={topOffset}
              bottomOffset={bottomOffset}
              prevScrollTop={this.scrollTop}
              onViewportLeftScroll={this.onViewportLeftScroll}
              columns={columns}
              collaborators={collaborators}
              settings={this.props.settings}
              onModifyTimelineSettings={this.props.onModifyTimelineSettings}
              dtable={this.props.dtable}
              tableID={this.props.tableID}
              formulaRows={this.props.formulaRows}
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
          isRenderAll={isRenderAll}
          eventBus={eventBus}
          changedSelectedByScroll={changedSelectedByScroll}
          onViewportRightScroll={onViewportRightScroll}
          onCanvasRightScroll={this.onCanvasRightScroll}
          updateSelectedDate={updateSelectedDate}
          onRowExpand={onRowExpand}
          onModifyRow={this.props.onModifyRow}
        />
      </div>
    );
  }
}

Viewport.propTypes = {
  isShowUsers: PropTypes.bool,
  isRenderAll: PropTypes.bool,
  columns: PropTypes.array,
  collaborators: PropTypes.array,
  settings: PropTypes.object,
  table: PropTypes.object,
  tableID: PropTypes.string,
  dtable: PropTypes.object,
  formulaRows: PropTypes.object,
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
  onModifyRow: PropTypes.func,
  onModifyTimelineSettings: PropTypes.func,
};

export default Viewport;
