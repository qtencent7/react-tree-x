# React Tree X

一个功能强大的 React 树形组件，具有拖拽、搜索、自定义渲染等特性。

## 特性

- 🌲 基本的树形结构展示
- 🔍 节点搜索功能（支持中英文）
- ✨ 自定义节点渲染
- 📝 节点编辑功能
- 🎯 节点选择功能
- 🎨 可自定义样式
- 🚀 性能优化
- 🌐 支持国际化

## 安装

```bash
npm install react-tree-x
# 或
yarn add react-tree-x
```

## 使用示例

```jsx
import { Tree } from 'react-tree-x';

const data = {
  id: '1',
  label: '根节点',
  children: [
    {
      id: '1-1',
      label: '子节点1',
    },
    {
      id: '1-2',
      label: '子节点2',
      children: [
        {
          id: '1-2-1',
          label: '子节点2-1',
        },
      ],
    },
  ],
};

function App() {
  return (
    <Tree
      data={data}
      onSelect={(nodeId) => console.log('选中节点:', nodeId)}
    />
  );
}
```

## API

### Tree Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| data | 树形数据 | `TreeNode` | - |
| className | 自定义类名 | `string` | `''` |
| selectedId | 当前选中的节点ID | `string \| number` | - |
| onSelect | 节点选中时的回调函数 | `(nodeId: string \| number) => void` | - |
| renderSlot | 自定义节点渲染函数 | `(node: TreeNode) => ReactNode` | - |
| onAddNode | 添加节点时的回调函数 | `(parentId: string \| number, label: string) => void` | - |
| searchNodes | 自定义搜索函数 | `(data: TreeNode, term: string) => string[][]` | - |
| renderTopSlot | 自定义顶部渲染函数 | `(props: TopSlotProps) => ReactNode` | - |

### TreeNode 类型

```typescript
interface TreeNode {
  id: string | number;
  label: string;
  children?: TreeNode[];
}
```

## 自定义样式

组件使用 CSS 类名来定义样式，你可以通过覆盖这些类名来自定义样式：

```css
.tree-component { /* 树组件容器 */ }
.tree-node { /* 树节点 */ }
.tree-node-content { /* 节点内容 */ }
.tree-node-label { /* 节点标签 */ }
.tree-node-children { /* 子节点容器 */ }
/* 更多样式类名... */
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可

MIT
