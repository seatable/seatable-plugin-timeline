import { GRID_VIEWS } from '../../constants';
import Year from './year';
import Month from './month';

const VIEWS = {
  [GRID_VIEWS.YEAR]: Year,
  [GRID_VIEWS.MONTH]: Month,
};

export default VIEWS;