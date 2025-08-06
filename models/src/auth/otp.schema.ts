import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Schema as MongooseSchema } from "mongoose";

export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: true })
export class Otp {
  _id!: mongoose.Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  userId!: mongoose.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
  })
  type!: string; // 'email' or 'phone'

  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
  })
  phoneNumber!: string;

  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
  })
  otp!: string;

  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
  })
  countryCode!: string;

  @Prop({
    // Default is 5 minutes from now
    default: () => new Date(Date.now() + 5 * 60 * 1000),
    expires: 1, // Expires 1 second after expireAt
  })
  expireAt!: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
