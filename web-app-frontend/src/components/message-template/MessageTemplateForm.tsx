import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { ArrowLeft01Icon, FloppyDiskIcon } from 'hugeicons-react';
import { Loader } from '../common/Loader';
import { Engine, MessageTemplateRq, MessageTemplateRs } from '../../api/message.templates';
import AceEditor from 'react-ace';
import { loadSettings } from '../../settings/utils';
import { encodeText, tryDecodeToText } from '../../utils/base64';


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
    const [schema, setSchema] = useState<Record<string, any>>({});
    const [template, setTemplate] = useState<string>('');

    useImperativeHandle(ref, () => ({
      getMessageTemplateRq: (): MessageTemplateRq => {
        return {
          code,
          name,
          engine,
          schema,
          template: encodeText(template)
        };
      },
      changeFormValues: (rs: MessageTemplateRs) => {
        setCode(rs.code);
        setName(rs.name);
        setEngine(rs.engine);
        setSchema(rs.schema);
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

                <Form.Group controlId="messageTemplateNameInput">
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

                <Form.Group controlId="messageTemplateEngineInput">
                  <Row className={'mb-2'}>
                    <Col md={3}>
                      <Form.Label>Engine</Form.Label>
                    </Col>
                    <Col md={9}>
                      <Form.Select
                        value={engine}
                        onChange={(e) => setEngine(e.target.value as Engine)}
                        required
                      >
                        <option key="FREEMARKER" value="FREEMARKER">
                          FreeMarker
                        </option>
                        <option key="JAVA_TEMPLATE_ENGINE" value="JAVA_TEMPLATE_ENGINE">
                          Java Template Engine
                        </option>
                      </Form.Select>
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group controlId="messageTemplateTemplateInput">
                  <Row className={'mb-2'}>
                    <Col md={3}>
                      <Form.Label>Template</Form.Label>
                    </Col>
                    <Col md={9}>
                      <AceEditor
                        mode={'text'}
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
