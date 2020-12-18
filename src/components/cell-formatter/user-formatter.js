import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CreatorFormatter, LastModifierFormatter } from 'dtable-ui-component';
import { isValidEmail } from '../../utils/common-utils';

const emptyCell = <span className="row-cell-empty d-inline-block"></span>;

class UserFormatter extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isDataLoaded: false,
      collaborator: null
    };
  }

  componentDidMount() {
    this.calculateCollaboratorData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.calculateCollaboratorData(nextProps);
  }

  calculateCollaboratorData = (props) => {
    const { row, column, cellType } = props;
    if (column.type === cellType.LAST_MODIFIER) {
      this.getCollaborator(row._last_modifier);
    } else if (column.type === cellType.CREATOR) {
      this.getCollaborator(row._creator);
    }
  }

  getCollaborator = (value) => {
    if (!value) {
      this.setState({isDataLoaded: true, collaborator: null});
      return;
    }
    this.setState({isDataLoaded: false, collaborator: null});
    let { collaborators } = this.props;
    let collaborator = collaborators && collaborators.find(c => c.email === value);
    if (collaborator) {
      this.setState({isDataLoaded: true, collaborator: collaborator});
      return;
    }

    if (!isValidEmail(value)) {
      let mediaUrl = this.props.getMediaUrl();
      let defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      this.setState({isDataLoaded: true, collaborator: collaborator});
      return;
    }

    this.props.getUserCommonInfo(value).then(res => {
      collaborator = res.data;
      this.setState({isDataLoaded: true, collaborator: collaborator});
    }).catch(() => {
      let mediaUrl = this.props.getMediaUrl();
      let defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      this.setState({isDataLoaded: true, collaborator: collaborator});
    });
  }

  renderUserFormatter = () => {
    const { isDataLoaded, collaborator } = this.state;
    if (!isDataLoaded || !collaborator) return emptyCell;
    let { column, row, cellType } = this.props;
    switch (column.type) {
      case cellType.CREATOR: {
        if (!row._creator) return emptyCell;
        return <CreatorFormatter collaborators={[collaborator]} value={row._creator} />;
      }
      case cellType.LAST_MODIFIER: {
        if (!row._last_modifier) return emptyCell;
        return <LastModifierFormatter collaborators={[collaborator]} value={row._last_modifier} />;
      }
      default: {
        return emptyCell;
      }
    }
  }

  render() {
    return this.renderUserFormatter();
  }
}

UserFormatter.propTypes = {
  column: PropTypes.object,
  row: PropTypes.object,
  cellType: PropTypes.object,
  getMediaUrl: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
};

export default UserFormatter;