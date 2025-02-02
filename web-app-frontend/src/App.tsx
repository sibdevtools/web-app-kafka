import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'hugeicons-react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import BootstrapGroups from './components/bootstrap-groups/BootstrapGroups';
import MessagePublishing from './components/message-publishing/MessagePublishing';
import MessageTemplates from './components/message-templates/MessageTemplates';
import MessageConsuming from './components/message-consuming/MessageConsuming';
import { contextPath } from './constant/common';
import AddEditBootstrapGroup from './components/bootstrap-group/AddEditBootstrapGroup';
import ApplicationLayout from './components/common/ApplicationLayout';
import AddEditMessageTemplate from './components/message-template/AddEditMessageTemplate';
import MessageTemplatePublishing from './components/message-template/publishing/MessageTemplatePublishing';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes */}
        <Route path={contextPath} element={<ApplicationLayout />}>
          <Route index element={<BootstrapGroups />} />
          <Route path={'v1'}>
            <Route path="bootstrap-group">
              <Route path="add" element={<AddEditBootstrapGroup />} />
              <Route path={':groupId'}>
                <Route path="edit" element={<AddEditBootstrapGroup />} />
                <Route path="consuming" element={<MessageConsuming />} />
                <Route path="publishing" element={<MessagePublishing />} />
              </Route>
            </Route>
            <Route path="message-templates" element={<MessageTemplates />} />
            <Route path="message-template">
              <Route path="add" element={<AddEditMessageTemplate />} />
              <Route path={':templateId'}>
                <Route path="edit" element={<AddEditMessageTemplate />} />
                <Route path="publishing" element={<MessageTemplatePublishing />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )

};

export default App;
