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
    { name: 'CMakeLists.txt', isFolder: false },
    { name: 'Makefile', isFolder: false }
  ];

  const renderNode = (node: TreeNode, depth: number = 0, path: string = '') => {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    const isMod = node.modified;

    return (
      <div key={currentPath}>
        <div
          onClick={() => !node.isFolder && setSelectedFile(currentPath)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 8px',
            paddingLeft: `${depth * 14 + 10}px`,
            fontSize: '11px',
            cursor: node.isFolder ? 'default' : 'pointer',
            background: isMod ? '#eff6ff' : (selectedFile === currentPath ? '#f1f5f9' : 'transparent'),
            color: isMod ? '#1d4ed8' : (node.isFolder ? '#475569' : '#0f172a'),
            fontWeight: (isMod || node.isFolder) ? 600 : 400,
            borderRadius: '4px',
            marginBottom: '1px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {node.isFolder ? (
              <FolderIcon size={13} color="#64748b" />
            ) : (
              <FileCodeIcon size={13} color={isMod ? '#2563eb' : '#94a3b8'} />
            )}
            <span>{node.name}</span>
          </div>
          {isMod && (
            <span style={{ fontSize: '9px', fontWeight: 700, background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '1px 5px', borderRadius: '3px' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', borderRight: `1px solid ${theme.border.subtle}`, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border.subtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: theme.accent.blue, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          TREE SNAPSHOT
        </span>
        <span style={{ fontSize: '10px', color: theme.text.muted, fontFamily: 'monospace' }}>
          tree:{cp?.git_tree_hash.slice(0, 8) || 'HEAD'}
        </span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 4px', background: '#ffffff' }}>
        {defaultTree.map((n) => renderNode(n))}
      </div>
    </div>
  );
};
