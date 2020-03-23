import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ModalPortal from './dialog/modal-portal';
import NewViewDialog from './dialog/new-view-dialog';
import DropdownMenu from './dropdownmenu';

const propTypes = {
  views: PropTypes.array,
  selectedViewIdx: PropTypes.number,
  onSelectView: PropTypes.func,
  onDeleteView: PropTypes.func,
  onAddView: PropTypes.func,
};

class TimelineViewsTabs extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowViewDropdown: false,
      dropdownMenuPosition: {
        top: 0,
        left: 0
      },
      isShowNewViewDialog: false,
    };
    this.views = [];
  }

  componentDidMount() {
    let { selectedViewIdx } = this.props;
    let { left } = this.views[selectedViewIdx].getBoundingClientRect();
    let { offsetWidth } = this.viewsTabsScroll;
    if (left > offsetWidth) {
      this.viewsTabsScroll.scrollLeft = left - offsetWidth;
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

  setTimelineViewsTabsScroll = () => {
    if (!this.viewsTabsScroll) return;
    let { offsetWidth, scrollWidth } = this.viewsTabsScroll;
    if (scrollWidth > offsetWidth) {
      this.viewsTabsScroll.scrollLeft = scrollWidth - offsetWidth;
    }
  }

  onNewViewToggle = () => {
    this.setState({isShowNewViewDialog: !this.state.isShowNewViewDialog});
  }

  onNewViewCancel = () => {
    this.setState({isShowNewViewDialog: false});
  }

  onAddView = (viewName) => {
    this.props.onAddView(viewName);
    this.onNewViewToggle();
  }

  render() {
    let { views, selectedViewIdx } = this.props;
    let { isShowViewDropdown, dropdownMenuPosition, isShowNewViewDialog } = this.state;
    let viewsLength = views.length;
    return (
      <div className="timeline-views-tabs d-flex">
        <div className="views-tabs-scroll" ref={ref => this.viewsTabsScroll = ref}>
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
                    onClick={this.props.onSelectView.bind(this, _id)}
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
                            <DropdownMenu
                              dropdownMenuPosition={dropdownMenuPosition}
                              options={viewsLength > 1 &&
                                <React.Fragment>
                                  <button className="dropdown-item" onClick={this.props.onDeleteView.bind(this, _id)}>
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
        <div className="btn-add-view d-flex align-items-center" onClick={this.onNewViewToggle}>
          <i className="dtable-font dtable-icon-add-table"></i>
        </div>
        {isShowNewViewDialog &&
          <NewViewDialog
            onNewViewConfirm={this.onAddView}
            onNewViewCancel={this.onNewViewCancel}
          />
        }
      </div>
    );
  }
}

TimelineViewsTabs.propTypes = propTypes;

export default TimelineViewsTabs;