import React from 'react';
import PropTypes from 'prop-types';
import CanvasLeft from './canvas-left';
import GroupCanvasLeft from './group-canvas-left';
import ColumnManager from './column-manager';
import ColumnsShown from './columns-shown';

class ViewportLeft extends React.Component {

  renderCanvasLeft = () => {
    let { isGroupView, groupVisibleStartIdx, renderedRows, groups, onExpandGroupToggle, foldedGroups } = this.props;
    let CustomCanvasLeft, canvasLeftProps;
    if (isGroupView) {
      CustomCanvasLeft = GroupCanvasLeft;
      canvasLeftProps = { groupVisibleStartIdx, groups, foldedGroups, onExpandGroupToggle };
    } else {
      CustomCanvasLeft = CanvasLeft;
      canvasLeftProps = { renderedRows };
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

  moveColumn = (source, target) => {
    const { columns, settings } = this.props;
    const configuredColumns = settings.columns || columns.map((item, index) => {
      item.shown = index == 0; // show the first column by default
      return item;
    }); 
    let sourceIndex, targetIndex, movedColumnName, unMovedColumnsName = []; 
    configuredColumns.forEach((column_name, index) => {
      if (column_name === source) {
        sourceIndex = index;
        movedColumnName = column_name;
      } else {
        if (column_name === target) {
          targetIndex = index;
        }   
        unMovedColumnsName.push(column_name);
      }   
    }); 
    let target_index = unMovedColumnsName.findIndex(column_name => column_name === target);
    if (sourceIndex < targetIndex) {
      target_index = target_index + 1;
    }   
    settings.columns = unMovedColumnsName.splice(target_index, 0, movedColumnName);
    this.props.onModifyTimelineSettings(settings);
  }

  render() {
    const { topOffset, bottomOffset, columns, settings } = this.props;
    const configuredColumns = settings.columns || columns.map((item, index) => {
      item.shown = index == 0; // show the first column by default
      return item;
    });
    return (
      <div className="timeline-viewport-left" ref={ref => this.viewportLeft = ref} onScroll={this.onViewportLeftScroll}>
        <ColumnManager
          columns={configuredColumns}
          updateColumn={this.updateColumn}
          moveColumn={this.moveColumn}
        />
        <ColumnsShown columns={configuredColumns.filter(item => item.shown)} />
        <div className="canvas-left-wrapper" style={{paddingTop: topOffset, paddingBottom: bottomOffset}}>
          {this.renderCanvasLeft()}
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
