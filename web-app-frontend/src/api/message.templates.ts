import axios from 'axios';

const messageTemplate = axios.create({
  baseURL: '/kafka-client-service/message-template',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface MessageTemplateRs {
  id: number;
  code: string;
  name: string;
  engine: 'FREEMARKER' | 'JAVA_TEMPLATE_ENGINE';
  createdAt: string;
  modifiedAt: string;
}

export interface GetAllMessageTemplateRs {
  success: boolean;
  body: MessageTemplateRs[];
}

export const getAllMessageTemplates = () => messageTemplate.get<GetAllMessageTemplateRs>('/');

export const deleteMessageTemplate = (id: number) => messageTemplate.delete(`/${id}`);
