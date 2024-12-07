import { Tree, TreeNode } from '@react-tree-x/core';
import { useState } from 'react';

const generateUniqueId = () => Math.random().toString(36).substr(2, 9);

const sampleData: TreeNode[] = [
  {
    id: '1',
    label: '第一层节点',
    children: [
      {
        id: '1-1',
        label: '第二层节点',
        children: [
          {
            id: '1-1-1',
            label: '第三层节点',
            children: [
              {
                id: '1-1-1-1',
                label: '第四层节点',
                children: [
                  {
                    id: '1-1-1-1-1',
                    label: '第五层节点',
                    children: [
                      {
                        id: '1-1-1-1-1-1',
                        label: '第六层节点',
                        children: [
                          {
                            id: '1-1-1-1-1-1-1',
                            label: '第七层节点',
                            children: [
                              {
                                id: '1-1-1-1-1-1-1-1',
                                label: '第八层节点',
                                children: [
                                  {
                                    id: '1-1-1-1-1-1-1-1-1',
                                    label: '第九层节点',
                                    children: [
                                      {
                                        id: '1-1-1-1-1-1-1-1-1-1',
                                        label: '最后一个节点'
                                      }
                                    ]
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: '1-2',
        label: '第二层节点(分支)',
        children: [
          {
            id: '1-2-1',
            label: '第三层节点A',
            children: [
              { id: '1-2-1-1', label: '第四层节点A' },
              { id: '1-2-1-2', label: '第四层节点B' }
            ]
          },
          {
            id: '1-2-2',
            label: '第三层节点B',
            children: [
              { id: '1-2-2-1', label: '第四层节点C' },
              { id: '1-2-2-2', label: '第四层节点D' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: '2',
    label: '平行节点',
    children: [
      {
        id: '2-1',
        label: '子节点1',
        children: [
          { id: '2-1-1', label: '子节点1-1' },
          { id: '2-1-2', label: '子节点1-2' }
        ]
      },
      {
        id: '2-2',
        label: '子节点2',
        children: [
          { id: '2-2-1', label: '子节点2-1' },
          { id: '2-2-2', label: '子节点2-2' }
        ]
      }
    ]
  }
];

function App() {
  const [treeData, setTreeData] = useState<TreeNode[]>(sampleData);
  const [selectedId, setSelectedId] = useState<string | number>();

  const handleAddNode = (parentId: string | number, label: string) => {
    const newNodeId = generateUniqueId();
    const findNodePathAndAddNode = (nodes: TreeNode[], targetId: string | number, currentPath: string[] = []): { updatedNodes: TreeNode[], path: string[] } => {
      return {
        updatedNodes: nodes.map(node => {
          const newPath = [...currentPath, node.id.toString()];
          
          if (node.id === targetId) {
            const newNode: TreeNode = {
              id: newNodeId,
              label: label
            };
            
            return {
              ...node,
              children: [
                ...(node.children || []),
                newNode
              ]
            };
          }
          
          if (node.children) {
            const { updatedNodes: updatedChildren, path: childPath } = findNodePathAndAddNode(node.children, targetId, newPath);
            
            return {
              ...node,
              children: updatedChildren
            };
          }
          
          return node;
        }),
        path: nodes.some(node => node.id === targetId) 
          ? [...currentPath, targetId.toString(), newNodeId] 
          : []
      };
    };

    const { updatedNodes, path } = findNodePathAndAddNode(treeData, parentId);
    
    setTreeData(updatedNodes);
    return path;
  };

  const handleDeleteNode = (nodeId: string | number) => {
    const findNodePathAndDeleteNode = (nodes: TreeNode[], targetId: string | number, currentPath: string[] = []): { updatedNodes: TreeNode[], path: string[] } => {
      return {
        updatedNodes: nodes.filter(node => {
          const newPath = [...currentPath, node.id.toString()];
          
          // 如果是要删除的节点，返回 false 以过滤掉
          if (node.id === targetId) {
            return false;
          }
          
          // 如果有子节点，递归处理子节点
          if (node.children) {
            const { updatedNodes: updatedChildren, path: childPath } = findNodePathAndDeleteNode(node.children, targetId, newPath);
            node.children = updatedChildren;
          }
          
          return true;
        }),
        path: nodes.some(node => node.id === targetId) 
          ? currentPath 
          : []
      };
    };

    const { updatedNodes, path } = findNodePathAndDeleteNode(treeData, nodeId);
    
    setTreeData(updatedNodes);
    return path;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto px-4" style={{ width: '300px', height: '500px' }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">React Tree X Demo</h1>
        <p className="text-gray-600 mb-6">一个现代的 React 树形组件示例</p>
        <Tree 
          data={treeData} 
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
        />
      </div>
    </div>
  );
}

export default App;
