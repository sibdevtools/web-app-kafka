// Base interface for all schema nodes
export interface BaseSchemaNode {
  title: string;
  type:  'string' | 'boolean' | 'number' | 'integer' | 'object' | 'array';
  specification: 'none' | 'enum';
  enum?: Array<string>;
  nullable: boolean;
}

// Interface for string type schema nodes
export interface StringSchemaNode extends BaseSchemaNode {
  type: 'string';
  minLength?: number;
  maxLength?: number;
}

// Interface for number/integer type schema nodes
export interface NumberSchemaNode extends BaseSchemaNode {
  type: 'number' | 'integer';
  minimum?: number;
  maximum?: number;
}

// Interface for object type schema nodes
export interface ObjectSchemaNode extends BaseSchemaNode {
  type: 'object';
  properties?: Array<{
    name: string;
    schema: SchemaNode;
  }>;
}

// Interface for array type schema nodes
export interface ArraySchemaNode extends BaseSchemaNode {
  type: 'array';
  items?: SchemaNode;
  minItems?: number;
  maxItems?: number;
}

// Union type for all schema nodes
export type SchemaNode =
  | BaseSchemaNode
  | StringSchemaNode
  | NumberSchemaNode
  | ObjectSchemaNode
  | ArraySchemaNode;
