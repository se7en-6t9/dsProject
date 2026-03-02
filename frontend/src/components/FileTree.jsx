// File tree component
import { useState } from "react";
import "./FileTree.css";

function FileTree({
  files = [],
  selectedFile,
  onSelectFile,
  onDeleteFile,
  onCreateFile,
  onCreateFolder,
  parentId = null,
}) {
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  // Filter files by parent
  const currentFiles = files.filter((f) => f.parent_id === parentId);

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (type, name) => {
    if (type === "folder") return "📁";
    
    const ext = name.split(".").pop()?.toLowerCase();
    const icons = {
      js: "📜",
      jsx: "⚛️",
      ts: "📘",
      tsx: "⚛️",
      py: "🐍",
      java: "☕",
      cpp: "C++",
      c: "C",
      cs: "C#",
      go: "Go",
      rb: "💎",
      php: "🐘",
      json: "{}",
      xml: "📋",
      html: "🌐",
      css: "🎨",
      scss: "🎨",
      md: "📝",
      sql: "🗄️",
      sh: "🐚",
      bash: "🐚",
      zip: "🎁",
      rar: "🎁",
    };
    return icons[ext] || "📄";
  };

  return (
    <ul className="file-tree">
      {currentFiles.map((file) => (
        <li key={file.id} className="file-tree-item">
          <div
            className={`file-tree-item-content ${
              selectedFile?.id === file.id ? "active" : ""
            }`}
          >
            {file.type === "folder" ? (
              <>
                <button
                  className="file-tree-item-toggle"
                  onClick={() => toggleFolder(file.id)}
                  title={expandedFolders.has(file.id) ? "Collapse" : "Expand"}
                >
                  {expandedFolders.has(file.id) ? "▼" : "▶"}
                </button>
                <span className="file-tree-item-icon">
                  {getFileIcon(file.type)}
                </span>
                <span
                  onClick={() => toggleFolder(file.id)}
                  style={{ flex: 1, cursor: "pointer" }}
                >
                  {file.name}
                </span>
                <div className="file-tree-item-actions">
                  <button
                    className="btn-small"
                    onClick={() => onCreateFile(file.id)}
                    title="Add file to this folder"
                  >
                    +F
                  </button>
                  <button
                    className="btn-small"
                    onClick={() => onCreateFolder(file.id)}
                    title="Add folder to this folder"
                  >
                    +D
                  </button>
                  <button
                    className="btn-small"
                    onClick={() => onDeleteFile(file.id)}
                    title="Delete folder"
                  >
                    🗑
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="file-tree-item-icon">
                  {getFileIcon(file.type, file.name)}
                </span>
                <span
                  onClick={() => onSelectFile(file.id)}
                  style={{ flex: 1, cursor: "pointer" }}
                >
                  {file.name}
                </span>
                <div className="file-tree-item-actions">
                  <button
                    className="btn-small"
                    onClick={() => onDeleteFile(file.id)}
                    title="Delete file"
                  >
                    🗑
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Nested files */}
          {file.type === "folder" && expandedFolders.has(file.id) && (
            <ul className="file-tree-item-children">
              <FileTree
                files={files}
                selectedFile={selectedFile}
                onSelectFile={onSelectFile}
                onDeleteFile={onDeleteFile}
                onCreateFile={onCreateFile}
                onCreateFolder={onCreateFolder}
                parentId={file.id}
              />
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

export default FileTree;
