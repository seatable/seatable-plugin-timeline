import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  value: PropTypes.string,
};

class UserFormatter extends React.Component {

  render() {
    let { value } = this.props;
    return (
      <div className="cell-formatter grid-cell-type-user d-flex align-items-center">
        <span className="d-inline-block" title={value}>{value}</span>
      </div>
    );
  }
}

UserFormatter.propTypes = propTypes;

export default UserFormatter;
