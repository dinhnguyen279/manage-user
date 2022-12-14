import { ModulesOption } from "@babel/preset-env/lib/options";
import express from "express";
import homeController from "../controller/homeController";
import multer from "multer";
import path from "path";
var appRoot = require("app-root-path");
let router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("check appRoot", appRoot);
    cb(null, appRoot + "/src/public/image/");
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const imageFilter = function (req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = "Only image files are allowed!";
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
// Upload single File
let upload = multer({ storage: storage, fileFilter: imageFilter });
// Upload Multiple File
let multi_upload = multer({
  storage: storage,
  fileFilter: imageFilter,
}).array("uploadedImages", 4);

const initWebRoute = (app) => {
  router.get("/", homeController.getHomepage);

  router.get("/detail/user/:id", homeController.getDetailPage);

  router.post("/create-new-user", homeController.createNewUser);

  router.post("/delete-user", homeController.deleteUser);

  router.get("/edit-user/:id", homeController.getEditPage);
  router.post("/update-user", homeController.postUpdateUser);

  // Upload single File
  router.get("/upload", homeController.getUploadFile);
  router.post(
    "/upload-file",
    upload.single("images"),
    homeController.handleUploadFile
  );
  // Upload Multiple File
  router.post(
    "/upload-multiple-images",
    (req, res, next) => {
      multi_upload(req, res, (err) => {
        console.log(req.files);
        if (
          err instanceof multer.MulterError &&
          err.code === "LIMIT_UNEXPECTED_FILE"
        ) {
          // Handle multer file limit error here
          res.send("LIMIT_UNEXPECTED_FILE");
        } else if (err) {
          res.send(err);
        } else {
          // make sure to call next() if all was well
          next();
        }
      });
    },
    homeController.handleUploadMultipleFiles
  );
  return app.use("/", router);
};
export default initWebRoute;
