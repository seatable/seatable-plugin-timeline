import React from 'react';
import PropTypes from 'prop-types';
import { zIndexs } from '../../constants'

import '../../css/dropdown-menu.css';

const propTypes = {
  dropdownMenuPosition: PropTypes.object,
  options: PropTypes.node,
}

class ViewDropdownMenu extends React.Component {

  render() {
    let { dropdownMenuPosition, options } = this.props;
    let dropdownMenuStyle = {
      zIndex: zIndexs.DROPDOWN_MENU,
      ...dropdownMenuPosition,
    };
    return (
      <div className="dropdown-menu large show" style={dropdownMenuStyle}>
        {options || <div className="no-options d-flex align-items-center justify-content-center">No options</div>}
      </div>
    );
  }
}

ViewDropdownMenu.propTypes = propTypes;

export default ViewDropdownMenu;