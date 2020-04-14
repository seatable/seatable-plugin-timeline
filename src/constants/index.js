import * as SETTING_KEY from './setting-key';
import * as zIndexs from './zIndexs';
import {
  DATE_UNIT,
  DATE_FORMAT,
} from './dates';

const PLUGIN_NAME = 'timeline';

const GRID_VIEWS = {
  YEAR: 'year',
  MONTH: 'month',
  DAY: 'day',
}

const NAVIGATE = {
  PREVIOUS: 'previous',
  NEXT: 'next',
  TODAY: 'today'
}

const ROW_HEIGHT = 32;

const DEFAULT_BG_COLOR = '#3b88fd';

const RECORD_END_TYPE = {
  END_TIME: 'end_time',
  RECORD_DURATION: 'record_duration'
};

export {
  PLUGIN_NAME,
  SETTING_KEY,
  GRID_VIEWS,
  DATE_UNIT,
  DATE_FORMAT,
  NAVIGATE,
  zIndexs,
  ROW_HEIGHT,
  DEFAULT_BG_COLOR,
  RECORD_END_TYPE,
};