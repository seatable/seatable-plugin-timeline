import React, { Component } from 'react';
import PropTypes from 'prop-types';
import EventRow from '../row/event-row';
import BgCells from '../row/bg-cells';
import EventCells from '../row/event-cells';
import GroupHeaderEventCell from '../row/group-header-event-cell';
import { GROUP_HEADER_HEIGHT, zIndexes, ROW_HEIGHT } from '../../constants';

class GroupItemRight extends Component {

  renderRows = (renderedRows) => {
    let { selectedGridView, selectedDate, columnWidth, overScanDates, renderedDates, group, isExpanded, onRowExpand } = this.props;
    const bgCells = (
      <BgCells
        selectedGridView={selectedGridView}
        columnWidth={columnWidth}
        renderedDates={renderedDates}
      />
    );
    let bgRows = [
      <EventRow
        key={'events-bg-row-group-header'}
        cells={bgCells}
      />
    ];
    let eventRows = [
      <EventRow
        key={'timeline-events-row-group-header'}
        cells={
          <GroupHeaderEventCell
            selectedGridView={selectedGridView}
            columnWidth={columnWidth}
            overScanStartDate={overScanDates[0]}
            group={group}
          />
        }
      />
    ];
    if (isExpanded) {
      Array.isArray(renderedRows) && renderedRows.forEach((r, index) => {
        bgRows.push(
          <EventRow
            key={`events-bg-row-${group.cell_value}-${r.name}`}
            cells={bgCells}
          />
        );
        eventRows.push(
          <EventRow
            key={`timeline-events-row-${group.cell_value}-${r.name}`}
            cells={
              <EventCells
                selectedGridView={selectedGridView}
                selectedDate={selectedDate}
                overScanDates={overScanDates}
                events={r.events}
                columnWidth={columnWidth}
                onRowExpand={onRowExpand}
              />
            }
          />
        );
      });
    }
    return (
      <React.Fragment>
        <div className="events-bg" style={{zIndex: zIndexes.EVENTS_BG}}>{bgRows}</div>
        <div className="events-rows">{eventRows}</div>
      </React.Fragment>
    );
  }

  render() {
    let { group, isExpanded } = this.props;
    let { rows } = group;
    let groupItemHeight = isExpanded ? GROUP_HEADER_HEIGHT + rows.length * ROW_HEIGHT : GROUP_HEADER_HEIGHT;
    return (
      <div className="group-item-right" style={{height: groupItemHeight}}>
        {this.renderRows(rows)}
      </div>
    );
  }
}

GroupItemRight.propTypes = {
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  overScanDates: PropTypes.array,
  renderedDates: PropTypes.array,
  columnWidth: PropTypes.number,
  group: PropTypes.object,
  isExpanded: PropTypes.bool,
  onRowExpand: PropTypes.func,
};

export default GroupItemRight;