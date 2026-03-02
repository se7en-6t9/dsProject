// Dashboard page
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FileTree from "../components/FileTree";
import Editor from "../components/Editor";
import { workspaceAPI } from "../services/api";

function Dashboard({ setIsAuthenticated }) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState(null);
  const navigate = useNavigate();

  // Load files on component mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const response = await workspaceAPI.getAll();
      setFiles(response.data.files || []);
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        navigate("/login");
      } else {
        setError("Failed to load files");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFile = async () => {
    if (!newName.trim()) {
      return;
    }

    try {
      await workspaceAPI.createFile(newName.trim(), selectedParentId);
      setNewName("");
      setShowNewFileModal(false);
      setSelectedParentId(null);
      await loadFiles();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create file");
    }
  };

  const handleCreateFolder = async () => {
    if (!newName.trim()) {
      return;
    }

    try {
      await workspaceAPI.createFolder(newName.trim(), selectedParentId);
      setNewName("");
      setShowNewFolderModal(false);
      setSelectedParentId(null);
      await loadFiles();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create folder");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const handleSelectFile = async (fileId) => {
    try {
      const response = await workspaceAPI.getById(fileId);
      setSelectedFile(response.data.file);
      setError("");
    } catch (err) {
      setError("Failed to load file");
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      await workspaceAPI.delete(fileId);
      setSelectedFile(null);
      await loadFiles();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete file");
    }
  };

  const handleSaveFile = async (content) => {
    if (!selectedFile) return;

    try {
      await workspaceAPI.updateFile(selectedFile.id, null, content);
      setSelectedFile({
        ...selectedFile,
        content,
        updated_at: new Date().toISOString(),
      });
      setError("");
    } catch (err) {
      setError("Failed to save file");
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">📁 Workspace</div>
        </div>

        <div className="sidebar-content">
          {isLoading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <FileTree
              files={files}
              selectedFile={selectedFile}
              onSelectFile={handleSelectFile}
              onDeleteFile={handleDeleteFile}
              onCreateFile={(parentId) => {
                setSelectedParentId(parentId);
                setShowNewFileModal(true);
              }}
              onCreateFolder={(parentId) => {
                setSelectedParentId(parentId);
                setShowNewFolderModal(true);
              }}
            />
          )}
        </div>

        <div className="sidebar-footer">
          <button
            className="btn-secondary btn-small"
            onClick={() => {
              setSelectedParentId(null);
              setShowNewFileModal(true);
            }}
            title="Create new file"
          >
            + File
          </button>
          <button
            className="btn-secondary btn-small"
            onClick={() => {
              setSelectedParentId(null);
              setShowNewFolderModal(true);
            }}
            title="Create new folder"
          >
            + Folder
          </button>
          <button
            className="btn-logout btn-small"
            onClick={handleLogout}
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        {error && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#3d1615",
              color: "#f85149",
              borderBottom: "1px solid #30363d",
              fontSize: "13px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {selectedFile ? (
          <Editor
            file={selectedFile}
            onSave={handleSaveFile}
            onDelete={() => handleDeleteFile(selectedFile.id)}
          />
        ) : (
          <div className="main-content">
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-title">No file selected</div>
              <div className="empty-state-desc">
                {files.length === 0
                  ? "Create a new file or folder to get started"
                  : "Select a file from the sidebar to edit"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="modal-overlay" onClick={() => setShowNewFileModal(false)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">Create New File</div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="File name (e.g., index.js)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleCreateFile();
                  }
                }}
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowNewFileModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleCreateFile}
                disabled={!newName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="modal-overlay" onClick={() => setShowNewFolderModal(false)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">Create New Folder</div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Folder name (e.g., src)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleCreateFolder();
                  }
                }}
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowNewFolderModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleCreateFolder}
                disabled={!newName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
