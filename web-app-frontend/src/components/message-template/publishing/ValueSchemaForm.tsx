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
  ({ schema }: ValueSchemaFormProps, ref) => {
    const [formData, setFormData] = useState<{ [key: string]: any }>({});

    const getNestedValue = (data: any, path: string[]) => {
      return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), data);
    };

    const setNestedValue = (data: any, path: string[], value: any) => {
      const newData = { ...data };
      let current = newData;

      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }

      current[path[path.length - 1]] = value;
      return newData;
    };

    const handleChange = (path: string[], value: any) => {
      setFormData((prev) => setNestedValue(prev, path, value));
    };

    const handleDeleteArrayItem = (path: string[], index: number) => {
      setFormData((prev) => {
        const array = getNestedValue(prev, path);
        const newArray = [...array];
        newArray.splice(index, 1);
        return setNestedValue(prev, path, newArray);
      });
    };

    useImperativeHandle(ref, () => ({
      getValue: () => formData,
    }));

    const renderField = (path: string[], node: SchemaNode) => {
      const value = getNestedValue(formData, path);

      if (node.default && value === undefined) {
        if (node.type === 'string') {
          handleChange(path, node.default);
        } else if (node.type === 'number' || node.type === 'integer' || node.type === 'boolean') {
          handleChange(path, `${node.default}`);
        } else if (node.type === 'array') {
          handleChange(path, JSON.parse(node.default));
        } else {
          handleChange(path, JSON.parse(node.default));
        }
      }

      switch (node.type) {
        case 'string':
          return (
            <Form.Group className={'mb-2'} as={Row} key={path.join('.')}>
              <Form.Label column md={2}>
                {node.title}
              </Form.Label>
              <Col md={10}>
                {node.specification === 'enum' ? (
                  <Form.Select
                    value={value || ''}
                    onChange={(e) => handleChange(path, e.target.value)}
                    required={true}
                  >
                    {!node.default && <option value={''}></option>}
                    {node.enum?.map((option) => (
                      <option key={option} value={JSON.parse(option)}>
                        {JSON.parse(option)}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <Form.Control
                    type="text"
                    value={value || ''}
                    onChange={(e) => handleChange(path, e.target.value)}
                  />
                )}
              </Col>
            </Form.Group>
          );

        case 'number':
        case 'integer':
          return (
            <Form.Group className={'mb-2'} as={Row} key={path.join('.')}>
              <Form.Label column md={2}>
                {node.title}
              </Form.Label>
              <Col md={10}>
                <Form.Control
                  type="number"
                  value={value || ''}
                  onChange={(e) => handleChange(path, parseFloat(e.target.value))}
                />
              </Col>
            </Form.Group>
          );

        case 'boolean':
          return (
            <Form.Group className={'mb-2'} as={Row} key={path.join('.')}>
              <Form.Label column md={2}>
                {node.title}
              </Form.Label>
              <Col md={10}>
                <Form.Check
                  type="checkbox"
                  checked={value || false}
                  onChange={(e) => handleChange(path, e.target.checked)}
                />
              </Col>
            </Form.Group>
          );

        case 'object':
          const objectNode = node as ObjectSchemaNode;
          return (
            <div className={'border p-3 mb-2'} key={path.join('.')}>
              <h4>{objectNode.title}</h4>
              {objectNode.properties?.map((prop) => (
                <div key={prop.name}>
                  {renderField([...path, prop.name], prop.schema)}
                </div>
              ))}
            </div>
          );

        case 'array':
          const arrayNode = node as ArraySchemaNode;
          const array = value || [];
          return (
            <div className={'mb-2'} key={path.join('.')}>
              <h4>{arrayNode.title}</h4>
              {array.map((_: any, index: number) => (
                <Row key={index}>
                  <Col md={11}>
                    {renderField([...path, index.toString()], arrayNode.items!)}
                  </Col>
                  <Col md={1}>
                    <Button variant="danger" onClick={() => handleDeleteArrayItem(path, index)}>
                      <MinusSignIcon />
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button onClick={() => handleChange(path, [...array, undefined])}>
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
            {renderField([prop.name], prop.schema)}
          </div>
        ))}
      </div>
    );
  }
);

export default ValueSchemaForm;
