// Editor component
import { useState, useEffect } from "react";
import "./Editor.css";

function Editor({ file, onSave, onDelete }) {
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    if (file && file.type === "file") {
      setContent(file.content || "");
      setIsSaved(true);
    }
  }, [file]);

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (!file || isSaved) return;

    setIsSaving(true);
    try {
      await onSave(content);
      setIsSaved(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyboardSave = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
  };

  if (!file) {
    return null;
  }

  if (file.type === "folder") {
    return (
      <div className="main-content">
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <div className="empty-state-title">Folder: {file.name}</div>
          <div className="empty-state-desc">
            This is a folder. Select a file to edit.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="editor-title">
          📝 {file.name}
          {!isSaved && <span style={{ color: "#f85149" }}> *</span>}
        </div>
        <div className="editor-actions">
          <button
            className={`btn-primary ${isSaved ? "" : ""}`}
            onClick={handleSave}
            disabled={isSaved || isSaving}
            title="Save file (Ctrl+S)"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            className="btn-danger"
            onClick={onDelete}
            title="Delete file"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="editor-content">
        <textarea
          className="editor-textarea"
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyboardSave}
          placeholder="Start typing... (Ctrl+S to save)"
          spellCheck="false"
        />
      </div>

      <div className="editor-info">
        <span>Language: {file.language || "text"}</span>
        <span>
          Last updated: {new Date(file.updated_at).toLocaleString()}
        </span>
        <span>Characters: {content.length}</span>
        <span>Lines: {content.split("\n").length}</span>
      </div>
    </div>
  );
}

export default Editor;
