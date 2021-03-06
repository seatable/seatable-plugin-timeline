import React from 'react';
import PropTypes from 'prop-types';
import { COLUMNS_ICON_CONFIG } from 'dtable-store';
import { ROW_HEIGHT } from '../../constants';

class ColumnsShow extends React.Component {

  render() {
    const { columns, isGroupView } = this.props;
    return (
      <div className={`timeline-row timeline-header-row d-flex ${isGroupView ? 'pl-4' : ''}`} style={{height: ROW_HEIGHT}}>
        {columns.map((column, index) => {
          return (
            <div className={`timeline-grid-cell text-truncate d-flex align-items-center ${index == 0 ? 'first-cell' : ''}`} style={{'width': column.width}} key={index}>
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
  isGroupView: PropTypes.bool,
  columns: PropTypes.array
};

export default ColumnsShow;
