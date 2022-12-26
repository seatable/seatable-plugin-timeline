import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en-gb';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import intl from 'react-intl-universal';
import Picker from '@seafile/seafile-calendar/lib/Picker';
import RangeCalendar from '@seafile/seafile-calendar/lib/RangeCalendar';
import { translateCalendar } from '../../utils/seafile-calendar-translate';
import { zIndexes, DATE_UNIT, DATE_FORMAT } from '../../constants';

import '@seafile/seafile-calendar/assets/index.css';

const propTypes = {
  isExporting: PropTypes.bool,
  gridStartDate: PropTypes.string,
  gridEndDate: PropTypes.string,
  onSelectDateRangeToggle: PropTypes.func,
  onConfirmExportDateRange: PropTypes.func,
};

class SelectExportDateRangeDialog extends Component {

  constructor(props) {
    super(props);
    const lang = window.dtable ? window.dtable.lang : 'zh-cn';
    const now = dayjs();
    let startDate = now.clone().startOf(DATE_UNIT.YEAR);
    let endDate = now.clone().endOf(DATE_UNIT.YEAR);
    if (lang === 'zh-cn') {
      startDate = startDate.locale('zh-cn');
      endDate = endDate.locale('zh-cn');
    } else {
      startDate = startDate.locale('en-gb');
      endDate = endDate.locale('en-gb');
    }
    this.state = {
      dateRange: [startDate, endDate],
    };
  }

  renderDatePicker = () => {
    const { dateRange } = this.state;
    return (
      <Picker
        value={dateRange}
        calendar={this.renderRangeCalendar()}
        style={{ zIndex: zIndexes.RC_CALENDAR }}
        onOpenChange={this.onOpenChange}
        onChange={this.onDatePickerChange}
      >
        {({ value }) => {
          return (
            <span>
              <input
                readOnly
                className="ant-calendar-picker-input ant-input"
                value={value && value[0] && value[1] ? `${value[0].format(DATE_FORMAT.YEAR_MONTH_DAY)} - ${value[1].format(DATE_FORMAT.YEAR_MONTH_DAY)}` : ''}
              />
            </span>
          );}
        }
      </Picker>
    );
  }

  renderRangeCalendar = () => {
    const { dateRange } = this.state;
    return (
      <RangeCalendar
        className={'timeline-date-range-calendar'}
        locale={translateCalendar()}
        showToday={false}
        format={DATE_FORMAT.YEAR_MONTH_DAY}
        defaultSelectedValue={dateRange}
        onPanelChange={this.onChangeSelectedRangeDates}
      />
    );
  }

  onOpenChange = (open) => {
    if (!open) {
      const { dateRange } = this.state;
      const { gridStartDate, gridEndDate } = this.props;

      // not changed.
      if (dateRange[0].isSame(gridStartDate) && dateRange[1].isSame(gridEndDate)) {
        return;
      }

      // not allowed date range.
      const diffs = dateRange[1].diff(dateRange[0], DATE_UNIT.DAY);
      if (diffs < 0) {
        const { gridStartDate, gridEndDate } = this.props;
        this.setState({
          dateRange: [dayjs(gridStartDate), dayjs(gridEndDate)]
        });
        return;
      }
    }
  }

  onDatePickerChange = (dates) => {
    this.setState({dateRange: dates});
  }

  onChangeSelectedRangeDates = (dates) => {
    this.setState({dateRange: dates});
  }

  toggle = () => {
    if (this.props.isExporting) {
      return;
    }
    this.props.onSelectDateRangeToggle();
  }

  handleSubmit = () => {
    if (this.props.isExporting) {
      return;
    }
    const { dateRange } = this.state;
    const startDate = dateRange[0].format(DATE_FORMAT.YEAR_MONTH_DAY);
    const endDate = dateRange[1].format(DATE_FORMAT.YEAR_MONTH_DAY);
    this.props.onConfirmExportDateRange(startDate, endDate);
  }

  render() {
    const { isExporting } = this.props;
    return (
      <Modal isOpen={true} toggle={this.toggle} autoFocus={false} className="timeline-export-select-date-range">
        <ModalHeader toggle={this.toggle}>{intl.get('Select_the_date_range_to_export')}</ModalHeader>
        <ModalBody>
          <div className="selected-date-range">{this.renderDatePicker()}</div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={this.toggle} className={isExporting ? 'disabled' : ''}>{intl.get('Cancel')}</Button>
          <Button color="primary" onClick={this.handleSubmit} className={isExporting ? 'disabled' : ''}>{intl.get(isExporting ? 'Exporting' : 'Export')}</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

SelectExportDateRangeDialog.propTypes = propTypes;

export default SelectExportDateRangeDialog;
