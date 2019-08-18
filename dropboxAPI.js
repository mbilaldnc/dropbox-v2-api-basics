const path = require('path'),
    dropboxV2Api = require('dropbox-v2-api'),
    fs = require("fs"),
    tmpPath = __dirname + "/tmp/",
    token = require("./token"),
    dropbox = dropboxV2Api.authenticate({
        token //means token:token
    });

const functions = {
    listFiles(folderPathAtDropbox = "", cb = (err, result) => { }) {
        // folderPathAtDropbox = "" for the main path
        dropbox({
            resource: 'files/list_folder',
            parameters: {
                'path': folderPathAtDropbox,
                'recursive': false,
                'include_media_info': false,
                'include_deleted': false,
                'include_has_explicit_shared_members': false,
                'include_mounted_folders': true,
                'include_non_downloadable_files': true
            }
        }, (err, result, response) => {
            //see docs for `result` parameters
            cb(err, result);
        });
    },
    uploadFile(fileFullName = "", cb = (err, result) => { }) {
        var file = "/" + path.basename(fileFullName);
        dropbox({
            resource: 'files/upload',
            parameters: {
                path: file
            },
            readStream: fs.createReadStream(fileFullName)
        }, (err, result, response) => {
            //upload completed
            console.log("COMPLETED");
            cb(err, result);
        });
    },
    downloadFile(filePathAtDropbox = "", cb = (err, result, savedPath) => { }) {
        // you should create a "tmp" folder at __dirname or you can change the code
        var savedPath = tmpPath + path.basename(filePathAtDropbox);
        dropbox({
            resource: 'files/download',
            parameters: {
                path: filePathAtDropbox
            }
        }, (err, result, response) => {
            //download completed
            cb(err, result, savedPath);
        }).pipe(fs.createWriteStream(savedPath))
    },
    deleteFile(filePathAtDropbox = "", cb = (err, result) => { }) {
        dropbox({
            resource: 'files/delete',
            parameters: {
                'path': filePathAtDropbox
            }
        }, (err, result, response) => {
            //see docs for `result` parameters
            cb(err, result);
        });
    }
}

module.exports = functions;