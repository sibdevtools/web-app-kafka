import React from 'react';
import { SchemaNode } from './type';
import SimpleNode from './parts/SimpleNode';

export const initialSchema: SchemaNode = {
  type: 'string',
  specification: 'none',
  nullable: false,
  title: '',
};

export interface SchemaFormBuilderProps {
  node: SchemaNode;
  onChange: (newNode: SchemaNode) => void;
  isRoot: boolean;
}

const SchemaFormBuilder: React.FC<SchemaFormBuilderProps> = ({
                                                               node,
                                                               onChange,
                                                               isRoot
                                                             }) => {
  return (
    <div className="border p-3 mb-3">
      <SimpleNode
        node={node}
        onChange={onChange}
        isRoot={isRoot}
      />
    </div>
  );
};

export default SchemaFormBuilder;
