import React from 'react';
import PropTypes from 'prop-types';
import { COLUMNS_ICON_CONFIG } from 'dtable-store';

class ColumnsShow extends React.Component {

  render() {
    let { columns } = this.props;
    return (
      <table>
        <thead>
          <tr>
            {columns.map((column, index) => {
              return (
                <td key={index} className="timeline-column-header" style={{'width': column.width}}>
                <i className={`dtable-font ${COLUMNS_ICON_CONFIG[column.type]} mr-1 timeline-column-icon`}></i>
                <span>{column.name}</span>
                </td>
              );
            })}
          </tr>
        </thead>
      </table>
    );
  }
}

ColumnsShow.propTypes = {
  columns: PropTypes.array
};

export default ColumnsShow;
