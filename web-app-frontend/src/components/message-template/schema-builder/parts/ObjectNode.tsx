import { Accordion, Button, Form, InputGroup } from 'react-bootstrap';
import { Add01Icon, Delete01Icon } from 'hugeicons-react';
import React from 'react';
import SchemaFormBuilder, { initialSchema } from '../SchemaFormBuilder';
import { ObjectSchemaNode, SchemaNode } from '../type';

export interface ObjectNodeProps {
  node: ObjectSchemaNode;
  onChange: (newNode: SchemaNode) => void;
}

const ObjectNode: React.FC<ObjectNodeProps> = ({
                                                 node,
                                                 onChange
                                               }) => {
  return (
    <>
      <Accordion defaultActiveKey="0" className="mb-3">
        <Accordion.Item eventKey="properties">
          <Accordion.Header>Properties</Accordion.Header>
          <Accordion.Body>
            {node.properties?.map((prop, index) => (
              <Accordion key={index} className="mb-3">
                <Accordion.Item eventKey={String(index)}>
                  <Accordion.Header>
                    {prop.name || 'Unnamed Property'} ({prop.schema.type})
                  </Accordion.Header>
                  <Accordion.Body>
                    <div className="border p-3 mb-3">
                      <div className="d-flex gap-3 mb-3">
                        <InputGroup className="flex-grow-1">
                          <InputGroup.Text>Name</InputGroup.Text>
                          <Form.Control
                            value={prop.name}
                            onChange={(e) => {
                              const newProperties = [...node.properties!];
                              newProperties[index] = { ...prop, name: e.target.value };
                              onChange({ ...node, properties: newProperties });
                            }}
                            required={true}
                          />
                          <Button
                            variant="danger"
                            onClick={() => {
                              const newProperties = node.properties?.filter((_, i) => i !== index);
                              onChange({ ...node, properties: newProperties });
                            }}
                          >
                            <Delete01Icon />
                          </Button>
                        </InputGroup>
                      </div>
                      <SchemaFormBuilder
                        node={prop.schema}
                        onChange={(newSchema) => {
                          const newProperties = [...node.properties!];
                          newProperties[index].schema = newSchema;
                          onChange({ ...node, properties: newProperties });
                        }}
                        isRoot={false}
                      />
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            ))}
            <Button
              variant="outline-success"
              size="sm"
              onClick={() => onChange({
                ...node,
                properties: [...(node.properties || []), {
                  name: '',
                  schema: initialSchema
                }]
              })}
            >
              <Add01Icon />
            </Button>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  )
}

export default ObjectNode;
