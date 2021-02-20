import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { COLUMNS_ICON_CONFIG } from 'dtable-store';

const propTypes = {
  column: PropTypes.object.isRequired,
  updateColumn: PropTypes.func.isRequired,
  moveColumn: PropTypes.func
};
class ColumnSetting extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isChecked: false,
      isItemDropTipShow: false
    };
    this.enteredCounter = 0;
  }

  updateColumn = (e) => {
    e.nativeEvent.stopImmediatePropagation(); // TODO: is it needed?
    this.props.updateColumn(this.props.column, e.target.checked); 
  }

  onDragStart = (event) => {
    event.stopPropagation();
    let ref = this.galleryItemRef;
    event.dataTransfer.setDragImage(ref, 10, 10);
    event.dataTransfer.effectAllowed = 'move';
    let dragStartItemData = JSON.stringify(this.props.column);
    event.dataTransfer.setData('text/plain', dragStartItemData);
  }

  onTableDragEnter = (event) => {
    event.stopPropagation();
    this.enteredCounter++;
    if (this.enteredCounter !== 0) {
      if (this.state.isItemDropTipShow) {
        return ;
      }
      this.setState({isItemDropTipShow: true});
    }
  }

  onDragOver = (event) => {
    if (event.dataTransfer.dropEffect === 'copy') {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  onDragLeave = (event) => {
    event.stopPropagation();
    this.enteredCounter--;
    if (this.enteredCounter === 0) {
      this.setState({isItemDropTipShow: false});
    }
  }

  onDrop = (event) => {
    event.stopPropagation();
    event.preventDefault();
    this.enteredCounter = 0;
    this.setState({isItemDropTipShow: false});
    let sourceColumn = event.dataTransfer.getData("text/plain");
    sourceColumn = JSON.parse(sourceColumn);
    const { column } = this.props;
    if (sourceColumn.name === column.name) {
      return;
    }
    this.props.moveColumn(sourceColumn, column);
  }

  render() {
    const { column } = this.props;
    return (
      <div 
        className={`gallery-setting-item ${this.state.isItemDropTipShow ? 'column-can-drop' : ''}`} 
        ref={ref => this.galleryItemRef = ref}
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
    <div className="gallery-column-switch">
      <label className="custom-switch">
        <input 
          type="checkbox" 
          className="custom-switch-input" 
          checked={column.shown}
          onChange={this.updateColumn}
          name="custom-switch-checkbox" 
        />  
        <span className="custom-switch-description text-truncate">
      <i className={`dtable-font ${COLUMNS_ICON_CONFIG[column.type]}`}></i>
      <span>{column.name}</span>
      </span>
        <span className="custom-switch-indicator"></span>
      </label>
    </div>
      </div>
    );
  }
}

ColumnSetting.propTypes = propTypes;

export default ColumnSetting;
