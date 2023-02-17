import { CELL_TYPE } from 'dtable-sdk';

import * as SETTING_KEY from './setting-key';
import * as zIndexes from './zIndexes';
import {
  DATE_UNIT,
  DATE_FORMAT,
} from './dates';

const PLUGIN_NAME = 'timeline';

const GRID_VIEWS = {
  YEAR: 'year',
  QUARTER: 'quarter',
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
};

const NAVIGATE = {
  PREVIOUS: 'previous',
  NEXT: 'next',
  TODAY: 'today'
};

const HEADER_HEIGHT = 85;

const GROUP_HEADER_HEIGHT = 32;

const ROW_HEIGHT = 32;

const DEFAULT_BG_COLOR = '#3b88fd';

const DEFAULT_TEXT_COLOR = '#202428';

const RECORD_END_TYPE = {
  END_TIME: 'end_time',
  RECORD_DURATION: 'record_duration'
};

export const COLLABORATOR_COLUMN_TYPES = [
  CELL_TYPE.COLLABORATOR, CELL_TYPE.CREATOR, CELL_TYPE.LAST_MODIFIER,
];

export {
  PLUGIN_NAME,
  SETTING_KEY,
  GRID_VIEWS,
  DATE_UNIT,
  DATE_FORMAT,
  NAVIGATE,
  zIndexes,
  HEADER_HEIGHT,
  GROUP_HEADER_HEIGHT,
  ROW_HEIGHT,
  DEFAULT_BG_COLOR,
  DEFAULT_TEXT_COLOR,
  RECORD_END_TYPE,
};
