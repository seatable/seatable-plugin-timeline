import { GROUP_HEADER_HEIGHT, ROW_HEIGHT } from '../constants';

export const getGroupViewportState = (groupViewportHeight, groups, foldedGroups) => {
  let { groupVisibleStartIdx, groupVisibleEndIdx } = getGroupVisibleBoundaries(groupViewportHeight, 0, groups, foldedGroups);
  return {
    groupVisibleStartIdx,
    groupVisibleEndIdx
  };
};

export const getGroupVisibleBoundaries = (groupViewportHeight, scrollTop, groups, foldedGroups) => {
  let groupIdx = 0;
  let groupsHeight = 0;
  let groupVisibleStartIdx = 0;
  let groupVisibleEndIdx = 0;
  groups.forEach((group, index) => {
    const isExpanded = isGroupExpanded(foldedGroups, index);
    const groupHeight = getGroupHeight(group, isExpanded);
    groupsHeight += groupHeight;
    groupIdx++;
    if (groupsHeight <= scrollTop) {
      groupVisibleStartIdx = groupIdx;
    }
    if (groupsHeight <= scrollTop + groupViewportHeight) {
      groupVisibleEndIdx = groupIdx;
    }
  });
  groupVisibleEndIdx = Math.min(groupVisibleEndIdx, groups.length - 1);
  if (groupVisibleEndIdx !== groups.length - 1) {
    groupVisibleEndIdx += 1;
  }
  return {
    groupVisibleStartIdx,
    groupVisibleEndIdx
  };
};

export const getGroupHeight = (group, isExpanded) => {
  const { rows } = group;
  const rowsHeight = isExpanded && Array.isArray(rows) ? rows.length * ROW_HEIGHT : 0;
  return GROUP_HEADER_HEIGHT + rowsHeight;
};

export const getGroupsHeight = (groups, foldedGroups, startIndex, endIndex) => {
  let groupsHeight = 0;
  for (let i = startIndex; i < endIndex; i++) {
    const group = groups[i];
    const isExpanded = isGroupExpanded(foldedGroups, i);
    groupsHeight += getGroupHeight(group, isExpanded);
  }
  return groupsHeight;
};

export const isGroupExpanded = (foldedGroups, groupIndex) => {
  return foldedGroups.indexOf(groupIndex) < 0;
};