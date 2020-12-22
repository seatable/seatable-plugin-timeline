import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import moment from 'moment';
import intl from 'react-intl-universal';
import DTable from 'dtable-sdk';
import TimelineViewsTabs from './components/timeline-views-tabs';
import Timeline from './timeline';
import View from './model/view';
import Group from './model/group';
import TimelineRow from './model/timeline-row';
import Event from './model/event';
import { PLUGIN_NAME, SETTING_KEY, DEFAULT_BG_COLOR, DEFAULT_TEXT_COLOR, RECORD_END_TYPE, DATE_UNIT, zIndexes } from './constants';
import { generatorViewId, getDtableUuid } from './utils';
import EventBus from './utils/event-bus';

import './locale';
import timelineLogo from './assets/image/timeline.png';

import './css/plugin-layout.css';

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
    this.eventBus = new EventBus();
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
    this.resetData(true);
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

  resetData = (init = false) => {
    let { showDialog, isShowTimelineSetting } = this.state;
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
    if (init) {
      isShowTimelineSetting = !this.isValidViewSettings(views[selectedViewIdx].settings);
      showDialog = true;
    }
    this.setState({
      isLoading: false,
      showDialog,
      plugin_settings,
      selectedViewIdx,
      isShowTimelineSetting
    });
  }

  onPluginToggle = () => {
    this.setState({showDialog: false});
    window.app.onClosePlugin && window.app.onClosePlugin();
  }

  onTimelineSettingToggle = () => {
    this.setState({isShowTimelineSetting: !this.state.isShowTimelineSetting});
  }

  onHideTimelineSetting = () => {
    this.setState({isShowTimelineSetting: false});
  }

  renderBtnGroups = () => {
    return (
      <div className="header-btn-list">
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

  getConvertedRows = (tableName, viewName) => {
    let rows = [];
    this.Id2ConvertedRowMap = {};
    this.dtable.forEachRow(tableName, viewName, (row) => {
      this.Id2ConvertedRowMap[row._id] = row;
      rows.push(row);
    });
    return rows;
  }

  getRows = (originRows, table, cellType, collaborators, settings = {}) => {
    let { name_column_name, single_select_column_name } = settings;
    let nameColumn = this.dtable.getColumnByName(table, name_column_name);
    let singleSelectColumn = this.dtable.getColumnByName(table, single_select_column_name);
    let { data: singleSelectColumnData } = singleSelectColumn || {};
    let options = singleSelectColumnData ? singleSelectColumn.data.options : [];
    let { type: nameColumnType } = nameColumn || {};
    return this.getGroupedRows(originRows, nameColumnType, settings, options, cellType, collaborators);
  }

  getGroups = (convertedGroups, originRows, table, cellType, collaborators, settings = {}) => {
    if (!Array.isArray(convertedGroups) || convertedGroups.length === 0 ||
    !Array.isArray(originRows) || originRows.length === 0) return [];
    let { name_column_name, single_select_column_name } = settings;
    let nameColumn = this.dtable.getColumnByName(table, name_column_name);
    let singleSelectColumn = this.dtable.getColumnByName(table, single_select_column_name);
    let { data: singleSelectColumnData } = singleSelectColumn || {};
    let options = singleSelectColumnData ? singleSelectColumn.data.options : [];
    let { type: nameColumnType } = nameColumn || {};
    let groups = [];
    convertedGroups.forEach((group) => {
      let { cell_value, column_name, column_key, rows } = group;
      let convertedRows = rows.map((r) => this.Id2ConvertedRowMap[r._id]);
      cell_value = cell_value || cell_value === 0  ? cell_value : `(${intl.get('Empty')})`;
      let groupedRows = this.getGroupedRows(convertedRows, nameColumnType, settings, options, cellType, collaborators);
      let {minDate, maxDate} = this.getGroupBoundaryDates(groupedRows);
      groups.push(new Group({
        cell_value,
        column_name,
        column_key,
        subgroups: null,
        min_date: minDate,
        max_date: maxDate,
        rows: groupedRows
      }));
    });
    return groups;
  }

  getGroupBoundaryDates = (groupedRows) => {
    let minDate, maxDate;
    groupedRows.forEach((row) => {
      let { min_date, max_date } = row;
      minDate = !minDate || moment(min_date).isBefore(minDate) ? min_date : minDate;
      maxDate = !maxDate || moment(max_date).isAfter(maxDate) ? max_date : maxDate;
    });
    return {minDate, maxDate};
  }

  getGroupedRows = (rows, nameColumnType, settings, options, cellType, collaborators) => {
    let { name_column_name, single_select_column_name, start_time_column_name,
      end_time_column_name, record_duration_column_name, record_end_type,
    } = settings;
    let minDate, maxDate, groupedRows = [];
    rows.forEach((row) => {
      let name = row[name_column_name];
      let label = row[single_select_column_name];
      let option = options.find(item => item.name === label) || {};
      let bgColor = option.color || DEFAULT_BG_COLOR;
      let textColor = option.textColor || DEFAULT_TEXT_COLOR;
      let start = row[start_time_column_name];
      let end;
      if (record_end_type === RECORD_END_TYPE.RECORD_DURATION) {
        let duration = row[record_duration_column_name];
        if (duration && duration !== 0) {
          end = moment(start).add(Math.ceil(duration) - 1, DATE_UNIT.DAY).format('YYYY-MM-DD');
        }
      } else {
        end = row[end_time_column_name];
      }
      minDate = !minDate || moment(start).isBefore(minDate) ? start : minDate;
      maxDate = !maxDate || moment(end).isAfter(maxDate) ? end : maxDate;
      if (Object.prototype.toString.call(name) === '[object Number]') {
        name += '';
      }
      name = name || `(${intl.get('Empty')})`;
      if (nameColumnType === cellType.TEXT) {
        this.updateRows(groupedRows, name, row, label, bgColor, textColor, start, end, minDate, maxDate);
      } else if (nameColumnType === cellType.COLLABORATOR) {
        name.forEach((item) => {
          let collaborator = collaborators.find(c => c.email === item);
          if (collaborator) {
            this.updateRows(groupedRows, collaborator.name, row, label, bgColor, textColor, start, end, minDate, maxDate);
          }
        });
      }
    });
    return groupedRows;
  }

  updateRows = (rows, name, row, label, bgColor, textColor, start, end, minDate, maxDate) => {
    let formattedName = name ? (name + '').trim() : '';
    let index = rows.findIndex(r => r.name === formattedName);
    let event = new Event({row, label, bgColor, textColor, start, end});
    if (index > -1) {
      rows[index].events.push(event);
    } else {
      rows.push(new TimelineRow({
        name: formattedName,
        min_date: minDate,
        max_date: maxDate,
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

  isValidSettings = (settings) => {
    let { name_column_name, start_time_column_name, end_time_column_name,
      record_duration_column_name } = settings;
    return name_column_name && start_time_column_name &&
      (end_time_column_name || record_duration_column_name);
  }

  getColumnIconConfig = () => {
    return this.dtable.getColumnIconConfig();
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

  getLinkCellValue = (linkId, table1Id, table2Id, rowId) => {
    return this.dtable.getLinkCellValue(linkId, table1Id, table2Id, rowId);
  }

  getRowsByID = (tableId, rowIds) => {
    return this.dtable.getRowsByID(tableId, rowIds);
  }

  getTableById = (table_id) => {
    return this.dtable.getTableById(table_id);
  }

  onRowExpand = (table, row) => {
    if (window.app.expandRow) {
      let originRow = this.dtable.getRowById(table, row._id);
      window.app.expandRow(originRow, table);
    }
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
    let columns = this.dtable.getColumns(selectedTable);
    let views = this.dtable.getViews(selectedTable);
    let selectedView = this.getSelectedView(selectedTable, settings) || views[0];
    let { name: viewName } = selectedView;
    let isGroupView = this.dtable.isGroupView(selectedView, columns);
    let CellType = this.dtable.getCellType();
    let collaborators = this.getRelatedUsersFromLocal();
    let nameColumns = [
      ...this.dtable.getColumnsByType(selectedTable, CellType.COLLABORATOR),
      ...this.dtable.getColumnsByType(selectedTable, CellType.TEXT)
    ];
    let singleSelectColumns = this.dtable.getColumnsByType(selectedTable, CellType.SINGLE_SELECT);
    let dateColumns = this.dtable.getColumnsByType(selectedTable, CellType.DATE);
    let numberColumns = this.dtable.getColumnsByType(selectedTable, CellType.NUMBER);
    const isValidSettings = this.isValidSettings(settings);
    const convertedRows = this.getConvertedRows(tableName, viewName);
    let rows = [];
    let groups = [];
    if (isValidSettings) {
      if (isGroupView) {
        const convertedGroups = this.dtable.getGroupRows(selectedView, selectedTable);
        groups = this.getGroups(convertedGroups, convertedRows, selectedTable, CellType, collaborators, settings);
      } else {
        rows = this.getRows(convertedRows, selectedTable, CellType, collaborators, settings);
      }
    }
    /* eslint-disable */
    console.log(`---------- Timeline plugin logs start ----------`);
    if (isGroupView) {
      console.log(groups);
    } else {
      console.log(rows);
    }
    console.log(`----------- Timeline plugin logs end -----------`);
    return (
      <Modal isOpen={true} toggle={this.onPluginToggle} className="dtable-plugin timeline" size='lg' zIndex={zIndexes.TIMELINE_DIALOG}>
        <ModalHeader className="plugin-header" close={this.renderBtnGroups()}>
          <div className="logo-title">
            <img className="plugin-logo" src={timelineLogo} alt="" />
            <span className="plugin-title">{intl.get('Timeline')}</span>
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
        <ModalBody className="plugin-body">
          <Timeline
            tables={tables}
            views={views}
            rows={rows}
            isGroupView={isGroupView}
            groups={groups}
            columns={columns}
            nameColumns={nameColumns}
            singleSelectColumns={singleSelectColumns}
            dateColumns={dateColumns}
            numberColumns={numberColumns}
            settings={settings}
            selectedTimelineView={selectedTimelineView}
            eventBus={this.eventBus}
            isShowTimelineSetting={isShowTimelineSetting}
            onTimelineSettingToggle={this.onTimelineSettingToggle}
            onModifyTimelineSettings={this.onModifyTimelineSettings}
            onHideTimelineSetting={this.onHideTimelineSetting}
            onRowExpand={this.onRowExpand.bind(this, selectedTable)}
          />
        </ModalBody>
      </Modal>
    );
  }
}

App.propTypes = propTypes;

export default App;