import React, { useState, KeyboardEvent, ChangeEvent, ReactNode } from 'react';
import './Node.css';

export type NodeProps = {
  id: string;
  label: string;
  children: NodeProps[];
  onDelete?: (id: string) => void;  // 删除当前节点
  onAdd?: (id: string, label: string) => void;     // 添加子节点，增加label参数
  addingNodeId?: string | null;     // 当前正在添加子节点的节点ID
  setAddingNodeId?: (id: string | null) => void;  // 设置正在添加子节点的节点ID
  rightSlot?: ReactNode | ((props: { id: string }) => ReactNode);  // 右侧插槽，可以是React节点或渲染函数
}

const Node: React.FC<NodeProps> = (props: NodeProps) => {
  const { 
    label, 
    children, 
    onDelete, 
    onAdd, 
    id,
    addingNodeId,
    setAddingNodeId,
    rightSlot 
  } = props;

  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const isAddingChild = addingNodeId === id;

  const renderIcon = () => {
    if (children.length === 0) {
      return (
        <svg className="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="2" fill="#000"/>
        </svg>
      );
    }
    return (
      <svg 
        className={`arrow ${isExpanded ? 'expanded' : ''}`} 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <path d="M9 18l6-6-6-6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      onAdd?.(id, inputValue.trim());
      setInputValue('');
      setAddingNodeId?.(null);
    } else if (e.key === 'Escape') {
      setAddingNodeId?.(null);
      setInputValue('');
    }
  };

  const handleAddClick = () => {
    setAddingNodeId?.(id);
    setIsExpanded(true); // 自动展开节点
  };

  const renderDefaultActions = () => (
    <>
      <button className="add" onClick={handleAddClick}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5v14M5 12h14" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button className="delete" onClick={() => onDelete?.(id)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 18L18 6M6 6l12 12" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </>
  );

  const renderRightSlot = () => {
    if (!rightSlot) {
      return renderDefaultActions();
    }
    if (typeof rightSlot === 'function') {
      return rightSlot({ id });
    }
    return rightSlot;
  };

  return (
    <div className="node-wrapper">
      <div className="node-container">
        <div className="node-content">
          {renderIcon()}
          <span className='node-label'>{label}</span>
        </div>
        <div className="node-actions">
          {renderRightSlot()}
        </div>
      </div>
      {isAddingChild && (
        <div className="node-input-container">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder="Enter node name..."
          />
        </div>
      )}
      {isExpanded && children.length > 0 && children.map((item: NodeProps, index: number) => {
        return <Node 
          key={index} 
          {...item} 
          onDelete={onDelete} 
          onAdd={onAdd}
          addingNodeId={addingNodeId}
          setAddingNodeId={setAddingNodeId}
          rightSlot={rightSlot}
        />;
      })}
    </div>
  );
};

export default Node;
