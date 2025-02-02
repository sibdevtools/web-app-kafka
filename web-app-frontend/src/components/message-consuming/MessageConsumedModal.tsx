import { Button, ButtonGroup, Col, Form, InputGroup, Modal, Row, Table } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { MessageRs } from '../../api/bootstrap.group';
import { tryDecodeToText } from '../../utils/base64';
import AceEditor from 'react-ace';
import { TextType, textTypeAceModeMap, textTypes } from '../../constant/common';
import { loadSettings } from '../../settings/utils';
import { FloppyDiskIcon, TextWrapIcon } from 'hugeicons-react';
import { downloadBase64File } from '../../utils/files';

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
  const settings = loadSettings();
  const headers = Object.entries(message.headers)
  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(true);

  const [headerViews, setHeaderViews] = useState<Array<'raw' | 'base64'>>([]);
  const [keyView, setKeyView] = useState<'base64' | 'raw'>('base64');
  const [valueView, setValueView] = useState<'base64' | 'raw'>('base64');
  const [valueType, setValueType] = useState<TextType>('Text');

  useEffect(() => {
    const headerViews = Array<'raw' | 'base64'>(headers.length)
    for (let i = 0; i < headerViews.length; i++) {
      headerViews[i] = 'base64'
    }
    setHeaderViews(headerViews);
  }, [message]);

  return (
    <Modal size={'xl'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Message</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className={'mb-2'}>
          <Col md={2}>Topic:</Col>
          <Col md={10}>{message.topic}</Col>
        </Row>
        <Row className={'mb-2'}>
          <Col md={2}>Partition:</Col>
          <Col md={10}>{message.partition}</Col>
        </Row>
        <Row className={'mb-2'}>
          <Col md={2}>Offset:</Col>
          <Col md={10}>{message.offset}</Col>
        </Row>
        <Row className={'mb-2'}>
          <Col md={2}>Timestamp:</Col>
          <Col md={10}>{message.timestamp}</Col>
        </Row>
        <Row className={'mb-2'}>
          <Col md={2}>Timestamp Type:</Col>
          <Col md={10}>{message.timestampType}</Col>
        </Row>
        {headers.length > 0 && (
          <Row className={'mb-2'}>
            <Col md={2}>Headers:</Col>
            <Col md={10}>
              <Table responsive striped bordered hover>
                <thead className={'table-dark'}>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                  <th>Value View</th>
                </tr>
                </thead>
                <tbody>
                {headers.map(([key, value], index) => (
                  <tr>
                    <td>{key}</td>
                    <td>{headerViews[index] === 'base64' ? value : tryDecodeToText(value)}</td>
                    <td>
                      <Form.Select
                        value={headerViews[index]}
                        onChange={(e) => {
                          const newHeaderViews = [...headerViews]
                          newHeaderViews[index] = e.target.value as 'raw' | 'base64'
                          setHeaderViews(newHeaderViews)
                        }}
                        required={true}
                      >
                        {['base64', 'raw'].map((it) => (
                          <option key={it} value={it}>
                            {it}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                  </tr>
                ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        )}
        {message.key && (
          <Row className={'mb-2'}>
            <Col md={2}>Key:</Col>
            <Col md={10}>
              <InputGroup>
                <Form.Control
                  value={(keyView === 'base64' ? message.key : tryDecodeToText(message.key)) ?? ''}
                  readOnly={true}
                />
                <Form.Select
                  value={keyView}
                  onChange={(e) => setKeyView(e.target.value as 'base64' | 'raw')}
                  required={true}
                >
                  {['base64', 'raw'].map((it) => (
                    <option key={it} value={it}>
                      {it}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        )}
        {message.value && (
          <>
            <Row className={'mb-2'}>
              <Col md={2}>Value View:</Col>
              <Col md={10}>
                <InputGroup>
                  <Form.Select
                    value={valueView}
                    onChange={(e) => setValueView(e.target.value as 'base64' | 'raw')}
                    required={true}
                  >
                    {['base64', 'raw'].map((it) => (
                      <option key={it} value={it}>
                        {it}
                      </option>
                    ))}
                  </Form.Select>
                  {valueView === 'raw' && (
                    <Form.Select
                      value={valueType}
                      onChange={(e) => setValueType(e.target.value as TextType)}
                    >
                      {textTypes.map((type, i) => (
                        <option key={i} value={type}>{type}</option>
                      ))}
                    </Form.Select>
                  )}
                </InputGroup>
              </Col>
            </Row>
            <Row className={'mb-2'}>
              <Col md={2}>Value Actions:</Col>
              <Col md={10}>
                <ButtonGroup className={'float-end'}>
                  <Button
                    variant="primary"
                    active={isWordWrapEnabled}
                    title={isWordWrapEnabled ? 'Unwrap' : 'Wrap'}
                    onClick={() => setIsWordWrapEnabled((prev) => !prev)}
                  >
                    <TextWrapIcon />
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={() => downloadBase64File(message.value ?? '', `message.${message.partition}.${message.offset}.bin`, 'text/plain')}
                    title={'Save'}
                  >
                    <FloppyDiskIcon />
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>
            <Row className={'mb-2'}>
              <Col md={2}>Value:</Col>
              <Col md={10}>
                <AceEditor
                  mode={valueView === 'base64' ? 'text' : textTypeAceModeMap.get(valueType) ?? 'text'}
                  theme={settings['aceTheme'].value}
                  name={`valueRepresentation`}
                  value={(valueView === 'base64' ? message.value : tryDecodeToText(message.value)) ?? ''}
                  className={'rounded'}
                  style={{
                    resize: 'vertical',
                    overflow: 'auto',
                    height: '480px',
                    minHeight: '200px',
                  }}
                  fontSize={14}
                  width="100%"
                  height="480px"
                  showPrintMargin={true}
                  showGutter={true}
                  highlightActiveLine={true}
                  wrapEnabled={isWordWrapEnabled}
                  setOptions={{
                    showLineNumbers: true,
                    wrap: isWordWrapEnabled,
                    useWorker: false,
                    readOnly: true,
                  }}
                  editorProps={{ $blockScrolling: true }}
                />
              </Col>
            </Row>
          </>
        )}
      </Modal.Body>
    </Modal>
  )

};
