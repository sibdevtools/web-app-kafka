import { Col, Modal, Row } from 'react-bootstrap';
import React from 'react';
import { RecordMetadataDto } from '../../api/bootstrap.group';

export interface MessagePublishedModalProps {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  recordMetadata: RecordMetadataDto;
}

export const MessagePublishedModal: React.FC<MessagePublishedModalProps> = ({
                                                                              showModal,
                                                                              setShowModal,
                                                                              recordMetadata
                                                                            }) => {
  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Message Published</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={4}>Partition:</Col>
          <Col md={8}>{recordMetadata.partition}</Col>
        </Row>
        <Row>
          <Col md={4}>Offset:</Col>
          <Col md={8}>{recordMetadata.offset}</Col>
        </Row>
        <Row>
          <Col md={4}>Timestamp:</Col>
          <Col md={8}>{recordMetadata.timestamp}</Col>
        </Row>
        <Row>
          <Col md={4}>Serialized key size:</Col>
          <Col md={8}>{recordMetadata.serializedKeySize}</Col>
        </Row>
        <Row>
          <Col md={4}>Serialized value size:</Col>
          <Col md={8}>{recordMetadata.serializedValueSize}</Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};
