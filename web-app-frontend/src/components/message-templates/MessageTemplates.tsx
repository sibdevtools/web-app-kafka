import React, { useEffect, useState } from 'react';
import { deleteMessageTemplate, getAllMessageTemplates, MessageTemplateRs } from '../../api/message.templates';
import { Alert, Button, ButtonGroup, Col, Container, Row } from 'react-bootstrap';
import { contextPath } from '../../constant/common';
import { PlusSignIcon } from 'hugeicons-react';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../common/CustomTable';
import { ActionButtons } from './ActionButtons';

const MessageTemplates: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<MessageTemplateRs[]>([]);
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

  const doDeleteMessageTemplate = async (template: MessageTemplateRs) => {
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
            columns={[
              { key: 'code', label: 'Code' },
              { key: 'name', label: 'Name' },
              { key: 'engine', label: 'Engine' },
              { key: 'actions', label: 'Actions' },
            ]}
            data={templates.map(template => {
              return {
                code: {
                  representation: <code>{template.code}</code>,
                  value: template.code
                },
                name: template.name,
                engine: {
                  representation: <code>{template.engine}</code>,
                  value: template.engine
                },
                actions: {
                  representation: <ActionButtons
                    onEdit={() => navigate(`${contextPath}v1/message-template/${template.id}/edit`)}
                    onMessagePublishing={() => navigate(`${contextPath}v1/message-template/${template.id}/publishing`)}
                    onDelete={() => doDeleteMessageTemplate(template)}
                  />
                }
              };
            })}
            sortableColumns={['code', 'name', 'engine']}
            filterableColumns={['code', 'name', 'engine']}
            styleProps={{
              centerHeaders: true,
              textCenterValues: true,
            }}
            responsive={true}
            loading={loading}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default MessageTemplates;
