import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MessageTemplateForm, { MessageTemplateFormHandle } from './MessageTemplateForm';
import { createMessageTemplate, getMessageTemplate, updateMessageTemplate } from '../../api/message.templates';
import { contextPath } from '../../constant/common';

const AddEditMessageTemplate: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { templateId } = useParams();
  const messageTemplateFormRef = useRef<MessageTemplateFormHandle>(null);

  useEffect(() => {
    if (templateId) {
      fetchMessageTemplate();
    } else {
      setLoading(false);
    }
  }, [templateId]);

  const fetchMessageTemplate = async () => {
    setLoading(true);
    if (!(templateId)) {
      setLoading(false);
      return;
    }
    try {
      const response = await getMessageTemplate(+templateId);
      const body = response.data.body;
      messageTemplateFormRef?.current?.changeFormValues(body);
    } catch (error) {
      console.error('Failed to fetch message template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const messageTemplateData = messageTemplateFormRef?.current?.getMessageTemplateRq();
      if (!messageTemplateData) {
        return
      }
      if (templateId) {
        await updateMessageTemplate(+templateId, messageTemplateData);
      } else {
        await createMessageTemplate(messageTemplateData);
      }
      navigate(`${contextPath}v1/message-templates`);
    } catch (error) {
      console.error('Failed to submit message template:', error);
    }
  };

  const navigateBack = () => {
    navigate(`${contextPath}v1/message-templates`);
  };

  return (
    <MessageTemplateForm
      ref={messageTemplateFormRef}
      loading={loading}
      onSubmit={handleSubmit}
      isEditMode={!!templateId}
      navigateBack={navigateBack}
    />
  );
};

export default AddEditMessageTemplate;
