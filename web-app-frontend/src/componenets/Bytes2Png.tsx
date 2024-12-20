import React, { useState } from 'react';
import { base64ToFile, fileToBase64 } from '../utils/converters';
import {
  Alert,
  Button,
  Col,
  Container, FormCheck,
  FormControl,
  FormLabel,
  FormSelect,
  FormText,
  InputGroup,
  Row,
  Spinner
} from 'react-bootstrap';
import { Download04Icon } from 'hugeicons-react';
import { decode, encode } from '../api/service';

enum Mode {
  ENCODE = 'To PNG',
  DECODE = 'From PNG'
}

export const Bytes2Png = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [useGZIP, setUseGZIP] = useState(true);
  const [base64, setBase64] = useState('');
  const [mode, setMode] = useState<Mode>(Mode.ENCODE);
  const [filename, setFilename] = useState('download.txt');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleConvert(event?.target?.files[0]);
    }
  };

  const handleConvert = (file: File | null) => {
    if (!file) {
      return;
    }
    fileToBase64(file, (result: string) => {
      setBase64(result.split(',')[1]);
    });
  };

  const doEncode = async () => {
    const rqWidth = width === 0 ? null : width;
    const rqHeight = height === 0 ? null : height;
    const rs = await encode({
      width: rqWidth,
      height: rqHeight,
      content: base64,
      useGZIP: useGZIP
    });
    if (rs.data.success) {
      const result = rs.data.body;
      base64ToFile(result, filename);
      setErrorMessage('');
    } else {
      console.error(`Failed to process: ${rs.status}`);
      setErrorMessage(`Failed to process: ${rs.status}`);
    }
  };

  const doDecode = async () => {
    const rs = await decode({ content: base64, useGZIP });
    if (rs.data.success) {
      const result = rs.data.body;
      base64ToFile(result, filename);
      setErrorMessage('');
    } else {
      console.error(`Failed to process: ${rs.status}`);
      setErrorMessage(`Failed to process: ${rs.status}`);
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      if (mode === Mode.ENCODE) {
        await doEncode();
      } else {
        await doDecode();
      }
    } catch (e) {
      console.error(`Failed to process: ${e}`, e);
      setErrorMessage(`Failed to process: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <p className={'h2 mb-4'}>Bytes &lt;-&gt; PNG Converter</p>
      {errorMessage && (
        <Row>
          <Row className="mt-3">
            <Col>
              <Alert variant={'danger'} role="alert">
                {errorMessage}
              </Alert>
            </Col>
          </Row>
        </Row>
      )}
      <Row className="mb-3">
        <Col md={1}>
          <FormLabel htmlFor="fileInput">File</FormLabel>
        </Col>
        <Col md={11}>
          <FormControl
            id={'fileInput'}
            type="file"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={1}>
          <FormLabel htmlFor="modeSelect">Mode</FormLabel>
        </Col>
        <Col md={11}>
          <FormSelect
            id="modeSelect"
            value={mode}
            onChange={e => setMode(e.target.value as Mode)}
            disabled={isLoading}
          >
            {Object.values(Mode).map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </FormSelect>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={1}>
          <FormLabel htmlFor="useGZIPInput">Use GZIP</FormLabel>
        </Col>
        <Col md={11}>
          <FormCheck
            id={'useGZIPInput'}
            type={'switch'}
            checked={useGZIP}
            onChange={e => setUseGZIP(e.target.checked)}
            disabled={isLoading}
          />
        </Col>
      </Row>
      {mode === Mode.ENCODE && (
        <>
          <Row className="mb-3">
            <Col md={1}>
              <FormLabel htmlFor="widthInput">Width</FormLabel>
            </Col>
            <Col md={11}>
              <FormControl
                id={'widthInput'}
                type={'number'}
                min={1}
                onChange={e => setWidth(+e.target.value)}
                disabled={isLoading}
              />
              <FormText>
                Optional value. If empty calculated for height or make square
              </FormText>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={1}>
              <FormLabel htmlFor="heightInput">Height</FormLabel>
            </Col>
            <Col md={11}>
              <FormControl
                id={'heightInput'}
                type={'number'}
                min={1}
                onChange={e => setHeight(+e.target.value)}
                disabled={isLoading}
              />
              <FormText>
                Optional value. If empty calculated for width or make square
              </FormText>
            </Col>
          </Row>
        </>
      )}
      <Row className="mb-3">
        <Col md={1}>
          <FormLabel htmlFor="fileNameInput">Filename</FormLabel>
        </Col>
        <Col md={11}>
          <InputGroup>
            <FormControl
              id={'fileNameInput'}
              type="text"
              value={filename}
              placeholder="Filename"
              onChange={(e) => setFilename(e.target.value)}
              disabled={isLoading}
            />
            <Button
              variant="primary"
              onClick={handleDownload}
              disabled={isLoading}
            >
              {isLoading ? <Spinner animation="border" size="sm" /> : <Download04Icon />}
            </Button>
          </InputGroup>
        </Col>
      </Row>
    </Container>
  );
};
