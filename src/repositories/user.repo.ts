import { Model, Schema, Types } from "mongoose";
import { IBaseDoc } from "./base.repo";

export interface IUser extends IBaseDoc {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  addressInfo?: {
    city?: string;
    country?: string;
    address?: string;
  };

  fullName(): string;
}

export interface UserModel extends Model<IUser> {
  myStaticMethod(): number;
}

export const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    firstName: { type: String},
    lastName: { type: String },
    email: { type: String, required:true},
    avatar: String,
    addressInfo: {
      city: String,
      country: String,
      address: String,
    },
  },
  {
    collection: "user",
    timestamps: true,
    statics: {
      myStaticMethod() {
        return 42;
      },
    },
  }
).method("fullName", function fullName() {
  // return this.firstName + " " + this.lastName;
  return this.name;
});

