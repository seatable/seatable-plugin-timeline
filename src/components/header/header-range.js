import React from 'react';
import PropTypes from 'prop-types';
import { dates } from '../../utils';

const propTypes = {
  days: PropTypes.array,
};

class HeaderRange extends React.Component {

  render() {
    let { days } = this.props;
    return (
      <div className="header-days-range d-flex">
        {days.map((d) => {
          let week = dates.getDate2Week(d);
          return <div key={`header-range-${d}`} className="days-range-week d-inline-flex align-items-center justify-content-center">{week}</div>;
        })}
      </div>
    );
  }
}

HeaderRange.propTypes = propTypes;

export default HeaderRange;