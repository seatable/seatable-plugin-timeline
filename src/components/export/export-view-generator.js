import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Toolbar from '../toolbar';

class ExportView extends Component {

  render() {
    const { selectedGridView, selectedDate, isShowUsers, GridView, gridStartDate, gridEndDate, rows,
      isGroupView, groups, eventBus } = this.props;
    return (
      <div className="timeline-container">
        <Toolbar
          selectedGridView={selectedGridView}
          selectedDate={selectedDate}
          isShowUsers={isShowUsers}
          eventBus={eventBus}
        />
        <GridView
          isShowUsers={isShowUsers}
          selectedGridView={selectedGridView}
          selectedDate={selectedDate}
          gridStartDate={gridStartDate}
          gridEndDate={gridEndDate}
          rows={rows}
          isGroupView={isGroupView}
          groups={groups}
          eventBus={eventBus}
          isRenderAll={true}
        />
      </div>
    );
  }
}

export const ExportViewGenerator = (props) => {
  let exportContainer = document.createElement('div');
  exportContainer.setAttribute('id', 'timeline-export-container');
  exportContainer.setAttribute('class', 'timeline-export-container');
  document.body.appendChild(exportContainer);
  ReactDOM.render(
    <ExportView {...props} />,
    exportContainer
  );
};