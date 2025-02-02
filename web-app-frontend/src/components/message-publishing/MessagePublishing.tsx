import React, { useCallback, useEffect, useState } from 'react';
import AceEditor from 'react-ace';
import { useNavigate, useParams } from 'react-router-dom';
import { getTopics, RecordMetadataDto, sendMessage } from '../../api/bootstrap.group';
import { contextPath, TextType, textTypeAceModeMap, textTypes } from '../../constant/common';
import { Loader } from '../common/Loader';
import { Alert, Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { ArrowLeft01Icon, MessageAdd01Icon, MinusSignIcon, PlusSignIcon } from 'hugeicons-react';
import { encode, encodeText } from '../../utils/base64';
import { loadSettings } from '../../settings/utils';

import '../../constant/ace.imports'
import { MessagePublishedModal } from './MessagePublishedModal';
import { getViewRepresentation, ViewType } from '../../utils/view';

interface HeaderForm {
  key: string | null;
  value: string | null;
  view: ViewType;
}

const MessagePublishing: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { groupId } = useParams();
  const settings = loadSettings();
  const [topics, setTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState<boolean>(false);

  const [topic, setTopic] = useState<string>('');
  const [partition, setPartition] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [maxTimeout, setMaxTimeout] = useState<number>(10000);
  const [key, setKey] = useState<string | null>(null);
  const [value, setValue] = useState<string | null>(null);
  const [headers, setHeaders] = useState<HeaderForm[]>([
    {
      key: null,
      value: null,
      view: 'raw'
    }
  ]);

  const [record, setRecord] = useState<RecordMetadataDto | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [keyView, setKeyView] = useState<ViewType>('raw');

  const [valueInputType, setValueInputType] = useState<'text' | 'file'>('text');
  const [valueView, setValueView] = useState<ViewType>('raw');
  const [valueType, setValueType] = useState<TextType>('Text');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    if (!(groupId)) {
      setLoading(false);
      return;
    }
    try {
      const response = await getTopics(+groupId);
      if (response.data.success) {
        let topics = response.data.body;
        setTopics(topics);
        if (topics.length > 0) {
          setTopic(topics[0]);
        }
      } else {
        setError('Failed to fetch topics');
        return;
      }
    } catch (error) {
      console.error('Failed to fetch topics:', error);
      setError('Failed to fetch topics');
    } finally {
      setLoading(false);
    }
  };

  const navigateBack = () => {
    navigate(contextPath);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecord(null);
    setError(null);
    if (!groupId) {
      return
    }
    const convertToRecord = (headers: HeaderForm[]): Record<string, string> => {
      return headers
        .filter(header => header.key !== null && header.value !== null)
        .reduce((acc, header) => {
          if (header.key && header.value) {
            acc[header.key] = header.value;
          }
          return acc;
        }, {} as Record<string, string>);
    }
    try {
      setSending(true);
      const rqHeaders = convertToRecord(headers)
      const rs = await sendMessage(+groupId, topic, {
        partition,
        timestamp,
        maxTimeout,
        key,
        value,
        headers: rqHeaders
      });
      if (rs.data.success) {
        let record = rs.data.body;
        setRecord(record);
        setShowModal(true);
      } else {
        setError('Failed to send message');
        return;
      }
    } catch (error) {
      setError(`Failed to send message: ${error}`);
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const changeKey = (changed: string | null) => {
    if (!changed) {
      setKey(null)
      return
    }
    if (keyView === 'base64') {
      setKey(changed)
    } else {
      const encoded = encodeText(changed)
      setKey(encoded)
    }
  }

  const changeValue = (changed: string | null) => {
    if (!changed) {
      setValue(null)
      return
    }
    if (valueView === 'base64') {
      setValue(changed)
    } else {
      const encoded = encodeText(changed)
      setValue(encoded)
    }
  }

  const getFileContent = useCallback((file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const binaryData = reader.result as ArrayBuffer;
        resolve(binaryData);
      };
      reader.onerror = (error) => reject(error);
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const content = await getFileContent(file);
    setValue(encode(content));
  };

  if (loading) {
    return (
      <Loader />
    );
  }

  return (
    <Container className="mt-4 mb-4">
      <Row className="mb-2">
        <Col md={{ span: 1, offset: 2 }}>
          <Button
            variant="outline-primary"
            onClick={navigateBack}
            title={'Back'}
          >
            <ArrowLeft01Icon />
          </Button>
        </Col>
        <Col md={9}>
          <h2>Message Publishing</h2>
        </Col>
      </Row>
      <Row className="mb-2">
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )
        }
        <Col md={{ span: 10, offset: 1 }}>
          <Form className="mt-4" onSubmit={onSubmit}>
            <Form.Group>
              <Row className={'mb-2'}>
                <Col md={2}>
                  <Form.Label>Topic</Form.Label>
                </Col>
                <Col md={10}>
                  <Form.Control
                    value={topic ?? ''}
                    list={'topics-suggestions'}
                    onChange={(e) => setTopic(e.target.value)}
                    required={true}
                  />
                  <datalist id="topics-suggestions">
                    {topics.map((topic, i) => (
                      <option key={i} value={topic} />
                    ))}
                  </datalist>
                </Col>
              </Row>
            </Form.Group>
            <Form.Group>
              <Row className={'mb-2'}>
                <Col md={2}>
                  <Form.Label>Partition</Form.Label>
                </Col>
                <Col md={10}>
                  <Form.Control
                    value={partition ?? ''}
                    type={'number'}
                    onChange={(e) => setPartition(e.target.value ? Number(e.target.value) : null)}
                  />
                </Col>
              </Row>
            </Form.Group>
            <Form.Group>
              <Row className={'mb-2'}>
                <Col md={2}>
                  <Form.Label>Timestamp</Form.Label>
                </Col>
                <Col md={10}>
                  <Form.Control
                    value={timestamp ?? ''}
                    type={'number'}
                    onChange={(e) => setTimestamp(e.target.value ? Number(e.target.value) : null)}
                  />
                </Col>
              </Row>
            </Form.Group>
            <Form.Group>
              <Row className={'mb-2'}>
                <Col md={2}>
                  <Form.Label>Max Timeout</Form.Label>
                </Col>
                <Col md={10}>
                  <InputGroup>
                    <Form.Control
                      value={maxTimeout}
                      type={'number'}
                      min={1}
                      onChange={(e) => setMaxTimeout(Number(e.target.value))}
                    />
                    <InputGroup.Text>ms</InputGroup.Text>
                  </InputGroup>
                </Col>
              </Row>
            </Form.Group>
            <Form.Group>
              <Row>
                <Col md={2}>
                  <Form.Label>Headers</Form.Label>
                </Col>
                <Col md={10}>
                  {headers.map((header, index) => (
                    <Row className={'mb-2'}>
                      <InputGroup>
                        <Form.Control
                          value={header.key ?? ''}
                          onChange={(e) => {
                            const newHeaders = [...headers]
                            newHeaders[index].key = e.target.value
                            setHeaders(newHeaders)
                          }}
                        />
                        <InputGroup.Text>=</InputGroup.Text>
                        <Form.Control
                          value={getViewRepresentation(header.view, header.value)}
                          onChange={(e) => {
                            const newHeaders = [...headers]
                            const changed = e.target.value
                            if (!changed) {
                              newHeaders[index].value = null
                            } else if (header.view === 'base64') {
                              newHeaders[index].value = changed
                            } else {
                              newHeaders[index].value = encodeText(changed)
                            }
                            setHeaders(newHeaders)
                          }}
                        />
                        <Form.Select
                          value={header.view}
                          onChange={(e) => {
                            const newHeaders = [...headers]
                            newHeaders[index].view = e.target.value as ViewType
                            setHeaders(newHeaders)
                          }}
                        >
                          <option value={'base64'}>Base64</option>
                          <option value={'raw'}>Raw</option>
                        </Form.Select>
                        <Button
                          variant="outline-success"
                          onClick={() => {
                            const updated = [...headers]
                            updated.splice(index + 1, 0, {
                              key: null,
                              value: null,
                              view: 'raw'
                            });
                            setHeaders(updated)
                          }}
                        >
                          <PlusSignIcon />
                        </Button>
                        <Button
                          variant="outline-danger"
                          disabled={headers.length === 1}
                          onClick={() => {
                            const newHeaders = headers.filter((_, i) => i !== index);
                            setHeaders(newHeaders)
                          }}
                        >
                          <MinusSignIcon />
                        </Button>
                      </InputGroup>
                    </Row>
                  ))}
                </Col>
              </Row>
            </Form.Group>
            <Form.Group>
              <Row className={'mb-2'}>
                <Col md={2}>
                  <Form.Label>Key</Form.Label>
                </Col>
                <Col md={10}>
                  <InputGroup>
                    <Form.Select
                      value={keyView}
                      onChange={(e) => setKeyView(e.target.value as ViewType)}
                    >
                      <option value={'base64'}>Base64</option>
                      <option value={'raw'}>Raw</option>
                    </Form.Select>
                    <Form.Control
                      value={getViewRepresentation(keyView, key)}
                      onChange={(e) => changeKey(e.target.value)}
                    />
                  </InputGroup>
                </Col>
              </Row>
            </Form.Group>
            <Form.Group>
              <Row className={'mb-2'}>
                <Col md={2}>
                  <Form.Label>Value</Form.Label>
                </Col>
                <Col md={10}>
                  <Row className={'mb-2'}>
                    <InputGroup>
                      <Form.Select
                        value={valueInputType}
                        onChange={(e) => setValueInputType(e.target.value as 'text' | 'file')}
                      >
                        <option value={'text'}>Text</option>
                        <option value={'file'}>File</option>
                      </Form.Select>
                      {valueInputType === 'text' && (
                        <Form.Select
                          value={valueView}
                          onChange={(e) => setValueView(e.target.value as ViewType)}
                        >
                          <option value={'base64'}>Base64</option>
                          <option value={'raw'}>Raw</option>
                        </Form.Select>
                      )}
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
                  </Row>
                  <Form.Group className={'mb-2'}>
                    {valueInputType === 'text' && (
                      <AceEditor
                        mode={valueView === 'base64' ? 'text' : textTypeAceModeMap.get(valueType) ?? 'text'}
                        theme={settings['aceTheme'].value}
                        name={`schema-representation`}
                        value={getViewRepresentation(valueView, value)}
                        onChange={changeValue}
                        className={`rounded border`}
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
                        wrapEnabled={true}
                        setOptions={{
                          showLineNumbers: true,
                          wrap: true,
                          useWorker: false,
                        }}
                        editorProps={{ $blockScrolling: true }}
                      />
                    )}
                    {valueInputType === 'file' && (
                      <Form.Control
                        type="file"
                        onChange={handleFileChange}
                      />
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Form.Group>
            <Form.Group>
              <Row className={'mb-2'}>
                <Col className="d-flex justify-content-end">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={sending}
                    title={'Send'}
                  >
                    <MessageAdd01Icon />
                  </Button>
                </Col>
              </Row>
            </Form.Group>
          </Form>
        </Col>
      </Row>

      {record && (
        <MessagePublishedModal
          showModal={showModal}
          setShowModal={setShowModal}
          recordMetadata={record}
        />
      )}
    </Container>
  );
};

export default MessagePublishing;
