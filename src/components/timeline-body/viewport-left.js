import React from 'react';
import PropTypes from 'prop-types';
import CanvasLeft from './canvas-left';

const propTypes = {
  renderedRows: PropTypes.array,
  headerHeight: PropTypes.number,
  topOffset: PropTypes.number,
  bottomOffset: PropTypes.number,
  onViewportLeftScroll: PropTypes.func,
};

class ViewportLeft extends React.Component {

  onViewportLeftScroll = (evt) => {
    if (!this.activeScroll) {
      this.activeScroll = true;
      return;
    }
    this.props.onViewportLeftScroll(evt.target.scrollTop);
  }

  setCanvasLeftScroll = (scrollTop) => {
    this.activeScroll = false;
    this.viewportLeft.scrollTop = scrollTop;
  }

  render() {
    let { renderedRows, headerHeight, topOffset, bottomOffset } = this.props;
    let viewportLeftStyle = {
      height: `calc(100% - ${headerHeight + 18}px)`
    };
    return (
      <div
        className="timeline-viewport-left"
        ref={ref => this.viewportLeft = ref}
        onScroll={this.onViewportLeftScroll}
        style={viewportLeftStyle}
      >
        <div
          className="canvas-left-wrapper"
          style={{
            paddingTop: topOffset,
            paddingBottom: bottomOffset
          }}
        >
          <CanvasLeft
            renderedRows={renderedRows}
          />
        </div>
      </div>
    );
  }
}

ViewportLeft.propTypes = propTypes;

export default ViewportLeft;