import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getLastMessages, getMessages, GetMessagesRs, getTopics, MessageRs } from '../api/bootstrap.group';
import { contextPath } from '../constant/common';
import { Loader } from './common/Loader';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { ArrowLeft01Icon, Search01Icon } from 'hugeicons-react';
import CustomTable from './common/CustomTable';
import { tryDecodeToText } from '../utils/base64';

const MessageConsuming: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [topics, setTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [topic, setTopic] = useState<string>('');
  const [maxMessages, setMaxMessages] = useState<number>(10);
  const [maxTimeout, setMaxTimeout] = useState<number>(10000);
  const [mode, setMode] = useState<'earliest' | 'latest'>('earliest');

  const [messages, setMessages] = useState<MessageRs[]>([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [keyView, setKeyView] = useState<'base64' | 'raw'>('base64');
  const [valueView, setValueView] = useState<'base64' | 'raw'>('base64');

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
    setMessageLoading(true);
    if (!(groupId)) {
      setMessageLoading(false);
      return;
    }
    try {
      let rs: GetMessagesRs;
      if (mode === 'earliest') {
        const response = await getMessages(+groupId, topic, maxMessages, maxTimeout);
        rs = response.data;
      } else {
        const response = await getLastMessages(+groupId, topic, maxMessages, maxTimeout);
        rs = response.data;
      }
      if (rs.success) {
        setMessages(rs.body);
      } else {
        setError('Failed to fetch messages');
        return;
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError('Failed to fetch messages');
    } finally {
      setMessageLoading(false);
    }
  };

  const getMessageKey = (message: MessageRs): string => {
    let value = message.key
    if (!value) {
      return ''
    }
    if (keyView === 'raw') {
      return tryDecodeToText(value)
    }

    return value;
  }

  const getMessageValue = (message: MessageRs): string => {
    let value = message.value
    if (!value) {
      return ''
    }
    if (valueView === 'raw') {
      return tryDecodeToText(value)
    }

    return value;
  }

  const getValueRepresentation = (value: string): string => {
    if (value.length >= 128) {
      value = value.substring(0, 128) + '...'
    }
    return value
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
          <h2>Message Consuming</h2>
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
                  <Form.Label>Max Messages</Form.Label>
                </Col>
                <Col md={9}>
                  <Form.Control
                    value={maxMessages}
                    type={'number'}
                    min={1}
                    onChange={(e) => setMaxMessages(Number(e.target.value))}
                    required={true}
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
                  <Form.Control
                    value={maxTimeout}
                    type={'number'}
                    min={1}
                    onChange={(e) => setMaxTimeout(Number(e.target.value))}
                  />
                </Col>
              </Row>
            </Form.Group>
            <Form.Group>
              <Row className={'mb-2'}>
                <Col md={3}>
                  <Form.Label>Mode</Form.Label>
                </Col>
                <Col md={9}>
                  <Form.Check
                    type={'radio'}
                    name="mode"
                    id={`mode-earliest`}
                    label={`Earliest N messages`}
                    onChange={() => setMode('earliest')}
                    checked={mode === 'earliest'}
                  />
                  <Form.Check
                    type={'radio'}
                    name="mode"
                    id={`mode-latest`}
                    label={`Latest N messages`}
                    onChange={() => setMode('latest')}
                    checked={mode === 'latest'}
                  />
                </Col>
              </Row>
            </Form.Group>
            <Form.Group>
              <Row className={'mb-2'}>
                <Col md={{ span: 1, offset: 11 }}>
                  <Button
                    variant="primary"
                    type="submit"
                    title={'Search'}
                  >
                    <Search01Icon />
                  </Button>
                </Col>
              </Row>
            </Form.Group>
          </Form>
        </Col>
      </Row>
      <Row className={'mb-2'}>
        <Col md={{ span: 10, offset: 1 }}>
          <h3>Messages</h3>
          <Row>
            <Form.Group>
              <Row className={'mb-2'}>
                <Col md={3}>
                  <Form.Label>Key View</Form.Label>
                </Col>
                <Col md={9}>
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
                </Col>
              </Row>
            </Form.Group>
            <Form.Group>
              <Row className={'mb-2'}>
                <Col md={3}>
                  <Form.Label>Value View</Form.Label>
                </Col>
                <Col md={9}>
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
                </Col>
              </Row>
            </Form.Group>
          </Row>
          <CustomTable
            columns={[
              { key: 'partition', label: 'Partition' },
              { key: 'offset', label: 'Offset' },
              { key: 'timestamp', label: 'Timestamp' },
              { key: 'timestampType', label: 'Timestamp Type' },
              { key: 'key', label: 'Key' },
              { key: 'value', label: 'Value' },
            ]}
            data={
              messages.map((message) => {
                  const key = getMessageKey(message);
                  const value = getMessageValue(message);
                  return {
                    partition: `${message.partition}`,
                    offset: `${message.offset}`,
                    timestamp: `${message.timestamp}`,
                    timestampType: {
                      representation: <code>
                        {message.timestampType}
                      </code>,
                      value: message.timestampType
                    },
                    key: {
                      representation: <code>
                        {getValueRepresentation(key)}
                      </code>,
                      value: key
                    },
                    value: {
                      representation: <code>
                        {getValueRepresentation(value)}
                      </code>,
                      value: value
                    }
                  }
                }
              )
            }
            sortableColumns={[
              'partition', 'offset', 'timestamp', 'timestampType', 'key', 'value'
            ]}
            filterableColumns={[
              'partition', 'offset', 'timestamp', 'timestampType', 'key', 'value'
            ]}
            loading={messageLoading}
            responsive={true}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default MessageConsuming;
