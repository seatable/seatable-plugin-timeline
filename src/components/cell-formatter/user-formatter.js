import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  value: PropTypes.string,
};

class UserFormatter extends React.Component {

  render() {
    let { value } = this.props;
    return (
      <div className="cell-formatter grid-cell-type-user">
        <span className="d-inline-block">{value}</span>
      </div>
    );
  }
}

UserFormatter.propTypes = propTypes;

export default UserFormatter;
