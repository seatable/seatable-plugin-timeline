/* This file is copied from plugin 'gallery', and modified. */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { CellType } from 'dtable-store';
import { 
  TextFormatter,
  NumberFormatter,
  CheckboxFormatter,
  DateFormatter,
  SingleSelectFormatter,
  MultipleSelectFormatter,
  CollaboratorFormatter,
  ImageFormatter,
  FileFormatter,
  LongTextFormatter,
  GeolocationFormatter,
  LinkFormatter,
  FormulaFormatter,
  CTimeFormatter,
  CreatorFormatter,
  LastModifierFormatter,
  MTimeFormatter,
  AutoNumberFormatter,
  UrlFormatter,
  EmailFormatter,
  DurationFormatter
} from 'dtable-ui-component';
import { isValidEmail } from '../../utils/common-utils';

const propTypes = {
  column: PropTypes.object.isRequired,
  row: PropTypes.object.isRequired,
  collaborators: PropTypes.array,
  /*
  type: PropTypes.string,
  tables: PropTypes.array,
  selectedView: PropTypes.object,
  table: PropTypes.object.isRequired,
  getLinkCellValue: PropTypes.func,
  getRowsByID: PropTypes.func,
  getTableById: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
  getMediaUrl: PropTypes.func,
  */
};

class Cell extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isDataLoaded: false,
      collaborator: null
    }
  }

  componentDidMount() {
    this.calculateCollaboratorData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.calculateCollaboratorData(nextProps);
  }

  calculateCollaboratorData = (props) => {
    const { row, column } = props;
    if (column.type === CellType.LAST_MODIFIER) {
      this.getCollaborator(row._last_modifier);
    } else if (column.type === CellType.CREATOR) {
      this.getCollaborator(row._creator);
    }
  }

  getCollaborator = (value) => {
    if (!value) {
      this.setState({isDataLoaded: true, collaborator: null});
      return;
    }
    this.setState({isDataLoaded: false, collaborator: null});
    let { collaborators } = this.props;
    let collaborator = collaborators && collaborators.find(c => c.email === value);
    if (collaborator) {
      this.setState({isDataLoaded: true, collaborator: collaborator});
      return;
    }

    if (!isValidEmail(value)) {
      let mediaUrl = this.props.getMediaUrl();
      let defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      this.setState({isDataLoaded: true, collaborator: collaborator});
      return;
    }
    
    this.props.getUserCommonInfo(value).then(res => {
      collaborator = res.data;
      this.setState({isDataLoaded: true, collaborator: collaborator});
    }).catch(() => {
      let mediaUrl = this.props.getMediaUrl();
      let defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      this.setState({isDataLoaded: true, collaborator: collaborator});
    });
  }

  renderEmptyFormatter = () => {
    return <span className="row-cell-empty d-inline-block"></span>;
  }

  renderFormatter = () => {
    const { column, row, collaborators, tables } = this.props;
    const { type: columnType, key: columnKey } = column;
    const { isDataLoaded, collaborator } = this.state;
    const _this = this;
    
    switch(columnType) {
      case CellType.TEXT: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        return <TextFormatter value={row[columnKey]} />;
      }
      case CellType.COLLABORATOR: {
        if (!row[columnKey] || row[columnKey].length === 0) return this.renderEmptyFormatter();
        return <CollaboratorFormatter value={row[columnKey]} collaborators={collaborators} />;
      }
      case CellType.LONG_TEXT: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        return <LongTextFormatter value={row[columnKey]} />;
      }
      case CellType.IMAGE: {
        if (!row[columnKey] || row[columnKey].length === 0) return this.renderEmptyFormatter();
        return <ImageFormatter value={row[columnKey]} isSample />;
      }
      case CellType.GEOLOCATION : {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        return <GeolocationFormatter value={row[columnKey]} />;
      }
      case CellType.NUMBER: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        return <NumberFormatter value={row[columnKey]} data={column.data} />;
      }
      case CellType.DATE: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        return <DateFormatter value={row[columnKey]} format={column.data.format} />;
      }
      case CellType.MULTIPLE_SELECT: {
        if (!row[columnKey] || row[columnKey].length === 0) return this.renderEmptyFormatter();
        return <MultipleSelectFormatter value={row[columnKey]} options={column.data.options} />;
      }
      case CellType.SINGLE_SELECT: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        return <SingleSelectFormatter value={row[columnKey]} options={column.data.options} />;
      }
      case CellType.FILE: {
        if (!row[columnKey] || row[columnKey].length === 0) return this.renderEmptyFormatter();
        return <FileFormatter value={row[columnKey]} isSample />;
      }
      case CellType.CHECKBOX: {
        return <CheckboxFormatter value={row[columnKey]} />;
      }
      case CellType.CTIME: {
        if (!row._ctime) return this.renderEmptyFormatter();
        return <CTimeFormatter value={row._ctime} />;
      }
      case CellType.MTIME: {
        if (!row._mtime) return this.renderEmptyFormatter();
        return <MTimeFormatter value={row._mtime} />;
      }
      case CellType.CREATOR: {
        if (!row._creator || !collaborator) return this.renderEmptyFormatter();
        if (isDataLoaded) {
          return <CreatorFormatter collaborators={[collaborator]} value={row._creator} />;
        }
        return null
      }
      case CellType.LAST_MODIFIER: {
        if (!row._last_modifier || !collaborator) return this.renderEmptyFormatter();
        if (isDataLoaded) {
          return <LastModifierFormatter collaborators={[collaborator]} value={row._last_modifier} />;
        }
        return null
      }
      case CellType.FORMULA: {
        let formulaRows = this.props.formulaRows ? {...this.props.formulaRows} : {};
        let formulaValue = formulaRows[row._id] ? formulaRows[row._id][columnKey] : '';
        if (!formulaValue) return this.renderEmptyFormatter();
        return <FormulaFormatter value={formulaValue} column={column} collaborators={collaborators} tables={tables} />;
      }
      case CellType.LINK: {
        let linkMetaData = {
          getLinkedCellValue: function(linkId, table1Id, table2Id, row_id) {
            return _this.props.getLinkCellValue(linkId, table1Id, table2Id, row_id);
          },
          getLinkedRows: function(tableId, rowIds) {
            return _this.props.getRowsByID(tableId, rowIds);
          },
          getLinkedTable: function(tableId) {
            return _this.props.getTableById(tableId);
          },
          expandLinkedTableRow: function(row, tableId) {
            return false
          }
        }
        return <LinkFormatter column={column} row={row} currentTableId={this.props.table._id} linkMetaData={linkMetaData} />;
      }
      case CellType.AUTO_NUMBER: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        return <AutoNumberFormatter value={row[columnKey]} />;
      }
      case CellType.URL: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        return <UrlFormatter value={row[columnKey]} />;
      }
      case CellType.EMAIL: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        return <EmailFormatter value={row[columnKey]} />;
      }
      case CellType.DURATION: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        return <DurationFormatter value={row[columnKey]} format={column.data.duration_format} />;
      }
      default:
        return null
    }
  }

  render() {
    const { column } = this.props;
    return(
      <div className="timeline-grid-cell text-truncate" style={{'width': column.width}}>
        {this.renderFormatter()}
      </div>
    );
  }
}

Cell.propTypes = propTypes;

export default Cell;
