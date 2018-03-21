import config from '../../config';
import { konsole } from '../../handlr/_all';
import formidable from 'formidable';
import path from 'path';

const fs = require('fs');
const UPLOAD_DIR = path.join(__dirname, '../../data/uploads');
const SVG_DIR = path.join(__dirname, '../../public/images/icons');
const BANNER_DIR = path.join(__dirname, '../../public/images/banners');
const TO_REPLACE = '#25B9C5';

class Content {
    constructor() { }

    upload(args, callback) {
        let form = formidable.IncomingForm();
        let savedName = '';
        let fileId = '';
        let fileType = '';
        form.uploadDir = UPLOAD_DIR;
        form.multiples = true;
        form.on('file', (field, file) => {
            fileId = path.basename(file.path).replace('upload_', '');
            fileType = path.extname(file.name);
            savedName = fileId + fileType;
            fs.rename(file.path, path.join(UPLOAD_DIR, savedName));
        });
        form.on('error', (err) => {
            konsole.error('Upload error: ' + err);
        });
        form.on('end', () => {
            callback({
                success: savedName && true,
                fileId: fileId,
                fileType: fileType.replace('.', ''),
                location: '/content/' + fileType.replace('.', '') + '/' + fileId
            });
        });
        form.parse(args.req);
    }

    readResource(args, callback) {
        callback(path.join(UPLOAD_DIR, args.fileId + '.' + args.fileType));
    }

    svg(args, callback) {
        fs.readFile(SVG_DIR + '/' + args.type + '/' + args.name + '.svg', (err, data) => {
            if (err) {
                callback(null);
                return;
            }
            callback(data);
        });
    }

    listBanners(args, callback) {
        fs.readdir(BANNER_DIR, (err, files) => {
            err && konsole.error(err.toString());
            callback(files);
        });
    }
}

export const ContentService = new Content();