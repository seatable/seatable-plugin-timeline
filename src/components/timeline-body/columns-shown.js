import React from 'react';
import PropTypes from 'prop-types';
import { COLUMNS_ICON_CONFIG } from 'dtable-store';

class ColumnsShow extends React.Component {

  render() {
    let { columns } = this.props;
    return (
      <ul>
        {columns.map((column, index) => {
          return (
            <li key={index}>
            <i className={`dtable-font ${COLUMNS_ICON_CONFIG[column.type]}`}></i>
            <span>{column.name}</span>
            </li>
          );
        })}
      </ul>
    );
  }
}

ColumnsShow.propTypes = {
  columns: PropTypes.array
};

export default ColumnsShow;
