import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Schema as MongooseSchema } from "mongoose";

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ timestamps: true })
export class Chat {
  _id!: mongoose.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId!: mongoose.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
  })
  title!: string; // Chat session title

  @Prop({
    type: MongooseSchema.Types.Array,
    required: true,
    default: [],
  })
  messages!: ChatMessage[];

  @Prop({
    type: MongooseSchema.Types.Boolean,
    default: false,
  })
  isActive!: boolean; // Whether chat is currently active

  @Prop({
    type: MongooseSchema.Types.Date,
    required: false,
  })
  lastMessageAt?: Date; // Last message timestamp
}

export type ChatMessageDocument = HydratedDocument<ChatMessage>;

@Schema({ _id: false })
export class ChatMessage {
  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
    enum: ["user", "ai"],
  })
  role!: string; // 'user' or 'ai'

  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
  })
  content!: string; // Message content

  @Prop({
    type: MongooseSchema.Types.Date,
    default: Date.now,
  })
  timestamp!: Date;

  @Prop({
    type: MongooseSchema.Types.Boolean,
    default: false,
  })
  isError?: boolean; // If AI response had an error
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
