import React from 'react';
import PropTypes from 'prop-types';
import PluginSelect from './plugin-select';
import { SETTING_KEY, zIndexs } from '../constants';

import '../css/timeline-setting.css';

const propTypes = {
  tables: PropTypes.array,
  views: PropTypes.array,
  userColumns: PropTypes.array,
  singleSelectColumns: PropTypes.array,
  dateColumns: PropTypes.array,
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

  render() {
    let { tables, views, userColumns, singleSelectColumns, dateColumns, onHideTimelineSetting } = this.props;
    return (
      <div className="plugin-timeline-setting position-absolute" style={{zIndex: zIndexs.TIMELINE_SETTING}} ref={ref => this.timelineSetting = ref}>
        <div className="setting-container">
          <div className="setting-header d-flex align-items-center">
            <div className="setting-header-title">设置</div>
            <div className="dtable-font dtable-icon-x btn-close" onClick={onHideTimelineSetting}></div>
          </div>
          <div className="setting-body">
            <div className="setting-list">
              <div className="setting-item table-setting">
                <div className="title">表格</div>
                {this.renderSelector(tables, SETTING_KEY.TABLE_NAME, 'name', 'name')}
              </div>
              <div className="setting-item view-setting">
                <div className="title">视图</div>
                {this.renderSelector(views, SETTING_KEY.VIEW_NAME, 'name', 'name')}
              </div>
              <div className="split-line"></div>
              <div className="setting-item user-setting">
                <div className="title">名称字段</div>
                {this.renderSelector(userColumns, SETTING_KEY.USER_COLUMN_NAME, 'name', 'name')}
              </div>
              <div className="setting-item color-setting">
                <div className="title">颜色标签字段</div>
                {this.renderSelector(singleSelectColumns, SETTING_KEY.SINGLE_SELECT_COLUMN_NAME, 'name', 'name')}
              </div>
              <div className="split-line"></div>
              <div className="setting-item start-time-setting">
                <div className="title">开始时间</div>
                {this.renderSelector(dateColumns, SETTING_KEY.START_TIME_COLUMN_NAME, 'name', 'name')}
              </div>
              <div className="setting-item end-time-setting">
                <div className="title">结束时间</div>
                {this.renderSelector(dateColumns, SETTING_KEY.END_TIME_COLUMN_NAME, 'name', 'name')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

TimelineSetting.propTypes = propTypes;

export default TimelineSetting;