import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BootstrapGroupForm, { BootstrapGroupFormHandle } from './BootstrapGroupForm';
import { createBootstrapGroup, getBootstrapGroup, updateBootstrapGroup } from '../../api/bootstrap.group';
import { contextPath } from '../../constant/common';

const AddEditBootstrapGroup: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { groupId } = useParams();
  const bootstrapGroupFormRef = useRef<BootstrapGroupFormHandle>(null);
  const [error, setError] = useState<string | null>(null);

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
      bootstrapGroupFormRef?.current?.changeFormValues(body);
    } catch (error) {
      console.error('Failed to fetch bootstrap group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bootstrapGroupData = bootstrapGroupFormRef?.current?.getBootstrapGroupRq();
      if (!bootstrapGroupData) {
        return
      }
      if (bootstrapGroupData.code.length === 0) {
        setError('Code are required');
        return;
      }
      if (bootstrapGroupData.name.length === 0) {
        setError('Name are required');
        return;
      }
      if (bootstrapGroupData.bootstrapServers.length === 0) {
        setError('Bootstrap servers are required');
        return;
      }
      if (groupId) {
        await updateBootstrapGroup(+groupId, bootstrapGroupData);
      } else {
        await createBootstrapGroup(bootstrapGroupData);
      }
      setError(null);
      navigate(contextPath);
    } catch (error) {
      console.error('Failed to submit bootstrap group:', error);
      setError(`Failed to submit bootstrap group: ${error}`);
    }
  };

  const navigateBack = () => {
    navigate(contextPath);
  };

  return (
    <BootstrapGroupForm
      ref={bootstrapGroupFormRef}
      loading={loading}
      onSubmit={handleSubmit}
      isEditMode={!!groupId}
      navigateBack={navigateBack}
      error={error}
      setError={setError}
    />
  );
};

export default AddEditBootstrapGroup;
