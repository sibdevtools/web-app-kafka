import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { ArraySchemaNode, ObjectSchemaNode, SchemaNode } from '../schema-builder/type';
import { Add01Icon, MinusSignIcon } from 'hugeicons-react';

export interface ValueSchemaFormProps {
  schema: ObjectSchemaNode;
}

export interface ValueSchemaFormHandle {
  getValue: () => { [key: string]: any };
}


export const ValueSchemaForm = forwardRef<ValueSchemaFormHandle, ValueSchemaFormProps>(
  ({
     schema
   }: ValueSchemaFormProps, ref) => {
    const [formData, setFormData] = useState<{ [key: string]: any }>({});

    const handleChange = (key: string, value: any) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleDeleteArrayItem = (key: string, index: number) => {
      const newArray = [...formData[key]];
      newArray.splice(index, 1);
      handleChange(key, newArray);
    };

    useImperativeHandle(ref, () => ({
      getValue: (): { [key: string]: any } => {
        return {
          ...formData,
        };
      },
    }));

    const renderField = (key: string, node: SchemaNode) => {
      if (node.default) {
        if (node.type === 'string') {
          formData[key] = formData[key] ?? node.default;
        } else if (node.type === 'number' || node.type === 'integer' || node.type === 'boolean') {
          formData[key] = formData[key] ?? `${node.default}`;
        } else if (node.type === 'array') {
          const array = JSON.parse(node.default);
          formData[key] = formData[key] ?? array;
          for (let i = 0; i < array.length; i++) {
            formData[`${key}[${i}]`] = formData[`${key}[${i}]`] ?? array[i];
          }
        } else {
          formData[key] = formData[key] ?? JSON.parse(node.default);
        }
      }

      switch (node.type) {
        case 'string':
          return (
            <Form.Group className={'mb-2'} as={Row} key={key}>
              <Form.Label column md={2}>
                {node.title}
              </Form.Label>
              <Col md={10}>
                {node.specification === 'enum' ? (
                  <Form.Select
                    value={formData[key] || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    required={true}
                  >
                    {!node.default && (
                      <option value={''}></option>
                    )}
                    {node.enum?.map((option) => (
                      <option key={option} value={JSON.parse(option)}>
                        {JSON.parse(option)}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <Form.Control
                    type="text"
                    value={formData[key] || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                )}
              </Col>
            </Form.Group>
          );

        case 'number':
        case 'integer':
          return (
            <Form.Group className={'mb-2'} as={Row} key={key}>
              <Form.Label column md={2}>
                {node.title}
              </Form.Label>
              <Col md={10}>
                <Form.Control
                  type="number"
                  value={formData[key] || ''}
                  onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                />
              </Col>
            </Form.Group>
          );

        case 'boolean':
          return (
            <Form.Group className={'mb-2'} as={Row} key={key}>
              <Form.Label column md={2}>
                {node.title}
              </Form.Label>
              <Col md={10}>
                <Form.Check
                  type="checkbox"
                  checked={formData[key] || false}
                  onChange={(e) => handleChange(key, e.target.checked)}
                />
              </Col>
            </Form.Group>
          );

        case 'object':
          const objectNode = node as ObjectSchemaNode;
          return (
            <div className={'border p-3 mb-2'} key={key}>
              <h4>{objectNode.title}</h4>
              {objectNode.properties?.map((prop) => (
                <div key={prop.name}>
                  {renderField(prop.name, prop.schema)}
                </div>
              ))}
            </div>
          );

        case 'array':
          const arrayNode = node as ArraySchemaNode;
          return (
            <div className={'mb-2'} key={key}>
              <h4>{arrayNode.title}</h4>
              {Array.from({ length: formData[key]?.length || 0 }).map((_, index) => (
                <Row key={index}>
                  <Col md={11}>
                    {renderField(`${key}[${index}]`, arrayNode.items!)}
                  </Col>
                  <Col md={1}>
                    <Button variant="danger" onClick={() => handleDeleteArrayItem(key, index)}>
                      <MinusSignIcon />
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button onClick={() => handleChange(key, [...(formData[key] || []), undefined])}>
                <Add01Icon />
              </Button>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className={'border p-3'}>
        <h3>{schema.title}</h3>
        {schema.properties?.map((prop) => (
          <div key={prop.name}>
            {renderField(prop.name, prop.schema)}
          </div>
        ))}
      </div>
    );
  });

export default ValueSchemaForm;
