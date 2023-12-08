import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { CellType, getTableColumnByName } from 'dtable-utils';
import { GROUP_HEADER_HEIGHT, ROW_HEIGHT } from '../../constants';
import Rows from './rows';
import Cell from '../row/cell';

class GroupItemLeft extends Component {

  onExpandGroupToggle = () => {
    this.props.onExpandGroupToggle();
  }

  getEventsCount = () => {
    const { rows } = this.props.group;
    if (!Array.isArray(rows) || rows.length === 0) {
      return 0;
    }
    return rows.reduce((curr, next) => curr + next.events.length, 0);
  }

  render() {
    const {
      group, isExpanded, shownColumns, collaborators, table, tableID, formulaRows,
    } = this.props;
    const { cell_value, column_name, rows } = group;
    const rowsCount = Array.isArray(rows) ? rows.length : 0;
    const groupColumn = getTableColumnByName(table, column_name);
    const groupTitleClassName = 'first-cell flex-fill px-0';
    return (
      <div className={classnames('group-item-left', { expanded: isExpanded })}>
        <div className="group-header" style={{height: GROUP_HEADER_HEIGHT}}>
          {groupColumn.type === CellType.GEOLOCATION ?
            <div className={`timeline-grid-cell ${groupTitleClassName}`}>{cell_value}</div> :
            <Cell
              className={groupTitleClassName}
              row={rows[0].events[0].original_row}
              column={groupColumn}
              collaborators={collaborators}
              tableID={tableID}
              formulaRows={formulaRows}
              autoWidth
            />
          }
          <div>
            <span className="rows-count">{this.getEventsCount()}</span>
            <span className="btn-group-expand" onClick={this.onExpandGroupToggle}>
              <i className={`group-expand-icon dtable-font ${isExpanded ? 'dtable-icon-drop-down' : 'dtable-icon-right-slide'}`}></i>
            </span>
          </div>
        </div>
        {(isExpanded && rowsCount > 0) &&
          <div className="group-item-left-rows" style={{height: rowsCount * ROW_HEIGHT}}>
            <Rows
              rows={rows}
              columns={shownColumns}
              collaborators={collaborators}
              tableID={tableID}
              formulaRows={formulaRows}
            />
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
  collaborators: PropTypes.array,
  table: PropTypes.object,
  tableID: PropTypes.string,
  formulaRows: PropTypes.object,
};

export default GroupItemLeft;
