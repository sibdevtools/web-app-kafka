import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'hugeicons-react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import BootstrapGroups from './components/bootstrap-groups/BootstrapGroups';
import MessagePublishing from './components/MessagePublishing';
import MessageTemplates from './components/MessageTemplates';
import MessageConsuming from './components/MessageConsuming';
import { contextPath } from './constant/common';
import AddEditBootstrapGroup from './components/bootstrap-group/AddEditBootstrapGroup';
import ApplicationLayout from './components/common/ApplicationLayout';

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
              </Route>
            </Route>
            <Route path="message-consuming" element={<MessageConsuming />} />
            <Route path="message-publishing" element={<MessagePublishing />} />
            <Route path="message-templates" element={<MessageTemplates />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )

};

export default App;
