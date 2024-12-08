import { Tree } from '@react-tree-x/core';
import React, { useState } from 'react';
import type { NodeProps } from '@react-tree-x/core';

// Helper function to create nested data for both trees
const createNestedData = (depth: number, currentDepth: number = 1, parentId: string = '0'): NodeProps[] => {
  if (currentDepth > depth) return [];
  
  return [{
    id: `${parentId}-${currentDepth}`,
    label: `Level ${currentDepth}`,
    children: createNestedData(depth, currentDepth + 1, `${parentId}-${currentDepth}`)
  }];
};

const App: React.FC = () => {
  const [originalTreeData] = useState<NodeProps[]>(createNestedData(15));
  const [treeData, setTreeData] = useState<NodeProps[]>(originalTreeData);
  const [serachTreeDta, setSearchTreeData] = useState<NodeProps[]>();

  // 递归查找并删除节点
  const deleteNode = (data: NodeProps[], targetId: string): NodeProps[] => {
    return data.filter(node => {
      if (node.id === targetId) {
        return false; // 删除匹配的节点
      }
      if (node.children.length > 0) {
        node.children = deleteNode(node.children, targetId);
      }
      return true;
    });
  };

  const handleDelete = (id: string) => {
    setTreeData(prevData => deleteNode(prevData, id));
  };

  const generateUniqueId = (parentId: string): string => {
    // 使用时间戳确保唯一性
    const timestamp = new Date().getTime();
    return `${parentId}-${timestamp}`;
  };

  // 递归查找并添加子节点
  const addChildNode = (data: NodeProps[], targetId: string, newNodeLabel: string): NodeProps[] => {
    return data.map(node => {
      if (node.id === targetId) {
        // 创建新的子节点
        const newId = generateUniqueId(node.id);
        return {
          ...node,
          children: [
            ...node.children,
            {
              id: newId,
              label: newNodeLabel,
              children: []
            }
          ]
        };
      }
      if (node.children.length > 0) {
        return {
          ...node,
          children: addChildNode(node.children, targetId, newNodeLabel)
        };
      }
      return node;
    });
  };

  const handleAdd = (parentId: string, label: string) => {
    setTreeData(prevData => addChildNode(prevData, parentId, label));
  };

  // 检查节点或其子节点是否包含过滤文本
  const nodeMatchesFilter = (node: NodeProps, filterText: string): boolean => {
    // 检查当前节点的label是否包含过滤文本
    if (node.label.toLowerCase().includes(filterText.toLowerCase())) {
      return true;
    }
    // 递归检查子节点
    return node.children.some(child => nodeMatchesFilter(child, filterText));
  };

  // 过滤树结构，保留匹配的节点及其父节点
  const filterTree = (nodes: NodeProps[], filterText: string): NodeProps[] => {
    if (!filterText) {
      return originalTreeData; // 如果没有过滤文本，返回原始树
    }

    return nodes
      .map(node => {
        // 检查当前节点及其子节点是否匹配
        const hasMatch = nodeMatchesFilter(node, filterText);
        
        if (!hasMatch) {
          return null; // 如果没有匹配，返回null（后面会被filter过滤掉）
        }

        // 如果有匹配，递归过滤子节点
        const filteredChildren = filterTree(node.children, filterText);
        
        // 返回包含过滤后子节点的新节点
        return {
          ...node,
          children: filteredChildren
        };
      })
      .filter(Boolean) as NodeProps[]; // 过滤掉null值
  };

  const handleFilter = (filterText: string) => {
    const filteredData = filterTree(treeData, filterText);
    setSearchTreeData(filteredData);
  };

  const handleDragMove = (dragId: string, dropId: string, position: 'before' | 'after') => {
    setTreeData(prevData => {
      // 找到被拖拽的节点
      let dragNode: NodeProps | null = null;
      
      const findDragNode = (nodes: NodeProps[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === dragId) {
            dragNode = nodes[i];
            return true;
          }
          if (nodes[i].children.length > 0 && findDragNode(nodes[i].children)) {
            return true;
          }
        }
        return false;
      };
      
      findDragNode(prevData);
      if (!dragNode) return prevData;
      
      // 从原位置删除节点
      const removeNode = (nodes: NodeProps[]): NodeProps[] => {
        return nodes.filter(node => {
          if (node.id === dragId) {
            return false;
          }
          if (node.children.length > 0) {
            node.children = removeNode(node.children);
          }
          return true;
        });
      };

      // 找到目标节点的位置并插入
      const newData = removeNode([...prevData]);
      
      const insertNode = (nodes: NodeProps[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === dropId) {
            const insertIndex = position === 'before' ? i : i + 1;
            nodes.splice(insertIndex, 0, dragNode!);
            return true;
          }
          if (nodes[i].children.length > 0 && insertNode(nodes[i].children)) {
            return true;
          }
        }
        return false;
      };
      
      insertNode(newData);
      return newData;
    });
  };

  const FileIcon = () => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginRight: '4px' }}
    >
      <path 
        d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9L13 2z" 
        stroke="#FFB800" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="#FFE082"
      />
      <path 
        d="M13 2v7h7" 
        stroke="#FFB800" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div style={{ padding: '20px' }}>
      <Tree
        treeData={serachTreeDta ?? treeData}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onFilter={handleFilter}
        leftSlot={<FileIcon />}
        onDragMove={handleDragMove}
      />
    </div>
  );
};

export default App;