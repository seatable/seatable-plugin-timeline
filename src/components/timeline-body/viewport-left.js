import React from 'react';
import PropTypes from 'prop-types';
import CanvasLeft from './canvas-left';
import GroupCanvasLeft from './group-canvas-left';

class ViewportLeft extends React.Component {

  renderCanvasLeft = () => {
    let { isGroupView, groupVisibleStartIdx, renderedRows, groups, onExpandGroupToggle, foldedGroups } = this.props;
    let CustomCanvasLeft, canvasLeftProps;
    if (isGroupView) {
      CustomCanvasLeft = GroupCanvasLeft;
      canvasLeftProps = { groupVisibleStartIdx, groups, foldedGroups, onExpandGroupToggle };
    } else {
      CustomCanvasLeft = CanvasLeft;
      canvasLeftProps = { renderedRows };
    }
    return (
      <CustomCanvasLeft {...canvasLeftProps} />
    );
  }

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
    let { topOffset, bottomOffset } = this.props;
    return (
      <div className="timeline-viewport-left" ref={ref => this.viewportLeft = ref} onScroll={this.onViewportLeftScroll}>
        <div className="canvas-left-wrapper" style={{paddingTop: topOffset, paddingBottom: bottomOffset}}>
          {this.renderCanvasLeft()}
        </div>
      </div>
    );
  }
}

ViewportLeft.propTypes = {
  renderedRows: PropTypes.array,
  groupVisibleStartIdx: PropTypes.number,
  groups: PropTypes.array,
  foldedGroups: PropTypes.array,
  topOffset: PropTypes.number,
  bottomOffset: PropTypes.number,
  onViewportLeftScroll: PropTypes.func,
  onExpandGroupToggle: PropTypes.func,
};

export default ViewportLeft;