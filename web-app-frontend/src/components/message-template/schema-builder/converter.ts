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
      if (node.default !== undefined && node.default.length > 0) {
        schema.default = node.default
      }
      const stringNode = node as StringSchemaNode;
      if (stringNode.minLength !== undefined) schema.minLength = stringNode.minLength;
      if (stringNode.maxLength !== undefined) schema.maxLength = stringNode.maxLength;
      break;
    case 'integer':
    case 'number':
      if (node.default !== undefined && node.default.length > 0) {
        schema.default = Number(node.default)
      }
      const numberNode = node as NumberSchemaNode;
      if (numberNode.minimum !== undefined) schema.minimum = numberNode.minimum;
      if (numberNode.maximum !== undefined) schema.maximum = numberNode.maximum;
      break;
    case 'object':
      if (node.default !== undefined && node.default.length > 0) {
        schema.default = JSON.parse(node.default)
      }
      const objectNode = node as ObjectSchemaNode;
      if (objectNode.properties) {
        schema.properties = objectNode.properties.reduce((acc, prop) => {
          acc[prop.name] = convertToJsonSchema(prop.schema);
          return acc;
        }, {} as Record<string, any>);
      }
      break;
    case 'array':
      if (node.default !== undefined && node.default.length > 0) {
        schema.default = JSON.parse(node.default)
      }
      const arrayNode = node as ArraySchemaNode;
      if (arrayNode.items) schema.items = convertToJsonSchema(arrayNode.items);
      if (arrayNode.minItems !== undefined) schema.minItems = arrayNode.minItems;
      if (arrayNode.maxItems !== undefined) schema.maxItems = arrayNode.maxItems;
      break;
    case 'boolean':
      if (node.default !== undefined && node.default.length > 0) {
        schema.default = 'true' === node.default
      }
      break;
  }

  switch (node.specification) {
    case 'enum':
      if (node.enum) schema.enum = node.enum?.filter(it => it.length > 0)?.map(it => JSON.parse(it));
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
        default: json.default !== undefined ? json.default : undefined,
      } as StringSchemaNode
    case 'integer':
    case 'number':
      return {
        ...baseNode,
        minimum: json.minimum,
        maximum: json.maximum,
        default: json.default !== undefined ? `${json.default}` : undefined,
      } as NumberSchemaNode
    case 'object':
      return {
        ...baseNode,
        properties: Object.entries(json.properties || {}).map(([name, prop]) => ({
          name,
          schema: parseJsonSchema(prop)
        })),
        default: json.default !== undefined ? JSON.stringify(json.default) : undefined,
      } as ObjectSchemaNode
    case 'array':
      return {
        ...baseNode,
        items: json.items ? parseJsonSchema(json.items) : initialSchema,
        minItems: json.minItems,
        maxItems: json.maxItems,
        default: json.default !== undefined ? JSON.stringify(json.default) : undefined,
      } as ArraySchemaNode
    case 'boolean':
      return {
        ...baseNode,
        default: json.default !== undefined ? `${json.default}` : undefined,
      } as SchemaNode;
    default:
  }

  return baseNode;
}
