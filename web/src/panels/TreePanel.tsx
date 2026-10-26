import React, { useState } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { theme } from '../app/theme';
import { FolderIcon, FileCodeIcon } from '../components/icons';

interface TreeNode {
  name: string;
  isFolder: boolean;
  children?: TreeNode[];
  modified?: boolean;
}

export const TreePanel: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>('core/src/stall_detector.cpp');
  const store = useTimelineStore();
  const cp = store.activeCheckpoint || (store.checkpoints.length > 0 ? store.checkpoints[0] : null);
  const modifiedFiles = new Set(cp?.files_modified || ['core/src/stall_detector.cpp', 'core/include/chrono/stall_detector.h']);

  const defaultTree: TreeNode[] = [
    {
      name: 'core',
      isFolder: true,
      children: [
        {
          name: 'include',
          isFolder: true,
          children: [
            {
              name: 'chrono',
              isFolder: true,
              children: [
                { name: 'event.h', isFolder: false, modified: modifiedFiles.has('core/include/chrono/event.h') },
                { name: 'hash_chain.h', isFolder: false, modified: modifiedFiles.has('core/include/chrono/hash_chain.h') },
                { name: 'ingest.h', isFolder: false, modified: modifiedFiles.has('core/include/chrono/ingest.h') },
                { name: 'stall_detector.h', isFolder: false, modified: modifiedFiles.has('core/include/chrono/stall_detector.h') },
                { name: 'verify.h', isFolder: false, modified: modifiedFiles.has('core/include/chrono/verify.h') }
              ]
            }
          ]
        },
        {
          name: 'src',
          isFolder: true,
          children: [
            { name: 'hash_chain.cpp', isFolder: false, modified: modifiedFiles.has('core/src/hash_chain.cpp') },
            { name: 'ingest.cpp', isFolder: false, modified: modifiedFiles.has('core/src/ingest.cpp') },
            { name: 'stall_detector.cpp', isFolder: false, modified: modifiedFiles.has('core/src/stall_detector.cpp') },
            { name: 'main.cpp', isFolder: false, modified: modifiedFiles.has('core/src/main.cpp') }
          ]
        }
      ]
    },
    {
      name: 'bridge',
      isFolder: true,
      children: [
        { name: 'pyproject.toml', isFolder: false },
        {
          name: 'app',
          isFolder: true,
          children: [
            { name: 'main.py', isFolder: false },
            { name: 'narrate.py', isFolder: false },
            { name: 'suggest.py', isFolder: false }
          ]
        }
      ]
    },
    { name: 'CMakeLists.txt', isFolder: false },
    { name: 'Makefile', isFolder: false }
  ];

  const renderNode = (node: TreeNode, depth: number = 0, path: string = '') => {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    const isMod = node.modified;
    const isSelected = selectedFile === currentPath;

    return (
      <div key={currentPath}>
        <div
          onClick={() => !node.isFolder && setSelectedFile(currentPath)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '3px 8px',
            paddingLeft: `${depth * 14 + 10}px`,
            fontSize: '11px',
            cursor: node.isFolder ? 'default' : 'pointer',
            background: isSelected ? theme.bg.base : 'transparent',
            borderLeft: isSelected ? `2px solid ${theme.accent.green}` : '2px solid transparent',
            color: node.isFolder ? theme.text.secondary : theme.text.primary,
            fontWeight: (isMod || isSelected) ? 600 : 400,
            borderRadius: '2px',
            marginBottom: '1px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {node.isFolder ? (
              <FolderIcon size={13} color={theme.text.muted} />
            ) : (
              <FileCodeIcon size={13} color={isMod ? theme.accent.green : theme.text.muted} />
            )}
            <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>{node.name}</span>
          </div>
          {isMod && (
            <span style={{
              fontSize: '9px',
              fontWeight: 600,
              background: '#fff8c5',
              color: '#9a6700',
              border: '1px solid #d4a72c',
              padding: '0 4px',
              borderRadius: '3px',
              fontFamily: '"JetBrains Mono", monospace'
            }}>
              MOD
            </span>
          )}
        </div>
        {node.children && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1, currentPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg.surface, borderRight: `1px solid ${theme.border.default}`, overflow: 'hidden' }}>
      <div style={{
        padding: '8px 14px',
        borderBottom: `1px solid ${theme.border.default}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: theme.bg.chrome
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: theme.text.muted,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontFamily: '"JetBrains Mono", monospace'
        }}>
          TREE SNAPSHOT
        </span>
        <span style={{ fontSize: '10px', color: theme.text.muted, fontFamily: '"JetBrains Mono", monospace' }}>
          tree:{cp?.git_tree_hash.slice(0, 8) || 'HEAD'}
        </span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 4px', background: theme.bg.surface }}>
        {defaultTree.map((n) => renderNode(n))}
      </div>
    </div>
  );
};
