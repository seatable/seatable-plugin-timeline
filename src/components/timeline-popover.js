import React from 'react';
import PropTypes from 'prop-types';
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap';

const propTypes = {
  container: PropTypes.object,
  popperClassName: PropTypes.string,
  target: PropTypes.string,
  offset: PropTypes.number,
  header: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  body: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  onPopoverToggle: PropTypes.func,
};

class TimelinePopover extends React.Component {

  render() {
    let { container, popperClassName, target, offset, header, body } = this.props;
    return (
      <Popover
        container={container}
        placement="bottom"
        trigger="legacy"
        isOpen={true}
        target={target}
        offset={offset}
        fade={false}
        toggle={this.props.onPopoverToggle}
        className={'timeline-popover-container'}
        popperClassName={`timeline-popover ${popperClassName}`}
      >
        {header && <PopoverHeader>{header}</PopoverHeader>}
        {body && <PopoverBody>{body}</PopoverBody>}
      </Popover>
    );
  }
}

TimelinePopover.propTypes = propTypes;

export default TimelinePopover;
