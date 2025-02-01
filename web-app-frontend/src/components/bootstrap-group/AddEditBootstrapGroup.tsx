import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BootstrapGroupForm from './BootstrapGroupForm';
import { createBootstrapGroup, getBootstrapGroup, updateBootstrapGroup } from '../../api/bootstrap.group';
import { contextPath } from '../../constant/common';

const AddEditBootstrapGroup: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { groupId } = useParams();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [maxTimeout, setMaxTimeout] = useState<number>(6000);
  const [bootstrapServers, setBootstrapServers] = useState<string[]>([]);

  useEffect(() => {
    if (groupId) {
      fetchBootstrapGroup();
    } else {
      setLoading(false);
    }
  }, [groupId]);

  const fetchBootstrapGroup = async () => {
    setLoading(true);
    if (!(groupId)) {
      setLoading(false);
      return;
    }
    try {
      const response = await getBootstrapGroup(+groupId);
      const body = response.data.body;
      setCode(body.code);
      setName(body.name);
      setMaxTimeout(body.maxTimeout);
      setBootstrapServers(body.bootstrapServers);
    } catch (error) {
      console.error('Failed to fetch bootstrap group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bootstrapGroupData = {
        code: code,
        name: name,
        maxTimeout: maxTimeout,
        bootstrapServers: bootstrapServers,
      };
      if (groupId) {
        await updateBootstrapGroup(+groupId, bootstrapGroupData);
      } else {
        await createBootstrapGroup(bootstrapGroupData);
      }
      navigate(contextPath);
    } catch (error) {
      console.error('Failed to submit bootstrap group:', error);
    }
  };

  const navigateBack = () => {
    navigate(contextPath);
  };

  return (
    <BootstrapGroupForm
      loading={loading}
      code={code}
      name={name}
      maxTimeout={maxTimeout}
      bootstrapServers={bootstrapServers}
      setCode={setCode}
      setName={setName}
      setMaxTimeout={setMaxTimeout}
      setBootstrapServers={setBootstrapServers}
      onSubmit={handleSubmit}
      isEditMode={!!groupId}
      navigateBack={navigateBack}
    />
  );
};

export default AddEditBootstrapGroup;
