import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Tree.css';

export interface TreeNode {
  id: string | number;
  label: string;
  children?: TreeNode[];
}

export interface TreeProps {
  data: TreeNode[];
  className?: string;
  selectedId?: string | number;
  onSelect?: (id: string | number) => void;
  renderSlot?: (node: TreeNode) => React.ReactNode;
  onAddNode?: (parentId: string | number, label: string) => string[] | void;
  onDeleteNode?: (nodeId: string | number) => string[] | void;
  renderTopSlot?: (props: {
    searchTerm: string;
    onSearch: (term: string) => void;
    searchResults: string[];
    expandToNodes: (nodeIds: string[]) => void;
  }) => React.ReactNode;
}

export const Tree: React.FC<TreeProps> = ({ 
  data, 
  className = '', 
  selectedId: initialSelectedId,
  onSelect,
  renderSlot,
  onAddNode,
  onDeleteNode,
  renderTopSlot
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());
  const [selectedId, setSelectedId] = useState<string | number | null>(initialSelectedId);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | number | null>(null);
  const [newNodeParentId, setNewNodeParentId] = useState<string | number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const searchTimeoutRef = useRef<number>();

  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const toggleNodeExpanded = (id: string | number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandToNodes = useCallback((nodeIds: string[]) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      nodeIds.forEach(id => newSet.add(id));
      return newSet;
    });
  }, []);

  const searchNodes = useCallback((nodes: TreeNode[], term: string, path: string[] = []): string[][] => {
    let results: string[][] = [];
    
    for (const node of nodes) {
      const currentPath = [...path, node.id.toString()];
      
      if (node.label.toLowerCase().includes(term.toLowerCase())) {
        results.push(currentPath);
      }
      
      if (node.children) {
        results = [...results, ...searchNodes(node.children, term, currentPath)];
      }
    }
    
    return results;
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);

    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    if (term.trim()) {
      // 设置新的定时器，延迟300ms执行搜索
      searchTimeoutRef.current = window.setTimeout(() => {
        const results = searchNodes(data, term);
        const paths = results.map(path => path.join('/'));
        setSearchResults(paths);
        
        const nodesToExpand = new Set<string>();
        results.forEach(path => {
          path.forEach(id => nodesToExpand.add(id));
        });
        setExpandedIds(prev => {
          const newSet = new Set(prev);
          nodesToExpand.forEach(id => newSet.add(id));
          return newSet;
        });
      }, 300);
    } else {
      setSearchResults([]);
    }
  }, [data, searchNodes]);

  const DefaultTopSlot = () => {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [isComposing, setIsComposing] = useState(false);
    const [inputValue, setInputValue] = useState(searchTerm);

    // 确保输入框保持焦点
    useEffect(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [searchResults]);

    // 同步外部搜索词到输入框
    useEffect(() => {
      setInputValue(searchTerm);
    }, [searchTerm]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      if (!isComposing) {
        handleSearch(value);
      }
    };

    const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
      setIsComposing(false);
      const value = e.currentTarget.value;
      setInputValue(value);
      handleSearch(value);
    };

    return (
      <div className="tree-search">
        <input
          ref={searchInputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={handleCompositionEnd}
          placeholder="搜索节点..."
          className="tree-search-input"
          autoFocus
        />
        {searchResults.length > 0 && (
          <div className="tree-search-results">
            找到 {searchResults.length} 个匹配项
          </div>
        )}
      </div>
    );
  };

  const DefaultActionSlot: React.FC<{ node: TreeNode }> = ({ node }) => (
    <div className="tree-node-actions flex items-center">
      <svg 
        onClick={(e) => {
          e.stopPropagation();
          const confirmDelete = window.confirm(`确定要删除节点 "${node.label}" 吗？`);
          if (confirmDelete) {
            const nodePath = onDeleteNode?.(node.id);
            if (nodePath && Array.isArray(nodePath)) {
              expandToNodes(nodePath);
            }
          }
        }}
        className="tree-node-delete-icon ml-2"
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
      <svg 
        onClick={(e) => {
          e.stopPropagation();
          setNewNodeParentId(node.id);
        }}
        className="tree-node-add-icon ml-2"
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="none" 
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="8" y1="4" x2="8" y2="12" />
        <line x1="4" y1="8" x2="12" y2="8" />
      </svg>
    </div>
  );

  const findNodePath = (nodes: TreeNode[], targetId: string | number, currentPath: string[] = []): string[] | null => {
    for (const node of nodes) {
      const newPath = [...currentPath, node.id.toString()];
      
      if (node.id === targetId) {
        return newPath;
      }
      
      if (node.children) {
        const childPath = findNodePath(node.children, targetId, newPath);
        if (childPath) {
          return childPath;
        }
      }
    }
    
    return null;
  };

  const TreeNode: React.FC<{ node: TreeNode; level: number }> = ({ node, level }) => {
    const [newNodeLabel, setNewNodeLabel] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedId === node.id;
    const isExpanded = expandedIds.has(node.id);
    const isHovered = hoveredNodeId === node.id;

    const highlightText = (text: string, highlight: string) => {
      if (!highlight.trim()) return text;
      const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
      return parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? 
          <span key={i} style={{ color: '#3b82f6' }}>{part}</span> : 
          part
      );
    };
    
    const toggleExpand = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasChildren) {
        toggleNodeExpanded(node.id);
      }
    };

    const handleSelect = () => {
      onSelect?.(node.id);
      setSelectedId(node.id);
    };

    const handleNewNodeSave = () => {
      if (newNodeLabel.trim()) {
        const nodePath = onAddNode?.(node.id, newNodeLabel.trim());
        
        if (nodePath && Array.isArray(nodePath)) {
          expandToNodes(nodePath);
        }
        
        setNewNodeLabel('');
        setNewNodeParentId(null);
      } else {
        setNewNodeParentId(null);
      }
    };

    useEffect(() => {
      if (newNodeParentId === node.id) {
        inputRef.current?.focus();
      }
    }, [newNodeParentId, node.id]);

    return (
      <div 
        className="tree-node"
        onMouseEnter={() => setHoveredNodeId(node.id)}
        onMouseLeave={() => setHoveredNodeId(null)}
      >
        <div className="tree-node-wrapper">
          <div 
            className={`tree-node-content ${isSelected ? 'selected' : ''}`}
            onClick={handleSelect}
            style={{ paddingLeft: `${level * 24}px` }}
          >
            <div className="tree-node-arrow" onClick={e => e.stopPropagation()}>
              {hasChildren && (
                <svg
                  className={isExpanded ? 'expanded' : ''}
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  onClick={toggleExpand}
                >
                  <polyline points="6 12 10 8 6 4" />
                </svg>
              )}
            </div>
            <span className="tree-node-label">
              {highlightText(node.label, searchTerm)}
            </span>
            {isHovered && (
              <div className="tree-node-actions">
                {renderSlot ? renderSlot(node) : <DefaultActionSlot node={node} />}
              </div>
            )}
          </div>
        </div>
        {newNodeParentId === node.id && (
          <div 
            className="tree-node-new-input" 
            style={{ paddingLeft: `${(level + 1) * 24}px` }}
          >
            <input
              ref={inputRef}
              type="text"
              value={newNodeLabel}
              onChange={(e) => setNewNodeLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNewNodeSave()}
              onBlur={handleNewNodeSave}
              placeholder="输入新节点名称"
              className="tree-node-new-input-field"
            />
          </div>
        )}
        {hasChildren && isExpanded && (
          <div className="tree-node-children">
            {node.children?.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`tree ${className}`}>
      {renderTopSlot ? renderTopSlot({ 
        searchTerm, 
        onSearch: handleSearch, 
        searchResults, 
        expandToNodes 
      }) : <DefaultTopSlot />}
      {data.map((node) => (
        <TreeNode key={node.id} node={node} level={0} />
      ))}
    </div>
  );
};
