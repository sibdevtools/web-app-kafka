import { Col, Modal, Row } from 'react-bootstrap';
import React from 'react';
import { MessageRs } from '../../api/bootstrap.group';

export interface MessageConsumedModalProps {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  message: MessageRs;
}

export const MessageConsumedModal: React.FC<MessageConsumedModalProps> = ({
                                                                            showModal,
                                                                            setShowModal,
                                                                            message
                                                                          }) => {
  return (
    <Modal size={'xl'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Message</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={4}>Topic:</Col>
          <Col md={8}>{message.topic}</Col>
        </Row>
        <Row>
          <Col md={4}>Partition:</Col>
          <Col md={8}>{message.partition}</Col>
        </Row>
        <Row>
          <Col md={4}>Offset:</Col>
          <Col md={8}>{message.offset}</Col>
        </Row>
        <Row>
          <Col md={4}>Timestamp:</Col>
          <Col md={8}>{message.timestamp}</Col>
        </Row>
        <Row>
          <Col md={4}>Timestamp Type:</Col>
          <Col md={8}>{message.timestampType}</Col>
        </Row>
        <Row>
          <Col md={4}>Headers:</Col>
          <Col md={8}>
            {Object.entries(message.headers).map(([key, value]) => (
              <Row>
                <Col md={4} key={key}>{key}</Col>
                <Col md={8}>{value}</Col>
              </Row>
            ))}
          </Col>
        </Row>
        <Row>
          <Col md={4}>Key:</Col>
          <Col md={8}>{message.key}</Col>
        </Row>
        <Row>
          <Col md={4}>Value:</Col>
          <Col md={8}>{message.value}</Col>
        </Row>
      </Modal.Body>
    </Modal>
  )

};
