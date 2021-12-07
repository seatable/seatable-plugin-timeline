import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import intl from 'react-intl-universal';
import ModalPortal from './dialog/modal-portal';
import NewViewDialog from './dialog/new-view-dialog';
import RenameViewDialog from './dialog/rename-view-dialog';
import DropdownMenu from './dropdownmenu';

const SCROLL_TYPE = {
  PREV: 'prev',
  NEXT: 'next',
};

const propTypes = {
  views: PropTypes.array,
  selectedViewIdx: PropTypes.number,
  onSelectView: PropTypes.func,
  onDeleteView: PropTypes.func,
  onAddView: PropTypes.func,
  onRenameView: PropTypes.func,
};

class ViewsTabs extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowViewDropdown: false,
      dropdownMenuPosition: {
        top: 0,
        left: 0
      },
      isShowNewViewDialog: false,
      isShowRenameViewDialog: false,
      canScrollPrev: false,
      canScrollNext: false,
      canViewsScroll: true,
    };
    this.views = [];
  }

  componentDidMount() {
    let { selectedViewIdx } = this.props;
    let { left } = this.views[selectedViewIdx].getBoundingClientRect();
    let { offsetWidth } = this.viewsTabsScroll;
    if (left > offsetWidth) {
      this.viewsTabsScroll.scrollLeft = left - offsetWidth;
    } else {
      this.checkAvailableScrollType();
    }
    document.addEventListener('click', this.onHideViewDropdown);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onHideViewDropdown);
  }

  checkAvailableScrollType = () => {
    if (this.props.isMobile) {
      return;
    }
    const { canScrollPrev, canScrollNext } = this.state;
    let { offsetWidth, scrollWidth, scrollLeft } = this.viewsTabsScroll;
    let _canScrollPrev = false;
    let _canScrollNext = false;
    if (scrollLeft > 0) {
      _canScrollPrev = true;
    }
    if (scrollLeft + offsetWidth < scrollWidth) {
      _canScrollNext = true;
    }

    if (_canScrollPrev !== canScrollPrev || _canScrollNext !== canScrollNext) {
      this.setState({
        canScrollPrev: _canScrollPrev,
        canScrollNext: _canScrollNext,
      });
    }
  }

  onScrollWithControl = (type) => {
    const { offsetWidth, scrollWidth, scrollLeft } = this.viewsTabsScroll;
    let targetScrollLeft;
    if (type === SCROLL_TYPE.PREV) {
      if (scrollLeft === 0) {
        return;
      }
      targetScrollLeft = scrollLeft - offsetWidth;
      targetScrollLeft = targetScrollLeft > 0 ? targetScrollLeft : 0;
    }

    if (type === SCROLL_TYPE.NEXT) {
      if (scrollLeft + offsetWidth === scrollWidth) {
        return;
      }
      targetScrollLeft = scrollLeft + offsetWidth;
      targetScrollLeft = targetScrollLeft > scrollWidth - offsetWidth ? scrollWidth - offsetWidth : targetScrollLeft;
    }
    if (this.state.canViewsScroll) {
      this.setState({ canViewsScroll: false });
      let timer = null;
      timer = setInterval(() => {
        let step = (targetScrollLeft - scrollLeft) / 10;
        step = step > 0 ? Math.ceil(step) : Math.floor(step);
        this.viewsTabsScroll.scrollLeft = this.viewsTabsScroll.scrollLeft + step;
        if (Math.abs(targetScrollLeft - this.viewsTabsScroll.scrollLeft) <= Math.abs(step)) {
          this.viewsTabsScroll.scrollLeft = targetScrollLeft;
          clearInterval(timer);
          this.setState({ canViewsScroll: true });
        }
      }, 15);
    }
  }

  onViewsScroll = () => {
    this.checkAvailableScrollType();
  }

  onDropdownToggle = (evt) => {
    evt.nativeEvent.stopImmediatePropagation();
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
    if (this.state.isShowViewDropdown) {
      this.setState({isShowViewDropdown: false});
    }
  }

  setViewItem = idx => viewItem => {
    this.views[idx] = viewItem;
  }

  setViewsTabsScroll = () => {
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

  onRenameViewToggle = () => {
    this.setState({isShowRenameViewDialog: !this.state.isShowRenameViewDialog});
  }

  hideRenameViewDialog = () => {
    this.setState({isShowRenameViewDialog: false});
  }

  onSelectView = (id, index) => {
    let { selectedViewIdx } = this.props;
    if (index === selectedViewIdx) return;
    this.props.onSelectView(id);
  }

  render() {
    let { views, selectedViewIdx } = this.props;
    let {
      isShowViewDropdown, dropdownMenuPosition, isShowNewViewDialog, isShowRenameViewDialog,
      canScrollPrev, canScrollNext,
    } = this.state;
    let selectedGridView = views[selectedViewIdx] || {};
    return (
      <div className="timeline-views-tabs">
        <div
          className="views-tabs-scroll" ref={ref => this.viewsTabsScroll = ref}
          onScroll={this.onViewsScroll}
        >
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
                  })}
                >
                  <div
                    className="view-item-content"
                    ref={this.setViewItem(i)}
                    onClick={this.onSelectView.bind(this, _id, i)}
                  >
                    <div className="view-name">{name}</div>
                    {isActiveView &&
                      <div
                        className="btn-view-dropdown"
                        ref={ref => this.btnViewDropdown = ref}
                        onClick={this.onDropdownToggle}
                      >
                        <i className="dtable-font dtable-icon-drop-down"></i>
                        {isShowViewDropdown &&
                          <ModalPortal>
                            <DropdownMenu
                              dropdownMenuPosition={dropdownMenuPosition}
                              options={
                                <React.Fragment>
                                  <button className="dropdown-item" onClick={this.onRenameViewToggle}>
                                    <i className="item-icon dtable-font dtable-icon-rename"></i>
                                    <span className="item-text">{intl.get('Rename_view')}</span>
                                  </button>
                                  {views.length > 1 &&
                                    <button className="dropdown-item" onClick={this.props.onDeleteView.bind(this, _id)}>
                                      <i className="item-icon dtable-font dtable-icon-delete"></i>
                                      <span className="item-text">{intl.get('Delete_view')}</span>
                                    </button>
                                  }
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
        {(canScrollPrev || canScrollNext) &&
          <div className="views-scroll-control">
            <span
              className={classnames('scroll-control-btn', 'scroll-prev', { 'scroll-active': canScrollPrev })}
              onClick={this.onScrollWithControl.bind(this, SCROLL_TYPE.PREV)}
            >
              <i className="dtable-font dtable-icon-left-slide btn-scroll-icon" />
            </span>
            <span
              className={classnames('scroll-control-btn', 'scroll-next', { 'scroll-active': canScrollNext })}
              onClick={this.onScrollWithControl.bind(this, SCROLL_TYPE.NEXT)}
            >
              <i className="dtable-font dtable-icon-right-slide btn-scroll-icon" />
            </span>
          </div>
        }
        <div className="btn-add-view" onClick={this.onNewViewToggle}>
          <i className="dtable-font dtable-icon-add-table"></i>
        </div>
        {isShowNewViewDialog &&
          <NewViewDialog
            onNewViewConfirm={this.onAddView}
            onNewViewCancel={this.onNewViewCancel}
          />
        }
        {isShowRenameViewDialog &&
          <RenameViewDialog
            viewName={selectedGridView.name}
            onRenameView={this.props.onRenameView}
            hideRenameViewDialog={this.hideRenameViewDialog}
          />
        }
      </div>
    );
  }
}

ViewsTabs.propTypes = propTypes;

export default ViewsTabs;