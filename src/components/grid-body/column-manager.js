import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { Input, ButtonDropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import ColumnSetting from './column-setting';

class ColumnManager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isDropdownOpen: false,
      keyword: '' // for 'search a column'
    };
  }

  toggle = () => {
    this.setState({
      isDropdownOpen: !this.state.isDropdownOpen
    });
  }

  searchColumn = (e) => {
    this.setState({
      keyword: e.target.value
    });
  }

  render() {
    const { isDropdownOpen, keyword } = this.state;
    let { columns } = this.props;
    if (keyword.trim()) {
      columns = columns.filter((column) => {
        return column.name.toLowerCase().indexOf(keyword.trim().toLowerCase()) != -1;
      });
    }

    return (
      <ButtonDropdown isOpen={isDropdownOpen} toggle={this.toggle} className="ml-4 mt-2 mb-4">
        <DropdownToggle caret size="sm" className="timeline-column-manager-btn">
          <i className="dtable-font dtable-icon-eye mr-1"></i>
          {intl.get('Show_columns')}
        </DropdownToggle>
        <DropdownMenu className="py-2 timeline-column-manager-menu">
          <div className="d-flex flex-column">
            <div className="px-2 pb-2">
              <Input type="text" bsSize="sm" placeholder={intl.get('Search_a_column')} value={keyword} onChange={this.searchColumn} />
            </div>
            {columns.length == 0 ?
              <p className="ml-2 no-column-tips">{intl.get('No_column')}</p> :
              <div className="timeline-column-manager-columns">
                {columns.map((column, index) => {
                  return (
                    <ColumnSetting
                      key={index}
                      column={column}
                      updateColumn={this.props.updateColumn}
                      moveColumn={this.props.moveColumn}
                    />
                  );
                })}
              </div>
            }
          </div>
        </DropdownMenu>
      </ButtonDropdown>
    );
  }
}

ColumnManager.propTypes = {
  columns: PropTypes.array,
  updateColumn: PropTypes.func,
  moveColumn: PropTypes.func,
};

export default ColumnManager;
