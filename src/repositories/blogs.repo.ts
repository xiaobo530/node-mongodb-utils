import { Schema, Types } from "mongoose";
import { IBaseDoc } from "./base.repo";

export interface IBlogModel extends IBaseDoc {
  title: string;
  author: string;
  body: string;
  comments: [{ body: string; date: Date }];
  date: Date;
  hidden: boolean;
  meta: {
    votes: number;
    favs: number;
  };
}

const blogSchema = new Schema({
  title: String,
  author: String,
  body: String,
  comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  meta: {
    votes: Number,
    favs: Number,
  },
});
