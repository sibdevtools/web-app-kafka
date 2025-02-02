import axios from 'axios';

const messageTemplate = axios.create({
  baseURL: '/kafka-client-service/message-template',
  headers: {
    'Content-Type': 'application/json',
  },
});

export type Engine = 'FREEMARKER' | 'JAVA_TEMPLATE_ENGINE' | 'AVRO';

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
