import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BootstrapGroupRs, getAllBootstrapGroup, getTopics, } from '../../../api/bootstrap.group';
import { getMessageTemplate, MessageTemplateRs, RecordMetadataDto, sendMessage } from '../../../api/message.templates';
import { contextPath } from '../../../constant/common';
import { Alert, Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { ArrowLeft01Icon, MessageAdd01Icon, MinusSignIcon, PlusSignIcon } from 'hugeicons-react';

import { MessageTemplatePublishedModal } from './MessageTemplatePublishedModal';
import ValueSchemaForm, { ValueSchemaFormHandle } from './ValueSchemaForm';
import { parseJsonSchema } from '../schema-builder/converter';
import { ObjectSchemaNode } from '../schema-builder/type';
import { getViewRepresentation, ViewType } from '../../../utils/view';
import { Base64, Loader, SuggestiveInput } from '@sibdevtools/frontend-common';

interface HeaderForm {
  key: string | null;
  value: string | null;
  view: ViewType;
}

const MessageTemplatePublishing: React.FC = () => {
  const { templateId } = useParams();

  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groups, setGroups] = useState<BootstrapGroupRs[]>([]);

  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topics, setTopics] = useState<{ key: string, value: string }[]>([]);

  const [templateLoading, setTemplateLoading] = useState(true);
  const [template, setTemplate] = useState<MessageTemplateRs>();
  const [schema, setJsonSchema] = useState<ObjectSchemaNode>();

  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const valueSchemaFormRef = useRef<ValueSchemaFormHandle>(null);

  const [groupId, setGroupId] = useState<number>(-1);
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
  const [templateHeaders, setTemplateHeaders] = useState<HeaderForm[]>([]);

  const [record, setRecord] = useState<RecordMetadataDto | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [keyView, setKeyView] = useState<ViewType>('raw');

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
        setJsonSchema(parseJsonSchema(template?.schema) as ObjectSchemaNode)
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

  useEffect(() => {
    const headers = Object.entries(template?.headers || {}).map(([key, value]) => {
      return {
        key: key,
        value: value,
        view: 'raw'
      } as HeaderForm
    })
    setTemplateHeaders(headers);
  }, [template]);

  const fetchTopics = async (groupId: number) => {
    setTopicsLoading(true);
    if (!(groupId)) {
      setTopicsLoading(false);
      return;
    }
    try {
      const response = await getTopics(+groupId);
      if (response.data.success) {
        const topics = response.data.body.map(it => {
          return { key: it, value: it }
        });
        setTopics(topics);
        if (topics.length > 0) {
          setTopic(topics[0].key);
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
      if (!groupId || groupId === -1) {
        setError('Choose a bootstrap group');
        return
      }
      if (!topic || topic === '') {
        setError('Choose a valid topic');
        return
      }
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

  const changeKey = (changed: string | null) => {
    if (!changed) {
      setKey(null)
      return
    }
    if (keyView === 'base64') {
      setKey(changed)
    } else {
      const encoded = Base64.Encoder.text2text(changed)
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
          <Loader loading={templateLoading || groupsLoading}>
            <Form className="mt-4" onSubmit={onSubmit}>
              <Form.Group>
                <Row className={'mb-2'}>
                  <Col md={2}>
                    <Form.Label>Bootstrap Group</Form.Label>
                  </Col>
                  <Col md={10}>
                    <SuggestiveInput
                      suggestions={groups.map(it => {
                        return { key: `${it.id}`, value: it.name, data: it }
                      })}
                      maxSuggestions={5}
                      mode="strict"
                      onChange={async (e) => {
                        const groupId = Number(e.data.id)
                        if (!groupId || isNaN(groupId)) {
                          console.warn('Invalid bootstrap group id:', groupId)
                          return
                        }
                        setGroupId(groupId)
                        await fetchTopics(groupId);
                      }}
                      required={true}
                      disabled={groups.length === 0 || topicsLoading}
                    />
                  </Col>
                </Row>
              </Form.Group>
              <Loader loading={topicsLoading}>
                {groups.length === 0 && (
                  <Alert variant="warning">
                    Create Bootstrap Group first to publish messages.
                  </Alert>
                )}
                {groups.length > 0 && (
                  <>
                    <Form.Group>
                      <Row className={'mb-2'}>
                        <Col md={2}>
                          <Form.Label>Topic</Form.Label>
                        </Col>
                        <Col md={10}>
                          <SuggestiveInput
                            suggestions={topics}
                            maxSuggestions={5}
                            mode="free"
                            onChange={it => setTopic(it.value)}
                            required={true}
                            disabled={topicsLoading || topics.length === 0}
                          />
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
                            min={0}
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
                            min={0}
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
                    {templateHeaders.length > 0 && (
                      <Form.Group>
                        <Row>
                          <Col md={2}>
                            <Form.Label>Template Headers</Form.Label>
                          </Col>
                          <Col md={10}>
                            {templateHeaders.map((header, index) => (
                              <Row className={'mb-2'}>
                                <InputGroup>
                                  <Form.Control
                                    value={header.key ?? ''}
                                    readOnly={true}
                                  />
                                  <InputGroup.Text>=</InputGroup.Text>
                                  <Form.Control
                                    value={getViewRepresentation(header.view, header.value)}
                                    readOnly={true}
                                  />
                                  <Form.Select
                                    value={header.view}
                                    onChange={(e) => {
                                      const newHeaders = [...templateHeaders]
                                      newHeaders[index].view = e.target.value as ViewType
                                      setHeaders(newHeaders)
                                    }}
                                  >
                                    <option value={'base64'}>Base64</option>
                                    <option value={'raw'}>Raw</option>
                                  </Form.Select>
                                </InputGroup>
                              </Row>
                            ))}
                          </Col>
                        </Row>
                      </Form.Group>
                    )}
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
                                      newHeaders[index].value = Base64.Encoder.text2text(changed)
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
                    {schema && (schema?.properties?.length ?? 0) > 0 && (
                      <Form.Group>
                        <Row className={'mb-2'}>
                          <Col md={2}>
                            <Form.Label>Value</Form.Label>
                          </Col>
                          <Col md={10}>
                            <ValueSchemaForm
                              ref={valueSchemaFormRef}
                              schema={schema} />
                          </Col>
                        </Row>
                      </Form.Group>
                    )}
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
              </Loader>
            </Form>
          </Loader>
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
