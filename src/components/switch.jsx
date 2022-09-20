import React from 'react';
import PropTypes from 'prop-types';

import '../css/switch.css';

function Switch(props) {
  const { onChange, checked, placeholder, disabled, className } = props;
  return(
    <div className={`timeline-switch ${className || ''}`}>
      <label className='custom-switch'>
        <input
          className='custom-switch-input'
          name='custom-switch-checkbox'
          type='checkbox'
          checked={checked || false}
          disabled={disabled || false}
          onChange={onChange}
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
};

export default Switch;
