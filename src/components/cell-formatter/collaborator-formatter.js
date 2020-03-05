import React from 'react';
import PropTypes from 'prop-types';
import CollaboratorOption from '../cell-formatter-widgets/collaborator-option';

const propTypes = {
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  column: PropTypes.object,
};

class CollaboratorFormatter extends React.Component {

  render() {
    let { value } = this.props;

    if (!value) {
      return '';
    }
    return (
      <div className="cell-formatter grid-cell-type-collaborator">
        <CollaboratorOption value={value} />
      </div>
    );
  }
}

CollaboratorFormatter.propTypes = propTypes;

export default CollaboratorFormatter;
