import multer from "multer";


//  Storage pattern returns the file Path name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // For unique file or we can use the nano id
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // cb(null, file.fieldname + "-" + uniqueSuffix);

    cb(null, file.originalname); // not a good approach because if we have two file of same name

  },
});

export const upload = multer({
     storage: storage 
    });
