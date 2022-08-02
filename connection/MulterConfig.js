const util = require("util");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: "us-east-2",
});

const s3 = new aws.S3();

//multer.diskStorage() creates a storage space for storing files.
var fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../uploads/images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

// filtering file type with multer
// var fileFilter = (req, file, cb) => {
//   if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|pdf|PDF|docx|DOCX)$/)) {
//     req.fileValidationError = 'This file type is not supported!';
//     return cb(new Error('This file type is not supported!'), false);
//   }
//   cb(null, true);
// };

var upload = multer({
  storage: multerS3({
    acl: "public-read",
    s3: s3,
    bucket: "test-bucket", // change this in your project
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
  limits: { fileSize: 1024 * 1024 * 5 },
  // fileFilter: fileFilter,
});

// var upload = util.promisify(uploadFiles);

module.exports = upload;
