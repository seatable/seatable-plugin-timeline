import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  value: PropTypes.string,
  column: PropTypes.object,
};

class CollaboratorOption extends React.Component {

  getCollaborator = () => {
    let { value } = this.props;
    let { collaborators } = window.app;
    let collaborator = collaborators.find(item => item.email === value);
    return collaborator;
  }

  getContainerStyle = () => {
    return {
      display: 'inline-flex',
      alignItems: 'center',
      marginRight: '10px',
      padding: '0 8px 0 2px',
      height: '20px',
      fontSize: '13px',
      borderRadius: '10px',
      background: '#eaeaea',
    };
  }

  getAvatarStyle = () => {
    return {
      display: 'flex',
      alignItems: 'center',
      margin: '0 4px 0 2px',
    };
  }
  
  getAvatarIconStyle = () => {
    return {
      width: '16px',
      height: '16px',
      borderRadius: '50%',
    };
  }

  render() {
    let containerStyle = this.getContainerStyle();
    let avatarStyle = this.getAvatarStyle();
    let avatarIconStyle = this.getAvatarIconStyle();
    let collaborator = this.getCollaborator();
    return (
      <div className="collaborator-container" style={containerStyle}>
        <span className="collaborator-avatar" style={avatarStyle}>
          <img className="collaborator-avatar-icon" style={avatarIconStyle} alt={collaborator.name} src={collaborator.avatar_url} />
        </span>
        <span className="collaborator-name">{collaborator.name}</span>
      </div>
    );
  }
}

CollaboratorOption.propTypes = propTypes;

export default CollaboratorOption;
