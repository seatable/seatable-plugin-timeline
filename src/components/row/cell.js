import React from 'react';
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
  SimpleLongTextFormatter,
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
  DurationFormatter,
  RateFormatter,
} from 'dtable-ui-component';
import { isValidEmail } from '../../utils/common-utils';

const propTypes = {
  column: PropTypes.object.isRequired,
  row: PropTypes.object.isRequired,
  collaborators: PropTypes.array,
  dtable: PropTypes.object.isRequired,
  tableID: PropTypes.string.isRequired,
  className: PropTypes.string,
  formulaRows: PropTypes.object,
  autoWidth: PropTypes.bool
};

const EMPTY_CELL_FORMATTER = <span className="row-cell-empty d-inline-block"></span>;

class Cell extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isDataLoaded: false,
      collaborator: null
    };
  }

  componentDidMount() {
    this.calculateCollaboratorData(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.calculateCollaboratorData(nextProps);
  }

  getMediaUrl = () => {
    if (window.dtable) {
      return window.dtable.mediaUrl;
    }
    return window.dtablePluginConfig.mediaUrl;
  }

  getUserCommonInfo = (email, avatar_size) => {
    if (window.dtableWebAPI) {
      return window.dtableWebAPI.getUserCommonInfo(email, avatar_size);
    }
    return Promise.reject();
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
      let mediaUrl = this.getMediaUrl();
      let defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      this.setState({isDataLoaded: true, collaborator: collaborator});
      return;
    }

    this.getUserCommonInfo(value).then(res => {
      collaborator = res.data;
      this.setState({isDataLoaded: true, collaborator: collaborator});
    }).catch(() => {
      let mediaUrl = this.getMediaUrl();
      let defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      this.setState({isDataLoaded: true, collaborator: collaborator});
    });
  }

  renderFormatter = () => {
    const { column, row, collaborators, dtable, tableID } = this.props;
    const { isDataLoaded, collaborator } = this.state;
    let { type: columnType, key: columnKey, data: columnData } = column;
    const cellValue = row[columnKey];
    columnData = columnData || {};
    switch(columnType) {
      case CellType.TEXT: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        return <TextFormatter value={cellValue} />;
      }
      case CellType.COLLABORATOR: {
        if (!cellValue || cellValue.length === 0) return EMPTY_CELL_FORMATTER;
        return <CollaboratorFormatter value={cellValue} collaborators={collaborators} />;
      }
      case CellType.LONG_TEXT: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        return <SimpleLongTextFormatter value={cellValue} />;
      }
      case CellType.IMAGE: {
        if (!cellValue || cellValue.length === 0) return EMPTY_CELL_FORMATTER;
        return <ImageFormatter value={cellValue} isSample />;
      }
      case CellType.GEOLOCATION : {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        return <GeolocationFormatter value={cellValue} />;
      }
      case CellType.NUMBER: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        return <NumberFormatter value={cellValue} data={columnData} />;
      }
      case CellType.DATE: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        return <DateFormatter value={cellValue} format={columnData.format} />;
      }
      case CellType.MULTIPLE_SELECT: {
        if (!cellValue || cellValue.length === 0) return EMPTY_CELL_FORMATTER;
        return <MultipleSelectFormatter value={cellValue} options={columnData.options} />;
      }
      case CellType.SINGLE_SELECT: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        return <SingleSelectFormatter value={cellValue} options={columnData.options} />;
      }
      case CellType.FILE: {
        if (!cellValue || cellValue.length === 0) return EMPTY_CELL_FORMATTER;
        return <FileFormatter value={cellValue} isSample />;
      }
      case CellType.CHECKBOX: {
        return <CheckboxFormatter value={cellValue} />;
      }
      case CellType.CTIME: {
        if (!row._ctime) return EMPTY_CELL_FORMATTER;
        return <CTimeFormatter value={row._ctime} />;
      }
      case CellType.MTIME: {
        if (!row._mtime) return EMPTY_CELL_FORMATTER;
        return <MTimeFormatter value={row._mtime} />;
      }
      case CellType.CREATOR: {
        if (!row._creator || !collaborator) return EMPTY_CELL_FORMATTER;
        if (isDataLoaded) {
          return <CreatorFormatter collaborators={[collaborator]} value={row._creator} />;
        }
        return null;
      }
      case CellType.LAST_MODIFIER: {
        if (!row._last_modifier || !collaborator) return EMPTY_CELL_FORMATTER;
        if (isDataLoaded) {
          return <LastModifierFormatter collaborators={[collaborator]} value={row._last_modifier} />;
        }
        return null;
      }
      case CellType.FORMULA:
      case CellType.LINK_FORMULA: {
        let formulaRows = this.props.formulaRows ? {...this.props.formulaRows} : {};
        let formulaValue = formulaRows[row._id] ? formulaRows[row._id][columnKey] : '';
        if (!formulaValue) return EMPTY_CELL_FORMATTER;
        return <FormulaFormatter value={formulaValue} column={column} collaborators={collaborators} />;
      }
      case CellType.LINK: {
        let linkMetaData = {
          getLinkedCellValue: dtable.getLinkCellValue.bind(dtable),
          getLinkedRows: dtable.getRowsByID.bind(dtable),
          getLinkedTable: dtable.getTableById.bind(dtable),
          expandLinkedTableRow: function(row, tableId) {
            return false;
          }
        };
        return <LinkFormatter column={column} row={row} currentTableId={tableID} linkMetaData={linkMetaData} containerClassName="leading-normal" />;
      }
      case CellType.AUTO_NUMBER: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        return <AutoNumberFormatter value={cellValue} />;
      }
      case CellType.URL: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        return <UrlFormatter value={cellValue} />;
      }
      case CellType.EMAIL: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        return <EmailFormatter value={cellValue} />;
      }
      case CellType.DURATION: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        return <DurationFormatter value={cellValue} format={columnData.duration_format} />;
      }
      case CellType.RATE: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        return <RateFormatter value={cellValue} data={columnData} />;
      }
      default:
        return null;
    }
  }

  render() {
    const { column, className, autoWidth } = this.props;
    return (
      <div className={`timeline-grid-cell text-truncate d-flex align-items-center ${className}`} style={autoWidth ? {} : {'width': column.width}}>
        {this.renderFormatter()}
      </div>
    );
  }
}

Cell.propTypes = propTypes;

export default Cell;
