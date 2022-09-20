import React from 'react';
import PropTypes from 'prop-types';
import { HEADER_HEIGHT } from '../../constants';

const propTypes = {
  renderedRows: PropTypes.array,
  renderHeaderYears: PropTypes.func,
  overScanDates: PropTypes.array,
  renderedDates: PropTypes.array,
  columnWidth: PropTypes.number,
  startOffset: PropTypes.number,
  endOffset: PropTypes.number,
  renderHeaderDates: PropTypes.func,
};

class Header extends React.Component {

  render() {
    const {
      overScanDates, renderedDates, columnWidth, startOffset, endOffset, renderHeaderYears,
      renderHeaderDates,
    } = this.props;
    const headerStyle = {
      width: overScanDates.length * columnWidth + startOffset + endOffset,
      height: HEADER_HEIGHT,
      paddingLeft: startOffset,
      paddingRight: endOffset
    };
    return (
      <div className="timeline-header" style={headerStyle}>
        {renderHeaderYears({overScanDates, renderedDates, columnWidth})}
        {renderHeaderDates({overScanDates, renderedDates, columnWidth, startOffset, endOffset})}
      </div>
    );
  }
}

Header.propTypes = propTypes;

export default Header;
