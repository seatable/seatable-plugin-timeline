import React from 'react';
import PropTypes from 'prop-types';
import EventRow from './event-row';
import EventCell from './event-cell';
import CollaboratorFormatter from './cell-formatter/collaborator-formatter';

const propTypes = {
  rows: PropTypes.array,
  onViewportLeftScroll: PropTypes.func,
};

class ViewportLeft extends React.Component {

  renderCells = (collaborator) => {
    let cell = <EventCell
      key={`timeline-left-event-cell-${collaborator}`}
      formatter={CollaboratorFormatter}
      value={collaborator}
    />
    return [cell];
  }

  onViewportLeftScroll = (event) => {
    let scrollLeft = event.target.scrollLeft;
    let scrollTop = event.target.scrollTop;
    this.setScroll({scrollLeft, scrollTop});
    this.props.onViewportLeftScroll({scrollLeft, scrollTop});
  }

  setScroll = ({scrollLeft, scrollTop}) => {
    this.viewportLeft.scrollLeft = scrollLeft;
    this.viewportLeft.scrollTop = scrollTop;
  }

  render() {
    let { rows } = this.props;

    return (
      <div className="viewport-left" ref={ref => this.viewportLeft = ref} onScroll={this.onViewportLeftScroll}>
        <div className="collaborator-rows">
          {Array.isArray(rows) && rows.map((r, index) => {
            let { collaborator } = r;
            return (
              <EventRow
                key={`timeline-collaborator-row-${index}`}
                cells={this.renderCells(collaborator)}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

ViewportLeft.propTypes = propTypes;

export default ViewportLeft;