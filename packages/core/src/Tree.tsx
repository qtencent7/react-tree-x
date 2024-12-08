import React, { useState, ChangeEvent, KeyboardEvent, ReactNode } from 'react';
import Node from './Node';
import type { NodeProps } from './Node';
import './Tree.css';

interface TreeProps {
  treeData: NodeProps[];
  onDelete?: (id: string) => void;  // 删除当前节点
  onAdd?: (id: string, label: string) => void;     // 添加子节点
  rightSlot?: NodeProps['rightSlot'];  // 右侧插槽
  onFilter?: (filterText: string) => void;  // 过滤回调函数
  topSlot?: ReactNode | ((props: { 
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  }) => ReactNode);  // 顶部插槽，可以是React节点或渲染函数
}

const Tree: React.FC<TreeProps> = (props: TreeProps) => {
  const { treeData, onDelete, onAdd, rightSlot, onFilter, topSlot } = props;
  const [filterValue, setFilterValue] = useState('');
  const [addingNodeId, setAddingNodeId] = useState<string | null>(null);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterValue(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onFilter?.(filterValue);
    }
  };

  const renderDefaultTopSlot = () => (
    <div className='tree-filter'>
      <input
        type="text"
        value={filterValue}
        onChange={handleFilterChange}
        onKeyDown={handleKeyDown}
        placeholder="输入关键字过滤..."
        className='tree-filter-input'
      />
    </div>
  );

  const renderTopSlot = () => {
    if (!topSlot) {
      return renderDefaultTopSlot();
    }
    if (typeof topSlot === 'function') {
      return topSlot({
        value: filterValue,
        onChange: handleFilterChange,
        onKeyDown: handleKeyDown
      });
    }
    return topSlot;
  };

  return (
    <div className='tree-container'>
      {renderTopSlot()}
      <div className='tree-wrapper'>
        {
          treeData.length > 0 && treeData.map((item: NodeProps) => {
            return <Node 
              {...item} 
              onDelete={onDelete} 
              onAdd={onAdd}
              rightSlot={rightSlot}
              addingNodeId={addingNodeId}
              setAddingNodeId={setAddingNodeId}
            />;
          })
        }
      </div>
    </div>
  );
};

export default Tree;