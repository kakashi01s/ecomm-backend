import { Router } from "express";
import { S3Controller } from "../s3/s3.controller.js";

const router = Router();

router.post("/upload-url", S3Controller.getUploadUrl);
router.post("/upload-urls", S3Controller.getMultipleUploadUrls);
router.post("/delete-file", S3Controller.deleteFile);
router.get("/download-url", S3Controller.getDownloadUrl);

export { router };
