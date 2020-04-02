import * as SETTING_KEY from './setting-key';
import * as zIndexs from './zIndexs';
import {
  DATE_UNIT,
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

export {
  PLUGIN_NAME,
  SETTING_KEY,
  GRID_VIEWS,
  DATE_UNIT,
  NAVIGATE,
  zIndexs,
  ROW_HEIGHT,
  DEFAULT_BG_COLOR,
};