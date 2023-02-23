global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
import { describe, test, expect } from "@jest/globals";
import * as fs from "fs";
import { DeleteResult, GridFSBucket, MongoClient, ObjectId } from "mongodb";
import { createGridFSBucket } from "./gridfs-client";

const mongoUrl = "mongodb://127.0.0.1:27017/test";

describe("GridFS Client", () => {
  test("create mongodb client", async () => {
    const client = new MongoClient(mongoUrl);
    expect(client).not.toBeNull();

    try {
      const db = client.db();
      const bucket = new GridFSBucket(db, { bucketName: "fs" });
    } finally {
      await client.close();
    }
  });

  test("get file info by id", async () => {
    const client = createGridFSBucket({ url: mongoUrl });
    expect(client).not.toBeNull();

    try {
      const fileInfo = await client.findInfoById("63f6d434301bfc3ddb726852");
      //   console.log(fileInfo);

      const fileInfo2 = await client.findInfoById("63f6d434301bfc3ddb726853");
      //   console.log(fileInfo2);
    } finally {
      client.close();
    }
  });

  test("get many file info", async () => {
    const client = createGridFSBucket({ url: mongoUrl });
    expect(client).not.toBeNull();

    try {
      const fileInfo = await client.findManyInfo({ filename: /.json$/ });
      console.log(fileInfo);
    } finally {
      client.close();
    }
  });

  test("rename a file info", async () => {
    const client = createGridFSBucket({ url: mongoUrl });
    expect(client).not.toBeNull();

    try {
      await client.rename("63f6d434301bfc3ddb726852", "新改的文件名");
      const fileInfo = await client.findInfoById("63f6d434301bfc3ddb726852");
      console.log(fileInfo);
      expect(fileInfo?.filename).toBe("新改的文件名");
    } finally {
      client.close();
    }
  });

  test("delete a file by id", async () => {
    const client = createGridFSBucket({ url: mongoUrl });
    expect(client).not.toBeNull();

    try {
      await client.deleteById("63f6d11a2880616e6c5868ce");
    } finally {
      client.close();
    }
  });

  test("upload a local file", async () => {
    const client = createGridFSBucket({ url: mongoUrl });
    expect(client).not.toBeNull();

    try {
      await client.upload(
        "D:\\@books\\畅销书籍\\《倾城之恋》张爱玲(影视文学小说).mobi", "《倾城之恋》张爱玲(影视文学小说).mobi"
      );
    } finally {
      client.close();
    }
  });

  test.only("download a file to local", async () => {
    const client = createGridFSBucket({ url: mongoUrl });
    expect(client).not.toBeNull();

    try {
      await client.download("63f726b4158754125c8b71f3", "《倾城之恋》张爱玲(影视文学小说).mobi"
      );
    } finally {
      client.close();
    }
  });

 
});
