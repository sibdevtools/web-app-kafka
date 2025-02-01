import React from 'react';
import { Container, Spinner } from 'react-bootstrap';

export const Loader = () => {
  return (
    <Container className={'vh-100 vw-100 d-flex justify-content-center'}>
      <Spinner className={'m-auto'} variant={'dark'} animation={'border'}>
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </Container>
  );
};
