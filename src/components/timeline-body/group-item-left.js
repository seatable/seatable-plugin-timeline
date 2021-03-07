import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { GROUP_HEADER_HEIGHT, ROW_HEIGHT } from '../../constants';
import Rows from './rows';

class GroupItemLeft extends Component {

  onExpandGroupToggle = () => {
    this.props.onExpandGroupToggle();
  }

  render() {
    let { group, isExpanded, shownColumns, collaborators, dtable, tableID, tables, formulaRows } = this.props;
    let { cell_value, rows } = group;
    const rowsCount = Array.isArray(rows) ? rows.length : 0;
    return (
      <div className="group-item-left">
        <div className="group-header" style={{height: GROUP_HEADER_HEIGHT}}>
          <span className="group-title text-truncate">{cell_value}</span>
          <span>
            <span className="rows-count">{rowsCount}</span>
            <span className="btn-group-expand" onClick={this.onExpandGroupToggle}>
              <i className={`group-expand-icon dtable-font ${isExpanded ? 'dtable-icon-drop-down' : 'dtable-icon-right-slide'}`}></i>
            </span>
          </span>
        </div>
        {(isExpanded && rowsCount > 0) &&
          <div className="group-item-left-rows" style={{height: rowsCount * ROW_HEIGHT}}>
            <Rows rows={rows} columns={shownColumns} collaborators={collaborators} dtable={dtable} tableID={tableID} tables={tables} formulaRows={formulaRows} />
          </div>
        }
      </div>
    );
  }
}

GroupItemLeft.propTypes = {
  group: PropTypes.object,
  shownColumns: PropTypes.array,
  isExpanded: PropTypes.bool,
  onExpandGroupToggle: PropTypes.func,
};

export default GroupItemLeft;
