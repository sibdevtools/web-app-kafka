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
