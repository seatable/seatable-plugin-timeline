import React from 'react';
import PropTypes from 'prop-types';
import EventRow from '../event-row';
import EventCell from '../event-cell';
import NameFormatter from '../cell-formatter/name-formatter';

const propTypes = {
  rows: PropTypes.array,
};

class CanvasLeft extends React.Component {

  renderCells = (name) => {
    return [
      <EventCell
        key={`timeline-left-event-cell-${name}`}
        formatter={<NameFormatter value={name} />}
      />
    ];
  }

  render() {
    let { rows } = this.props;
    return (
      <div className="canvas-left">
        {Array.isArray(rows) && rows.map((r, index) => {
          let { name } = r;
          return (
            <EventRow
              key={`timeline-name-row-${index}`}
              cells={this.renderCells(name)}
            />
          );
        })}
      </div>
    );
  }
}

CanvasLeft.propTypes = propTypes;

export default CanvasLeft;