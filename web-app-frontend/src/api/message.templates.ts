import axios from 'axios';

const messageTemplate = axios.create({
  baseURL: '/kafka-client-service/message-template',
  headers: {
    'Content-Type': 'application/json',
  },
});

export type Engine = 'FREEMARKER' | 'AVRO' | 'JAVA_SCRIPT' | 'PYTHON' | 'JSON';

export interface MessageTemplateShortRs {
  id: number;
  code: string;
  name: string;
  engine: Engine;
  createdAt: string;
  modifiedAt: string;
}

export interface GetAllMessageTemplateRs {
  success: boolean;
  body: MessageTemplateShortRs[];
}

export const getAllMessageTemplates = () => messageTemplate.get<GetAllMessageTemplateRs>('/');

export interface MessageTemplateRq {
  code: string;
  name: string;
  engine: Engine;
  headers: Record<string, string> | null;
  schema: Record<string, any>;
  template: string;
}

export const createMessageTemplate = (rq: MessageTemplateRq) => messageTemplate.post(`/`, rq);

export const updateMessageTemplate = (id: number, rq: MessageTemplateRq) => messageTemplate.put(`/${id}`, rq);

export const deleteMessageTemplate = (id: number) => messageTemplate.delete(`/${id}`);

export interface MessageTemplateRs {
  id: number;
  code: string;
  name: string;
  engine: Engine;
  headers: Record<string, string> | null;
  schema: Record<string, any>;
  template: string;
  createdAt: string;
  modifiedAt: string;
}

export interface GetMessageTemplateRs {
  success: boolean;
  body: MessageTemplateRs;
}

export const getMessageTemplate = (id: number) => messageTemplate.get<GetMessageTemplateRs>(`/${id}`);

export interface RecordMetadataDto {
  offset: number;
  timestamp: number;
  serializedKeySize: number;
  serializedValueSize: number;
  partition: number;
}

export interface SendMessageRq {
  bootstrapGroupId: number;
  topic: string;
  partition: number | null;
  timestamp: number | null;
  key: string | null;
  input: Record<string, any>;
  headers: Record<string, string> | null;
  maxTimeout: number | null;
}

export interface SendMessageRs {
  success: boolean;
  body: RecordMetadataDto;
}

export const sendMessage = (
  id: number,
  rq: SendMessageRq,
) => messageTemplate.post<SendMessageRs>(`/${id}/send`, rq);
