import multer from "multer"

const storage = multer.diskStorage({
  
  // 1️⃣ Destination function
  destination: function (req, file, cb) {
    cb(null, './public/temp'); // save in 'temp' folder in public
  },

  // 2️⃣ Filename function
  filename: function (req, file, cb) {
    cb(null, file.originalname); 
    // cb(null, Date.now() + '-' + file.originalname); 
    // Example: 1692015671000-myphoto.jpg
  }

});



export const upload = multer({
    storage: storage
})
