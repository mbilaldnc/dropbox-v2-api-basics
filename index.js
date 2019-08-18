const express = require("express"),
    app = express(),
    fileUpload = require("express-fileupload"),
    fs = require("fs"),
    tmpPath = __dirname + "/tmp/",
    DROPBOX = require("./dropboxAPI"),
    bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }))
app.use(fileUpload());

//token = xqdoAqtDzZgAAAAAAAAAPTiVjs--TmbX9ZH2_gsZ3IEWGX29GRBDNXvC7h4tVdhd

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

app.get("/all", (req, res) => {
    DROPBOX.listFiles("", (err, result) => {
        if (err) return console.log(err);
        console.log(result.entries);
        res.sendFile(__dirname + "/index.html");
    })
})

app.post("/download", (req, res) => {
    filePathAtDropbox = req.body.fileName;
    DROPBOX.downloadFile(filePathAtDropbox, (err, result, savedPath) => {
        if (err) return console.log(err)
        res.download(savedPath, (error) => {
            if (error) return console.log(error)
            fs.unlink(savedPath, (error2) => {
                if (error2) return console.log(error2)
                return res.sendFile(__dirname + "/index.html");
            })
        })
    })

})

app.post("/upload", (req, res) => {
    // In order "express-fileupload" to work you should add 'encType="multipart/form-data"' to your form at html file
    const uploadedFile = req.files.file;
    const filePath = tmpPath + uploadedFile.name;
    uploadedFile.mv(filePath, function (error) {
        if (error) return console.log("an error occured");

        console.log('File saved to server!');

        DROPBOX.uploadFile(filePath, (err, file) => {
            if (err) return console.log(err);
            console.log("File successfuly uploaded to dropbox!")
            console.log("FILE ID: " + file.id)
            fs.unlink(filePath, function (err) {
                if (err) throw err;
                console.log('File removed from server!');
            });
        })

        res.sendFile(__dirname + "/index.html");
    })
})

app.post("/delete", (req, res) => {
    const filePath = req.body.fileToDelete;
    DROPBOX.deleteFile(filePath, (err, result) => {
        if (err) return console.log(err);
        console.log(filePath + " file deleted successfuly!");
        res.sendFile(__dirname + "/index.html");
    })
})

var port = 3000;
app.listen(port, () => {
    console.log("Server started on localhost:" + port);
})