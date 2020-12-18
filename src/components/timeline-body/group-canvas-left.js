import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GroupItemLeft from './group-item-left';

class GroupCanvasLeft extends Component {

  onExpandGroupToggle = (groupIndex, isExpanded) => {
    this.props.onExpandGroupToggle(groupIndex, isExpanded);
  }

  render() {
    let { groups } = this.props;
    return (
      <div className="group-canvas-left">
        {groups.map((group, index) => (
          <GroupItemLeft
            key={`group-item-left-${group.cell_value}`}
            group={group}
            onExpandGroupToggle={this.onExpandGroupToggle.bind(this, index)}
          />
        ))}
      </div>
    );
  }
}

GroupCanvasLeft.propTypes = {
  groups: PropTypes.array,
  onExpandGroupToggle: PropTypes.func,
};

export default GroupCanvasLeft;