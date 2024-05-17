import React from 'react';
import PropTypes from 'prop-types';
import { COLUMNS_ICON_CONFIG } from 'dtable-utils';
import Switch from '../switch';

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
    this.props.updateColumn(this.props.column.key, e.target.checked);
  };

  onDragStart = (event) => {
    event.stopPropagation();
    let ref = this.itemRef;
    event.dataTransfer.setDragImage(ref, 10, 10);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', this.props.column.key);
  };

  onTableDragEnter = (event) => {
    event.stopPropagation();
    this.enteredCounter++;
    if (this.enteredCounter !== 0) {
      if (this.state.isItemDropTipShow) {
        return ;
      }
      this.setState({isItemDropTipShow: true});
    }
  };

  onDragOver = (event) => {
    if (event.dataTransfer.dropEffect === 'copy') {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  onDragLeave = (event) => {
    event.stopPropagation();
    this.enteredCounter--;
    if (this.enteredCounter === 0) {
      this.setState({isItemDropTipShow: false});
    }
  };

  onDrop = (event) => {
    event.stopPropagation();
    event.preventDefault();
    this.enteredCounter = 0;
    this.setState({isItemDropTipShow: false});
    const droppedColumnKey = event.dataTransfer.getData('text/plain');
    const { column } = this.props;
    if (droppedColumnKey == column.key) {
      return;
    }
    this.props.moveColumn(droppedColumnKey, column.key);
  };

  render() {
    const { column } = this.props;
    return (
      <div
        className={`timeline-column-setting-item ${this.state.isItemDropTipShow ? 'column-can-drop' : ''}`}
        ref={ref => this.itemRef = ref}
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
        <Switch
          column = {column}
          checked={column.shown}
          placeholder={(
            <>
              <i className={`dtable-font ${COLUMNS_ICON_CONFIG[column.type]}`}></i>
              <span>{column.name}</span>
            </>
          )}
          onChange={this.updateColumn}
        />
      </div>
    );
  }
}

ColumnSetting.propTypes = propTypes;

export default ColumnSetting;
