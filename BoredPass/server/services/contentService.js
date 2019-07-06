import { konsole } from "../../handlr";
import formidable from "formidable";
import path from "path";
import sharp from "sharp";

const fs = require("fs");
const UPLOAD_DIR = path.join(__dirname, "../../data/uploads");
const SVG_DIR = path.join(__dirname, "../../public/images/icons");
const BANNER_DIR = path.join(__dirname, "../../public/images/banners");

class Content {
  constructor() {}

  upload(args) {
    return new Promise((resolve, reject) => {
      let form = formidable.IncomingForm();
      let savedName = "";
      let fileId = "";
      let fileType = "";
      form.uploadDir = UPLOAD_DIR;
      form.multiples = true;
      form.on("file", (field, file) => {
        fileId = path.basename(file.path).replace("upload_", "");
        fileType = path.extname(file.name);
        savedName = fileId + fileType;
        fs.rename(file.path, path.join(UPLOAD_DIR, savedName), () => {});
      });
      form.on("error", err => {
        konsole.error(`Upload error: ${err}`);
        reject(`Upload error: ${err}`);
      });
      form.on("end", () => {
        resolve({
          success: savedName && true,
          fileId: fileId,
          fileType: fileType.replace(".", ""),
          location: "/content/" + fileType.replace(".", "") + "/" + fileId
        });
      });
      form.parse(args.req);
    });
  }

  readResource(args) {
    return new Promise((resolve, _) =>
      resolve(path.join(UPLOAD_DIR, args.fileId + "." + args.fileType))
    );
  }

  readThumb(args) {
    return new Promise((resolve, reject) =>
      sharp(path.join(UPLOAD_DIR, args.fileId + "." + args.fileType))
        .resize(350)
        .toBuffer()
        .then(data => resolve(data))
        .catch(err => {
          konsole.log(`Image thumbnail error: ${err.toString()}`);
          reject(`Image thumbnail error: ${err.toString()}`);
        })
    );
  }

  svg(args) {
    return new Promise((resolve, reject) =>
      fs.readFile(
        SVG_DIR + "/" + args.type + "/" + args.name + ".svg",
        (err, data) => {
          if (err) return reject(null);

          resolve(data);
        }
      )
    );
  }

  listBanners() {
    return new Promise((resolve, reject) =>
      fs.readdir(BANNER_DIR, (err, files) => {
        if (err) {
          konsole.error(err.toString());
          return reject(null);
        }
        resolve(files);
      })
    );
  }
}

export const ContentService = new Content();
