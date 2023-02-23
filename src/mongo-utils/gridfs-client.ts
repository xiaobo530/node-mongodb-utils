import {
  MongoClient,
  GridFSBucket,
  ObjectId,
  Filter,
  GridFSFile,
  GridFSBucketWriteStreamOptions,
} from "mongodb";

import * as path from "path";
import * as fs from "fs";
import { Readable } from "stream";
import { ReadStream, WriteStream } from "fs";

export interface MongoConfig {
  url: string;
  bucketName?: string;
}

/**
 * create GridFS bucket helper
 */
export function createGridFSBucket(cfg: MongoConfig) {
  function close() {
    client.close();
  }

  /**
   * get file info
   * @param id 
   * @returns 
   */
  async function findInfoById(id: string): Promise<GridFSFile | null> {
    const result = await bucket.find({ _id: new ObjectId(id) }).toArray();
    if (result && result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  }

  /**
   * get many file infos
   * @param filter 
   * @returns 
   */
  async function findManyInfo(
    filter?: Filter<GridFSFile>
  ): Promise<GridFSFile[]> {
    return await bucket.find(filter).toArray();
  }

  /**
   * change the file's name info
   * @param id 
   * @param filename 
   * @returns 
   */
  async function rename(id: string, filename: string) {
    return await bucket.rename(new ObjectId(id), filename);
  }

  /**
   * delete one file by id
   */
  async function deleteById(id: ObjectId | string) {
    await bucket.delete(new ObjectId(id));
  }

  /**
   * upload a file to db
   * @param sourceFile 
   * @param filename 
   * @param options 
   * @returns 
   */
  function upload(
    sourceFile: string | ReadStream,
    filename: string,
    options?: GridFSBucketWriteStreamOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const bs = bucket
        .openUploadStream(filename, options)
        .once("finish", () => {
          resolve();
        })
        .once("error", () => {
          reject();
        });

      if (sourceFile instanceof ReadStream) {
        sourceFile.pipe(bs);
      } else {
        fs.createReadStream(filename).pipe(bs);
      }
    });
  }

  /**
   * download file from db
   * @param id 
   * @param filename 
   * @returns 
   */
  function download(id: string, destFile: string | WriteStream): Promise<void> {
    return new Promise((resolve, reject) => {
      const read = bucket.openDownloadStream(new ObjectId(id));
      if (destFile instanceof WriteStream) {
        read.pipe(destFile);
      } else {
        const ws = fs
          .createWriteStream(destFile)
          .once("finish", () => {
            resolve();
          })
          .once("error", () => {
            reject();
          });
        read.pipe(ws);
      }
    });
  }

  const client = new MongoClient(cfg.url);
  const db = client.db();
  const bucket = new GridFSBucket(db, { bucketName: cfg.bucketName ?? "fs" });

  return {
    bucket,
    close,
    findInfoById,
    findManyInfo,
    rename,
    deleteById,
    upload,
    download,
  };
}
