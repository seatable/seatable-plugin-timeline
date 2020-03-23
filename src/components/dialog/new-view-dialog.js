import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert, Button } from 'reactstrap';
import intl from 'react-intl-universal';
import '../../locale';

const propTypes = {
  onNewViewConfirm: PropTypes.func,
  onNewViewCancel: PropTypes.func,
};

class NewViewDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewName: '',
      errMessage: '',
    };
  }

  handleChange = (event) => {
    let value = event.target.value;
    if (value === this.state.viewName) {
      return;
    }
    this.setState({viewName: value});
  }

  toggle = () => {
    this.props.onNewViewCancel();
  }
  
  handleSubmit = () => {
    let { viewName } = this.state;
    viewName = viewName.trim();
    if (!viewName) {
      this.setState({errMessage: 'Name_is_required'});
      return;
    }
    this.props.onNewViewConfirm(viewName);
    this.props.onNewViewCancel();
  }

  render() {
    return (
      <Modal isOpen={true} toggle={this.toggle} autoFocus={false}>
        <ModalHeader toggle={this.toggle}>{intl.get('New_View')}</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="viewName">{intl.get('Name')}</Label>
              <Input id="viewName" value={this.state.viewName} innerRef={input => {this.newInput = input;}} onChange={this.handleChange} autoFocus={true} />
              <Input style={{display: 'none'}} />
            </FormGroup>
          </Form>
          {this.state.errMessage && <Alert color="danger" className="mt-2">{intl.get(this.state.errMessage)}</Alert>}
        </ModalBody>
        <ModalFooter>          
          <Button color="secondary" onClick={this.toggle}>{intl.get('Cancel')}</Button>
          <Button color="primary" onClick={this.handleSubmit}>{intl.get('Submit')}</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

NewViewDialog.propTypes = propTypes;

export default NewViewDialog;