import React from 'react';
import PropTypes from 'prop-types';
import {
  CheckboxFormatter,
  CollaboratorFormatter,
  DateFormatter,
  FileFormatter,
  GeolocationFormatter,
  ImageFormatter,
  LongTextFormatter,
  MultipleSelectFormatter,
  NumberFormatter,
  SingleSelectFormatter,
  TextFormatter,
} from 'dtable-ui-component';
import { getValidCollaborators, getValidOptionIds } from '../utils';
import intl from 'react-intl-universal';

import '../locale';

import '../css/row-expand.css';

const emptyCell = <span className="row-cell-empty d-inline-block"></span>;

const propTypes = {
  selectedTable: PropTypes.object,
  expandedRow: PropTypes.object,
  cellType: PropTypes.object,
  collaborators: PropTypes.array,
  getOriginalRow: PropTypes.func,
  getColumnByName: PropTypes.func,
};

class RowExpand extends React.Component {

  renderRowDetail = () => {
    let { selectedTable, expandedRow, getOriginalRow, getColumnByName, cellType, collaborators } = this.props;
    if (!expandedRow) return null;
    let { _id } = expandedRow;
    let rowName, cells = [];
    let originRow = getOriginalRow(selectedTable, _id) || {};
    Object.keys(expandedRow).forEach((name, index) => {
      let column = getColumnByName(selectedTable, name);
      if (column) {
        let { key, type, data, name } = column;
        let cellValue = originRow[key];
        if (key === '0000') {
          rowName = cellValue;
        } else {
          let cellFormatter = this.getCellFormatter(cellValue, name, type, data, collaborators, cellType);
          if (cellFormatter) {
            cells.push(
              <div key={`row-cell-${index}`} className="cell-item d-flex">{cellFormatter}</div>
            );
          }
        }
      }
    });
    return (
      <React.Fragment>
        <div className="row-name" title={rowName}>{rowName}</div>
        <div className="row-cells-container position-relative">
          <div className="cells d-flex align-items-center">{cells}</div>
        </div>
      </React.Fragment>
    );
  }

  getCellFormatter = (cellValue, columnName, columnType, columnData, collaborators, cellType) => {
    switch (columnType) {
      case cellType.CHECKBOX: {
        return <CheckboxFormatter
          value={cellValue}
        />;
      }
      case cellType.COLLABORATOR: {
        let validCollaborators = getValidCollaborators(collaborators, cellValue);
        if (validCollaborators.length === 0) {
          return emptyCell;
        }
        return <CollaboratorFormatter
          collaborators={collaborators}
          value={validCollaborators}
        />;
      }
      case cellType.DATE: {
        let { format } = columnData || {};
        if (!cellValue) {
          return emptyCell;
        }
        return <DateFormatter
          format={format}
          value={cellValue}
        />;
      }
      case cellType.FILE: {
        if (!cellValue) {
          return emptyCell;
        }
        return <FileFormatter
          value={cellValue}
        />;
      }
      case cellType.GEOLOCATION: {
        if (!cellValue) {
          return emptyCell;
        }
        return <GeolocationFormatter
          value={cellValue}
        />;
      }
      case cellType.IMAGE: {
        if (!cellValue) {
          return emptyCell;
        }
        return <ImageFormatter
          isSample
          value={cellValue}
        />;
      }
      case cellType.LONG_TEXT: {
        if (!cellValue) {
          return emptyCell;
        }
        return <LongTextFormatter
          value={cellValue}
        />;
      }
      case cellType.MULTIPLE_SELECT: {
        let { options } = columnData || {};
        let validOptionIds = getValidOptionIds(options, cellValue);
        if (validOptionIds.length === 0) {
          return emptyCell;
        }
        return <MultipleSelectFormatter
          options={options}
          value={validOptionIds}
        />;
      }
      case cellType.NUMBER: {
        let { format } = columnData || {};
        if (cellValue !== 0 && !cellValue) {
          return emptyCell;
        }
        return (
          <div className="column-number d-inline-flex align-items-center">
            <span className="column-name">{columnName}</span>
            <NumberFormatter
              format={format}
              value={cellValue}
            />
          </div>
        );
      }
      case cellType.SINGLE_SELECT: {
        let { options } = columnData || {};
        let isValidSelectedOption = Array.isArray(options) && options.findIndex(o => o.id === cellValue) > -1;
        if (!isValidSelectedOption) {
          return emptyCell;
        }
        return <SingleSelectFormatter
          options={options}
          value={cellValue}
        />;
      }
      case cellType.TEXT: {
        if (!cellValue) {
          return emptyCell;
        }
        return <TextFormatter
          value={cellValue}
        />;
      }
      default: {
        return null;
      }
    }
  }

  render() {
    return (
      <div className="timeline-row-expand position-relative">
        {this.renderRowDetail()}
      </div>
    );
  }
}

RowExpand.propTypes = propTypes;

export default RowExpand;