import React, { useState, KeyboardEvent, ChangeEvent, ReactNode, DragEvent } from 'react';
import type { DropPosition } from './Tree';
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
  leftSlot?: ReactNode | ((props: { id: string, hasChildren: boolean, isExpanded: boolean, onExpand: () => void }) => ReactNode);  // 左侧插槽
  nodeSlot?: ReactNode | ((props: { 
    id: string, 
    label: string,
    hasChildren: boolean, 
    isExpanded: boolean,
    onExpand: () => void,
    leftSlot: ReactNode,
    rightSlot: ReactNode
  }) => ReactNode);  // 节点内容插槽
  onDragMove?: (dragId: string, dropId: string, position: DropPosition) => void;  // 拖拽移动回调
}

const DefaultNodeContent: React.FC<{
  id: string,
  label: string,
  hasChildren: boolean,
  isExpanded: boolean,
  onExpand: () => void,
  leftSlot: ReactNode,
  rightSlot: ReactNode
}> = ({ 
  label, 
  hasChildren, 
  isExpanded, 
  onExpand, 
  leftSlot, 
  rightSlot 
}) => (
  <div className="node-container">
    <div 
      className="node-content"
      onClick={() => hasChildren && onExpand()}
      style={{ cursor: hasChildren ? 'pointer' : 'default' }}
    >
      {leftSlot}
      <span className='node-label'>{label}</span>
    </div>
    <div className="node-actions">
      {rightSlot}
    </div>
  </div>
);

const Node: React.FC<NodeProps> = (props: NodeProps) => {
  const { 
    label, 
    children, 
    onDelete, 
    onAdd, 
    id,
    addingNodeId,
    setAddingNodeId,
    rightSlot,
    leftSlot,
    nodeSlot,
    onDragMove
  } = props;

  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);

  const isAddingChild = addingNodeId === id;

  const renderDefaultIcon = () => {
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
      >
        <path d="M9 18l6-6-6-6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };

  const renderLeftSlot = () => {
    if (!leftSlot) {
      return renderDefaultIcon();
    }
    if (typeof leftSlot === 'function') {
      return leftSlot({ 
        id, 
        hasChildren: children.length > 0, 
        isExpanded, 
        onExpand: () => setIsExpanded(!isExpanded) 
      });
    }
    return leftSlot;
  };

  const renderRightSlot = () => {
    if (!rightSlot) {
      return (
        <>
          <button className="add" onClick={() => {
            setAddingNodeId?.(id);
            setIsExpanded(true);
          }}>
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
    }
    if (typeof rightSlot === 'function') {
      return rightSlot({ id });
    }
    return rightSlot;
  };

  const renderNodeContent = () => {
    const leftSlotContent = renderLeftSlot();
    const rightSlotContent = renderRightSlot();

    if (!nodeSlot) {
      return (
        <DefaultNodeContent
          id={id}
          label={label}
          hasChildren={children.length > 0}
          isExpanded={isExpanded}
          onExpand={() => setIsExpanded(!isExpanded)}
          leftSlot={leftSlotContent}
          rightSlot={rightSlotContent}
        />
      );
    }

    if (typeof nodeSlot === 'function') {
      return nodeSlot({
        id,
        label,
        hasChildren: children.length > 0,
        isExpanded,
        onExpand: () => setIsExpanded(!isExpanded),
        leftSlot: leftSlotContent,
        rightSlot: rightSlotContent
      });
    }

    return nodeSlot;
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

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position: DropPosition = e.clientY < midY ? 'before' : 'after';
    
    if (position !== dropPosition) {
      setDropPosition(position);
      e.currentTarget.setAttribute('data-drop-position', position);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    setDropPosition(null);
    e.currentTarget.removeAttribute('data-drop-position');
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const dragId = e.dataTransfer.getData('text/plain');
    if (dropPosition && onDragMove) {
      onDragMove(dragId, id, dropPosition);
    }
    
    setDropPosition(null);
    e.currentTarget.removeAttribute('data-drop-position');
  };

  return (
    <div className="node-wrapper">
      <div 
        className="node-drag"
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-node-id={id}
      >
        {renderNodeContent()}
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
          leftSlot={leftSlot}
          nodeSlot={nodeSlot}
          onDragMove={onDragMove}
        />;
      })}
    </div>
  );
};

export default Node;
