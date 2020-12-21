import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GroupItemLeft from './group-item-left';
import { isGroupExpanded } from '../../utils/group-viewport-utils';

class GroupCanvasLeft extends Component {

  onExpandGroupToggle = (groupIndex, isExpanded) => {
    this.props.onExpandGroupToggle(groupIndex, isExpanded);
  }

  render() {
    let { groupVisibleStartIdx, groups, foldedGroups } = this.props;
    return (
      <div className="group-canvas-left">
        {groups.map((group, index) => {
          const isExpanded = isGroupExpanded(foldedGroups, index + groupVisibleStartIdx);
          return (
            <GroupItemLeft
              key={`group-item-left-${group.cell_value}`}
              group={group}
              isExpanded={isExpanded}
              onExpandGroupToggle={this.onExpandGroupToggle.bind(this, index)}
            />
          );
        })}
      </div>
    );
  }
}

GroupCanvasLeft.propTypes = {
  groupVisibleStartIdx: PropTypes.number,
  groups: PropTypes.array,
  foldedGroups: PropTypes.array,
  onExpandGroupToggle: PropTypes.func,
};

export default GroupCanvasLeft;