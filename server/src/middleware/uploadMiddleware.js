import multer from "multer";
import path from "path";
import fs from "fs";

const uploadpath="upload";

if(!fs.existsSync(uploadpath)){
    fs.mkdirSync(uploadpath,{recursive:true});
}

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,uploadpath)
    },
    filename:(req,file,cb)=>{
        const uniqueSuffix=Date.now()+'-'+Math.round(Math.random()*1E9);
        cb(null,file.fieldname+'-'+uniqueSuffix+path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [".pdf"];

    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(extension)) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed."));
    }
};

const upload = multer({
    storage,
    fileFilter,
});

export default upload;
