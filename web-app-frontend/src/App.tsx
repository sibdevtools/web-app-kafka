import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'hugeicons-react'
import { Container, Nav } from 'react-bootstrap';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import BootstrapGroups from './components/BootstrapGroups';
import MessagePublishing from './components/MessagePublishing';
import MessageTemplates from './components/MessageTemplates';
import MessageConsuming from './components/MessageConsuming';
import { contextPath } from './constant/common';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Container fluid className="p-0">
        {/* Navigation Tabs */}
        <Nav variant="tabs" defaultActiveKey="/" className="mb-3" fill>
          <Nav.Item>
            <Nav.Link as={Link} to={contextPath} eventKey="bootstrap-groups">
              Bootstrap Groups
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} to={`${contextPath}message-consuming`} eventKey="message-consuming">
              Message Consuming
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} to={`${contextPath}message-publishing`} eventKey="message-publishing">
              Message Publishing
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} to={`${contextPath}message-templates`} eventKey="message-templates">
              Message Templates
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Routes>
          {/* Routes */}
          <Route path={contextPath}>
            <Route index element={<BootstrapGroups />} />
            <Route path="message-consuming" element={<MessageConsuming />} />
            <Route path="message-publishing" element={<MessagePublishing />} />
            <Route path="message-templates" element={<MessageTemplates />} />
          </Route>
        </Routes>
      </Container>
    </BrowserRouter>
  )

};

export default App;
