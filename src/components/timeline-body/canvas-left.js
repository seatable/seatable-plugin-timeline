import React from 'react';
import PropTypes from 'prop-types';
import EventRow from '../event-row';
import EventCell from '../event-cell';
import UserFormatter from '../cell-formatter/user-formatter';

const propTypes = {
  rows: PropTypes.array,
};

class CanvasLeft extends React.Component {

  renderCells = (user) => {
    return [
      <EventCell
        key={`timeline-left-event-cell-${user}`}
        formatter={UserFormatter}
        value={user}
      />
    ];
  }

  render() {
    let { rows } = this.props;
    return (
      <div className="canvas-left">
        {Array.isArray(rows) && rows.map((r, index) => {
          let { user } = r;
          return (
            <EventRow
              key={`timeline-user-row-${index}`}
              cells={this.renderCells(user)}
            />
          );
        })}
      </div>
    );
  }
}

CanvasLeft.propTypes = propTypes;

export default CanvasLeft;