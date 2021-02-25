import React from 'react';
import PropTypes from 'prop-types';
import CanvasLeft from './canvas-left';
import GroupCanvasLeft from './group-canvas-left';
import ColumnManager from './column-manager';
import ColumnsShown from './columns-shown';

class ViewportLeft extends React.Component {

  renderCanvasLeft = (shownColumns) => {
    let { isGroupView, groupVisibleStartIdx, renderedRows, groups, onExpandGroupToggle, foldedGroups, collaborators } = this.props;
    let CustomCanvasLeft, canvasLeftProps;
    if (isGroupView) {
      CustomCanvasLeft = GroupCanvasLeft;
      canvasLeftProps = { groupVisibleStartIdx, groups, foldedGroups, onExpandGroupToggle, shownColumns, collaborators };
    } else {
      CustomCanvasLeft = CanvasLeft;
      canvasLeftProps = { renderedRows, shownColumns, collaborators };
    }
    return (
      <CustomCanvasLeft {...canvasLeftProps} />
    );
  }

  onViewportLeftScroll = (evt) => {
    if (!this.activeScroll) {
      this.activeScroll = true;
      return;
    }
    this.props.onViewportLeftScroll(evt.target.scrollTop);
  }

  setCanvasLeftScroll = (scrollTop) => {
    this.activeScroll = false;
    this.viewportLeft.scrollTop = scrollTop;
  }

  updateColumn = (targetColumn, targetShown) => {
    const { columns, settings } = this.props;
    const configuredColumns = settings.columns || columns.map((item, index) => {
      item.shown = index == 0; // show the first column by default
      return item;
    });
    settings.columns = configuredColumns.map(item => {
      if (item.key == targetColumn.key) {
        item.shown = targetShown; 
      }
      return item;
    });
    this.props.onModifyTimelineSettings(settings);
  }

  moveColumn = (targetColumnKey, targetIndexColumn) => {
    const { columns, settings } = this.props;
    const configuredColumns = settings.columns || columns.map((item, index) => {
      item.shown = index == 0; // show the first column by default
      return item;
    }); 
    const targetColumn = configuredColumns.filter(column => column.key == targetColumnKey)[0];
    const originalIndex = configuredColumns.indexOf(targetColumn);
    const targetIndex = configuredColumns.indexOf(targetIndexColumn);
    configuredColumns.splice(originalIndex, 1);
    configuredColumns.splice(targetIndex, 0, targetColumn);
    settings.columns = configuredColumns;
    this.props.onModifyTimelineSettings(settings);
  }

  render() {
    const { topOffset, bottomOffset, columns, settings } = this.props;
    const configuredColumns = settings.columns || columns.map((item, index) => {
      item.shown = index == 0; // show the first column by default
      return item;
    });
    const shownColumns = configuredColumns.filter(item => item.shown);
    return (
      <div className="timeline-viewport-left" ref={ref => this.viewportLeft = ref} onScroll={this.onViewportLeftScroll}>
        <ColumnManager
          columns={configuredColumns}
          updateColumn={this.updateColumn}
          moveColumn={this.moveColumn}
        />
        <ColumnsShown columns={shownColumns} />
        <div className="canvas-left-wrapper" style={{paddingTop: topOffset, paddingBottom: bottomOffset}}>
          {this.renderCanvasLeft(shownColumns)}
        </div>
      </div>
    );
  }
}

ViewportLeft.propTypes = {
  renderedRows: PropTypes.array,
  groupVisibleStartIdx: PropTypes.number,
  groups: PropTypes.array,
  foldedGroups: PropTypes.array,
  topOffset: PropTypes.number,
  bottomOffset: PropTypes.number,
  onViewportLeftScroll: PropTypes.func,
  onExpandGroupToggle: PropTypes.func,
};

export default ViewportLeft;
