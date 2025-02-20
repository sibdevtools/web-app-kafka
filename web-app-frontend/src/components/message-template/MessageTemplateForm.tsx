import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { ArrowLeft01Icon, FloppyDiskIcon, MinusSignIcon, PlusSignIcon } from 'hugeicons-react';
import { Loader } from '../common/Loader';
import { Engine, MessageTemplateRq, MessageTemplateRs } from '../../api/message.templates';
import AceEditor from 'react-ace';
import { loadSettings } from '../../settings/utils';
import { encodeText, tryDecodeToText } from '../../utils/base64';
import SchemaFormBuilder from './schema-builder/SchemaFormBuilder';
import { SchemaNode } from './schema-builder/type';
import { convertToJsonSchema, parseJsonSchema } from './schema-builder/converter';

import '../../constant/ace.imports'
import { getViewRepresentation, ViewType } from '../../utils/view';

export interface MessageTemplateFormHandle {
  getMessageTemplateRq: () => MessageTemplateRq;
  changeFormValues: (rs: MessageTemplateRs) => void;
}

type MessageTemplateFormHandleProps = {
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  isEditMode: boolean;
  navigateBack: () => void;
};

const EngineToAceMode: Record<Engine, string> = {
  JSON: 'none',
  JAVA_SCRIPT: 'javascript',
  PYTHON: 'python',
  AVRO: 'json',
  FREEMARKER: 'text'
}

interface HeaderForm {
  key: string | null;
  value: string | null;
  view: ViewType;
}

export const MessageTemplateForm = forwardRef<MessageTemplateFormHandle, MessageTemplateFormHandleProps>(
  ({
     loading,
     onSubmit,
     isEditMode,
     navigateBack
   }: MessageTemplateFormHandleProps, ref) => {
    const settings = loadSettings();

    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [engine, setEngine] = useState<Engine>('FREEMARKER');
    const [headers, setHeaders] = useState<HeaderForm[]>([
      {
        key: null,
        value: null,
        view: 'raw'
      }
    ]);
    const [template, setTemplate] = useState<string>('');
    const [rootSchema, setRootSchema] = useState<SchemaNode>({
      title: '',
      type: 'object',
      specification: 'none',
      nullable: false,
      properties: [],
    });

    useImperativeHandle(ref, () => ({
      getMessageTemplateRq: (): MessageTemplateRq => {
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
        return {
          code,
          name,
          engine,
          headers: convertToRecord(headers),
          schema: convertToJsonSchema(rootSchema),
          template: EngineToAceMode[engine] === 'none' ? '' : encodeText(template)
        };
      },
      changeFormValues: (rs: MessageTemplateRs) => {
        setCode(rs.code);
        setName(rs.name);
        setEngine(rs.engine);
        setHeaders(Object.entries(rs.headers || {}).map(([key, value]) => ({
          key: key,
          value: value,
          view: 'base64'
        })))
        setRootSchema(parseJsonSchema(rs.schema));
        setTemplate(tryDecodeToText(rs.template));
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
            <h2>{isEditMode ? 'Edit Message Template' : 'Add Message Template'}</h2>
          </Col>
        </Row>
        {loading ?
          <Loader />
          :
          <Row>
            <Col md={{ span: 10, offset: 1 }}>
              <Form className="mt-4" onSubmit={onSubmit}>
                <Form.Group controlId="messageTemplateCodeInput">
                  <Row className={'mb-2'}>
                    <Col md={2}>
                      <Form.Label>Code</Form.Label>
                    </Col>
                    <Col md={10}>
                      <Form.Control
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group controlId="messageTemplateNameInput">
                  <Row className={'mb-2'}>
                    <Col md={2}>
                      <Form.Label>Name</Form.Label>
                    </Col>
                    <Col md={10}>
                      <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group controlId="messageTemplateHeadersInput">
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

                <Form.Group controlId="messageTemplateSchemaInput">
                  <Row className={'mb-2'}>
                    <Col md={2}>
                      <Form.Label>Schema</Form.Label>
                    </Col>
                    <Col md={10}>
                      <SchemaFormBuilder
                        node={rootSchema}
                        onChange={setRootSchema}
                        isRoot={true}
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group controlId="messageTemplateEngineInput">
                  <Row className={'mb-2'}>
                    <Col md={2}>
                      <Form.Label>Engine</Form.Label>
                    </Col>
                    <Col md={10}>
                      <Form.Select
                        value={engine}
                        onChange={(e) => setEngine(e.target.value as Engine)}
                        required
                      >
                        <option key="FREEMARKER" value="FREEMARKER">
                          FreeMarker
                        </option>
                        <option key="AVRO" value="AVRO">
                          Avro
                        </option>
                        <option key="JAVA_SCRIPT" value="JAVA_SCRIPT">
                          JavaScript
                        </option>
                        <option key="PYTHON" value="PYTHON">
                          Python
                        </option>
                        <option key="JSON" value="JSON">
                          JSON
                        </option>
                      </Form.Select>
                    </Col>
                  </Row>
                </Form.Group>

                {EngineToAceMode[engine] !== 'none' && (
                  <Form.Group controlId="messageTemplateTemplateInput">
                    <Row className={'mb-2'}>
                      <Col md={2}>
                        <Form.Label>Template</Form.Label>
                      </Col>
                      <Col md={10}>
                        <AceEditor
                          mode={EngineToAceMode[engine]}
                          theme={settings['aceTheme'].value}
                          name={`schema-representation`}
                          value={template}
                          onChange={setTemplate}
                          className={`rounded border`}
                          style={{
                            resize: 'vertical',
                            overflow: 'auto',
                            height: '480px',
                            minHeight: '200px',
                          }}
                          fontSize={14}
                          width="100%"
                          height="480px"
                          showPrintMargin={true}
                          showGutter={true}
                          highlightActiveLine={true}
                          wrapEnabled={true}
                          setOptions={{
                            showLineNumbers: true,
                            wrap: true,
                            useWorker: false,
                          }}
                          editorProps={{ $blockScrolling: true }}
                        />
                      </Col>
                    </Row>
                  </Form.Group>
                )}

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
  }
);

export default MessageTemplateForm;
