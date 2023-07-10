/*
 * Title:
 * Description:
 * Author: Tasnim Anas
 * Date:
 *
 */
// dependencies
const fs = require('fs');
const path = require('path');
// app object
const lib = {};
lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = (dir, file, data, callback) => {
    fs.open(`${lib.baseDir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            const stringData = JSON.stringify(data);
            fs.writeFile(fileDescriptor, stringData, (err2) => {
                if (!err2) {
                    fs.close(fileDescriptor, (err3) => {
                        if (!err3) {
                            callback(false);
                        } else {
                            callback('Error closing file');
                        }
                    });
                } else {
                    callback('Error writing file');
                }
            });
        } else {
            callback("Could'nt create file. It may already exist");
        }
    });
};

lib.readFile = (dir, file, callback) => {
    fs.readFile(`${lib.baseDir + dir}/${file}.json`, 'utf8', (err, data) => {
        callback(err, data);
    });
};

lib.update = (dir, file, data, callback) => {
    fs.open(`${lib.baseDir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            const stringData = JSON.stringify(data);
            fs.ftruncate(fileDescriptor, (err4) => {
                if (!err4) {
                    fs.writeFile(fileDescriptor, stringData, (err2) => {
                        if (!err2) {
                            fs.close(fileDescriptor, (err3) => {
                                if (!err3) {
                                    callback(false);
                                } else {
                                    callback('Error closing file');
                                }
                            });
                        } else {
                            callback('Error writing file');
                        }
                    });
                } else {
                    callback('Error truncating file');
                }
            });
        } else {
            callback("Couldn't update file. It may not exist");
        }
    });
};

lib.delete = (dir, file, callback) => {
    fs.unlink(`${lib.baseDir + dir}/${file}.json`, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('Error deleting file');
        }
    });
};
lib.listAllFile = (dir, callback) => {
    fs.readdir(`${lib.baseDir + dir}`, (err, list) => {
        if (!err && list && list.length > 0) {
            const trimmedFileNames = [];
            list.forEach((filename) => {
                trimmedFileNames.push(filename.replace('.json', ''));
            });
            callback(false, trimmedFileNames);
        } else {
            callback(true, 'Directory/Files may not exist');
        }
    });
};

module.exports = lib;
