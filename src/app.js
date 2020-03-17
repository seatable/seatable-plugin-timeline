import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import DTable from 'dtable-sdk';
import Timeline from './timeline';
import TimelineSetting from './components/timeline-setting';
import TimelineRow from './model/timeline-row';
import Event from './model/event';
import { SETTING_KEY, DEFAULT_BG_COLOR } from './constants';

import './css/plugin-layout.css';
import timeLogo from './assets/image/timeline.png';

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

  getViews = (table) => {
    let { name } = table || {};
    return this.dtable.getTableViews(name);
  }

  getRows = (tableName, viewName) => {
    let { settings } = this.state;
    let { collaborators } = window.app;
    let CellType = this.dtable.getCellType();
    let table = this.dtable.getTableByName(tableName);
    let rows = [];
    let { user_column_name, single_select_column_name, start_time_column_name, end_time_column_name } = settings;
    if (!user_column_name ||
        !start_time_column_name ||
        !end_time_column_name) {
      return [];
    }
    let userColumn = this.dtable.getColumnByName(table, user_column_name);
    let singleSelectColumn = this.dtable.getColumnByName(table, single_select_column_name);
    let options = singleSelectColumn && singleSelectColumn.data ? singleSelectColumn.data.options : [];
    let { type: userColumnType } = userColumn;
    this.dtable.forEachRow(tableName, viewName, (row) => {
      let user = row[user_column_name];
      let label = row[single_select_column_name];
      let option = options.find(item => item.name === label) || {};
      let bgColor = option.color || DEFAULT_BG_COLOR;
      let start = row[start_time_column_name];
      let end = row[end_time_column_name];
      if (user) {
        if (userColumnType === CellType.TEXT) {
          this.updateRows(rows, user, row, label, bgColor, start, end);
        } else if (userColumnType === CellType.COLLABORATOR) {
          user.forEach((item) => {
            let collaborator = collaborators.find(c => c.email === item) || {};
            this.updateRows(rows, collaborator.name, row, label, bgColor, start, end);
          });
        }
      }
    });
    return rows;
  }

  updateRows = (rows, user, row, label, bgColor, start, end) => {
    let index = rows.findIndex(r => r.user === user);
    let event = new Event({row, label, bgColor, start, end});
    if (index > -1) {
      rows[index].events.push(event);
    } else {
      rows.push(new TimelineRow({
        user,
        events: [event]
      }));
    }
  }

  render() {
    let { isLoading, showDialog, isShowTimelineSetting, settings } = this.state;
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
    let userColumns = [
      ...this.dtable.getColumnsByType(selectedTable, CellType.COLLABORATOR),
      ...this.dtable.getColumnsByType(selectedTable, CellType.TEXT)
    ];
    let singleSelectColumns = this.dtable.getColumnsByType(selectedTable, CellType.SINGLE_SELECT);
    let dateColumns = this.dtable.getColumnsByType(selectedTable, CellType.DATE);
    let rows = this.getRows(tableName, viewName);
    console.log(`---------- Timeline plugin logs start ----------`);
    console.log(rows);
    console.log(`----------- Timeline plugin logs end -----------`);
    return (
      <Modal isOpen={true} toggle={this.onPluginToggle} className="dtable-plugin plugin-container" size='lg'>
        <ModalHeader className="plugin-header" close={this.renderBtnGroups()}>
          <img className="plugin-logo" src={timeLogo} alt="" />
          <span>{'Timeline'}</span>
        </ModalHeader>
        <ModalBody className="plugin-body position-relative">
          <Timeline
            rows={rows}
          />
          {isShowTimelineSetting &&
            <TimelineSetting
              tables={tables}
              selectedTable={selectedTable}
              views={views}
              userColumns={userColumns}
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
