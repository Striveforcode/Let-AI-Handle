import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, {
  HydratedDocument,
  Schema as MongooseSchema,
  Types,
} from "mongoose";

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({ timestamps: true })
export class RefreshToken {
  _id!: mongoose.Types.ObjectId;
  updatedAt!: Date;

  @Prop({
    unique: true,
    required: true,
  })
  refreshToken!: string;

  @Prop({
    unique: true,
    required: true,
  })
  accessToken!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  userId!: Types.ObjectId;

  @Prop({
    default: () => {
      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() + 5);
      return currentDate;
    },
    expires: 10, // Expires 10 seconds after expireAt
  })
  expireAt!: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
