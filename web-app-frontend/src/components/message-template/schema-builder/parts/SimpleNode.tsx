import { Form, InputGroup } from 'react-bootstrap';
import React from 'react';
import { ArraySchemaNode, NumberSchemaNode, ObjectSchemaNode, SchemaNode, StringSchemaNode } from '../type';
import StringNode from './StringNode';
import NumberNode from './NumberNode';
import ObjectNode from './ObjectNode';
import ArrayNode from './ArrayNode';
import EnumNode from './EnumNode';


export interface SimpleNodeProps {
  node: SchemaNode;
  onChange: (newNode: SchemaNode) => void;
  isRoot: boolean;
}

const SimpleNode: React.FC<SimpleNodeProps> = ({
                                                 node,
                                                 onChange,
                                                 isRoot
                                               }) => {
  return (
    <>
      <Form.Group className="mb-3">
        <InputGroup>
          <InputGroup.Text>Title</InputGroup.Text>
          <Form.Control
            value={node.title}
            onChange={(e) => onChange({ ...node, title: e.target.value.slice(0, 64) })}
            maxLength={64}
            required={true}
          />
        </InputGroup>
      </Form.Group>

      {!isRoot && (
        <Form.Group className="mb-3">
          <InputGroup>
            <InputGroup.Text>
              Type
            </InputGroup.Text>
            <Form.Select
              value={node.type}
              onChange={(e) => onChange({ ...node, type: e.target.value as SchemaNode['type'] })}
              required={true}
            >
              {['string', 'boolean', 'number', 'integer', 'object', 'array'].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Form.Select>
            <InputGroup.Text>
              <Form.Check
                type="checkbox"
                label="Nullable"
                checked={node.nullable}
                onChange={(e) => onChange({ ...node, nullable: e.target.checked })}
              />
            </InputGroup.Text>
          </InputGroup>
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <InputGroup>
          <InputGroup.Text>
            Specification
          </InputGroup.Text>
          <Form.Select
            value={node.specification}
            onChange={(e) => onChange({ ...node, specification: e.target.value as SchemaNode['specification'] })}
          >
            {['none', 'enum'].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Form.Select>
        </InputGroup>
      </Form.Group>

      {node.specification === 'enum' && (
        <EnumNode
          node={node}
          onChange={onChange}
        />
      )}

      {node.type === 'string' && (
        <StringNode
          node={node as StringSchemaNode}
          onChange={onChange}
        />
      )}

      {(node.type === 'number' || node.type === 'integer') && (
        <NumberNode
          node={node as NumberSchemaNode}
          onChange={onChange}
        />
      )}

      {node.type === 'object' && (
        <ObjectNode
          node={node as ObjectSchemaNode}
          onChange={onChange}
        />
      )}

      {node.type === 'array' && (
        <ArrayNode
          node={node as ArraySchemaNode}
          onChange={onChange}
        />
      )}
    </>
  )
}

export default SimpleNode;
