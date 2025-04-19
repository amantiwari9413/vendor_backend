import multer from "multer"
import { resolve } from 'path';

import {__dirname } from "../utills/dotevUtils.js";

const parentDir = resolve(__dirname, '..');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `${parentDir}/upload`); // Save to the 'upload' folder
    },
    filename: (req, file, cb) => {
      // Extract the original file extension
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName); // Save with a unique name and original extension
    }
  });

export const upload=multer({storage,})