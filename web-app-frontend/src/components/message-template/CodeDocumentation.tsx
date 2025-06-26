import React, { useState } from 'react';
import { Accordion, Button, Table } from 'react-bootstrap';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import { Task01Icon, TaskDone01Icon } from 'hugeicons-react';
import './CodeDocumentation.css';


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

const keyValueStorageExamples = [
  {
    description: 'Get key-value storage service',
    implementations: {
      javascript: `const kvs = wak.keyValueStorage();`,
      python: `kvs = wak.keyValueStorage()`
    }
  },
];
const keyValueStorageRecordExamples = [
  {
    description: 'Get value holder',
    implementations: {
      javascript: `const valueHolder = kvs.get("space-name", "key");`,
      python: `valueHolder = kvs.get("space-name", "key")`
    }
  },
  {
    description: 'Get value from holder',
    implementations: {
      javascript: `const value = valueHolder.value();`,
      python: `value = valueHolder.value()`
    }
  },
  {
    description: 'Get meta information from holder',
    implementations: {
      javascript: `const meta = valueHolder.meta();`,
      python: `meta = valueHolder.meta()`
    }
  },
  {
    description: 'Set record state',
    implementations: {
      javascript: `const epochMilliseconds = 1750832700000;
const meta = kvs.set({
  space: "space-name",
  key: "key",
  value: "some-value", // any serializable value
  expiredAt: epochMilliseconds // optional
});`,
      python: `epochMilliseconds = 1750832700000
meta = kvs.set({
  "space": "space-name",
  "key": "key",
  "value": "some-value", # any serializable value
  "expiredAt": epochMilliseconds # optional
});`
    }
  },
  {
    description: 'Prolongate record',
    implementations: {
      javascript: `const epochMilliseconds = 1750832700000;
const meta = kvs.prolongate("space-name", "key", epochMilliseconds);`,
      python: `epochMilliseconds = 1750832700000
meta = kvs.prolongate("space-name", "key", epochMilliseconds)`
    }
  },
  {
    description: 'Remove value from space by key',
    implementations: {
      javascript: `kvs.delete("space-name", "key");`,
      python: `kvs.delete("space-name", "key")`
    }
  },
];
const keyValueStorageRecordMetaExamples = [
  {
    description: 'Get creation epoch milliseconds from meta information',
    implementations: {
      javascript: `const createdAt = meta.createdAt();`,
      python: `createdAt = meta.createdAt()`
    }
  },
  {
    description: 'Get modification epoch milliseconds from meta information',
    implementations: {
      javascript: `const modifiedAt = meta.modifiedAt();`,
      python: `modifiedAt = meta.modifiedAt()`
    }
  },
  {
    description: 'Get expiration epoch milliseconds from meta information',
    implementations: {
      javascript: `const expiredAt = meta.expiredAt();`,
      python: `expiredAt = meta.expiredAt()`
    }
  },
  {
    description: 'Get version from meta information',
    implementations: {
      javascript: `const version = meta.version();`,
      python: `version = meta.version()`
    }
  },
];
const keyValueStorageSpaceExamples = [
  {
    description: 'Get set of all spaces names',
    implementations: {
      javascript: `const spaces = kvs.getSpaces();`,
      python: `spaces = kvs.getSpaces()`
    }
  },
  {
    description: 'Get set of all keys in space',
    implementations: {
      javascript: `const keys = kvs.getKeys("space-name");`,
      python: `keys = kvs.getKeys("space-name")`
    }
  },
  {
    description: 'Delete entire space',
    implementations: {
      javascript: `kvs.delete("space-name");`,
      python: `kvs.delete("space-name")`
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
    },
    {
      name: 'Key-value storage',
      examples: keyValueStorageExamples,
      sections: [
        {
          name: 'Space operations',
          examples: keyValueStorageSpaceExamples
        },
        {
          name: 'Record operations',
          examples: keyValueStorageRecordExamples,
          sections: [
            {
              name: 'Meta information',
              examples: keyValueStorageRecordMetaExamples
            }
          ]
        }
      ]
    },
    {
      name: 'Utils',
      examples: [
        {
          description: 'Get utils',
          implementations: {
            javascript: 'const utils = wak.utils()',
            python: 'utils = wak.utils()'
          }
        }
      ],
      sections: [
        {
          name: 'Binary utils',
          examples: [
            {
              description: 'Get binary utils',
              implementations: {
                javascript: 'const binary = utils.binary()',
                python: 'binary = utils.binary()'
              }
            },
            {
              description: 'Convert string, number to binary array',
              implementations: {
                javascript: 'const array = binary.toBytes("test")',
                python: 'array = binary.toBytes("test")'
              }
            },
            {
              description: 'Convert binary array to string',
              implementations: {
                javascript: 'const array = binary.toString([1, 2, 3])',
                python: 'array = binary.toString([1, 2, 3])'
              }
            },
            {
              description: 'Convert binary array to int',
              implementations: {
                javascript: 'const array = binary.toInt([1, 2, 3, 4])',
                python: 'array = binary.toInt([1, 2, 3, 4])'
              }
            },
            {
              description: 'Convert binary array to long',
              implementations: {
                javascript: 'const array = binary.toLong([1, 2, 3, 4, 5, 6, 7, 8])',
                python: 'array = binary.toLong([1, 2, 3, 4, 5, 6, 7, 8])'
              }
            },
            {
              description: 'Convert binary array to float',
              implementations: {
                javascript: 'const array = binary.toFloat([1, 2, 3, 4])',
                python: 'array = binary.toFloat([1, 2, 3, 4])'
              }
            },
            {
              description: 'Convert binary array to double',
              implementations: {
                javascript: 'const array = binary.toDouble([1, 2, 3, 4, 5, 6, 7, 8])',
                python: 'array = binary.toDouble([1, 2, 3, 4, 5, 6, 7, 8])'
              }
            }
          ]
        },
        {
          name: 'Base64 utils',
          examples: [
            {
              description: 'Get Base64 utils',
              implementations: {
                javascript: 'const base64 = utils.base64()',
                python: 'base64 = utils.base64()'
              }
            },
            {
              description: 'Encode array to array',
              implementations: {
                javascript: 'const array = base64.encode([1, 2, 3, 4])',
                python: 'array = base64.encode([1, 2, 3, 4])'
              }
            },
            {
              description: 'Encode array to string',
              implementations: {
                javascript: 'const string = base64.encodeToString([1, 2, 3, 4])',
                python: 'string = base64.encodeToString([1, 2, 3, 4])'
              }
            },
            {
              description: 'Decode array or string to array',
              implementations: {
                javascript: 'const array = base64.decode([1, 2, 3, 4])',
                python: 'array = base64.decode([1, 2, 3, 4])'
              }
            },
          ]
        },
        {
          name: 'JSON utils',
          examples: [
            {
              description: 'Get JSON utils',
              implementations: {
                javascript: 'const json = utils.json()',
                python: 'json = utils.json()'
              }
            },
            {
              description: 'Serialize object to binary array with json',
              implementations: {
                javascript: 'const array = json.serialize({key: "value"})',
                python: 'array = json.serialize({"key": "value"})'
              }
            },
            {
              description: 'Dump object to string json',
              implementations: {
                javascript: 'const dumped = json.dump({key: "value"})',
                python: 'dumped = json.dump({"key": "value"})'
              }
            },
            {
              description: 'Deserialize object from binary array with json',
              implementations: {
                javascript: 'const deserialized = json.deserialize([1, 2, 3, 4])',
                python: 'deserialized = json.deserialize([1, 2, 3, 4])'
              }
            },
            {
              description: 'Parse object from json string',
              implementations: {
                javascript: 'const parsed = json.parse("{\"key\":42}")',
                python: 'parsed = json.parse("{\"key\":42}")'
              }
            },
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
  const [copied, setCopied] = useState<Array<any>>([]);

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
                          <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                            <Button
                              variant={'link'}
                              className={'text-secondary code-clipboard-btn'}
                              size={'sm'}
                              onClick={async () => {
                                const copiedNew = [...copied, it];
                                setCopied(copiedNew);
                                await navigator.clipboard.writeText(it.implementation);
                                setTimeout(() => setCopied(copied.filter(e => e !== it)), 1500);
                              }}
                            >
                              {copied.some(e => e === it) ? (<TaskDone01Icon size={16} />) : (<Task01Icon size={16} />)}
                            </Button>
                            <SyntaxHighlighter language={mode} style={docco}>
                              {it.implementation}
                            </SyntaxHighlighter>
                          </div>
                        )}
                        {'implementations' in it && (
                          <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                            <Button
                              variant={'link'}
                              className={'text-secondary code-clipboard-btn'}
                              size={'sm'}
                              onClick={async () => {
                                const copiedNew = [...copied, it];
                                setCopied(copiedNew);
                                await navigator.clipboard.writeText(it.implementations[mode]);
                                setTimeout(() => setCopied(copied.filter(e => e !== it)), 1500);
                              }}
                            >
                              {copied.some(e => e === it) ? (<TaskDone01Icon size={16} />) : (<Task01Icon size={16} />)}
                            </Button>
                            <SyntaxHighlighter language={mode} style={docco}>
                              {it.implementations[mode]}
                            </SyntaxHighlighter>
                          </div>
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
