import React from 'react';
import PropTypes from 'prop-types';
import CanvasLeft from './canvas-left';

const propTypes = {
  rows: PropTypes.array,
  onViewportLeftScroll: PropTypes.func,
};

class ViewportLeft extends React.Component {

  onViewportLeftScroll = (evt) => {
    this.props.onViewportLeftScroll(evt.target.scrollTop);
  }

  setCanvasLeftScroll = (scrollTop) => {
    this.viewportLeft.scrollTop = scrollTop;
  }

  render() {
    let { rows } = this.props;
    return (
      <div className="timeline-viewport-left" ref={ref => this.viewportLeft = ref} onScroll={this.onViewportLeftScroll}>
        <CanvasLeft
          rows={rows}
        />
      </div>
    );
  }
}

ViewportLeft.propTypes = propTypes;

export default ViewportLeft;