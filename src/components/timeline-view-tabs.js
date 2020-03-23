import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ModalPortal from './dialog/modal-portal';
import ViewDropdownMenu from './dropdown-menu/view-dropdownmenu';

const propTypes = {
  views: PropTypes.array,
  selectedViewIdx: PropTypes.number,
  onDeleteTimelineView: PropTypes.func,
};

class TimelineViewTabs extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowViewDropdown: false,
      dropdownMenuPosition: {
        top: 0,
        left: 0
      }
    };
    this.views = [];
  }

  componentDidMount() {
    let { selectedViewIdx } = this.props;
    let { left } = this.views[selectedViewIdx].getBoundingClientRect();
    let { offsetWidth } = this.viewsTabsScrll;
    if (left > offsetWidth) {
      this.viewsTabsScrll.scrollLeft = left - offsetWidth;
    }
    document.addEventListener('click', this.onHideViewDropdown);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onHideViewDropdown);
  }

  onDropdownToggle = (evt) => {
    evt.nativeEvent.stopImmediatePropagation()
    let { top, left, height } = this.btnViewDropdown.parentNode.getBoundingClientRect();
    this.setState({
      isShowViewDropdown: !this.state.isShowViewDropdown,
      dropdownMenuPosition: {
        top: top + height - 3,
        left
      }
    });
  }

  onHideViewDropdown = () => {
    this.setState({isShowViewDropdown: false});
  }

  setViewItem = idx => viewItem => {
    this.views[idx] = viewItem;
  }

  setTimelineViewTabsScroll = () => {
    let { offsetWidth, scrollWidth } = this.viewsTabsScrll;
    this.viewsTabsScrll.scrollLeft = scrollWidth - offsetWidth;
  }

  render() {
    let { views, selectedViewIdx } = this.props;
    let { isShowViewDropdown, dropdownMenuPosition } = this.state;
    let viewsLength = views.length;
    return (
      <div className="timeline-views-tabs d-flex">
        <div className="views-tabs-scroll" ref={ref => this.viewsTabsScrll = ref}>
          <div className="views d-inline-flex">
            {views.map((v, i) => {
              let { _id, name } = v;
              let isActiveView = selectedViewIdx === i;
              return (
                <div
                  key={`timeline-views-${_id}`}
                  className={classnames({
                    'view-item': true, 
                    'active': isActiveView
                  })
                }>
                  <div
                    className="view-item-content d-flex align-items-center justify-content-center position-relative"
                    ref={this.setViewItem(i)}
                    onClick={this.props.onSelectTimelineView.bind(this, _id)}
                  >
                    <div className="view-name">{name}</div>
                    {isActiveView &&
                      <div
                        className="btn-view-dropdown d-flex align-items-center justify-content-center"
                        ref={ref => this.btnViewDropdown = ref}
                        onClick={this.onDropdownToggle}
                      >
                        <i className="dtable-font dtable-icon-drop-down"></i>
                        {isShowViewDropdown &&
                          <ModalPortal>
                            <ViewDropdownMenu
                              dropdownMenuPosition={dropdownMenuPosition}
                              options={viewsLength > 1 &&
                                <React.Fragment>
                                  <button className="dropdown-item" onClick={this.props.onDeleteTimelineView.bind(this, _id)}>
                                    <i className="item-icon dtable-font dtable-icon-delete"></i>
                                    <span className="item-text">{'删除'}</span>
                                  </button>
                                </React.Fragment>
                              }
                            />
                          </ModalPortal>
                        }
                      </div>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

TimelineViewTabs.propTypes = propTypes;

export default TimelineViewTabs;