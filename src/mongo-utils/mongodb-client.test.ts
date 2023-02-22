global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
import { describe, test, expect } from "@jest/globals";
import { createMongodbCient } from "./mongodb-client";
import { IUser, UserModel, UserSchema } from "../repositories/user.repo";
import { Model, Document, HydratedDocument } from "mongoose";
import { hasUncaughtExceptionCaptureCallback } from "process";
import { DeleteResult } from "mongodb";

const mongoUrl = "mongodb://127.0.0.1:27017/test";

describe("MongoDB Client", () => {
  test("create mongodb client", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();
    await client.close();
  });

  // test("save a new document", async () => {
  //   const client = await createMongodbCient({ url: mongoUrl });
  //   expect(client.db).not.toBeNull();

  //   try {
  //     client.configModels(userDefine);
  //     const UserModel = client.getModel<UserModelType>("user");

  //     const user = new UserModel({
  //       name: "new Bill",
  //       email: "bill@initech.com",
  //       avatar: "https://i.imgur.com/dM7Thhn.png",
  //       addressInfo: { country: "china", city: "shanghai" },
  //     });

  //     expect(user.isNew).toBeTruthy();
  //     await user.save();
  //   } catch (error) {
  //     expect(error).not.toBeNull();
  //   } finally {
  //     await client.close();
  //   }
  // });

  test("get model by name", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const DocModel = client.db.model("user");

      expect(DocModel.collection.name).toBe("user");
    } catch (err) {
      throw err;
    } finally {
      await client.close();
    }
  });

  test("new one document", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const doc = client.newOne<IUser>("user");
      doc.firstName = "new";
      doc.lastName = "one document";
      doc.email = "bob@gmail.com";
      expect(doc.isNew).toBeTruthy();
      await doc.save();
    } catch (err) {
      throw err;
    } finally {
      await client.close();
    }
  });

  test("new many documents", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const objs = [
        {
          firstName: "new 1 ",
          email: "bob@gmail.com",
        },
        {
          firstName: "new 2",
          email: "bob@gmail.com",
        },
        {
          firstName: "new 3 ",
          email: "bob@gmail.com",
        },
      ];

      const docs = client.newMany<IUser>("user", objs);
      expect(docs.length).toBe(3);
      await Promise.all(docs.map((doc) => doc.save()));
    } catch (err) {
      throw err;
    } finally {
      await client.close();
    }
  });

  test("create & save many documents", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const docs: Array<Partial<IUser>> = [
        {
          name: "create & save one document",
          email: "bill@initech.com",
          avatar: "https://i.imgur.com/dM7Thhn.png",
        },
      ];

      const ids = await client.createMany("user", docs);
      expect(ids.length).toBe(1);
    } catch (error) {
      expect(error).not.toBeNull();
    } finally {
      await client.close();
    }
  });

  test("insert many documents", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const docs: Array<Partial<IUser>> = [
        {
          name: "insert many documents 1",
          email: "bill@initech.com",
          avatar: "https://i.imgur.com/dM7Thhn.png",
        },
        {
          name: "insert many documents 2",
          email: "bill@initech.com",
          avatar: "https://i.imgur.com/dM7Thhn.png",
        },
        {
          name: "insert many documents 3",
          email: "bill@initech.com",
          avatar: "https://i.imgur.com/dM7Thhn.png",
        },
      ];

      const result = await client.insertMany("user", docs);
      expect(result.length).toBe(3);
    } catch (error) {
      expect(error).not.toBeNull();
    } finally {
      await client.close();
    }
  });

  test("find & delete documents by id", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const docs: Array<Partial<IUser>> = [
        {
          name: "insert many documents 1",
          email: "bill@initech.com",
          avatar: "https://i.imgur.com/dM7Thhn.png",
        },
        {
          name: "insert many documents 2",
          email: "bill@initech.com",
          avatar: "https://i.imgur.com/dM7Thhn.png",
        },
        {
          name: "insert many documents 3",
          email: "bill@initech.com",
          avatar: "https://i.imgur.com/dM7Thhn.png",
        },
      ];

      const inserted = await client.insertMany("user", docs);
      const ids = inserted.map((val) => val._id);

      // console.log(ids);
      const deleted = await client.findByIdAndDelete<IUser>("user", ids);

      // console.log(deleted);

      expect(deleted.length).toBe(3);
      expect(deleted[0]?.name).toEqual(docs[0].name);
    } catch (error) {
      expect(error).not.toBeNull();
    } finally {
      await client.close();
    }
  });

  test("delete one document", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const doc: Partial<IUser> = {
        name: "insert one document for delete",
        email: "bill@initech.com",
        avatar: "https://i.imgur.com/dM7Thhn.png",
      };

      const inserted = await client.insertMany("user", [doc]);
      expect(inserted.length).toBe(1);

      const deleted = await client.deleteOne("user", { name: doc.name });

      expect(deleted).toBeTruthy();
    } catch (error) {
      expect(error).not.toBeNull();
    } finally {
      await client.close();
    }
  });

  test("delete many document", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const docs: Array<Partial<IUser>> = [
        {
          name: "insert many documents for delete",
          email: "bill@initech.com",
          avatar: "https://i.imgur.com/dM7Thhn.png",
        },
        {
          name: "insert many documents for delete",
          email: "bill@initech.com",
          avatar: "https://i.imgur.com/dM7Thhn.png",
        },
        {
          name: "insert many documents for delete",
          email: "bill@initech.com",
          avatar: "https://i.imgur.com/dM7Thhn.png",
        },
      ];

      const inserted = await client.insertMany("user", docs);
      expect(inserted.length).toBe(3);

      const deleted = await client.deleteMany("user", {
        name: "insert many documents for delete",
      });

      expect(deleted).toBeTruthy();
    } catch (error) {
      expect(error).not.toBeNull();
    } finally {
      await client.close();
    }
  });

  test("find & update one document by id", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const doc: Partial<IUser> = {
        name: "insert one document for update",
        email: "bill@initech.com",
        avatar: "https://i.imgur.com/dM7Thhn.png",
      };

      const inserted = await client.insertMany("user", [doc]);
      expect(inserted.length).toBe(1);

      const update = await client.findByIdAndUpdate<IUser>(
        "user",
        inserted[0]._id,
        { email: "update@gmail.com" },
        { new: true }
      );
      // console.log(update);

      expect(update?.email).toBe("update@gmail.com");

      const update2 = await client.findByIdAndUpdate<IUser>(
        "user",
        inserted[0]._id,
        { email: "update2@gmail.com" },
        { new: true }
      );
      // console.log(update2);

      expect(update?.email).toBe("update2@gmail.com");
    } catch (error) {
      expect(error).not.toBeNull();
    } finally {
      await client.close();
    }
  });

  test("update one document", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const doc: Partial<IUser> = {
        name: "insert one document for update",
        email: "bill@initech.com",
        avatar: "https://i.imgur.com/dM7Thhn.png",
      };

      const inserted = await client.insertMany("user", [doc]);
      expect(inserted.length).toBe(1);

      const update = await client.updateOne<IUser>(
        "user",
        { name: "insert one document for update" },
        { email: "update-one@gmail.com" }
      );
      expect(update).toBeTruthy();
    } catch (error) {
      expect(error).not.toBeNull();
    } finally {
      await client.close();
    }
  });

  test("update many document", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const doc: Partial<IUser> = {
        name: "insert one document for update",
        email: "bill@initech.com",
        avatar: "https://i.imgur.com/dM7Thhn.png",
      };

      const inserted = await client.insertMany("user", [doc]);
      expect(inserted.length).toBe(1);

      const update = await client.updateMany<IUser>(
        "user",
        { name: "insert one document for update" },
        { email: "update-may@gmail.com" }
      );
      expect(update).toBeTruthy();
    } catch (error) {
      expect(error).not.toBeNull();
    } finally {
      await client.close();
    }
  });

  test("find & replace one document by id", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const doc: Partial<IUser> = {
        name: "insert one document for replace",
        email: "bill@initech.com",
        avatar: "https://i.imgur.com/dM7Thhn.png",
      };

      const inserted = await client.insertMany("user", [doc]);
      expect(inserted.length).toBe(1);

      const replace = await client.findByIdAndReplace<IUser>(
        "user",
        inserted[0]._id,
        { name: "replaced", firstName: "hello", lastName: "bob" },
        { new: true }
      );
      // console.log(replace);

      expect(replace?.firstName).toBe("hello");
    } catch (error) {
      expect(error).not.toBeNull();
    } finally {
      await client.close();
    }
  });

  test("count douments", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const count = await client.countDocuments("user", {});

      expect(count).toBeGreaterThanOrEqual(0);
      console.log(count);
    } catch (error) {
      expect(error).not.toBeNull();
    } finally {
      await client.close();
    }
  });

  test("distinct douments", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const result = await client.distinct<IUser>("user", "name", {
        email: { $exists: true },
      });

      // expect(count).toBeGreaterThanOrEqual(0);
      // console.log(result);
    } catch (error) {
      expect(error).not.toBeNull();
    } finally {
      await client.close();
    }
  });

  test("exists douments", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const result = await client.exists<IUser>("user", {
        email: { $exists: true },
      });
    } catch (error) {
      expect(error).not.toBeNull();
    } finally {
      await client.close();
    }
  });

  test("find doc by id", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const result = await client.findById("user", "63f4ce37d4401ab9a60b0e55");
      console.log(result);
    } catch (error) {
      expect(error).not.toBeNull();
    } finally {
      await client.close();
    }
  });

  test("find one doc", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const result = await client.findOne("user", { lastName: "bob" });
      // console.log(result);
    } catch (error) {
      expect(error).not.toBeNull();
    } finally {
      await client.close();
    }
  });

  test("find many docs", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const result = await client.find("user", { email: "bill@initech.com" });
      console.log(result);
    } catch (error) {
      expect(error).not.toBeNull();
    } finally {
      await client.close();
    }
  });

  test.only("using find query", async () => {
    const client = await createMongodbCient({ url: mongoUrl });
    expect(client.db).not.toBeNull();

    try {
      client.configModels(["user", UserSchema]);

      const query = client.findQuery("user", {});

      query.where("email").equals("bill@initech.com");
      query.where("name").equals("insert many documents 1");
      const result = await query.exec();
      // client.find("user", { email: "bill@initech.com" });
      // console.log(result);
    } catch (error) {
      expect(error).not.toBeNull();
    } finally {
      await client.close();
    }
  });
});
