import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { Delete01Icon, MessageAdd01Icon, MessageSearch01Icon, PencilEdit01Icon } from 'hugeicons-react';


export interface ActionButtonsProps {
  onEdit: () => void;
  onMessageConsuming: () => void;
  onMessagePublishing: () => void;
  onDelete: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
                                                              onEdit,
                                                              onMessageConsuming,
                                                              onMessagePublishing,
                                                              onDelete,
                                                            }) => (
  <ButtonGroup>
    <Button
      variant="primary"
      onClick={onEdit}
      title={'Edit'}
    >
      <PencilEdit01Icon />
    </Button>
    <Button
      variant="secondary"
      onClick={onMessageConsuming}
      title={'Consuming'}
    >
      <MessageSearch01Icon />
    </Button>
    <Button
      variant="outline-secondary"
      onClick={onMessagePublishing}
      title={'Publishing'}
    >
      <MessageAdd01Icon />
    </Button>
    <Button
      variant="danger"
      onClick={onDelete}
      title={'Delete'}
    >
      <Delete01Icon />
    </Button>
  </ButtonGroup>
);
