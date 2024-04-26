import React from 'react';
import PropTypes from 'prop-types';
import { handleEnterKeyDown } from '../utils/common-utils';

import '../css/switch.css';

function Switch(props) {
  const { onChange, checked, placeholder, disabled, className, column } = props;

  const handleKeyDown = (e) => {
    if(e.keyCode !== 13) return;
    e.target.checked = !checked;
    onChange(e);
  };

  return(
    <div className={`timeline-switch ${className || ''}`}>
      <label className='custom-switch'>
        <input
          aria-label={column.name}
          className='custom-switch-input'
          name='custom-switch-checkbox'
          type='checkbox'
          checked={checked || false}
          disabled={disabled || false}
          onChange={onChange}
          onKeyDown={handleKeyDown}
        />
        <span className='custom-switch-description text-truncate'>{placeholder}</span>
        <span className='custom-switch-indicator'></span>
      </label>
    </div>
  );
}

Switch.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  column: PropTypes.object,
};

export default Switch;
