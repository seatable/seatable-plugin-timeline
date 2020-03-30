import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import DTable from 'dtable-sdk';
import TimelineViewsTabs from './components/timeline-views-tabs';
import Timeline from './timeline';
import TimelineSetting from './components/timeline-setting';
import View from './model/view';
import TimelineRow from './model/timeline-row';
import Event from './model/event';
import { PLUGIN_NAME, SETTING_KEY, DEFAULT_BG_COLOR } from './constants';
import { generatorViewId, getDtableUuid } from './utils';

import './css/plugin-layout.css';
import timeLogo from './assets/image/timeline.png';

const DEFAULT_PLUGIN_SETTINGS = {
  views: [
    {
      _id: '0000',
      name: 'Default View',
      settings: {}
    }
  ]
};

const KEY_SELECTED_VIEW_IDS = `${PLUGIN_NAME}-selectedViewIds`;

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
      plugin_settings: {},
      selectedViewIdx: 0,
    };
    this.dtable = new DTable();
  }

  componentDidMount() {
    this.initPluginDTableData();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({showDialog: nextProps.showDialog});
  }

  componentWillUnmount() {
    this.unsubscribeLocalDtableChanged();
    this.unsubscribeRemoteDtableChanged();
  }

  async initPluginDTableData() {
    if (window.app === undefined) {
      // local develop
      window.app = {};
      await this.dtable.init(window.dtablePluginConfig);
      await this.dtable.syncWithServer();
      let relatedUsersRes = await this.getRelatedUsersFromServer(this.dtable.dtableStore);
      window.app.collaborators = relatedUsersRes.data.user_list;
      this.dtable.subscribe('dtable-connect', () => { this.onDTableConnect(); });
    } else {
      // integrated to dtable app
      this.dtable.initInBrowser(window.app.dtableStore);
    }
    this.unsubscribeLocalDtableChanged = this.dtable.subscribe('local-dtable-changed', () => { this.onDTableChanged(); });
    this.unsubscribeRemoteDtableChanged = this.dtable.subscribe('remote-dtable-changed', () => { this.onDTableChanged(); });
    this.resetData();
  }

  async getRelatedUsersFromServer(dtableStore) {
    return dtableStore.dtableAPI.getTableRelatedUsers();
  }

  onDTableConnect = () => {
    this.resetData();
  }

  onDTableChanged = () => {
    this.resetData();
  }

  resetData = () => {
    let { isShowTimelineSetting } = this.state;
    let plugin_settings = this.dtable.getPluginSettings(PLUGIN_NAME) || {};
    if (!plugin_settings || Object.keys(plugin_settings).length === 0) {
      plugin_settings = DEFAULT_PLUGIN_SETTINGS;
    }
    let { views } = plugin_settings;
    let dtableUuid = getDtableUuid();
    let selectedViewIds = this.getSelectedViewIds(KEY_SELECTED_VIEW_IDS) || {};
    let selectedViewId = selectedViewIds[dtableUuid];
    let selectedViewIdx = views.findIndex(v => v._id === selectedViewId);
    selectedViewIdx = selectedViewIdx > 0 ? selectedViewIdx : 0;
    if (!isShowTimelineSetting) {
      isShowTimelineSetting = !this.isValidViewSettings(views[selectedViewIdx].settings);
    }
    this.setState({
      isLoading: false,
      showDialog: true,
      plugin_settings,
      selectedViewIdx,
      isShowTimelineSetting
    });
  }

  onTimelineSettingToggle = () => {
    this.setState({isShowTimelineSetting: !this.state.isShowTimelineSetting});
  }

  onHideTimelineSetting = () => {
    this.setState({isShowTimelineSetting: false});
  }

  onPluginToggle = () => {
    this.setState({showDialog: false});
  }

  renderBtnGroups = () => {
    return (
      <div className="header-btn-list d-flex align-items-center">
        <span className="dtable-font dtable-icon-x btn-close" onClick={this.onPluginToggle}></span>
      </div>
    );
  }

  onModifyTimelineSettings = (updated) => {
    let { plugin_settings, selectedViewIdx } = this.state;
    let { views: updatedViews } = plugin_settings;
    let updatedView = plugin_settings.views[selectedViewIdx];
    let { settings: updatedSettings} = updatedView || {};
    updatedSettings = Object.assign({}, updatedSettings, updated);
    updatedView.settings = updatedSettings;
    updatedViews[selectedViewIdx] = updatedView;
    plugin_settings.views = updatedViews;
    this.setState({plugin_settings}, () => {
      this.dtable.updatePluginSettings(PLUGIN_NAME, plugin_settings);
    });
  }

  getSelectedTable = (tables, settings = {}) => {
    let selectedTable = this.dtable.getTableByName(settings[SETTING_KEY.TABLE_NAME]);
    if (!selectedTable) {
      return tables[0];
    }
    return selectedTable;
  }

  getSelectedView = (table, settings = {}) => {
    return this.dtable.getViewByName(table, settings[SETTING_KEY.VIEW_NAME]);
  }

  getViews = (table) => {
    let { name } = table || {};
    return this.dtable.getTableViews(name);
  }

  getRelatedUsersFromLocal = () => {
    let { collaborators, state } = window.app;
    if (!collaborators) {
      // dtable app
      return state && state.collaborators;
    }
    return collaborators; // local develop
  }

  getRows = (tableName, viewName, settings = {}) => {
    let collaborators = this.getRelatedUsersFromLocal()
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

  onAddView = (viewName) => {
    let { plugin_settings } = this.state;
    let { views: updatedViews } = plugin_settings;
    let selectedViewIdx = updatedViews.length;
    let _id = generatorViewId(updatedViews);
    let newView = new View({_id, name: viewName});
    updatedViews.push(newView);
    let { settings } = updatedViews[selectedViewIdx];
    let isShowTimelineSetting = !this.isValidViewSettings(settings);
    plugin_settings.views = updatedViews;
    this.setState({
      plugin_settings,
      selectedViewIdx,
      isShowTimelineSetting
    }, () => {
      this.storeSelectedViewId(updatedViews[selectedViewIdx]._id);
      this.dtable.updatePluginSettings(PLUGIN_NAME, plugin_settings);
      this.viewsTabs && this.viewsTabs.setTimelineViewsTabsScroll();
    });
  }

  onRenameView = (viewName) => {
    let { plugin_settings, selectedViewIdx } = this.state;
    let updatedView = plugin_settings.views[selectedViewIdx];
    updatedView = Object.assign({}, updatedView, {name: viewName});
    plugin_settings.views[selectedViewIdx] = updatedView;
    this.setState({
      plugin_settings
    }, () => {
      this.dtable.updatePluginSettings(PLUGIN_NAME, plugin_settings);
    });
  }

  onDeleteView = (viewId) => {
    let { plugin_settings, selectedViewIdx } = this.state;
    let { views: updatedViews } = plugin_settings;
    let viewIdx = updatedViews.findIndex(v => v._id === viewId);
    selectedViewIdx = updatedViews.length - 1 === viewIdx ? viewIdx - 1 : selectedViewIdx;
    if (viewIdx > -1) {
      updatedViews.splice(viewIdx, 1);
      let { settings } = updatedViews[selectedViewIdx];
      let isShowTimelineSetting = !this.isValidViewSettings(settings);
      plugin_settings.views = updatedViews;
      this.setState({
        plugin_settings,
        selectedViewIdx,
        isShowTimelineSetting
      }, () => {
        this.storeSelectedViewId(updatedViews[selectedViewIdx]._id);
        this.dtable.updatePluginSettings(PLUGIN_NAME, plugin_settings);
      });
    }
  }

  onSelectView = (viewId) => {
    let { plugin_settings } = this.state;
    let { views: updatedViews } = plugin_settings;
    let viewIdx = updatedViews.findIndex(v => v._id === viewId);
    if (viewIdx > -1) {
      let { settings } = updatedViews[viewIdx];
      let isShowTimelineSetting = !this.isValidViewSettings(settings);
      this.setState({selectedViewIdx: viewIdx, isShowTimelineSetting});
      this.storeSelectedViewId(viewId);
    }
  }

  storeSelectedViewId = (viewId) => {
    let dtableUuid = getDtableUuid();
    let selectedViewIds = this.getSelectedViewIds(KEY_SELECTED_VIEW_IDS);
    selectedViewIds[dtableUuid] = viewId;
    window.localStorage.setItem(KEY_SELECTED_VIEW_IDS, JSON.stringify(selectedViewIds));
  }

  getSelectedViewIds = (key) => {
    let selectedViewIds = window.localStorage.getItem(key);
    return selectedViewIds ? JSON.parse(selectedViewIds) : {};
  }

  isValidViewSettings = (settings) => {
    return settings && Object.keys(settings).length > 0;
  }

  render() {
    let { isLoading, showDialog, isShowTimelineSetting, plugin_settings, selectedViewIdx } = this.state;
    if (isLoading || !showDialog) {
      return '';
    }
    let { views: timelineViews } = plugin_settings;
    let selectedTimelineView = timelineViews[selectedViewIdx];
    let { settings } = selectedTimelineView || {};
    let tables = this.dtable.getTables();
    let selectedTable = this.getSelectedTable(tables, settings);
    let { name: tableName } = selectedTable || {};
    let views = this.dtable.getViews(selectedTable);
    let selectedView = this.getSelectedView(selectedTable, settings) || views[0];
    let { name: viewName } = selectedView;
    let CellType = this.dtable.getCellType();
    let userColumns = [
      ...this.dtable.getColumnsByType(selectedTable, CellType.COLLABORATOR),
      ...this.dtable.getColumnsByType(selectedTable, CellType.TEXT)
    ];
    let singleSelectColumns = this.dtable.getColumnsByType(selectedTable, CellType.SINGLE_SELECT);
    let dateColumns = this.dtable.getColumnsByType(selectedTable, CellType.DATE);
    let rows = this.getRows(tableName, viewName, settings);
    console.log(`---------- Timeline plugin logs start ----------`);
    console.log(rows);
    console.log(`----------- Timeline plugin logs end -----------`);
    return (
      <Modal isOpen={true} toggle={this.onPluginToggle} className="dtable-plugin plugin-container" size='lg'>
        <ModalHeader className="plugin-header" close={this.renderBtnGroups()}>
          <div className="logo-title d-flex align-items-center">
            <img className="plugin-logo" src={timeLogo} alt="" />
            <span className="plugin-title">{'Timeline'}</span>
          </div>
          <TimelineViewsTabs
            ref={ref => this.viewsTabs = ref}
            views={timelineViews}
            selectedViewIdx={selectedViewIdx}
            onAddView={this.onAddView}
            onRenameView={this.onRenameView}
            onDeleteView={this.onDeleteView}
            onSelectView={this.onSelectView}
          />
        </ModalHeader>
        <ModalBody className="plugin-body position-relative">
          <Timeline
            rows={rows}
            selectedTimelineView={selectedTimelineView}
            onTimelineSettingToggle={this.onTimelineSettingToggle}
          />
          {isShowTimelineSetting &&
            <TimelineSetting
              tables={tables}
              selectedTable={selectedTable}
              views={views}
              userColumns={userColumns}
              singleSelectColumns={singleSelectColumns}
              dateColumns={dateColumns}
              settings={settings || {}}
              onModifyTimelineSettings={this.onModifyTimelineSettings}
              onHideTimelineSetting={this.onHideTimelineSetting}
            />
          }
        </ModalBody>
      </Modal>
    );
  }
}

App.propTypes = propTypes;

export default App;
