import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

class ColumnShownControlItem extends Component {

  constructor(props) {
    super(props);
    this.columnIconConfig = props.getColumnIconConfig();
    this.state = {
      isItemDropTipShow: false
    };
    this.enteredCounter = 0;
  }

  onDrop = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    this.enteredCounter = 0;
    this.setState({isItemDropTipShow: false});
    let sourceColumn = evt.dataTransfer.getData('text/plain');
    sourceColumn = JSON.parse(sourceColumn);
    const { onMoveColumn, column } = this.props;
    if (sourceColumn.name === column.name) {
      return;
    }
    onMoveColumn(sourceColumn.name, column.name);
  }

  onTableDragEnter = (evt) => {
    evt.stopPropagation();
    this.enteredCounter++;
    if (this.enteredCounter !== 0) {
      if (this.state.isItemDropTipShow) {
        return ;
      }
      this.setState({isItemDropTipShow: true});
    }
  }

  onDragOver = (evt) => {
    if (evt.dataTransfer.dropEffect === 'copy') {
      return;
    }
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'move';
  }

  onDragLeave = (evt) => {
    evt.stopPropagation();
    this.enteredCounter--;
    if (this.enteredCounter === 0) {
      this.setState({isItemDropTipShow: false});
    }
  }

  onDragStart = (evt) => {
    evt.stopPropagation();
    evt.dataTransfer.setDragImage(this.columnShownControlItem, 10, 10);
    evt.dataTransfer.effectAllowed = 'move';
    let dragStartItemData = JSON.stringify(this.props.column);
    evt.dataTransfer.setData('text/plain', dragStartItemData);
  }


  render() {
    let { column } = this.props;
    let { type, name, isShown } = column;
    return (
      <div
        className={classnames('column-shown-control-item position-relative d-flex align-items-center', {'can-drop': this.state.isItemDropTipShow})}
        ref={ref => this.columnShownControlItem = ref}
        onDrop={this.onDrop}
        onDragEnter={this.onTableDragEnter}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
      >
        <div
          className="drag-column-handle"
          draggable="true"
          onDragStart={this.onDragStart}
        >
          <i className="dtable-font dtable-icon-drag"></i>
        </div>
        <label className="custom-switch d-flex align-items-center justify-content-between">
          <input type="checkbox" name="custom-switch-checkbox" className="custom-switch-input" checked={isShown} onChange={this.props.onShowColumnToggle.bind(this, name)} />
          <span className="custom-switch-description text-truncate">
            <i className={`column-icon ${this.columnIconConfig[type]}`}></i>
            <span>{name}</span>
          </span>
          <span className="custom-switch-indicator"></span>
        </label>
      </div>
    );
  }
}

ColumnShownControlItem.propTypes = {
  column: PropTypes.object,
  getColumnIconConfig: PropTypes.func,
  onShowColumnToggle: PropTypes.func,
  onMoveColumn: PropTypes.func,
};

export default ColumnShownControlItem;