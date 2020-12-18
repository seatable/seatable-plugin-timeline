import React from 'react';
import PropTypes from 'prop-types';
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

class CanvasLeft extends React.Component {

  render() {
    let { renderedRows } = this.props;
    return (
      <div className="canvas-left">
        {Array.isArray(renderedRows) && renderedRows.map((r, index) => {
          let { name } = r;
          return (
            <EventRow
              key={`timeline-name-row-${index}`}
              cells={
                <EventCells
                  name={name}
                />
              }
            />
          );
        })}
      </div>
    );
  }
}

CanvasLeft.propTypes = {
  renderedRows: PropTypes.array,
};

export default CanvasLeft;