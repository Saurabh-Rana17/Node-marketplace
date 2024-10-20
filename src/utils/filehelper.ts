import * as fs from "fs";

export const deleteFile = (filepath: any) => {
  fs.unlink(filepath, (err) => {
    if (err) {
      throw err;
    }
  });
};
