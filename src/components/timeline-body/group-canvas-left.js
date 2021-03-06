import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GroupItemLeft from './group-item-left';
import { isGroupExpanded } from '../../utils/group-viewport-utils';

class GroupCanvasLeft extends Component {

  onExpandGroupToggle = (groupIndex, isExpanded) => {
    this.props.onExpandGroupToggle(groupIndex, isExpanded);
  }

  render() {
    let { groupVisibleStartIdx, groups, foldedGroups, shownColumns, collaborators, dtable, tableID, tables, formulaRows, topOffset, bottomOffset } = this.props;
    return (
      <div className="group-canvas-left" style={{paddingTop: topOffset, paddingBottom: bottomOffset}}>
        {groups.map((group, index) => {
          const isExpanded = isGroupExpanded(foldedGroups, index + groupVisibleStartIdx);
          return (
            <GroupItemLeft
              key={`group-item-left-${group.key}`}
              group={group}
              shownColumns={shownColumns}
              collaborators={collaborators}
              isExpanded={isExpanded}
              onExpandGroupToggle={this.onExpandGroupToggle.bind(this, index)}
              dtable={dtable}
              tableID={tableID}
              tables={tables}
              formulaRows={formulaRows}
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
  shownColumns: PropTypes.array
};

export default GroupCanvasLeft;
