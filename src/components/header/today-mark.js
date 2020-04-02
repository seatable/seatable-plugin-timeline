import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  style: PropTypes.object
};

function TodayMark(props) {
  let { style } = props;
  let todayMarkStyle = {
    ...style
  };
  return <div className="today-mark position-absolute" style={todayMarkStyle}></div>;
}

TodayMark.propTypes = propTypes;

export default TodayMark;
