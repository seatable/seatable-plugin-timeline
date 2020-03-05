import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import DTable from 'dtable-sdk';
import Timeline from './timeline';
import TimelineSetting from './components/timeline-setting';
import TimelineRow from './model/timeline-row';
import Event from './model/event';
import { SETTING_KEY, VIEW_TYPE, DATE_UNIT } from './constants';
import { dates } from './utils';
import moment from 'moment';

import './css/plugin-layout.css';

const propTypes = {
  showDialog: PropTypes.bool
};

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      showDialog: props.showDialog || false,
      isShowTimelineSetting: false,
      settings: {},
      selectedDate: dates.getToday('YYYY-MM-DD'),
      selectedTimelineView: VIEW_TYPE.MONTH,
    };
    this.dtable = null;
  }

  componentDidMount() {
    this.dtable = new DTable();
    this.init();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({showDialog: nextProps.showDialog});
  }

  async init() {
    if (window.app === undefined) {
      window.app = {};
      await this.dtable.init(window.dtableConfig);
      let relatedUsersRes = await this.getRelatedUsers(this.dtable.dtableStore);
      window.app.collaborators = relatedUsersRes.data.user_list;
      this.dtable.subscribe('dtable-connect', () => {this.onDTableConnect();});
      this.dtable.subscribe('remote-data-changed', () => {this.onDTableChanged();});
      await this.dtable.syncWithServer();
      this.resetData();
    } else {
      this.dtable.initInBrowser(window.app.dtableStore);
      let relatedUsersRes = await this.getRelatedUsers(this.dtable.dtableStore);
      window.app.collaborators = relatedUsersRes.data.user_list;
      this.dtable.subscribe('remote-data-changed', () => {this.onDTableChanged();});
      await this.dtable.init(window.dtablePluginConfig);
      this.resetData();
    }
  }

  async getRelatedUsers(dtableStore) {
    return dtableStore.dtableAPI.getTableRelatedUsers();
  }

  onDTableConnect = () => {
    this.resetData();
  }

  onDTableChanged = () => {
    this.resetData();
  }

  resetData = () => {
    this.setState({
      isLoading: false,
      showDialog: true,
    });
  }

  onTimelineSettingToggle = () => {
    this.setState({isShowTimelineSetting: !this.state.isShowTimelineSetting});
  }

  onPluginToggle = () => {
    this.setState({showDialog: false});
  }

  renderBtnGroups = () => {
    return (
      <div className="header-btn-list d-flex">
        <span className="btn-setting" id="btn_setting" onClick={this.onTimelineSettingToggle}>
          <i className="dtable-font dtable-icon-settings"></i>
        </span>
        <span className="dtable-font dtable-icon-x btn-close" onClick={this.onPluginToggle}></span>
      </div>
    );
  }

  onModifyTimelineSettings = (settings) => {
    this.setState({settings});
  }

  getSelectedTable = (tables) => {
    let { settings } = this.state;
    let selectedTable = this.dtable.getTableByName(settings[SETTING_KEY.TABLE_NAME]);
    if (!selectedTable) {
      return tables[0];
    }
    return selectedTable;
  }

  getSelectedView = (table) => {
    let { settings } = this.state;
    return this.dtable.getViewByName(table, settings[SETTING_KEY.VIEW_NAME]);
  }

  onNavigate = (selectedDate) => {
    this.setState({selectedDate});
  }

  getViews = (table) => {
    let { name } = table || {};
    return this.dtable.getTableViews(name);
  }

  getRows = (tableName, viewName) => {
    let { settings, selectedDate, selectedTimelineView } = this.state;
    let table = this.dtable.getTableByName(tableName);
    let formattedDate = moment(selectedDate);
    let startOfSelectedDate, endOfSelectedDate, rows = [];
    if (selectedTimelineView === VIEW_TYPE.MONTH) {
      startOfSelectedDate = formattedDate.startOf(DATE_UNIT.MONTH).format('YYYY-MM-DD');
      endOfSelectedDate = formattedDate.endOf(DATE_UNIT.MONTH).format('YYYY-MM-DD');
    }
    let { collaborator_column_name, single_select_column_name, start_time_column_name, end_time_column_name } = settings;
    if (!collaborator_column_name ||
        !single_select_column_name ||
        !start_time_column_name ||
        !end_time_column_name) {
      return [];
    }
    let singleSelectColumn = this.dtable.getColumnByName(table, single_select_column_name);
    let options = singleSelectColumn && singleSelectColumn.data ? singleSelectColumn.data.options : [];
    this.dtable.forEachRow(tableName, viewName, (row) => {
      let collaborator = row[collaborator_column_name];
      let label = row[single_select_column_name];
      let option = options.find(item => item.name === label);
      let bgColor = option.color;
      let start = row[start_time_column_name];
      let end = row[end_time_column_name];
      let isCurrentRange = moment(start).isBetween(startOfSelectedDate, endOfSelectedDate);
      if (collaborator) {
        collaborator.forEach((item) => {
          let index = rows.findIndex(r => r.collaborator === item);
          let event = new Event({row, label, bgColor, start, end});
          event.row = row;
          if (index > -1 && isCurrentRange) {
            rows[index].events.push(event);
          } else if (index < 0){
            rows.push(new TimelineRow({
              collaborator: item,
              events: isCurrentRange ? [event] : []
            }));
          }
        });
      }
    });
    return rows;
  }

  render() {
    let { isLoading, showDialog, isShowTimelineSetting, settings, selectedDate, selectedTimelineView } = this.state;
    if (isLoading || !showDialog) {
      return '';
    }
    let tables = this.dtable.getTables();
    let selectedTable = this.getSelectedTable(tables);
    let { name: tableName } = selectedTable || {};
    let views = this.dtable.getViews(selectedTable);
    let selectedView = this.getSelectedView(selectedTable) || views[0];
    let { name: viewName } = selectedView;
    let CellType = this.dtable.getCellType();
    let collaboratorColumns = this.dtable.getColumnsByType(selectedTable, CellType.COLLABORATOR);
    let singleSelectColumns = this.dtable.getColumnsByType(selectedTable, CellType.SINGLE_SELECT);
    let dateColumns = this.dtable.getColumnsByType(selectedTable, CellType.DATE);
    let rows = this.getRows(tableName, viewName);
    console.log(`---------- Timeline plugin logs start ----------`);
    console.log(rows);
    console.log(`----------- Timeline plugin logs end -----------`);
    return (
      <Modal isOpen={true} toggle={this.onPluginToggle} className="dtable-plugin plugin-container" size='lg'>
        <ModalHeader className="plugin-header" close={this.renderBtnGroups()}>{'Timeline'}</ModalHeader>
        <ModalBody className="plugin-body position-relative">
          <Timeline
            rows={rows}
            selectedDate={selectedDate}
            selectedTimelineView={selectedTimelineView}
            onNavigate={this.onNavigate}
          />
          {isShowTimelineSetting &&
            <TimelineSetting
              tables={tables}
              selectedTable={selectedTable}
              views={views}
              collaboratorColumns={collaboratorColumns}
              singleSelectColumns={singleSelectColumns}
              dateColumns={dateColumns}
              settings={settings}
              onModifyTimelineSettings={this.onModifyTimelineSettings}
            />
          }
        </ModalBody>
      </Modal>
    );
  }
}

App.propTypes = propTypes;

export default App;
