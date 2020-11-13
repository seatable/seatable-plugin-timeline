import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import PluginSelect from './plugin-select';
import { SETTING_KEY, zIndexs, RECORD_END_TYPE } from '../constants';
import intl from 'react-intl-universal';
import '../locale';

import '../css/timeline-setting.css';

const RECORD_END_TYPES = [RECORD_END_TYPE.END_TIME, RECORD_END_TYPE.RECORD_DURATION];

const propTypes = {
  tables: PropTypes.array,
  views: PropTypes.array,
  nameColumns: PropTypes.array,
  singleSelectColumns: PropTypes.array,
  dateColumns: PropTypes.array,
  numberColumns: PropTypes.array,
  settings: PropTypes.object,
  onModifyTimelineSettings: PropTypes.func,
  onHideTimelineSetting: PropTypes.func,
};

class TimelineSetting extends React.Component {

  renderSelector = (source, settingKey, valueKey, labelKey) => {
    let { settings } = this.props;
    let options = source.map((item) => {
      let value = item[valueKey];
      let label = item[labelKey];
      return {value, label, setting_key: settingKey};
    });
    let selectedOption = options.find(item => item.value === settings[settingKey]);
    if (!selectedOption && (settingKey === SETTING_KEY.TABLE_NAME || settingKey === SETTING_KEY.VIEW_NAME)) {
      selectedOption = options[0];
    }
    return <PluginSelect
      value={selectedOption}
      options={options}
      onChange={this.onModifySettings}
    />
  }

  renderRecordEndType = () => {
    let { settings } = this.props;
    let { record_end_type } = settings;
    record_end_type = record_end_type || RECORD_END_TYPE.END_TIME;
    return RECORD_END_TYPES.map((r) => {
      let displayType = r === RECORD_END_TYPE.END_TIME ? 'End_Date' : 'Duration';
      return (
        <div
          key={`record_end_type_${r}`}
          onClick={() => this.onSelectRecordEndType(r)} 
          className={classnames({
            'record-end-type-item': true,
            'selected': r === record_end_type,
          })}
        >
          <span>{intl.get(displayType)}</span>
        </div>
      );
    });
  }

  renderRecordEndItem = () => {
    let { settings, dateColumns, numberColumns } = this.props;
    let { record_end_type } = settings;
    record_end_type = record_end_type || RECORD_END_TYPE.END_TIME;
    if (record_end_type === RECORD_END_TYPE.RECORD_DURATION) {
      return (
        <div className="setting-item record-duration">
          {this.renderSelector(numberColumns, SETTING_KEY.RECORD_DURATION_COLUMN_NAME, 'name', 'name')}
        </div>
      );
    }
    return (
      <div className="setting-item end-time">
        {this.renderSelector(dateColumns, SETTING_KEY.END_TIME_COLUMN_NAME, 'name', 'name')}
      </div>
    );
  }

  onModifySettings = (selectedOption) => {
    let { settings } = this.props;
    let { setting_key, value } = selectedOption;
    let updated;
    if (setting_key === SETTING_KEY.TABLE_NAME) {
      updated = {[setting_key]: value};  // Need init settings after select new table.
    } else {
      updated = Object.assign({}, settings, {[setting_key]: value});
    }
    this.props.onModifyTimelineSettings(updated);
  };

  onSelectRecordEndType = (recordEndType) => {
    let { settings } = this.props;
    let updated =  Object.assign({}, settings, {[SETTING_KEY.RECORD_END_TYPE]: recordEndType});
    this.props.onModifyTimelineSettings(updated);
  }

  render() {
    let { tables, views, nameColumns, singleSelectColumns, dateColumns, onHideTimelineSetting } = this.props;
    return (
      <div className="plugin-timeline-setting position-absolute" style={{zIndex: zIndexs.TIMELINE_SETTING}} ref={ref => this.timelineSetting = ref}>
        <div className="setting-container">
          <div className="setting-header d-flex align-items-center">
            <div className="setting-header-container d-flex">
              <div className="setting-header-title">{intl.get('Settings')}</div>
              <div className="dtable-font dtable-icon-x btn-close" onClick={onHideTimelineSetting}></div>
            </div>
          </div>
          <div className="setting-body">
            <div className="setting-list">
              <div className="setting-item table">
                <div className="title">{intl.get('Table')}</div>
                {this.renderSelector(tables, SETTING_KEY.TABLE_NAME, 'name', 'name')}
              </div>
              <div className="setting-item table-view">
                <div className="title">{intl.get('View')}</div>
                {this.renderSelector(views, SETTING_KEY.VIEW_NAME, 'name', 'name')}
              </div>
              <div className="split-line"></div>
              <div className="setting-item name">
                <div className="title">{intl.get('Name_Column')}</div>
                {this.renderSelector(nameColumns, SETTING_KEY.NAME_COLUMN_NAME, 'name', 'name')}
              </div>
              <div className="setting-item color">
                <div className="title">{intl.get('Color_Column')}</div>
                {this.renderSelector(singleSelectColumns, SETTING_KEY.SINGLE_SELECT_COLUMN_NAME, 'name', 'name')}
              </div>
              <div className="split-line"></div>
              <div className="setting-item start-time">
                <div className="title">{intl.get('Start_Date')}</div>
                {this.renderSelector(dateColumns, SETTING_KEY.START_TIME_COLUMN_NAME, 'name', 'name')}
              </div>
              <div className="split-line"></div>
              <div className="setting-item record-end-type">{this.renderRecordEndType()}</div>
              {this.renderRecordEndItem()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

TimelineSetting.propTypes = propTypes;

export default TimelineSetting;