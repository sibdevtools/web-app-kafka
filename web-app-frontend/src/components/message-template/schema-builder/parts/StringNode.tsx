import { Form, InputGroup } from 'react-bootstrap';
import React from 'react';
import { SchemaNode, StringSchemaNode } from '../type';


export interface StringNodeProps {
  node: StringSchemaNode;
  onChange: (newNode: SchemaNode) => void;
}


const StringNode: React.FC<StringNodeProps> = ({
                                                 node,
                                                 onChange,
                                               }) => {
  return (
    <>
      <Form.Group className="mb-3">
        <InputGroup>
          <InputGroup.Text>Minimum Length</InputGroup.Text>
          <Form.Control
            type="number"
            value={node.minLength || ''}
            min={0}
            onChange={(e) => onChange({ ...node, minLength: Number(e.target.value) })}
          />
        </InputGroup>
      </Form.Group>
      <Form.Group className="mb-3">
        <InputGroup>
          <InputGroup.Text>Maximum Length</InputGroup.Text>
          <Form.Control
            type="number"
            value={node.maxLength || ''}
            min={0}
            onChange={(e) => onChange({ ...node, maxLength: Number(e.target.value) })}
          />
        </InputGroup>
      </Form.Group>
    </>
  )
}

export default StringNode;
