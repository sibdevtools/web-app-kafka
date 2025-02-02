import { Alert, Col, Form, Row } from 'react-bootstrap';
import CustomTable from '../common/CustomTable';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { getLastMessages, getMessages, GetMessagesRs, MessageRs } from '../../api/bootstrap.group';
import { MessageConsumedModal } from './MessageConsumedModal';
import { getViewRepresentation, ViewType } from '../../utils/view';

export interface MessageConsumingResultHandle {
  fetchMessages: (
    groupId: string,
    topic: string,
    maxMessages: number,
    maxTimeout: number,
    mode: 'earliest' | 'latest'
  ) => void;
}

export interface MessageConsumingResultProps {

}

export const MessageConsumingResult = forwardRef<MessageConsumingResultHandle, MessageConsumingResultProps>(
  ({}: MessageConsumingResultProps, ref) => {
    const [messages, setMessages] = useState<MessageRs[]>([]);
    const [messageLoading, setMessageLoading] = useState(false);
    const [keyView, setKeyView] = useState<ViewType>('base64');
    const [valueView, setValueView] = useState<ViewType>('base64');
    const [error, setError] = useState<string | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<MessageRs | null>(null);

    useImperativeHandle(ref, () => ({
      fetchMessages: async (
        groupId: string,
        topic: string,
        maxMessages: number,
        maxTimeout: number,
        mode: 'earliest' | 'latest'
      ) => {
        setMessageLoading(true);
        if (!(groupId)) {
          setMessageLoading(false);
          return;
        }
        try {
          let rs: GetMessagesRs;
          if (mode === 'earliest') {
            const response = await getMessages(+groupId, topic, maxMessages, maxTimeout);
            rs = response.data;
          } else {
            const response = await getLastMessages(+groupId, topic, maxMessages, maxTimeout);
            rs = response.data;
          }
          if (rs.success) {
            setMessages(rs.body);
          } else {
            setError('Failed to fetch messages');
            return;
          }
        } catch (error) {
          console.error('Failed to fetch messages:', error);
          setError('Failed to fetch messages');
        } finally {
          setMessageLoading(false);
        }
      },
    }));

    const getValueRepresentation = (value: string): string => {
      if (value.length >= 128) {
        value = value.substring(0, 128) + '...'
      }
      return value
    }

    return (
      <>
        <h3>Messages</h3>
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )
        }
        <Row>
          <Form.Group>
            <Row className={'mb-2'}>
              <Col md={3}>
                <Form.Label>Key View</Form.Label>
              </Col>
              <Col md={9}>
                <Form.Select
                  value={keyView}
                  onChange={(e) => setKeyView(e.target.value as ViewType)}
                  required={true}
                >
                  {['base64', 'raw'].map((it) => (
                    <option key={it} value={it}>
                      {it}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Form.Group>
          <Form.Group>
            <Row className={'mb-2'}>
              <Col md={3}>
                <Form.Label>Value View</Form.Label>
              </Col>
              <Col md={9}>
                <Form.Select
                  value={valueView}
                  onChange={(e) => setValueView(e.target.value as ViewType)}
                  required={true}
                >
                  {['base64', 'raw'].map((it) => (
                    <option key={it} value={it}>
                      {it}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Form.Group>
        </Row>
        <CustomTable
          columns={[
            { key: 'partition', label: 'Partition' },
            { key: 'offset', label: 'Offset' },
            { key: 'timestamp', label: 'Timestamp' },
            { key: 'timestampType', label: 'Timestamp Type' },
            { key: 'key', label: 'Key' },
            { key: 'value', label: 'Value' },
          ]}
          data={
            messages.map((message, index) => {
                const key = getViewRepresentation(keyView, message.key);
                const value = getViewRepresentation(valueView, message.value);
                return {
                  index: index,
                  partition: `${message.partition}`,
                  offset: `${message.offset}`,
                  timestamp: `${message.timestamp}`,
                  timestampType: {
                    representation: <code>
                      {message.timestampType}
                    </code>,
                    value: message.timestampType
                  },
                  key: {
                    representation: <code>
                      {getValueRepresentation(key)}
                    </code>,
                    value: key
                  },
                  value: {
                    representation: <code>
                      {getValueRepresentation(value)}
                    </code>,
                    value: value
                  }
                }
              }
            )
          }
          rowBehavior={{
            handler: (row) => {
              const index = row.index as number;
              if (messages.length > index) {
                const message = messages[index]
                setSelectedMessage(message)
                setShowModal(true);
              }
            }
          }}
          sortableColumns={[
            'partition', 'offset', 'timestamp', 'timestampType', 'key', 'value'
          ]}
          filterableColumns={[
            'partition', 'offset', 'timestamp', 'timestampType', 'key', 'value'
          ]}
          loading={messageLoading}
          responsive={true}
        />
        {selectedMessage && (
          <MessageConsumedModal
            showModal={showModal}
            setShowModal={setShowModal}
            message={selectedMessage}
          />
        )}
      </>
    )
  }
);

export default MessageConsumingResult;
