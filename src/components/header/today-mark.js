import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  style: PropTypes.object
};

function TodayMark(props) {
  const { style } = props;
  const todayMarkStyle = {
    ...style
  };
  return <div className="today-mark" style={todayMarkStyle}></div>;
}

TodayMark.propTypes = propTypes;

export default TodayMark;
