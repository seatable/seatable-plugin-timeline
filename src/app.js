import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import moment from 'moment';
import DTable from 'dtable-sdk';
import TimelineViewsTabs from './components/timeline-views-tabs';
import Timeline from './timeline';
import TimelineSetting from './components/timeline-setting';
import View from './model/view';
import TimelineRow from './model/timeline-row';
import Event from './model/event';
import { PLUGIN_NAME, SETTING_KEY, DEFAULT_BG_COLOR, DEFAULT_TEXT_COLOR, RECORD_END_TYPE, DATE_UNIT } from './constants';
import { generatorViewId, getDtableUuid } from './utils';
import TimelinePopover from './components/timeline-popover';
import RowExpand from './components/row-expand';

import intl from 'react-intl-universal';

import './locale';

import './css/plugin-layout.css';
import timelineLogo from './assets/image/timeline.png';

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
      isShowRowExpand: false,
      rowExpandTarget: '',
      expandedRow: {},
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

  onTimelineSettingToggle = () => {
    this.setState({isShowTimelineSetting: !this.state.isShowTimelineSetting});
  }

  onHideTimelineSetting = () => {
    this.setState({isShowTimelineSetting: false});
  }

  onPluginToggle = () => {
    this.setState({showDialog: false});
    window.app.onClosePlugin();
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

  getRows = (tableName, viewName, cellType, collaborators, settings = {}) => {
    let table = this.dtable.getTableByName(tableName);
    let rows = [];
    let {
      name_column_name,
      single_select_column_name,
      start_time_column_name,
      end_time_column_name,
      record_duration_column_name,
      record_end_type,
    } = settings;
    if (!name_column_name ||
        !start_time_column_name ||
        (!end_time_column_name && !record_duration_column_name)) {
      return [];
    }
    let nameColumn = this.dtable.getColumnByName(table, name_column_name);
    let singleSelectColumn = this.dtable.getColumnByName(table, single_select_column_name);
    let { data: singleSelectColumnData } = singleSelectColumn || {};
    let options = singleSelectColumnData ? singleSelectColumn.data.options : [];
    let { type: nameColumnType } = nameColumn || {};
    this.dtable.forEachRow(tableName, viewName, (row) => {
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
      if (name) {
        if (nameColumnType === cellType.TEXT) {
          this.updateRows(rows, name, row, label, bgColor, textColor, start, end);
        } else if (nameColumnType === cellType.COLLABORATOR) {
          name.forEach((item) => {
            let collaborator = collaborators.find(c => c.email === item) || {};
            this.updateRows(rows, collaborator.name, row, label, bgColor, textColor, start, end);
          });
        }
      }
    });
    return rows;
  }

  updateRows = (rows, name, row, label, bgColor, textColor, start, end) => {
    let index = rows.findIndex(r => r.name === name.trim());
    let event = new Event({row, label, bgColor, textColor, start, end});
    if (index > -1) {
      rows[index].events.push(event);
    } else {
      rows.push(new TimelineRow({
        name,
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

  onRowExpand = (evt, row, target) => {
    if (this.state.isShowRowExpand) return;
    let viewportRightDom = document.querySelector('.timeline-viewport-right');
    let { left: viewportRightLeft, width: viewportRightWidth } = viewportRightDom.getBoundingClientRect();
    let { left: eventCellLeft, width: eventCellWidth } = evt.target.getBoundingClientRect();
    let rowExpandOffsetLeft = 0;
    if (Math.abs(eventCellLeft - viewportRightLeft) + eventCellWidth > viewportRightWidth) {
      rowExpandOffsetLeft = -((eventCellLeft + eventCellWidth / 2) - evt.clientX);
    }
    this.setState({
      isShowRowExpand: true,
      rowExpandTarget: target,
      expandedRow: row,
      rowExpandOffsetLeft
    });
  }

  onRowExpandToggle = () => {
    this.setState({isShowRowExpand: !this.state.isShowRowExpand});
  }

  onViewportRightScroll = () => {
    this.onResetRowExpand();
  }

  onResetRowExpand = () => {
    let { isShowRowExpand, rowExpandTarget } = this.state;
    if (isShowRowExpand && rowExpandTarget) {
      let rowExpandTargetDom = document.querySelector(`#${rowExpandTarget}`);
      if (rowExpandTargetDom) {
        let viewportRightDom = document.querySelector('.timeline-viewport-right');
        let { left: viewportRightLeft, width: viewportRightWidth } = viewportRightDom.getBoundingClientRect();
        let { left: rowExpandTargetLeft, width: rowExpandTargetWidth } = rowExpandTargetDom.getBoundingClientRect();
        let popoverOffsetLeft = rowExpandTargetLeft - viewportRightLeft;
        if (popoverOffsetLeft >= viewportRightWidth || popoverOffsetLeft <= -rowExpandTargetWidth) {
          this.setState({
            isShowRowExpand: false,
            rowExpandTarget: '',
            expandedRow: {}
          });
        }
      }
    }
  }

  render() {
    let { isLoading, showDialog, isShowTimelineSetting, plugin_settings, selectedViewIdx, isShowRowExpand, rowExpandTarget, expandedRow, rowExpandOffsetLeft } = this.state;
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
    let collaborators = this.getRelatedUsersFromLocal();
    let nameColumns = [
      ...this.dtable.getColumnsByType(selectedTable, CellType.COLLABORATOR),
      ...this.dtable.getColumnsByType(selectedTable, CellType.TEXT)
    ];
    let singleSelectColumns = this.dtable.getColumnsByType(selectedTable, CellType.SINGLE_SELECT);
    let dateColumns = this.dtable.getColumnsByType(selectedTable, CellType.DATE);
    let numberCoumns = this.dtable.getColumnsByType(selectedTable, CellType.NUMBER);
    let rows = this.getRows(tableName, viewName, CellType, collaborators, settings);
    console.log(`---------- Timeline plugin logs start ----------`);
    console.log(rows);
    console.log(`----------- Timeline plugin logs end -----------`);
    return (
      <Modal isOpen={true} toggle={this.onPluginToggle} className="dtable-plugin timeline" size='lg'>
        <ModalHeader className="plugin-header" close={this.renderBtnGroups()}>
          <div className="logo-title d-flex align-items-center">
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
        <ModalBody className="plugin-body position-relative">
          <Timeline
            rows={rows}
            selectedTimelineView={selectedTimelineView}
            onTimelineSettingToggle={this.onTimelineSettingToggle}
            onViewportRightScroll={this.onViewportRightScroll}
            onRowExpand={this.onRowExpand}
          />
          {isShowTimelineSetting &&
            <TimelineSetting
              tables={tables}
              selectedTable={selectedTable}
              views={views}
              nameColumns={nameColumns}
              singleSelectColumns={singleSelectColumns}
              dateColumns={dateColumns}
              numberCoumns={numberCoumns}
              settings={settings || {}}
              onModifyTimelineSettings={this.onModifyTimelineSettings}
              onHideTimelineSetting={this.onHideTimelineSetting}
            />
          }
        </ModalBody>
        {isShowRowExpand &&
          <TimelinePopover
            container={document.querySelector('.timeline-viewport-right')}
            popperClassName={'popper-row-expand'}
            target={rowExpandTarget}
            offset={rowExpandOffsetLeft}
             body={
              <RowExpand
                selectedTable={selectedTable}
                expandedRow={expandedRow}
                getOriginalRow={this.dtable.getRowById}
                getColumnByName={this.dtable.getColumnByName}
                cellType={CellType}
                collaborators={collaborators}
              />
            }
            onPopoverToggle={this.onRowExpandToggle}
          />
        }
      </Modal>
    );
  }
}

App.propTypes = propTypes;

export default App;