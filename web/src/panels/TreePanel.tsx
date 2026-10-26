import React, { useState } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { theme } from '../app/theme';

interface TreeNode {
  name: string;
  isFolder: boolean;
  children?: TreeNode[];
  modified?: boolean;
}

export const TreePanel: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const store = useTimelineStore();
  const cp = store.activeCheckpoint || (store.checkpoints.length > 0 ? store.checkpoints[0] : null);
  const modifiedFiles = new Set(cp?.files_modified || []);

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
    { name: 'CMakeLists.txt', isFolder: false, modified: modifiedFiles.has('CMakeLists.txt') },
    { name: 'Makefile', isFolder: false }
  ];

  const renderNode = (node: TreeNode, depth: number = 0) => {
    return (
      <div key={node.name} style={{ marginLeft: `${depth * 14}px` }}>
        <div
          onClick={() => !node.isFolder && setSelectedFile(node.name)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
            borderRadius: '4px',
            cursor: node.isFolder ? 'default' : 'pointer',
            fontSize: '11px',
            background: selectedFile === node.name ? theme.bg.elevated : 'transparent',
            color: node.modified ? theme.accent.amber : (node.isFolder ? theme.text.secondary : theme.text.primary)
          }}
        >
          <span>{node.isFolder ? '📁' : '📄'}</span>
          <span style={{ fontWeight: node.modified ? 700 : 400 }}>{node.name}</span>
          {node.modified && (
            <span style={{ fontSize: '9px', background: 'rgba(229, 169, 60, 0.15)', color: theme.accent.amber, padding: '1px 5px', borderRadius: '3px', marginLeft: 'auto', fontWeight: 700 }}>
              MOD
            </span>
          )}
        </div>
        {node.children && node.children.map((c) => renderNode(c, depth + 1))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg.surface, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border.subtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0c12' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: theme.accent.cyan, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          TREE SNAPSHOT
        </span>
        <span style={{ fontSize: '10px', color: theme.text.muted, fontFamily: 'monospace' }}>
          tree:{cp ? cp.git_tree_hash.slice(0, 8) : 'HEAD'}
        </span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px', background: '#08090d' }}>
        {defaultTree.map((n) => renderNode(n, 0))}
      </div>
    </div>
  );
};
