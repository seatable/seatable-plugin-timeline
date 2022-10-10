import { GRID_VIEWS } from '../../constants';
import Year from './year';
import Quarter from './quarter';
import Month from './month';
import Day from './day';

const VIEWS = {
  [GRID_VIEWS.YEAR]: Year,
  [GRID_VIEWS.QUARTER]: Quarter,
  [GRID_VIEWS.MONTH]: Month,
  [GRID_VIEWS.DAY]: Day,
};

export default VIEWS;
