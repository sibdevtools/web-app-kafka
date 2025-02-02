import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTopics } from '../../api/bootstrap.group';
import { contextPath } from '../../constant/common';
import { Loader } from '../common/Loader';
import { Alert, Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { ArrowLeft01Icon, MessageAdd01Icon, MinusSignIcon, PlusSignIcon } from 'hugeicons-react';
import { encodeText, tryDecodeToText } from '../../utils/base64';

interface HeaderForm {
  key: string | null;
  value: string | null;
  view: 'base64' | 'raw';
}

const MessagePublishing: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [topics, setTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [topic, setTopic] = useState<string>('');
  const [partition, setPartition] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [maxTimeout, setMaxTimeout] = useState<number>(10000);
  const [key, setKey] = useState<string | null>(null);
  const [headers, setHeaders] = useState<HeaderForm[]>([
    {
      key: null,
      value: null,
      view: 'base64'
    }
  ]);

  const [keyView, setKeyView] = useState<'base64' | 'raw'>('base64');

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
    if (!groupId) {
      return
    }
    //TODO: send to Kafka
    console.log('Sending message to Kafka', topic, partition, timestamp, maxTimeout, key, headers);
  };

  const getKeyRepresentation = (): string => {
    if (!key) {
      return ''
    }
    if (keyView === 'raw') {
      return tryDecodeToText(key)
    }

    return key;
  }

  const getHeaderRepresentation = (view: 'base64' | 'raw', value: string | null): string => {
    if (!value) {
      return ''
    }
    if (view === 'raw') {
      return tryDecodeToText(value)
    }

    return value;
  }

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
                <Col md={3}>
                  <Form.Label>Topic</Form.Label>
                </Col>
                <Col md={9}>
                  <Form.Select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required={true}
                  >
                    {topics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
            </Form.Group>
            <Form.Group>
              <Row className={'mb-2'}>
                <Col md={3}>
                  <Form.Label>Partition</Form.Label>
                </Col>
                <Col md={9}>
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
                <Col md={3}>
                  <Form.Label>Timestamp</Form.Label>
                </Col>
                <Col md={9}>
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
                <Col md={3}>
                  <Form.Label>Max Timeout</Form.Label>
                </Col>
                <Col md={9}>
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
              <Row className={'mb-2'}>
                <Col md={3}>
                  <Form.Label>Headers</Form.Label>
                </Col>
                <Col md={9}>
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
                          value={getHeaderRepresentation(header.view, header.value)}
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
                            newHeaders[index].view = e.target.value as 'base64' | 'raw'
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
                              view: 'base64'
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
                <Col md={3}>
                  <Form.Label>Key</Form.Label>
                </Col>
                <Col md={9}>
                  <InputGroup>
                    <Form.Select
                      value={keyView}
                      onChange={(e) => setKeyView(e.target.value as 'base64' | 'raw')}
                    >
                      <option value={'base64'}>Base64</option>
                      <option value={'raw'}>Raw</option>
                    </Form.Select>
                    <Form.Control
                      value={getKeyRepresentation()}
                      onChange={(e) => changeKey(e.target.value)}
                    />
                  </InputGroup>
                </Col>
              </Row>
            </Form.Group>
            <Form.Group>
              <Row className={'mb-2'}>
                <Col className="d-flex justify-content-end">
                  <Button
                    variant="primary"
                    type="submit"
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
    </Container>
  );
};

export default MessagePublishing;
