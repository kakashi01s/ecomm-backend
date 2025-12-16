import { S3Util } from "../../utils/s3_util.js";

class S3Controller {
  /**
   * Generate a single signed upload URL
   */
  static async getUploadUrl(req, res) {
    try {
      const { filename, contentType, folder } = req.body;

      if (!filename || !contentType) {
        return res
          .status(400)
          .json({ message: "filename & contentType required" });
      }

      const key = S3Util.generateFileKey(folder || "uploads", filename);

      const uploadUrl = await S3Util.generateUploadUrl(key, contentType);

      res.json({
        key,
        uploadUrl,
        publicUrl: `${process.env.CLOUDFRONT_URL}/${key}`,
      });
    } catch (error) {
      console.error("S3 signed url error:", error);
      res.status(500).json({ message: "Failed to create signed URL" });
    }
  }

  /**
   * Generate multiple signed upload URLs
   */
  static async getMultipleUploadUrls(req, res) {
    try {
      const { files, folder } = req.body;

      if (!files || !Array.isArray(files)) {
        return res.status(400).json({ message: "files array required" });
      }

      const results = [];

      for (const file of files) {
        const { filename, contentType } = file;

        const key = S3Util.generateFileKey(folder || "uploads", filename);

        const uploadUrl = await S3Util.generateUploadUrl(key, contentType);

        results.push({
          key,
          uploadUrl,
          publicUrl: `${process.env.CLOUDFRONT_URL}/${key}`,
        });
      }

      res.json(results);
    } catch (error) {
      console.error("S3 multi signed url error:", error);
      res
        .status(500)
        .json({ message: "Failed to create multiple signed URLs" });
    }
  }

  /**
   * Delete file from S3
   */
  static async deleteFile(req, res) {
    try {
      const { key } = req.body;

      if (!key) {
        return res.status(400).json({ message: "key required" });
      }

      await S3Util.deleteFile(key);

      res.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("S3 delete error:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  }

  /**
   * Generate a signed download URL
   */
  static async getDownloadUrl(req, res) {
    try {
      const { key } = req.query;

      if (!key) {
        return res.status(400).json({ message: "key required" });
      }

      const url = await S3Util.generateDownloadUrl(key);

      res.json({ url });
    } catch (error) {
      console.error("S3 download signed url error:", error);
      res.status(500).json({ message: "Failed to create download signed URL" });
    }
  }
}

export { S3Controller };
