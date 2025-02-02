import React from 'react';
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { ArrowLeft01Icon, FloppyDiskIcon, PlusSignIcon } from 'hugeicons-react';
import { Loader } from '../common/Loader';

type MockFormProps = {
  loading: boolean;
  code: string;
  name: string;
  maxTimeout: number;
  bootstrapServers: string[];
  setCode: (name: string) => void;
  setName: (name: string) => void;
  setMaxTimeout: (value: number) => void;
  setBootstrapServers: (value: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditMode: boolean;
  navigateBack: () => void;
};

export const BootstrapGroupForm: React.FC<MockFormProps> = ({
                                                              loading,
                                                              code,
                                                              name,
                                                              maxTimeout,
                                                              bootstrapServers,
                                                              setCode,
                                                              setName,
                                                              setMaxTimeout,
                                                              setBootstrapServers,
                                                              onSubmit,
                                                              isEditMode,
                                                              navigateBack
                                                            }) => {
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
      {loading ?
        <Loader />
        :
        <Row>
          <Col md={{ span: 10, offset: 1 }}>
            <Form className="mt-4" onSubmit={onSubmit}>
              <Form.Group className="mb-3" controlId="bootstrapGroupCodeInput">
                <Form.Label>Code</Form.Label>
                <Form.Control
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="bootstrapGroupNameInput">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="bootstrapGroupNameInput">
                <Form.Label>Max Timeout</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={maxTimeout}
                  onChange={(e) => setMaxTimeout(Number(e.target.value))}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="bootstrapBootstrapServersInput">
                <Row className="mb-3">
                  <Col md={4}>Bootstrap Servers</Col>
                  <Col md={{ span: 1, offset: 7 }}>
                    <Button
                      variant="outline-success"
                      onClick={() => {
                        const updated = [...bootstrapServers]
                        updated.push('')
                        setBootstrapServers(updated)
                      }}
                    >
                      <PlusSignIcon />
                    </Button>
                  </Col>
                </Row>
                {bootstrapServers.map((it, index) => (
                  <Row className="mb-3">
                    <InputGroup>
                      <Form.Control
                        value={it || ''}
                        onChange={(e) => {
                          const updated = [...bootstrapServers]
                          updated[index] = e.target.value
                          setBootstrapServers(updated)
                        }}
                      />
                      <Button
                        variant="outline-danger"
                        onClick={() => {
                          const updated = bootstrapServers.filter((_, i) => i !== index);
                          setBootstrapServers(updated)
                        }}
                      >
                        -
                      </Button>
                    </InputGroup>
                  </Row>
                ))}
              </Form.Group>

              {/* Submit Button */}
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
      }
    </Container>
  );
};

export default BootstrapGroupForm;
