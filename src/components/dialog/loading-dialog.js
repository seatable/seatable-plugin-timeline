import React from 'react';
import { Modal, ModalBody } from 'reactstrap';
import intl from 'react-intl-universal';

export function LoadingDialog() {
  return (
    <Modal isOpen={true} className="timeline-loading-dialog">
      <ModalBody>
        <div className="loading-content">
          <span className="loading-icon"></span>
          <span>{intl.get('Exporting')}</span>
        </div>
      </ModalBody>
    </Modal>
  );
}

export default LoadingDialog;