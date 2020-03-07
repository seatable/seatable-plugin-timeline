import React from 'react';
import PropTypes from 'prop-types';
import EventRow from '../event-row';
import EventCell from '../event-cell';
import UserFormatter from '../cell-formatter/user-formatter';

const propTypes = {
  rows: PropTypes.array,
  onViewportLeftScroll: PropTypes.func,
};

class ViewportLeft extends React.Component {

  renderCells = (user) => {
    return [
      <EventCell
        key={`timeline-left-event-cell-${user}`}
        formatter={UserFormatter}
        value={user}
      />
    ];
  }

  onViewportLeftScroll = (event) => {
    let scrollLeft = event.target.scrollLeft;
    let scrollTop = event.target.scrollTop;
    this.setViewportLeftScroll({scrollLeft, scrollTop});
    this.props.onViewportLeftScroll({scrollLeft, scrollTop});
  }

  setViewportLeftScroll = ({scrollLeft, scrollTop}) => {
    this.viewportLeft.scrollLeft = scrollLeft;
    this.viewportLeft.scrollTop = scrollTop;
  }

  render() {
    let { rows } = this.props;

    return (
      <div className="viewport-left" ref={ref => this.viewportLeft = ref} onScroll={this.onViewportLeftScroll}>
        <div className="user-rows">
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
      </div>
    );
  }
}

ViewportLeft.propTypes = propTypes;

export default ViewportLeft;