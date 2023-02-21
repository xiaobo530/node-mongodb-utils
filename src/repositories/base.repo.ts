import { Types } from "mongoose";

export interface IBaseDoc {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
  [index: string]: any;
}
