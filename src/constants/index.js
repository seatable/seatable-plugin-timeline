import * as SETTING_KEY from './setting-key';
import * as zIndexs from './zIndexs';

const PLUGIN_NAME = 'timeline';

const VIEW_TYPE = {
  MONTH: 'month',
}

const DATE_UNIT = {
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

const COLUMN_WIDTH = 40;

const DEFAULT_BG_COLOR = '#3b88fd';

export {
  PLUGIN_NAME,
  SETTING_KEY,
  VIEW_TYPE,
  DATE_UNIT,
  NAVIGATE,
  zIndexs,
  ROW_HEIGHT,
  COLUMN_WIDTH,
  DEFAULT_BG_COLOR
};