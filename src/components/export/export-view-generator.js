import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class ExportView extends Component {

  render() {
    const { GridView } = this.props;
    return (
      <div className="timeline-container">
        <GridView
          isRenderAll={true}
          {...this.props}
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
