import React, { useEffect, useState } from 'react';
import { deleteMessageTemplate, getAllMessageTemplates, MessageTemplateShortRs } from '../../api/message.templates';
import { Alert, Button, ButtonGroup, Col, Container, Row } from 'react-bootstrap';
import { contextPath } from '../../constant/common';
import { PlusSignIcon } from 'hugeicons-react';
import { useNavigate } from 'react-router-dom';
import { ActionButtons } from './ActionButtons';
import { CustomTable } from '@sibdevtools/frontend-common';

const MessageTemplates: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<MessageTemplateShortRs[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessageTemplates();
  }, []);

  const fetchMessageTemplates = async () => {
    setLoading(true);
    try {
      const response = await getAllMessageTemplates();
      if (response.data.success) {
        setTemplates(response.data.body);
      } else {
        setError('Failed to fetch message templates');
        return;
      }
    } catch (error) {
      console.error('Failed to fetch message templates:', error);
      setError('Failed to fetch message templates');
    } finally {
      setLoading(false);
    }
  };

  const doDeleteMessageTemplate = async (template: MessageTemplateShortRs) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      const response = await deleteMessageTemplate(template.id);
      if (response.status !== 200 || !response.data.success) {
        console.error('Failed to delete template');
        return;
      }
      setTemplates(templates.filter(it => it.id !== template.id));
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  if (error) {
    return (
      <Alert variant="danger" onClose={() => setError(null)} dismissible>
        {error}
      </Alert>
    );
  }

  return (
    <Container className={'mt-4 mb-4'}>
      <Row>
        <Col md={12}>
          <Row className={'mb-2'}>
            <Col md={{ span: 1, offset: 11 }}>
              <ButtonGroup>
                <Button
                  variant={'outline-success'}
                  onClick={() => navigate(`${contextPath}v1/message-template/add`)}
                  title={'Add'}
                >
                  <PlusSignIcon />
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
          <CustomTable
            table={{ responsive: true }}
            thead={{
              tableId: 'web-app-kafka-message-templates',
              columns: {
                code: {
                  label: 'Code',
                  sortable: true,
                  filterable: true,
                  className: 'text-center'
                },
                name: {
                  label: 'Name',
                  sortable: true,
                  filterable: true,
                  className: 'text-center'
                },
                engine: {
                  label: 'Engine',
                  sortable: true,
                  filterable: true,
                  className: 'text-center'
                },
                actions: {
                  label: 'Actions',
                  className: 'text-center'
                }
              },
            }}
            tbody={{
              data: templates.map(template => {
                return {
                  code: {
                    representation: <code>{template.code}</code>,
                    value: template.code,
                    className: 'text-center'
                  },
                  name: template.name,
                  engine: {
                    representation: <code>{template.engine}</code>,
                    value: template.engine,
                    className: 'text-center'
                  },
                  actions: {
                    representation: <ActionButtons
                      onEdit={() => navigate(`${contextPath}v1/message-template/${template.id}/edit`)}
                      onMessagePublishing={() => navigate(`${contextPath}v1/message-template/${template.id}/publishing`)}
                      onDelete={() => doDeleteMessageTemplate(template)}
                    />,
                    className: 'text-center'
                  }
                };
              })
            }}
            loading={loading}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default MessageTemplates;
