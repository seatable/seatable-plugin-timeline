import React from 'react';
import PropTypes from 'prop-types';
import Rows from './rows';

class CanvasLeft extends React.Component {

  render() {
    const {
      renderedRows, shownColumns, collaborators, tableID, formulaRows, topOffset,
      bottomOffset,
    } = this.props;
    return (
      <div className="canvas-left" style={{paddingTop: topOffset, paddingBottom: bottomOffset}}>
        <Rows
          rows={renderedRows}
          columns={shownColumns}
          collaborators={collaborators}
          tableID={tableID}
          formulaRows={formulaRows}
        />
      </div>
    );
  }
}

CanvasLeft.propTypes = {
  collaborators: PropTypes.array,
  formulaRows: PropTypes.object,
  renderedRows: PropTypes.array,
  shownColumns: PropTypes.array,
  topOffset: PropTypes.number,
  bottomOffset: PropTypes.number,
  tableID: PropTypes.string,
};

export default CanvasLeft;
