import { Model, Schema, Types } from "mongoose";
import { ModelDefine } from "../mongo-utils";
import {  IBaseDoc } from "./base.repo";

export interface IBookModel extends IBaseDoc {
  name: string;
  auther: string;
  year: number;
}

export type BookModelType = Model<IBookModel, {}, {}>;

export const bookSchema = new Schema<IBookModel>({
  name: { type: String, required: true },
  auther: { type: String, required: true },
  year: { type: Number },
});

class SchemaMethods {
  myMethod() {
    return 42;
  }
  static myStatic() {
    return 42;
  }
  get myVirtual() {
    return 42;
  }
}

bookSchema.loadClass(SchemaMethods);

// export const bookDefine: ModelDefine = {
//   name: "book",
//   schema: bookSchema,
//   collection: "book",
// };
