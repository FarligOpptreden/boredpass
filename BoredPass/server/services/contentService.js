import config from '../../config';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(__dirname, '../../data/uploads');

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
      console.log('Upload error: ' + err);
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
}

export const ContentService = new Content();