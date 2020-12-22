import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { GROUP_HEADER_HEIGHT, ROW_HEIGHT } from '../../constants';
import EventRow from '../row/event-row';
import EventCell from '../row/event-cell';
import NameFormatter from '../cell-formatter/name-formatter';

const EventCells = ({name}) => {
  return [
    <EventCell
      key={`timeline-left-event-cell-${name}`}
      title={name}
      formatter={<NameFormatter value={name} />}
    />
  ];
};

class GroupItemLeft extends Component {

  onExpandGroupToggle = () => {
    this.props.onExpandGroupToggle();
  }

  render() {
    let { group, isExpanded } = this.props;
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
            {rows.map((row) => {
              let { name } = row;
              return (
                <EventRow
                  key={`timeline-name-row-${name}`}
                  cells={
                    <EventCells
                      name={name}
                    />
                  }
                />
              );
            })}
          </div>
        }
      </div>
    );
  }
}

GroupItemLeft.propTypes = {
  group: PropTypes.object,
  isExpanded: PropTypes.bool,
  onExpandGroupToggle: PropTypes.func,
};

export default GroupItemLeft;