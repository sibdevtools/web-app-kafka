import axios from 'axios';

const bootstrapGroup = axios.create({
  baseURL: '/kafka-client-service/bootstrap-group',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface BootstrapGroupRs {
  id: number;
  code: string;
  name: string;
  maxTimeout: number;
  bootstrapServers: string[];
  createdAt: string;
  modifiedAt: string;
}

export interface GetAllBootstrapGroupRs {
  success: boolean;
  body: BootstrapGroupRs[];
}

export const getAllBootstrapGroup = () => bootstrapGroup.get<GetAllBootstrapGroupRs>('/');

export interface GetBootstrapGroupRs {
  success: boolean;
  body: BootstrapGroupRs;
}

export const getBootstrapGroup = (groupId: number) => bootstrapGroup.get<GetBootstrapGroupRs>(`/${groupId}`);

export interface BootstrapGroupRq {
  code: string;
  name: string;
  maxTimeout: number;
  bootstrapServers: string[];
}

export const createBootstrapGroup = (rq: BootstrapGroupRq) => bootstrapGroup.post(`/`, rq);

export const updateBootstrapGroup = (groupId: number, rq: BootstrapGroupRq) => bootstrapGroup.put(`/${groupId}`, rq);

export const deleteBootstrapGroup = (groupId: number) => bootstrapGroup.delete(`/${groupId}`);

export interface GetTopicsRs {
  success: boolean;
  body: string[];
}

export const getTopics = (groupId: number) => bootstrapGroup.get<GetTopicsRs>(`/${groupId}/topics`);

export interface MessageRs {
  topic: string;
  partition: number;
  offset: number;
  timestamp: number;
  timestampType: string;
  headers: Record<string, string>;
  key: string | null;
  value: string | null;
}

export interface GetMessagesRs {
  success: boolean;
  body: MessageRs[];
}

export const getMessages = (
  groupId: number,
  topic: string,
  maxMessages: number,
  maxTimeout: number | null
) => bootstrapGroup.get<GetMessagesRs>(`/${groupId}/${topic}/messages`, {
  params: {
    maxMessages: maxMessages,
    maxTimeout: maxTimeout
  }
});

export const getLastMessages = (
  groupId: number,
  topic: string,
  maxMessages: number,
  maxTimeout: number | null
) => bootstrapGroup.get<GetMessagesRs>(`/${groupId}/${topic}/lastMessages`, {
  params: {
    maxMessages: maxMessages,
    maxTimeout: maxTimeout
  }
});
