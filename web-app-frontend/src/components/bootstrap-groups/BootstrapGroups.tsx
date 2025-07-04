import React, { useEffect, useState } from 'react';
import { BootstrapGroupRs, deleteBootstrapGroup, getAllBootstrapGroup } from '../../api/bootstrap.group';
import { Alert, Button, ButtonGroup, Col, Container, ListGroup, ListGroupItem, Row } from 'react-bootstrap';
import { contextPath } from '../../constant/common';
import { PlusSignIcon } from 'hugeicons-react';
import { useNavigate } from 'react-router-dom';
import { ActionButtons } from './ActionButtons';
import { CustomTable } from '@sibdevtools/frontend-common';

const BootstrapGroups: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<BootstrapGroupRs[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBootstrapGroups();
  }, []);

  const fetchBootstrapGroups = async () => {
    setLoading(true);
    try {
      const response = await getAllBootstrapGroup();
      if (response.data.success) {
        setGroups(response.data.body);
      } else {
        setError('Failed to fetch bootstrap groups');
        return;
      }
    } catch (error) {
      console.error('Failed to fetch bootstrap groups:', error);
      setError('Failed to fetch bootstrap groups');
    } finally {
      setLoading(false);
    }
  };

  const doDeleteBootstrapGroup = async (group: BootstrapGroupRs) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      const response = await deleteBootstrapGroup(group.id);
      if (response.status !== 200 || !response.data.success) {
        console.error('Failed to delete group');
        return;
      }
      setGroups(groups.filter(it => it.id !== group.id));
    } catch (error) {
      console.error('Failed to delete group:', error);
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
                  onClick={() => navigate(`${contextPath}v1/bootstrap-group/add`)}
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
                servers: {
                  label: 'Bootstrap Servers',
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
              data: groups.map(group => {
                return {
                  code: {
                    representation: <code>{group.code}</code>,
                    value: group.code,
                    className: 'text-center'
                  },
                  name: group.name,
                  servers: {
                    representation: <ListGroup>
                      {group.bootstrapServers.map(it => (<ListGroupItem key={it}>{it}</ListGroupItem>))}
                    </ListGroup>,
                    value: group.bootstrapServers.join(', ')
                  },
                  actions: {
                    representation: <ActionButtons
                      onEdit={() => navigate(`${contextPath}v1/bootstrap-group/${group.id}/edit`)}
                      onMessageConsuming={() => navigate(`${contextPath}v1/bootstrap-group/${group.id}/consuming`)}
                      onMessagePublishing={() => navigate(`${contextPath}v1/bootstrap-group/${group.id}/publishing`)}
                      onDelete={() => doDeleteBootstrapGroup(group)}
                    />
                  }
                };
              }),
            }}
            loading={loading}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default BootstrapGroups;
