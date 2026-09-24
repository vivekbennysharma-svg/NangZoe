const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();

const PORT = 3000;
const SHARED_FOLDER = path.join(__dirname,"shared");

if(!fs.existsSync(SHARED_FOLDER)){
    fs.mkdirSync(SHARED_FOLDER);
}

const upload = multer({
    dest: SHARED_FOLDER
});

app.use(express.static("public"));

app.get("/files",(req,res)=>{
    fs.readdir(SHARED_FOLDER, (err, files)=>{
        if(err){
            return res.status(500).json({
                error: "Unable to read shared folder"
            });
        }
        res.json(files);
    });
});

app.get("/download/:filename",(req,res)=>{
    const filename = req.params.filename;

    if(filename.includes("/") || filename.includes("\\") || filename===".."){
        return res.status(400).send("Invalid filename");
    }
    const filePath = path.join(SHARED_FOLDER,filename);

    fs.stat(filePath,(err,stats)=>{
        if(err || !stats.isFile()){
            return res.status(404).send("file not found");
        }

        res.download(filePath,filename,(err)=>{
            if(err){
                console.log("File download error:",err.message);
            }
        });
    });
});

app.post("/upload",upload.single("file"),(req,res)=>{
    if(!req.file){
        return res.status(400).send("No file uploaded");
    }
    const originalName = path.basename(req.file.originalname);
    const temporaryPath = req.file.path;
    const finalPath = path.join(SHARED_FOLDER,originalName);

    fs.rename(temporaryPath,finalPath,(err)=>{
        if(err){
            console.log("Upload error:",err.message);
            return res.status(500).send("Could not save file");
        }
        res.send("File uploaded successfully");
    })
})
app.listen(PORT, "0.0.0.0", ()=>{
    console.log(`NangZoe Server is running on PORT: ${PORT}`);
});