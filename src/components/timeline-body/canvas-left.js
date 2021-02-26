import React from 'react';
import PropTypes from 'prop-types';
import Rows from './rows';

class CanvasLeft extends React.Component {

  render() {
    const { renderedRows, shownColumns, collaborators, dtable, tableID, tables, formulaRows } = this.props;
    return (
      <div className="canvas-left">
        <Rows rows={renderedRows} columns={shownColumns} collaborators={collaborators} dtable={dtable} tableID={tableID} tables={tables} formulaRows={formulaRows} />
      </div>
    );
  }
}

CanvasLeft.propTypes = {
  renderedRows: PropTypes.array,
  shownColumns: PropTypes.array
};

export default CanvasLeft;
