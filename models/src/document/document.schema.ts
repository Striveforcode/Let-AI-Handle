import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Schema as MongooseSchema } from "mongoose";

export type DocumentDocument = HydratedDocument<Document>;

@Schema({ timestamps: true })
export class Document {
  _id!: mongoose.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId!: mongoose.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
  })
  title!: string;

  @Prop({
    type: MongooseSchema.Types.String,
    required: false,
  })
  description?: string;

  @Prop({
    type: [MongooseSchema.Types.String],
    required: false,
  })
  tags?: string[];

  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
  })
  fileName!: string;

  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
  })
  fileType!: string; // pdf, docx, txt, etc.

  @Prop({
    type: MongooseSchema.Types.Number,
    required: true,
  })
  fileSize!: number; // in bytes

  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
  })
  fileUrl!: string; // URL to stored file

  @Prop({
    type: MongooseSchema.Types.String,
    required: false,
  })
  filePath?: string; // Local file path for development

  @Prop({
    type: MongooseSchema.Types.Date,
    default: Date.now,
  })
  uploadDate!: Date;

  @Prop({
    type: MongooseSchema.Types.String,
    default: "uploaded",
  })
  status!: string; // uploaded, processing, processed, error

  @Prop({
    type: MongooseSchema.Types.String,
    required: false,
  })
  summary?: string; // AI-generated summary

  @Prop({
    type: MongooseSchema.Types.Array,
    required: false,
  })
  insights?: string[]; // AI-generated insights

  @Prop({
    type: MongooseSchema.Types.Boolean,
    default: false,
  })
  isProcessed!: boolean; // Whether AI has processed the document

  @Prop({
    type: MongooseSchema.Types.Date,
    required: false,
  })
  processedAt?: Date; // When AI processing was completed
}

export const DocumentSchema = SchemaFactory.createForClass(Document);
