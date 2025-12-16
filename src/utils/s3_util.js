// utils/s3.util.js
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import crypto from "crypto";
import { extname } from "path";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.AWS_S3_BUCKET;

class S3Util {
  /**
   * Generate a unique key for a file
   * @param {string} folder - folder path like 'uploads/profiles'
   * @param {string} originalFilename - e.g. 'image.png'
   */
  static generateFileKey(folder, originalFilename) {
    const timestamp = Date.now();
    const ext = extname(originalFilename);
    const random = crypto.randomBytes(6).toString("hex"); // prevent collisions
    return `${folder}/${random}_${timestamp}${ext}`;
  }

  /**
   * Generate a pre-signed URL for uploading
   * @param {string} key - Final file key
   * @param {string} contentType - MIME type
   * @param {number} expiresIn - seconds
   */
  static async generateUploadUrl(key, contentType, expiresIn = 900) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });
    return await getSignedUrl(s3, command, { expiresIn });
  }

  /**
   * Generate a pre-signed URL for reading a file
   * @param {string} key - File key in S3
   * @param {number} expiresIn - seconds
   */
  static async generateDownloadUrl(key, expiresIn = 900) {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    return await getSignedUrl(s3, command, { expiresIn });
  }

  /**
   * Delete a file
   * @param {string} key - File key in S3
   */
  static async deleteFile(key) {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await s3.send(command);
  }
}

export { S3Util };
