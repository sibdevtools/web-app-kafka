import { Container, Nav } from 'react-bootstrap';
import { Link, Outlet } from 'react-router-dom';
import { contextPath } from '../../constant/common';
import React from 'react';

const ApplicationLayout: React.FC = () => {
  return (
    <Container fluid className="p-0">
      <Nav variant="tabs" defaultActiveKey="/" className="mb-3" fill>
        <Nav.Item>
          <Nav.Link as={Link} to={contextPath} eventKey="bootstrap-groups">
            Bootstrap Groups
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to={`${contextPath}v1/message-templates`} eventKey="message-templates">
            Message Templates
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <main className="d-flex flex-nowrap">
        <Outlet />
      </main>
    </Container>
  );
}

export default ApplicationLayout;
