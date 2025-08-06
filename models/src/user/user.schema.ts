import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Schema as MongooseSchema } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  _id!: mongoose.Types.ObjectId;
  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
    unique: true,
  })
  email!: string;

  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
  })
  name!: string;

  @Prop({
    type: MongooseSchema.Types.String,
    required: false,
  })
  phone?: string;

  @Prop({
    type: MongooseSchema.Types.Boolean,
    default: false,
  })
  isVerified!: boolean;

  @Prop({
    type: MongooseSchema.Types.String,
    required: false,
  })
  countryCode?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
