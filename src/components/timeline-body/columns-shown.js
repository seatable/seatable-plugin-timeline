import React from 'react';
import PropTypes from 'prop-types';
import { COLUMNS_ICON_CONFIG } from 'dtable-store';
import { ROW_HEIGHT } from '../../constants';

class ColumnsShow extends React.Component {

  render() {
    let { columns } = this.props;
    return (
      <div className="timeline-row timeline-header-row d-flex" style={{height: ROW_HEIGHT}}>
      {columns.map((column, index) => {
        return (
          <div className="timeline-grid-cell text-truncate" style={{'width': column.width}}>
          <i className={`dtable-font ${COLUMNS_ICON_CONFIG[column.type]} mr-1 timeline-column-icon`}></i>
          <span>{column.name}</span>
          </div>
        );
      })}
      </div>
    );
  }
}

ColumnsShow.propTypes = {
  columns: PropTypes.array
};

export default ColumnsShow;
