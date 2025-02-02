import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTopics } from '../../api/bootstrap.group';
import { contextPath } from '../../constant/common';
import { Loader } from '../common/Loader';
import { Alert, Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { ArrowLeft01Icon, Search01Icon } from 'hugeicons-react';
import MessageConsumingResult, { MessageConsumingResultHandle } from './MessageConsumingResult';

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

  const messageConsumingResultRef = useRef<MessageConsumingResultHandle>(null);

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
    messageConsumingResultRef?.current?.fetchMessages(groupId, topic, maxMessages, maxTimeout, mode);
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
          <MessageConsumingResult
            ref={messageConsumingResultRef}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default MessageConsuming;
