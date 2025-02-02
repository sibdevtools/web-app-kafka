import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BootstrapGroupRs, getAllBootstrapGroup, getTopics, } from '../../../api/bootstrap.group';
import { getMessageTemplate, MessageTemplateRs, RecordMetadataDto, sendMessage } from '../../../api/message.templates';
import { contextPath } from '../../../constant/common';
import { Loader } from '../../common/Loader';
import { Alert, Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { ArrowLeft01Icon, MessageAdd01Icon, MinusSignIcon, PlusSignIcon } from 'hugeicons-react';
import { encodeText, tryDecodeToText } from '../../../utils/base64';

import { MessageTemplatePublishedModal } from './MessageTemplatePublishedModal';
import ValueSchemaForm, { ValueSchemaFormHandle } from './ValueSchemaForm';
import { parseJsonSchema } from '../schema-builder/converter';
import { ObjectSchemaNode } from '../schema-builder/type';

interface HeaderForm {
  key: string | null;
  value: string | null;
  view: 'base64' | 'raw';
}

const MessageTemplatePublishing: React.FC = () => {
  const { templateId } = useParams();

  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groups, setGroups] = useState<BootstrapGroupRs[]>([]);

  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);

  const [templateLoading, setTemplateLoading] = useState(true);
  const [template, setTemplate] = useState<MessageTemplateRs>();

  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const valueSchemaFormRef = useRef<ValueSchemaFormHandle>(null);

  const [groupId, setGroupId] = useState<number>(0);
  const [topic, setTopic] = useState<string>('');
  const [partition, setPartition] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [maxTimeout, setMaxTimeout] = useState<number>(10000);
  const [key, setKey] = useState<string | null>(null);
  const [headers, setHeaders] = useState<HeaderForm[]>([
    {
      key: null,
      value: null,
      view: 'raw'
    }
  ]);

  const [record, setRecord] = useState<RecordMetadataDto | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [keyView, setKeyView] = useState<'base64' | 'raw'>('raw');

  useEffect(() => {
    fetchBootstrapGroups();
    if (templateId) {
      fetchMessageTemplate(+templateId);
    }
  }, [templateId]);

  const fetchBootstrapGroups = async () => {
    setGroupsLoading(true);
    try {
      const response = await getAllBootstrapGroup();
      if (response.data.success) {
        const groupRs = response.data.body;
        setGroups(groupRs);
        if (groupRs.length > 0) {
          const groupId = groupRs[0].id;
          setGroupId(groupId);
          await fetchTopics(groupId);
        }
      } else {
        setError('Failed to fetch bootstrap groups');
        return;
      }
    } catch (error) {
      console.error('Failed to fetch bootstrap groups:', error);
      setError('Failed to fetch bootstrap groups');
    } finally {
      setGroupsLoading(false);
    }
  };

  const fetchMessageTemplate = async (templateId: number) => {
    setTemplateLoading(true);
    try {
      const response = await getMessageTemplate(templateId);
      if (response.data.success) {
        let template = response.data.body;
        setTemplate(template);
      } else {
        setError('Failed to fetch template');
        return;
      }
    } catch (error) {
      console.error('Failed to fetch template:', error);
      setError('Failed to fetch template');
    } finally {
      setTemplateLoading(false);
    }
  };

  const fetchTopics = async (groupId: number) => {
    setTopicsLoading(true);
    if (!(groupId)) {
      setTopicsLoading(false);
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
      setTopicsLoading(false);
    }
  };

  const navigateBack = () => {
    navigate(`${contextPath}v1/message-templates`);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecord(null);
    setError(null);
    if (!templateId) {
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
      const input = valueSchemaFormRef?.current?.getValue() ?? {}
      const rqHeaders = convertToRecord(headers)
      const rs = await sendMessage(+templateId, {
        bootstrapGroupId: groupId,
        topic,
        partition,
        timestamp,
        maxTimeout,
        key,
        input,
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

  const getViewRepresentation = (view: 'base64' | 'raw', value: string | null): string => {
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
            {(templateLoading || groupsLoading) && (<Loader />)}
            {!(templateLoading || groupsLoading) && groups.length > 0 && (
              <Form.Group>
                <Row className={'mb-2'}>
                  <Col md={2}>
                    <Form.Label>Bootstrap Group</Form.Label>
                  </Col>
                  <Col md={10}>
                    <Form.Select
                      value={groupId}
                      onChange={async (e) => {
                        const rawGroupId = e.target.value;
                        if (!rawGroupId) {
                          return
                        }
                        const groupId = Number(rawGroupId)
                        setGroupId(groupId)
                        await fetchTopics(groupId);
                      }}
                      required={true}
                    >
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>
              </Form.Group>
            )}
            {(topicsLoading) && (<Loader />)}
            {!(templateLoading || groupsLoading || topicsLoading) && groups.length === 0 && (
              <Alert variant="warning">
                Create Bootstrap Group first to publish messages.
              </Alert>
            )}
            {!(templateLoading || groupsLoading || topicsLoading) && groups.length > 0 && (
              <>
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
                          onChange={(e) => setKeyView(e.target.value as 'base64' | 'raw')}
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
                      <ValueSchemaForm
                        ref={valueSchemaFormRef}
                        schema={parseJsonSchema(template?.schema) as ObjectSchemaNode} />
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
              </>
            )}
          </Form>
        </Col>
      </Row>

      {record && (
        <MessageTemplatePublishedModal
          showModal={showModal}
          setShowModal={setShowModal}
          recordMetadata={record}
        />
      )}
    </Container>
  );
};

export default MessageTemplatePublishing;
