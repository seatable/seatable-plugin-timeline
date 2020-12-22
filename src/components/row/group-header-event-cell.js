import React from 'react';
import PropTypes from 'prop-types';
import { zIndexes } from '../../constants';
import { getEventWidth, getEventLeft } from '../../utils/row-utils';

function GroupHeaderEventCell({selectedGridView, columnWidth, overScanStartDate, group}) {
  let { min_date, max_date, cell_value } = group;
  let width = getEventWidth(selectedGridView, columnWidth, min_date, max_date);
  let left = getEventLeft(selectedGridView, columnWidth, overScanStartDate, min_date);
  const eventCellStyle = {width, left, zIndex: zIndexes.GROUP_HEADER_EVENT_CELL};
  return [
    <div className="group-header-event-cell" key={`group-header-event-cell-${cell_value}`} style={eventCellStyle}>
      <div className="timeline-group-indicator"></div>
    </div>
  ];
}

GroupHeaderEventCell.propTypes = {
  selectedGridView: PropTypes.string,
  columnWidth: PropTypes.number,
  overScanStartDate: PropTypes.string,
  group: PropTypes.object,
};

export default GroupHeaderEventCell;