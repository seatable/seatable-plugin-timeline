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
  CTimeFormatter,
  MTimeFormatter,
  FormulaFormatter,
  LinkFormatter,
  AutoNumberFormatter,
  UrlFormatter,
  EmailFormatter,
} from 'dtable-ui-component';
import UserFormatter from './cell-formatter/user-formatter';
import { getValidCollaborators, getValidOptionIds } from '../utils';
import { RECORD_END_TYPE } from '../constants';

import '../css/row-expand.css';

const emptyCell = <span className="row-cell-empty d-inline-block"></span>;

const propTypes = {
  tables: PropTypes.array,
  selectedTable: PropTypes.object,
  selectedView: PropTypes.object,
  settings: PropTypes.object,
  expandedRow: PropTypes.object,
  cellType: PropTypes.object,
  collaborators: PropTypes.array,
  getOriginalRow: PropTypes.func,
  getColumnByName: PropTypes.func,
  getMediaUrl: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
  getLinkCellValue: PropTypes.func,
  getRowsByID: PropTypes.func,
  getTableById: PropTypes.func,
};

class RowExpand extends React.Component {

  renderRowDetail = () => {
    let { selectedTable, settings, expandedRow, getOriginalRow, getColumnByName, cellType, collaborators } = this.props;
    if (!expandedRow) return null;
    let { name_column_name, single_select_column_name, start_time_column_name, record_end_type, end_time_column_name,
      record_duration_column_name, shown_column_names } = settings;
    shown_column_names = shown_column_names || [];
    let { _id } = expandedRow;
    let rowName, cells = [];
    let originRow = getOriginalRow(selectedTable, _id) || {};
    Object.keys(expandedRow).forEach((name, index) => {
      let column = getColumnByName(selectedTable, name);
      if (column && ([name_column_name, single_select_column_name, start_time_column_name].indexOf(name) > 0 ||
        (record_end_type === RECORD_END_TYPE.END_TIME && end_time_column_name === name) ||
        (record_end_type === RECORD_END_TYPE.RECORD_DURATION && record_duration_column_name === name) ||
        shown_column_names.includes(name))) {
        let { key } = column;
        let cellValue = originRow[key];
        if (key === '0000') {
          rowName = cellValue;
        } else {
          let cellFormatter = this.getCellFormatter(originRow, column, collaborators, cellType);
          if (cellFormatter) {
            cells.push(
              <div key={`row-cell-${index}`} className="cell-item d-flex align-items-center">{cellFormatter}</div>
            );
          }
        }
      }
    });
    return (
      <React.Fragment>
        <div className="row-name" title={rowName}>{rowName}</div>
        <div className="row-cells-container">{cells}</div>
      </React.Fragment>
    );
  }

  getCellFormatter = (row, column, collaborators, cellType) => {
    const { key, name: columnName, type: columnType, data: columnData } = column;
    let cellValue = row[key];
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
      case cellType.CTIME: {
        if (!row._ctime) return emptyCell;
        return <CTimeFormatter value={row._ctime} />;
      }
      case cellType.MTIME: {
        if (!row._mtime) return emptyCell;
        return <MTimeFormatter value={row._mtime} />;
      }
      case cellType.CREATOR:
      case cellType.LAST_MODIFIER: {
        return (
          <UserFormatter
            column={column}
            row={row}
            cellType={cellType}
            getMediaUrl={this.props.getMediaUrl}
            getUserCommonInfo={this.props.getUserCommonInfo}
          />
        );
      }
      case cellType.FORMULA: {
        let { tables, selectedView } = this.props;
        let formulaRows = selectedView.formula_rows;
        let formulaValue = formulaRows ? formulaRows[row._id][key] : '';
        if (!formulaValue) return emptyCell;
        return <FormulaFormatter value={formulaValue} column={column} collaborators={collaborators} tables={tables} containerClassName="formula-container" />;
      }
      case cellType.LINK: {
        let linkMetaData = {
          getLinkedCellValue: (linkId, table1Id, table2Id, row_id) => {
            return this.props.getLinkCellValue(linkId, table1Id, table2Id, row_id);
          },
          getLinkedRows: (tableId, rowIds) => {
            return this.props.getRowsByID(tableId, rowIds);
          },
          getLinkedTable: (tableId) => {
            return this.props.getTableById(tableId);
          },
          expandLinkedTableRow: (row, tableId) => {
            return false;
          }
        };
        return <LinkFormatter column={column} row={row} currentTableId={this.props.selectedTable._id} linkMetaData={linkMetaData} containerClassName="gallery-link-container" />;
      }
      case cellType.AUTO_NUMBER: {
        if (!cellValue) return emptyCell;
        return <AutoNumberFormatter value={cellValue} containerClassName="text-editor" />;
      }
      case cellType.URL: {
        if (!cellValue) return emptyCell;
        return <UrlFormatter value={cellValue} containerClassName="text-editor" />;
      }
      case cellType.EMAIL: {
        if (!cellValue) return emptyCell;
        return <EmailFormatter value={cellValue} containerClassName="text-editor" />;
      }
      default: {
        return null;
      }
    }
  }

  render() {
    return (
      <div className="timeline-row-expand">
        {this.renderRowDetail()}
      </div>
    );
  }
}

RowExpand.propTypes = propTypes;

export default RowExpand;