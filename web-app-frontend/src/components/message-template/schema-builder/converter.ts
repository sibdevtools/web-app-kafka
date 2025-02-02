import {
  ArraySchemaNode,
  BaseSchemaNode,
  NumberSchemaNode,
  ObjectSchemaNode,
  SchemaNode,
  StringSchemaNode
} from './type';
import { initialSchema } from './SchemaFormBuilder';


export function convertToJsonSchema(node: SchemaNode): any {
  const baseType = node.type;
  const type = node.nullable ? ['null', baseType] : baseType;

  const schema: any = {
    type,
    title: node.title,
  };

  switch (node.type) {
    case 'string':
      const stringNode = node as StringSchemaNode;
      if (stringNode.minLength !== undefined) schema.minLength = stringNode.minLength;
      if (stringNode.maxLength !== undefined) schema.maxLength = stringNode.maxLength;
      break;
    case 'integer':
    case 'number':
      const numberNode = node as NumberSchemaNode;
      if (numberNode.minimum !== undefined) schema.minimum = numberNode.minimum;
      if (numberNode.maximum !== undefined) schema.maximum = numberNode.maximum;
      break;
    case 'object':
      const objectNode = node as ObjectSchemaNode;
      if (objectNode.properties) {
        schema.properties = objectNode.properties.reduce((acc, prop) => {
          acc[prop.name] = convertToJsonSchema(prop.schema);
          return acc;
        }, {} as Record<string, any>);
      }
      break;
    case 'array':
      const arrayNode = node as ArraySchemaNode;
      if (arrayNode.items) schema.items = convertToJsonSchema(arrayNode.items);
      if (arrayNode.minItems !== undefined) schema.minItems = arrayNode.minItems;
      if (arrayNode.maxItems !== undefined) schema.maxItems = arrayNode.maxItems;
      break;
  }

  switch (node.specification) {
    case 'enum':
      if (node.enum) schema.enum = node.enum?.map(it => JSON.parse(it));
      break;
  }

  return schema;
}


export function parseJsonSchema(json: any): SchemaNode {
  let type: SchemaNode['type'] = 'string';
  let specification: SchemaNode['specification'] = 'none';
  let nullable = false;

  if (Array.isArray(json.type)) {
    const types = json.type.filter((t: string) => t !== 'null');
    type = types[0] || 'null';
    nullable = json.type.includes('null');
  } else if (typeof json.type === 'string') {
    type = json.type as SchemaNode['type'];
  }
  if ('enum' in json) {
    specification = 'enum'
  }

  const baseNode: BaseSchemaNode = {
    type,
    specification,
    nullable,
    title: json.title || '',
  };

  switch (specification) {
    case 'enum':
      const jsonEnum = json.enum;
      baseNode.enum = []
      if (jsonEnum && typeof jsonEnum[Symbol.iterator] === 'function') {
        for (let jsonEnumItem of jsonEnum) {
          baseNode.enum.push(JSON.stringify(jsonEnumItem))
        }
      }
      break;
  }

  switch (type) {
    case 'string':
      return {
        ...baseNode,
        minLength: json.minLength,
        maxLength: json.maxLength,
      } as StringSchemaNode
    case 'integer':
    case 'number':
      return {
        ...baseNode,
        minimum: json.minimum,
        maximum: json.maximum,
      } as NumberSchemaNode
    case 'object':
      return {
        ...baseNode,
        properties: Object.entries(json.properties || {}).map(([name, prop]) => ({
          name,
          schema: parseJsonSchema(prop)
        })),
      } as ObjectSchemaNode
    case 'array':
      return {
        ...baseNode,
        items: json.items ? parseJsonSchema(json.items) : initialSchema,
        minItems: json.minItems,
        maxItems: json.maxItems,
      } as ArraySchemaNode
  }

  return baseNode;
}
