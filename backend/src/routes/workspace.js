// Workspace (files and folders) routes
import express from "express";
import multer from "multer";
import supabase from "../db.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Configure multer for file upload
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || "5242880"); // 5MB default
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSize,
  },
});

// Sanitize filename
const sanitizeFilename = (name) => {
  return name
    .replace(/[<>:"|?*\x00-\x1F]/g, "_")
    .trim()
    .slice(0, 255);
};

// Create file
router.post(
  "/file",
  authMiddleware,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const { name, parentId, language } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name) {
      const error = new Error("File name is required");
      error.statusCode = 400;
      throw error;
    }

    const sanitizedName = sanitizeFilename(name);

    if (!sanitizedName) {
      const error = new Error("Invalid file name");
      error.statusCode = 400;
      throw error;
    }

    // Check for duplicate filename in same parent folder
    const { data: existingFile } = await supabase
      .from("files")
      .select("id")
      .eq("user_id", userId)
      .eq("name", sanitizedName)
      .eq("parent_id", parentId || null)
      .eq("type", "file")
      .single();

    if (existingFile) {
      const error = new Error(
        "File with this name already exists in this folder"
      );
      error.statusCode = 409;
      throw error;
    }

    // Verify parent folder exists and belongs to user
    if (parentId) {
      const { data: parentFolder } = await supabase
        .from("files")
        .select("id")
        .eq("id", parentId)
        .eq("user_id", userId)
        .eq("type", "folder")
        .single();

      if (!parentFolder) {
        const error = new Error("Parent folder not found");
        error.statusCode = 404;
        throw error;
      }
    }

    // Create file record
    const { data: newFile, error: createError } = await supabase
      .from("files")
      .insert([
        {
          user_id: userId,
          name: sanitizedName,
          type: "file",
          parent_id: parentId || null,
          language: language || "text",
          path: `user-${userId}/${sanitizedName}`,
        },
      ])
      .select()
      .single();

    if (createError) {
      const error = new Error("Failed to create file");
      error.statusCode = 500;
      throw error;
    }

    // Upload file content if provided
    if (req.file) {
      const filePath = `${userId}/${newFile.id}`;

      const { error: uploadError } = await supabase.storage
        .from("workspace-files")
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) {
        // Delete file record if upload fails
        await supabase.from("files").delete().eq("id", newFile.id);

        const error = new Error("Failed to upload file content");
        error.statusCode = 500;
        throw error;
      }
    }

    res.status(201).json({
      success: true,
      message: "File created successfully",
      file: newFile,
    });
  })
);

// Create folder
router.post(
  "/folder",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { name, parentId } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name) {
      const error = new Error("Folder name is required");
      error.statusCode = 400;
      throw error;
    }

    const sanitizedName = sanitizeFilename(name);

    if (!sanitizedName) {
      const error = new Error("Invalid folder name");
      error.statusCode = 400;
      throw error;
    }

    // Check for duplicate folder name in same parent
    const { data: existingFolder } = await supabase
      .from("files")
      .select("id")
      .eq("user_id", userId)
      .eq("name", sanitizedName)
      .eq("parent_id", parentId || null)
      .eq("type", "folder")
      .single();

    if (existingFolder) {
      const error = new Error(
        "Folder with this name already exists in this location"
      );
      error.statusCode = 409;
      throw error;
    }

    // Verify parent folder exists and belongs to user
    if (parentId) {
      const { data: parentFolder } = await supabase
        .from("files")
        .select("id")
        .eq("id", parentId)
        .eq("user_id", userId)
        .eq("type", "folder")
        .single();

      if (!parentFolder) {
        const error = new Error("Parent folder not found");
        error.statusCode = 404;
        throw error;
      }
    }

    // Create folder record
    const { data: newFolder, error: createError } = await supabase
      .from("files")
      .insert([
        {
          user_id: userId,
          name: sanitizedName,
          type: "folder",
          parent_id: parentId || null,
          path: `user-${userId}/${sanitizedName}`,
        },
      ])
      .select()
      .single();

    if (createError) {
      const error = new Error("Failed to create folder");
      error.statusCode = 500;
      throw error;
    }

    res.status(201).json({
      success: true,
      message: "Folder created successfully",
      folder: newFolder,
    });
  })
);

// Get all files and folders for user
router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const { data: files, error } = await supabase
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .order("type", { ascending: false })
      .order("name", { ascending: true });

    if (error) {
      const err = new Error("Failed to retrieve files");
      err.statusCode = 500;
      throw err;
    }

    res.status(200).json({
      success: true,
      files,
    });
  })
);

// Get file/folder by ID
router.get(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: file, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !file) {
      const err = new Error("File or folder not found");
      err.statusCode = 404;
      throw err;
    }

    // If it's a file, get its content from storage
    let content = null;
    if (file.type === "file") {
      const filePath = `${userId}/${file.id}`;

      const { data: fileData, error: downloadError } = await supabase.storage
        .from("workspace-files")
        .download(filePath);

      if (!downloadError && fileData) {
        content = await fileData.text();
      }
    }

    res.status(200).json({
      success: true,
      file: {
        ...file,
        content,
      },
    });
  })
);

// Update file (rename or update content)
router.put(
  "/:id",
  authMiddleware,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, content } = req.body;
    const userId = req.user.id;

    // Get current file
    const { data: currentFile, error: fetchError } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !currentFile) {
      const error = new Error("File not found");
      error.statusCode = 404;
      throw error;
    }

    // Update name if provided
    if (name && name !== currentFile.name) {
      const sanitizedName = sanitizeFilename(name);

      if (!sanitizedName) {
        const error = new Error("Invalid name");
        error.statusCode = 400;
        throw error;
      }

      // Check for duplicate name in same parent
      const { data: existingFile } = await supabase
        .from("files")
        .select("id")
        .eq("user_id", userId)
        .eq("name", sanitizedName)
        .eq("parent_id", currentFile.parent_id)
        .neq("id", id)
        .single();

      if (existingFile) {
        const error = new Error(
          "Another file with this name already exists in this folder"
        );
        error.statusCode = 409;
        throw error;
      }

      const { error: updateError } = await supabase
        .from("files")
        .update({
          name: sanitizedName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        const error = new Error("Failed to update file");
        error.statusCode = 500;
        throw error;
      }
    }

    // Update file content if provided
    if (currentFile.type === "file" && (content !== undefined || req.file)) {
      const filePath = `${userId}/${currentFile.id}`;

      if (content !== undefined) {
        // Update with text content
        const encoder = new TextEncoder();
        const buffer = encoder.encode(content);

        const { error: uploadError } = await supabase.storage
          .from("workspace-files")
          .update(filePath, buffer, {
            upsert: true,
          });

        if (uploadError) {
          const error = new Error("Failed to update file content");
          error.statusCode = 500;
          throw error;
        }
      } else if (req.file) {
        // Update with file upload
        const { error: uploadError } = await supabase.storage
          .from("workspace-files")
          .update(filePath, req.file.buffer, {
            upsert: true,
          });

        if (uploadError) {
          const error = new Error("Failed to update file content");
          error.statusCode = 500;
          throw error;
        }
      }

      // Update the updated_at timestamp
      await supabase
        .from("files")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    }

    res.status(200).json({
      success: true,
      message: "File updated successfully",
    });
  })
);

// Delete file or folder
router.delete(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // Get file/folder
    const { data: file, error: fetchError } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !file) {
      const error = new Error("File or folder not found");
      error.statusCode = 404;
      throw error;
    }

    // If it's a folder, check if it's empty
    if (file.type === "folder") {
      const { data: children } = await supabase
        .from("files")
        .select("id")
        .eq("parent_id", id)
        .eq("user_id", userId);

      if (children && children.length > 0) {
        const error = new Error("Cannot delete non-empty folder");
        error.statusCode = 400;
        throw error;
      }
    } else {
      // Delete file from storage
      const filePath = `${userId}/${file.id}`;

      await supabase.storage.from("workspace-files").remove([filePath]);
    }

    // Delete file record
    const { error: deleteError } = await supabase
      .from("files")
      .delete()
      .eq("id", id);

    if (deleteError) {
      const error = new Error("Failed to delete file");
      error.statusCode = 500;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  })
);

export default router;
