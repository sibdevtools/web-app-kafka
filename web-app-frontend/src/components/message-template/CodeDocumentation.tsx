import React from 'react';
import { Accordion, Table } from 'react-bootstrap';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import 'react-syntax-highlighter/dist/esm/languages/hljs/python';


type ExampleCode = {
  description: string,
} & (
  {
    implementation: string
  }
  |
  {
    implementations: Record<'javascript' | 'python', string>
  }
  )

interface ExampleSection {
  name: string,
  examples?: ExampleCode[],
  sections?: ExampleSection[]
}


const rqExamples = [
  {
    description: 'Get request object',
    implementation: `wak.request()`,
  },
  {
    description: 'Get requested partition',
    implementations: {
      javascript: `const rq = wak.request();
const partition = rq.partition;`,
      python: `rq = wak.request()
partition = rq.partition`,
    }
  },
  {
    description: 'Get requested timestamp',
    implementations: {
      javascript: `const rq = wak.request();
const timestamp = rq.timestamp;`,
      python: `rq = wak.request()
timestamp = rq.timestamp`,
    }
  },
  {
    description: 'Get requested key as byte array',
    implementations: {
      javascript: `const rq = wak.request();
const key = rq.key;`,
      python: `rq = wak.request()
key = rq.key`,
    }
  },
  {
    description: 'Get requested key as UTF-8 string',
    implementations: {
      javascript: `const rq = wak.request();
const key = rq.rawKey();`,
      python: `rq = wak.request()
key = rq.rawKey()`,
    }
  },
];
const rqInputExamples = [
  {
    description: 'Get requested input as dictionary. Key is string, value type is any JSON value.',
    implementations: {
      javascript: `const rq = wak.request();
const input = rq.input;`,
      python: `rq = wak.request()
input = rq.input`,
    }
  },
  {
    description: 'Get requested input param value',
    implementations: {
      javascript: `const rq = wak.request();
const value = rq.param('key1');`,
      python: `rq = wak.request()
value = rq.param("key1")`,
    }
  },
];
const rqHeadersExamples = [
  {
    description: 'Get requested headers as dictionary. Key is string, value is binary array.',
    implementations: {
      javascript: `const rq = wak.request();
const headers = rq.headers;`,
      python: `rq = wak.request()
headers = rq.headers`,
    }
  },
  {
    description: 'Get requested header raw value (binary to UTF-8 string)',
    implementations: {
      javascript: `const rq = wak.request();
const value = rq.rawHeader('headerName');`,
      python: `rq = wak.request()
value = rq.rawHeader("headerName")`,
    }
  },
  {
    description: 'Get requested header Base64 value',
    implementations: {
      javascript: `const rq = wak.request();
const value = rq.binaryHeader('headerName');`,
      python: `rq = wak.request()
value = rq.binaryHeader("headerName")`,
    }
  },
];

const rsExamples = [
  {
    description: 'Get response object',
    implementation: `wak.response()`,
  },
  {
    description: 'Set response partition',
    implementations: {
      javascript: `const rs = wak.response();
rs.partition(1);`,
      python: `rs = wak.response()
rs.partition(1)`
    }
  },
  {
    description: 'Set response timestamp',
    implementations: {
      javascript: `const rs = wak.response();
rs.timestamp(1);`,
      python: `rs = wak.response()
rs.timestamp(1)`
    }
  },
  {
    description: 'Set response header',
    implementations: {
      javascript: `const rs = wak.response();
rs.header('key-string', 'value-string');`,
      python: `rs = wak.response()
rs.header("key-string", "value-string")`
    }
  },
  {
    description: 'Set response header, value is base64 string',
    implementations: {
      javascript: `const rs = wak.response();
rs.binaryHeader('key-string', btoa('value-string'));`,
      python: `import base64
rs = wak.response()
data = base64.b64encode(b'value-string')
rs.binaryHeader("key-string", data)`
    }
  },
];
const rsKeyExamples = [
  {
    description: 'Set response key to string',
    implementations: {
      javascript: `const rs = wak.response();
rs.plainKey('any-string');`,
      python: `rs = wak.response()
rs.plainKey("any-string")`
    }
  },
  {
    description: 'Set response key to bytes array',
    implementations: {
      javascript: `const rs = wak.response();
rs.bytesKey([48, 49]);`,
      python: `rs = wak.response()
rs.bytesKey([48, 49])`
    }
  },
  {
    description: 'Set response key to JSON',
    implementations: {
      javascript: `const rs = wak.response();
rs.jsonKey({key: 'value'});`,
      python: `rs = wak.response()
rs.jsonKey({"key": "value"})`,
    }
  },
];
const rsValueExamples = [
  {
    description: 'Set response value to string',
    implementations: {
      javascript: `const rs = wak.response();
rs.plainValue('any-string');`,
      python: `rs = wak.response()
rs.plainValue("any-string")`
    }
  },
  {
    description: 'Set response value to bytes array',
    implementations: {
      javascript: `const rs = wak.response();
rs.bytesValue([48, 49]);`,
      python: `rs = wak.response()
rs.bytesValue([48, 49])`
    }
  },
  {
    description: 'Set response value to JSON',
    implementations: {
      javascript: `const rs = wak.response();
rs.jsonValue({key: 'value'});`,
      python: `rs = wak.response()
rs.jsonValue({"key": "value"})`,
    }
  },
  {
    description: 'Set response value to AVRO',
    implementations: {
      javascript: `const rs = wak.response();
const schema = {};
const input = {};
rs.avroValue(schema, input);`,
      python: `rs = wak.response()
schema = {}
input = {}
rs.avroValue(schema, input)`,
    }
  },
];

const sessionsExamples = [
  {
    description: 'Get sessions service',
    implementation: `wak.sessions()`,
  },
  {
    description: 'Get session by ID with last version',
    implementations: {
      javascript: `const sessions = wak.sessions();
const session = sessions.get('session-id');`,
      python: `sessions = wak.sessions()
session = sessions.get("session-id")`
    }
  },
  {
    description: 'Get session by ID and specific version',
    implementations: {
      javascript: `const sessions = wak.sessions();
const version = 1;
const session = sessions.get('session-id', version);`,
      python: `sessions = wak.sessions()
version = 1
session = sessions.get("session-id", version)`
    }
  },
  {
    description: 'Get session by ID and specific version (version is string)',
    implementations: {
      javascript: `const sessions = wak.sessions();
const version = '1';
const session = sessions.get('session-id', version);`,
      python: `sessions = wak.sessions()
version = "1"
session = sessions.get("session-id", version)`
    }
  },
  {
    description: 'Create session',
    implementations: {
      javascript: `const sessions = wak.sessions();
const sections = {
  sectionKey: {
    sectionAttributeKey: 'sectionAttributeValue',
    sectionAttributeKey2: true,
    sectionAttributeKey3: 42,
    sectionAttributeKey4: ['item1', 'item2'],
    sectionAttributeKey5: {key: 'value'},
  }
};
const ownerTypeCode = 'SERVICE'; // or 'USER'
const ownerId = '123456';
const permissions = ['PERMISSION1', 'PERMISSION2'];
const session = sessions.create(sections, ownerTypeCode, ownerId, permissions);`,
      python: `sessions = wak.sessions()
sections = {
  "sectionKey": {
    "sectionAttributeKey": "sectionAttributeValue",
    "sectionAttributeKey2": True,
    "sectionAttributeKey3": 42,
    "sectionAttributeKey4": ["item1", "item2"],
    "sectionAttributeKey5": {"key": "value"},
  }
}
ownerTypeCode = "SERVICE" # or "USER"
ownerId = "123456"
permissions = ["PERMISSION1", "PERMISSION2"]
session = sessions.create(sections, ownerTypeCode, ownerId, permissions)`,
    }
  },
];
const sessionIdExamples = [
  {
    description: 'Get session id',
    implementations: {
      javascript: `const sessions = wak.sessions();
const session = sessions.get('session-id');
const sessionId = session.getId();`,
      python: `sessions = wak.sessions()
session = sessions.get("session-id")
sessionId = session.getId()`
    }
  },
  {
    description: 'Get session uid',
    implementations: {
      javascript: `const sessions = wak.sessions();
const session = sessions.get('session-id');
const sessionId = session.getId();
const sessionUID = sessionId.getUID();`,
      python: `sessions = wak.sessions()
session = sessions.get("session-id")
sessionId = session.getId()
sessionUID = sessionId.getUID()`
    }
  },
  {
    description: 'Get session version',
    implementations: {
      javascript: `const sessions = wak.sessions();
const session = sessions.get('session-id');
const sessionId = session.getId();
const sessionVersion = sessionId.getVersion();`,
      python: `sessions = wak.sessions()
session = sessions.get("session-id")
sessionId = session.getId()
sessionVersion = sessionId.getVersion()`
    }
  }
];
const sessionAttributesExamples = [
  {
    description: 'Get attribute value',
    implementations: {
      javascript: `const sessions = wak.sessions();
const session = sessions.get('session-id');
const attributeValue = session.get('sectionKey', 'attributeKey');`,
      python: `sessions = wak.sessions()
session = sessions.get("session-id")
attributeValue = session.get("sectionKey", "attributeKey")`
    }
  },
  {
    description: 'Get attribute names',
    implementations: {
      javascript: `const sessions = wak.sessions();
const session = sessions.get('session-id');
const attributesNames = session.getAttributeNames('sectionKey');`,
      python: `sessions = wak.sessions()
session = sessions.get("session-id")
attributesNames = session.getAttributeNames("sectionKey")`
    }
  },
  {
    description: 'Create attribute, fail if attribute already exists',
    implementations: {
      javascript: `const sessions = wak.sessions();
const session = sessions.get('session-id');
session.add('sectionKey', 'attributeKey1', 'attributeValue');`,
      python: `sessions = wak.sessions()
session = sessions.get("session-id")
session.add("sectionKey", "attributeKey1", "attributeValue")`
    }
  },
  {
    description: 'Set attribute, create if attribute does not exist',
    implementations: {
      javascript: `const sessions = wak.sessions();
const session = sessions.get('session-id');
session.set('sectionKey', 'attributeKey1', 'attributeValue');`,
      python: `sessions = wak.sessions()
session = sessions.get("session-id")
session.set("sectionKey", "attributeKey1", "attributeValue")`
    }
  },
  {
    description: 'Remove attribute',
    implementations: {
      javascript: `const sessions = wak.sessions();
const session = sessions.get('session-id');
session.remove('sectionKey', 'attributeKey1');`,
      python: `sessions = wak.sessions()
session = sessions.get("session-id")
session.remove("sectionKey", "attributeKey1")`
    }
  },
];

const allExamples: ExampleSection = {
  name: 'Examples',
  sections: [
    {
      name: 'Request',
      examples: rqExamples,
      sections: [
        {
          name: 'Headers',
          examples: rqHeadersExamples
        },
        {
          name: 'Input',
          examples: rqInputExamples
        }
      ]
    },
    {
      name: 'Response',
      examples: rsExamples,
      sections: [
        {
          name: 'Key',
          examples: rsKeyExamples
        },
        {
          name: 'Value',
          examples: rsValueExamples
        }
      ]
    },
    {
      name: 'Sessions',
      examples: sessionsExamples,
      sections: [
        {
          name: 'Session Actions',
          sections: [
            {
              name: 'Session ID',
              examples: sessionIdExamples
            },
            {
              name: 'Session attributes',
              examples: sessionAttributesExamples
            }
          ]
        }
      ]
    }
  ]
};

const CodeDocumentation: React.FC<{ mode: 'javascript' | 'python', section?: ExampleSection }> = ({
                                                                                                    mode,
                                                                                                    section = allExamples
                                                                                                  }) => {
  return (
    <Accordion className={'mb-2'}>
      <Accordion.Item eventKey={`examples-${section.name}`}>
        <Accordion.Header>{section.name}</Accordion.Header>
        <Accordion.Body>
          {section.examples && (
            <Table>
              <thead>
              <tr>
                <th>Description</th>
                <th>Code</th>
              </tr>
              </thead>
              <tbody>
              {
                section.examples.map(it =>
                  (
                    <tr>
                      <td>{it.description}</td>
                      <td>
                        {'implementation' in it && (
                          <SyntaxHighlighter language={mode} style={docco}>
                            {it.implementation}
                          </SyntaxHighlighter>
                        )}
                        {'implementations' in it && (
                          <SyntaxHighlighter language={mode} style={docco}>
                            {it.implementations[mode]}
                          </SyntaxHighlighter>
                        )}
                      </td>
                    </tr>
                  )
                )
              }
              </tbody>
            </Table>
          )}
          {section.sections?.map(it => (
            <CodeDocumentation mode={mode} section={it} />
          ))}
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default CodeDocumentation;
