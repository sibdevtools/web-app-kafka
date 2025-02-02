export const contextPath = '/web/app/kafka/ui/';


export const textTypeAceModeMap = new Map<string, string>([
    ['JSON', 'json'] as const,
    ['XML', 'xml'] as const,
    ['Text', 'text'] as const,
    ['YAML', 'yaml'] as const,
    ['ProtoBuf', 'protobuf'] as const,
  ]
);

export type MapKey<T extends Map<any, any>> = T extends Map<infer K, any> ? K : never

export type TextType = MapKey<typeof textTypeAceModeMap>

export const textTypes = [
  ...textTypeAceModeMap.keys(),
].sort()
