import { Button, ButtonGroup, Col, Form, InputGroup, Modal, Row, Table } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { MessageRs } from '../../api/bootstrap.group';
import { tryDecodeToText } from '../../utils/base64';
import AceEditor from 'react-ace';
import { TextType, textTypeAceModeMap, textTypes } from '../../constant/common';
import { FloppyDiskIcon, MagicWand01Icon, TextWrapIcon } from 'hugeicons-react';
import { ViewType } from '../../utils/view';
import { Files, SettingsUtils } from '@sibdevtools/frontend-common';
import { IAceEditor } from 'react-ace/lib/types';

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
  const settings = SettingsUtils.load();
  const headers = Object.entries(message.headers)
  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(true);

  const [headerViews, setHeaderViews] = useState<Array<'raw' | 'base64'>>([]);
  const [keyView, setKeyView] = useState<ViewType>('base64');
  const [valueView, setValueView] = useState<ViewType>('base64');
  const [valueType, setValueType] = useState<TextType>('Text');
  const [decodedMessage, setDecodedMessage] = useState<string>('');

  const handleLoad = (editor: IAceEditor) => {
    editor.commands.addCommand({
      name: 'openSearch',
      bindKey: { win: 'Ctrl-F', mac: 'Command-F' },
      exec: (editor) => editor.execCommand('find'),
    });

    editor.commands.addCommand({
      name: 'openReplace',
      bindKey: { win: 'Ctrl-H', mac: 'Command-H' },
      exec: (editor) => editor.execCommand('replace'),
    });
  };

  useEffect(() => {
    const headerViews = Array<'raw' | 'base64'>(headers.length)
    for (let i = 0; i < headerViews.length; i++) {
      headerViews[i] = 'base64'
    }
    setHeaderViews(headerViews);
    const decodedMessage = tryDecodeToText(message.value)
    setDecodedMessage(decodedMessage)
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
                  <th>Value View</th>
                  <th>Value</th>
                </tr>
                </thead>
                <tbody>
                {headers.map(([key, value], index) => (
                  <tr>
                    <td>{key}</td>
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
                        <option value={'base64'}>Base64</option>
                        <option value={'raw'}>Raw</option>
                      </Form.Select>
                    </td>
                    <td>{headerViews[index] === 'base64' ? value : tryDecodeToText(value)}</td>
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
                  onChange={(e) => setKeyView(e.target.value as ViewType)}
                  required={true}
                >
                  <option value={'base64'}>Base64</option>
                  <option value={'raw'}>Raw</option>
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
                    onChange={(e) => setValueView(e.target.value as ViewType)}
                    required={true}
                  >
                    <option value={'base64'}>Base64</option>
                    <option value={'raw'}>Raw</option>
                  </Form.Select>
                  {
                    valueView === 'raw' && (
                      <Form.Select
                        value={valueType}
                        onChange={(e) => setValueType(e.target.value as TextType)}
                      >
                        {textTypes.map((type, i) => (
                          <option key={i} value={type}>{type}</option>
                        ))}
                      </Form.Select>
                    )
                  }

                  {
                    valueType === 'JSON' && (
                      <Button
                        variant="primary"
                        type="button"
                        title={'Beautify'}
                        onClick={() => {
                          if (!decodedMessage) {
                            return;
                          }
                          const json = JSON.parse(decodedMessage)
                          setDecodedMessage(JSON.stringify(json, null, 4))
                        }}
                      >
                        <MagicWand01Icon />
                      </Button>
                    )
                  }
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
                    onClick={() => Files.download(message.value ?? '', `message.${message.partition}.${message.offset}.bin`)}
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
                  theme={settings['aceTheme']}
                  onLoad={handleLoad}
                  name={`valueRepresentation`}
                  value={(valueView === 'base64' ? message.value : decodedMessage) ?? ''}
                  className={'rounded'}
                  style={{
                    resize: 'vertical',
                    overflow: 'auto',
                    minHeight: '240px',
                  }}
                  fontSize={14}
                  width="100%"
                  height="640px"
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
