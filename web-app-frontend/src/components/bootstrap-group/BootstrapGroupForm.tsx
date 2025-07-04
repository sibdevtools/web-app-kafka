import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Alert, Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { ArrowLeft01Icon, FloppyDiskIcon, MinusSignIcon, PlusSignIcon } from 'hugeicons-react';
import { BootstrapGroupRq, BootstrapGroupRs } from '../../api/bootstrap.group';
import { Loader } from '@sibdevtools/frontend-common';


export interface BootstrapGroupFormHandle {
  getBootstrapGroupRq: () => BootstrapGroupRq;
  changeFormValues: (rs: BootstrapGroupRs) => void;
}

type BootstrapGroupFormHandleProps = {
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  isEditMode: boolean;
  navigateBack: () => void;
  error: string | null;
  setError: (text: string | null) => void;
};

export const BootstrapGroupForm = forwardRef<BootstrapGroupFormHandle, BootstrapGroupFormHandleProps>(
  ({
     loading,
     onSubmit,
     isEditMode,
     navigateBack,
     error,
     setError
   }: BootstrapGroupFormHandleProps, ref) => {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [maxTimeout, setMaxTimeout] = useState<number>(6000);
    const [bootstrapServers, setBootstrapServers] = useState<string[]>(['']);

    useImperativeHandle(ref, () => ({
      getBootstrapGroupRq: (): BootstrapGroupRq => {
        return {
          code,
          name,
          maxTimeout,
          bootstrapServers: bootstrapServers.filter(it => it.trim() !== ''),
        };
      },
      changeFormValues: (rs: BootstrapGroupRs) => {
        setCode(rs.code);
        setName(rs.name);
        setMaxTimeout(rs.maxTimeout);
        setBootstrapServers(rs.bootstrapServers);
      }
    }));

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
            <h2>{isEditMode ? 'Edit Bootstrap Group' : 'Add Bootstrap Group'}</h2>
          </Col>
        </Row>
        <Loader loading={loading}>
          <Row>
            {error && (
              <Alert variant="danger" onClose={() => setError(null)} dismissible>
                {error}
              </Alert>
            )
            }
            <Col md={{ span: 10, offset: 1 }}>
              <Form className="mt-4" onSubmit={onSubmit}>
                <Form.Group controlId="bootstrapGroupCodeInput">
                  <Row className={'mb-2'}>
                    <Col md={3}>
                      <Form.Label>Code</Form.Label>
                    </Col>
                    <Col md={9}>
                      <Form.Control
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group controlId="bootstrapGroupNameInput">
                  <Row className={'mb-2'}>
                    <Col md={3}>
                      <Form.Label>Name</Form.Label>
                    </Col>
                    <Col md={9}>
                      <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group controlId="bootstrapGroupMaxTimeoutInput">
                  <Row className={'mb-2'}>
                    <Col md={3}>
                      <Form.Label>Max Timeout</Form.Label>
                    </Col>
                    <Col md={9}>
                      <InputGroup>
                        <Form.Control
                          type="number"
                          min={1}
                          value={maxTimeout}
                          onChange={(e) => setMaxTimeout(Number(e.target.value))}
                          required
                        />
                        <InputGroup.Text>ms</InputGroup.Text>
                      </InputGroup>
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group controlId="bootstrapBootstrapServersInput">
                  <Row className="mb-2">
                    <Col md={3}>
                      <Form.Label>
                        Bootstrap Servers
                      </Form.Label>
                    </Col>
                    <Col md={9}>
                      {bootstrapServers.map((it, index) => (
                        <Row className={'mb-2'}>
                          <InputGroup>
                            <Form.Control
                              value={it || ''}
                              onChange={(e) => {
                                const value = e.target.value
                                const updated = [...bootstrapServers]
                                const values = value.split(',')
                                if (values.length === 1) {
                                  updated[index] = value
                                } else {
                                  for (let i = 0; i < values.length; i++) {
                                    const it = values[i].trim()
                                    if (it.length === 0) continue;
                                    if (i === 0) {
                                      updated[index] = it;
                                    } else {
                                      updated.splice(index + i, 0, it);
                                    }
                                  }
                                }
                                setBootstrapServers(updated)
                              }}
                            />
                            <Button
                              variant="outline-success"
                              onClick={() => {
                                const updated = [...bootstrapServers]
                                updated.splice(index + 1, 0, '');
                                setBootstrapServers(updated)
                              }}
                            >
                              <PlusSignIcon />
                            </Button>
                            <Button
                              variant="outline-danger"
                              disabled={bootstrapServers.length === 1}
                              onClick={() => {
                                const updated = bootstrapServers.filter((_, i) => i !== index);
                                setBootstrapServers(updated)
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

                <Row>
                  <Col className="d-flex justify-content-end">
                    <Button
                      variant="primary"
                      type="submit"
                      title={'Save'}
                    >
                      <FloppyDiskIcon />
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Loader>
      </Container>
    );
  }
);

export default BootstrapGroupForm;
