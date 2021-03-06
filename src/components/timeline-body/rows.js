import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { ROW_HEIGHT } from '../../constants';
import Cell from '../row/cell';

class Rows extends React.Component {

  render() {
    const { rows, columns, collaborators, dtable, tableID, tables, formulaRows } = this.props;
    return (
      <Fragment>
        {Array.isArray(rows) && rows.map((row, index) => {
          return (
            <div className="timeline-row d-flex" style={{height: ROW_HEIGHT}} key={index}>
              {columns.map((column, index) => {
                return <Cell key={index} className={index == 0 ? 'first-cell' : ''} row={row.row} column={column} collaborators={collaborators} dtable={dtable} tableID={tableID} tables={tables} formulaRows={formulaRows} />;
              })}
            </div>
          );
        })}
      </Fragment>
    );
  }
}

Rows.propTypes = {
  rows: PropTypes.array,
  columns: PropTypes.array,
  collaborators: PropTypes.array
};

export default Rows;
