import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import intl from 'react-intl-universal';
import DTable, { CELL_TYPE } from 'dtable-sdk';
import ViewsTabs from './components/views-tabs';
import Timeline from './timeline';
import View from './model/view';
import Group from './model/group';
import TimelineRow from './model/timeline-row';
import Event from './model/event';
import { PLUGIN_NAME, SETTING_KEY, DEFAULT_BG_COLOR, DEFAULT_TEXT_COLOR, RECORD_END_TYPE, DATE_UNIT } from './constants';
import { generatorViewId, getDtableUuid } from './utils';
import EventBus from './utils/event-bus';

import './locale';
import timelineLogo from './assets/image/timeline.png';

import './css/timeline.css';

const DEFAULT_PLUGIN_SETTINGS = {
  views: [
    {
      _id: '0000',
      name: `${intl.get('Default_View')}`,
      settings: {}
    }
  ]
};
const KEY_SELECTED_VIEW_IDS = `${PLUGIN_NAME}-selectedViewIds`;

const EMPTY_LABEL = `(${intl.get('Empty')})`;

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
      window.app.state = {};
      await this.dtable.init(window.dtablePluginConfig);
      await this.dtable.syncWithServer();
      let relatedUsersRes = await this.getRelatedUsersFromServer(this.dtable.dtableStore);
      const userList = relatedUsersRes.data.user_list;
      window.app.collaborators = userList;
      window.app.state.collaborators = userList;
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
    this.cellType = this.dtable.getCellType();
    this.columnIconConfig = this.dtable.getColumnIconConfig();
    this.optionColorsMap = this.getOptionColorsMap();
    this.collaborators = this.getRelatedUsersFromLocal();
    this.setState({
      isLoading: false,
      showDialog,
      plugin_settings,
      selectedViewIdx,
      isShowTimelineSetting
    });
  }

  onPluginToggle = () => {
    setTimeout(() => {
      this.setState({showDialog: false});
    }, 500);
    window.app.onClosePlugin && window.app.onClosePlugin();
  }

  onTimelineSettingToggle = () => {
    this.setState({isShowTimelineSetting: !this.state.isShowTimelineSetting});
  }

  onHideTimelineSetting = () => {
    this.setState({isShowTimelineSetting: false});
  }

  onModifyTimelineSettings = (updated) => {
    let { plugin_settings, selectedViewIdx } = this.state;
    let { views: updatedViews } = plugin_settings;
    let updatedView = plugin_settings.views[selectedViewIdx];
    updatedView.settings = updated;
    updatedViews[selectedViewIdx] = updatedView;
    plugin_settings.views = updatedViews;
    this.setState({plugin_settings}, () => {
      this.dtable.updatePluginSettings(PLUGIN_NAME, plugin_settings);
    });
  }

  getOptionColorsMap = () => {
    let optionColors = this.dtable.getOptionColors();
    if (!Array.isArray(optionColors)) {
      return {};
    }
    let optionColorsMap = {};
    optionColors.forEach((optionColor) => {
      optionColorsMap[optionColor.COLOR] = optionColor.TEXT_COLOR;
    });
    return optionColorsMap;
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

  getRows = (originRows, table, view, settings = {}) => {
    if (!Array.isArray(originRows) || originRows.length === 0) return [];
    let { single_select_column_name, label_column_name, start_time_column_name,
      end_time_column_name, record_duration_column_name, colored_by_row_color, record_end_type } = settings;
    const labelColumn = this.dtable.getColumnByName(table, label_column_name) || {};
    let options = [], rowsColor = {}, singleSelectColumn = {};
    if (colored_by_row_color) {
      const viewRows = this.dtable.getViewRows(view, table);
      rowsColor = this.dtable.getViewRowsColor(viewRows, view, table);
    } else {
      singleSelectColumn = this.dtable.getColumnByName(table, single_select_column_name);
      const { data: singleSelectColumnData } = singleSelectColumn || {};
      options = singleSelectColumnData ? singleSelectColumn.data.options : [];
    }
    let minDate, maxDate, groupedRows = [];
    originRows.forEach((row) => {
      const dtableRow = this.dtable.getRowById(table, row._id);
      let { label, bgColor, textColor, start, end } = this.getEventData(table, row, dtableRow, labelColumn, singleSelectColumn, start_time_column_name,
        end_time_column_name, record_duration_column_name, colored_by_row_color, record_end_type, options, rowsColor);
      minDate = !minDate || dayjs(start.date).isBefore(minDate) ? start.date : minDate;
      maxDate = !maxDate || dayjs(end.date).isAfter(maxDate) ? end.date : maxDate;
      const event = new Event({row, label, bgColor, textColor, start, end});
      this.updateRows(groupedRows, dtableRow, event, minDate, maxDate);
    });
    return groupedRows;
  }

  getGroups = (convertedGroups, originRows, table, view, settings = {}) => {
    if (!Array.isArray(convertedGroups) || convertedGroups.length === 0 ||
    !Array.isArray(originRows) || originRows.length === 0) return [];
    let { single_select_column_name, label_column_name, start_time_column_name,
      end_time_column_name, record_duration_column_name, colored_by_row_color, record_end_type, } = settings;
    const labelColumn = this.dtable.getColumnByName(table, label_column_name) || {};
    let options = [], rowsColor = {}, singleSelectColumn = {};
    if (colored_by_row_color) {
      const viewRows = this.dtable.getViewRows(view, table);
      rowsColor = this.dtable.getViewRowsColor(viewRows, view, table);
    } else {
      singleSelectColumn = this.dtable.getColumnByName(table, single_select_column_name);
      const { data: singleSelectColumnData } = singleSelectColumn || {};
      options = singleSelectColumnData ? singleSelectColumn.data.options : [];
    }
    return convertedGroups.map((group) => {
      let { cell_value, column_name, column_key, rows } = group;
      const key = cell_value + '';
      let convertedRows = rows.map((r) => this.Id2ConvertedRowMap[r._id]);
      cell_value = cell_value || cell_value === 0 ? cell_value : EMPTY_LABEL;

      let timelineRows = [];
      convertedRows.forEach((row) => {
        const dtableRow = this.dtable.getRowById(table, row._id);
        const { label, bgColor, textColor, start, end } = this.getEventData(table, row, dtableRow, labelColumn, singleSelectColumn, start_time_column_name,
          end_time_column_name, record_duration_column_name, colored_by_row_color, record_end_type, options, rowsColor);
        let timelineRow = new TimelineRow({
          row: dtableRow,
          min_date: start.date,
          max_date: end.date,
          events: [
            new Event({row, label, bgColor, textColor, start, end})
          ]
        });
        timelineRows.push(timelineRow);
      });
      let {minDate, maxDate} = this.getGroupBoundaryDates(timelineRows);
      return new Group({
        key,
        cell_value,
        column_name,
        column_key,
        subgroups: null,
        min_date: minDate,
        max_date: maxDate,
        rows: timelineRows
      });
    });
  }

  getGroupBoundaryDates = (groupedRows) => {
    let minDate, maxDate;
    groupedRows.forEach((row) => {
      let { min_date, max_date } = row;
      minDate = !minDate || dayjs(min_date).isBefore(minDate) ? min_date : minDate;
      maxDate = !maxDate || dayjs(max_date).isAfter(maxDate) ? max_date : maxDate;
    });
    return {minDate, maxDate};
  }

  updateRows = (rows, dtableRow, ev, minDate, maxDate) => {
    rows.push(new TimelineRow({
      row: dtableRow,
      min_date: minDate,
      max_date: maxDate,
      events: [ev]
    }));
  }

  getEventData = (table, originalRow, dtableRow, labelColumn, singleSelectColumn, startTimeColumnName, endTimeColumnName, recordDurationColumnName,
    coloredByRowColor, recordEndType, options, rowsColor) => {
    const label = this.getEventLabel(originalRow, labelColumn.name, labelColumn.type, {collaborators: this.collaborators});
    let bgColor, textColor;
    if (coloredByRowColor) {
      bgColor = rowsColor[originalRow._id];
      textColor = this.optionColorsMap[bgColor];
    } else {
      const option = options.find(item => item.id === dtableRow[singleSelectColumn.key]) || {};
      bgColor = option.color;
      textColor = option.textColor;
    }
    bgColor = bgColor || DEFAULT_BG_COLOR;
    textColor = textColor || DEFAULT_TEXT_COLOR;
    let start = originalRow[startTimeColumnName];
    const startColumn = this.dtable.getColumnByName(table, startTimeColumnName);
    const canChangeStart = startColumn && startColumn.type === CELL_TYPE.DATE;
    let end;
    let endColumn;
    let canChangeEnd;
    if (recordEndType === RECORD_END_TYPE.RECORD_DURATION) {
      const duration = originalRow[recordDurationColumnName];
      if (duration && duration !== 0) {
        const { data: startColumnData } = startColumn;
        const isStartIncludeHour = startColumnData && startColumnData.format && startColumnData.format.indexOf('HH:mm') > -1;
        const startFormat = isStartIncludeHour ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
        const addDays = Number(Number(duration).toFixed(0)); // rounding
        end = dayjs(start).add(addDays, DATE_UNIT.DAY).format(startFormat);
      } else {
        end = start;
      }
      endColumn = this.dtable.getColumnByName(table, recordDurationColumnName);
      canChangeEnd = endColumn && endColumn.type === CELL_TYPE.NUMBER;
    } else {
      end = originalRow[endTimeColumnName];
      endColumn = this.dtable.getColumnByName(table, endTimeColumnName);
      canChangeEnd = endColumn && endColumn.type === CELL_TYPE.DATE;
    }
    return {
      label,
      bgColor,
      textColor,
      start: {
        date: start,
        canChange: canChangeStart,
        column: startColumn
      },
      end: {
        date: end,
        canChange: canChangeEnd,
        column: endColumn
      },
    };
  }

  getEventLabel(originalRow, columnName, columnType, {collaborators} = {}) {
    const cellValue = originalRow[columnName];
    switch(columnType) {
      case this.cellType.TEXT:
      case this.cellType.SINGLE_SELECT: {
        return cellValue;
      }
      case this.cellType.COLLABORATOR: {
        if (!Array.isArray(cellValue) || !Array.isArray(collaborators)) {
          return null;
        }
        return cellValue.map((email) => {
          const collaborator = collaborators.find((collaborator) => collaborator.email === email);
          return collaborator && collaborator.name;
        }).join(',');
      }
      default: {
        return cellValue;
      }
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
      this.viewsTabs && this.viewsTabs.setViewsTabsScroll();
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
    const { start_time_column_name, end_time_column_name,
      record_duration_column_name } = settings;
    return start_time_column_name &&
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

  onExportAsImage = () => {
    this.timeline.onExportAsImage();
  }

  onTimelineClick = () => {
    const { isShowTimelineSetting } = this.state;
    if (isShowTimelineSetting) {
      this.onHideTimelineSetting();
    }
  }

  getTableFormulaRows = (table, view) => {
    let rows = this.dtable.getViewRows(view, table);
    return this.dtable.getTableFormulaResults(table, rows);
  }

  onModifyRow = (table, row, update) => {
    this.dtable.modifyRow(table, table.id_row_map[row._id], update);
  }

  getFirstLevelGroupView = (view) => {
    const { groupbys } = view;
    return {
      ...view,
      groupbys: groupbys.slice(0, 1),
    };
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
    let views = this.dtable.getNonArchiveViews(selectedTable);
    let selectedView = this.getSelectedView(selectedTable, settings) || views[0];
    let { name: viewName } = selectedView;
    let isGroupView = this.dtable.isGroupView(selectedView, columns);
    let formulaRows = this.getTableFormulaRows(selectedTable, selectedView);
    selectedView = Object.assign({}, selectedView, {formula_rows: formulaRows});

    let { single_select_column_name, label_column_name, colored_by_row_color } = settings;
    const singleSelectColumn = columns.filter(item => item.type === this.cellType.SINGLE_SELECT)[0];
    if (singleSelectColumn) {
      if (!colored_by_row_color && single_select_column_name === undefined) {
        settings.single_select_column_name = singleSelectColumn.name;
      }
      if (label_column_name === undefined) {
        settings.label_column_name = singleSelectColumn.name;
      }
    }

    const isValidSettings = this.isValidSettings(settings);
    const convertedRows = this.getConvertedRows(tableName, viewName);
    let rows = [];
    let groups = [];
    if (isValidSettings) {
      if (isGroupView) {
        const convertedGroups = this.dtable.getGroupRows(this.getFirstLevelGroupView(selectedView), selectedTable);
        groups = this.getGroups(convertedGroups, convertedRows, selectedTable, selectedView, settings);
      } else {
        rows = this.getRows(convertedRows, selectedTable, selectedView, settings);
      }
    }
    if (window.app === undefined) {
      /* eslint-disable */
      console.log(`---------- Timeline plugin logs start ----------`);
      if (isGroupView) {
        console.log(groups);
      } else {
        console.log(rows);
      }
      console.log(`----------- Timeline plugin logs end -----------`);
    }

    return (
      <div className="dtable-plugin plugin-timeline" ref={ref => this.plugin = ref} onClick={this.onTimelineClick}>
        <div className="plugin-header">
          <div className="plugin-logo">
            <img className="plugin-logo-icon" src={timelineLogo} alt="timeline" />
            <span>{intl.get('Timeline')}</span>
          </div>
          <ViewsTabs
            ref={ref => this.viewsTabs = ref}
            views={timelineViews}
            selectedViewIdx={selectedViewIdx}
            onAddView={this.onAddView}
            onRenameView={this.onRenameView}
            onDeleteView={this.onDeleteView}
            onSelectView={this.onSelectView}
          />
          <div className="timeline-operators">
            <span className="timeline-operator dtable-font dtable-icon-download btn-export-image" onClick={this.onExportAsImage}></span>
            <span className="timeline-operator dtable-font dtable-icon-settings btn-settings" onClick={this.onTimelineSettingToggle}></span>
            <span className="timeline-operator dtable-font dtable-icon-x btn-close" onClick={this.onPluginToggle}></span>
          </div>
        </div>
        <Timeline
          ref={ref => this.timeline = ref}
          tables={tables}
          views={views}
          selectedTable={selectedTable}
          rows={rows}
          isGroupView={isGroupView}
          groups={groups}
          columns={columns}
          collaborators={this.collaborators}
          settings={settings}
          selectedTimelineView={selectedTimelineView}
          eventBus={this.eventBus}
          isShowTimelineSetting={isShowTimelineSetting}
          dtable={this.dtable}
          CellType={this.cellType}
          tableID={selectedTable._id}
          formulaRows={formulaRows}
          columnIconConfig={this.columnIconConfig}
          onModifyTimelineSettings={this.onModifyTimelineSettings}
          onHideTimelineSetting={this.onHideTimelineSetting}
          onRowExpand={this.onRowExpand.bind(this, selectedTable)}
          onModifyRow={(row, update) => this.onModifyRow(selectedTable, row, update)}
        />
      </div>
    );
  }
}

App.propTypes = propTypes;

export default App;
