import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import * as fs from 'fs';
import * as pdfParse from 'pdf-parse';
import {
  Document,
  DocumentDocument,
} from '../../../models/src/document/document.schema';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  documentId: string;
  messages: ChatMessage[];
  documentContent: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly HUGGING_FACE_API_URL =
    'https://api-inference.huggingface.co/models';
  private readonly HUGGING_FACE_TOKEN =
    process.env.HUGGING_FACE_TOKEN || 'your-hugging-face-token-here';

  // Store chat sessions in memory (in production, use Redis or database)
  private chatSessions: Map<string, ChatSession> = new Map();

  constructor(
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
  ) {}

  async startChatSession(documentId: string, userId: string) {
    try {
      // Get document from database
      const document = await this.documentModel.findOne({
        _id: documentId,
        userId,
      });

      if (!document) {
        throw new BadRequestException('Document not found');
      }

      // Extract document content if not already extracted
      let documentContent = '';
      if (document.filePath) {
        documentContent = await this.extractDocumentContent(
          document.filePath,
          document.fileName,
        );

        // Log the extracted content for chat session
        console.log('💬 CHAT SESSION - EXTRACTED PDF CONTENT:');
        console.log('='.repeat(60));
        console.log(`📄 Document: ${document.title}`);
        console.log(`📄 File: ${document.fileName}`);
        console.log(`📄 Content length: ${documentContent.length} characters`);
        console.log('📄 Full extracted content:');
        console.log(documentContent);
        console.log('='.repeat(60));
      }

      // Create chat session
      const sessionId = `${userId}_${documentId}`;
      const chatSession: ChatSession = {
        documentId,
        messages: [
          {
            role: 'assistant',
            content: `Hello! I've analyzed your document "${document.title}". You can now ask me questions about its content, and I'll provide answers based on the document.`,
            timestamp: new Date(),
          },
        ],
        documentContent,
      };

      this.chatSessions.set(sessionId, chatSession);

      console.log(`💬 Started chat session for document: ${document.title}`);

      return {
        success: true,
        message: 'Chat session started successfully',
        data: {
          sessionId,
          documentTitle: document.title,
          messages: chatSession.messages,
        },
      };
    } catch (error) {
      this.logger.error(`Error starting chat session: ${error.message}`);
      throw new BadRequestException('Failed to start chat session');
    }
  }

  async sendMessage(sessionId: string, userMessage: string) {
    try {
      const chatSession = this.chatSessions.get(sessionId);
      if (!chatSession) {
        throw new BadRequestException('Chat session not found');
      }

      // Add user message to session
      const userMsg: ChatMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      };
      chatSession.messages.push(userMsg);

      console.log('💬 USER QUESTION:');
      console.log('='.repeat(50));
      console.log(userMessage);
      console.log('='.repeat(50));

      // Generate AI response using Hugging Face
      const aiResponse = await this.generateAIResponse(
        userMessage,
        chatSession.documentContent,
        chatSession.messages,
      );

      // Add AI response to session
      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      chatSession.messages.push(aiMsg);

      console.log('🤖 AI RESPONSE:');
      console.log('='.repeat(50));
      console.log(aiResponse);
      console.log('='.repeat(50));

      return {
        success: true,
        message: 'Message sent successfully',
        data: {
          messages: chatSession.messages,
        },
      };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      throw new BadRequestException('Failed to send message');
    }
  }

  async getChatHistory(sessionId: string) {
    try {
      const chatSession = this.chatSessions.get(sessionId);
      if (!chatSession) {
        throw new BadRequestException('Chat session not found');
      }

      return {
        success: true,
        message: 'Chat history retrieved successfully',
        data: {
          messages: chatSession.messages,
        },
      };
    } catch (error) {
      this.logger.error(`Error getting chat history: ${error.message}`);
      throw new BadRequestException('Failed to get chat history');
    }
  }

  private async extractDocumentContent(
    filePath: string,
    fileName: string,
  ): Promise<string> {
    try {
      console.log(`🔍 CHAT - Attempting to extract content from: ${filePath}`);

      if (!fs.existsSync(filePath)) {
        console.log(`❌ CHAT - File does not exist: ${filePath}`);
        return '';
      }

      const stats = fs.statSync(filePath);
      console.log(`📊 CHAT - File size: ${stats.size} bytes`);

      if (stats.size === 0) {
        console.log(`❌ CHAT - File is empty: ${filePath}`);
        return '';
      }

      const fileExtension = fileName.toLowerCase().split('.').pop();
      console.log(`📄 CHAT - File extension: ${fileExtension}`);

      if (fileExtension === 'pdf') {
        console.log(`🔄 CHAT - Processing PDF file...`);
        const dataBuffer = fs.readFileSync(filePath);

        const data = await pdfParse(dataBuffer, {
          // Enhanced PDF parsing options
          max: 0, // No page limit
          normalizeWhitespace: true, // Clean up whitespace
          disableCombineTextItems: false, // Keep text structure
        });

        console.log(`📄 CHAT - PDF parsed successfully:`);
        console.log(`📄 CHAT - Pages: ${data.numpages}`);
        console.log(`📄 CHAT - Text length: ${data.text.length} characters`);

        if (!data.text || data.text.trim().length === 0) {
          console.log(
            `⚠️ CHAT - PDF text extraction resulted in empty content`,
          );
          return 'PDF text extraction failed - document might be image-based or corrupted.';
        }

        // Clean and normalize the extracted text
        let cleanedText = data.text
          .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
          .replace(/\n\s*\n/g, '\n') // Remove empty lines
          .trim();

        console.log(
          `✅ CHAT - PDF content extracted successfully (${cleanedText.length} chars)`,
        );
        return cleanedText;
      } else if (fileExtension === 'txt') {
        const content = fs.readFileSync(filePath, 'utf-8');
        console.log(
          `✅ CHAT - TXT content extracted successfully (${content.length} chars)`,
        );
        return content;
      }

      console.log(`⚠️ CHAT - Unsupported file type: ${fileExtension}`);
      return '';
    } catch (error) {
      console.log(`❌ CHAT - Error extracting document content:`, error);
      this.logger.error(`Error extracting document content: ${error.message}`);
      return '';
    }
  }

  private async generateAIResponse(
    userQuestion: string,
    documentContent: string,
    chatHistory: ChatMessage[],
  ): Promise<string> {
    try {
      // Handle conversational messages and greetings
      const lowerQuestion = userQuestion.toLowerCase().trim();

      // Check for greetings and conversational messages
      if (this.isConversationalMessage(lowerQuestion)) {
        console.log(
          '💬 DETECTED CONVERSATIONAL MESSAGE - Using friendly response',
        );
        return this.generateConversationalResponse(
          lowerQuestion,
          documentContent,
        );
      }

      // Create context from recent chat history
      const recentMessages = chatHistory
        .slice(-6) // Last 6 messages for context
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join('\n');

      // Log what we're sending to AI
      console.log('💬 CHAT - CONTENT BEING SENT TO AI:');
      console.log('='.repeat(60));
      console.log(`📝 User Question: ${userQuestion}`);
      console.log(
        `📄 Document Content Length: ${documentContent.length} characters`,
      );
      console.log('📄 Document Content (First 500 chars):');
      console.log(documentContent.substring(0, 500) + '...');
      console.log('📄 Document Content (Last 300 chars):');
      console.log(
        '...' +
          documentContent.substring(Math.max(0, documentContent.length - 300)),
      );
      console.log(`💬 Chat History (${chatHistory.length} messages):`);
      console.log(recentMessages);
      console.log('='.repeat(60));

      // Create enhanced prompt for question answering
      const prompt = `
You are an AI assistant helping users understand their documents. Answer the user's question based ONLY on the provided document content.

Document Content:
${documentContent}

Chat History:
${recentMessages}

Current Question: ${userQuestion}

Instructions:
1. Answer based ONLY on the document content provided
2. If the answer is not in the document, say "I cannot find this information in the document"
3. Be specific and cite relevant parts of the document
4. Keep answers concise but informative
5. If asked about numbers, dates, or specific details, provide exact information from the document

Answer:`;

      // Try Hugging Face text generation model for better conversational responses
      try {
        console.log(
          `📊 Content length for generative model: ${documentContent.length} characters`,
        );

        // For generative models, we can work with larger chunks
        // Split into chunks (max 3000 chars to stay under token limits but allow more context)
        const maxChunkSize = 3000;
        const chunks = this.chunkContentForQA(documentContent, maxChunkSize);
        console.log(
          `📝 Split content into ${chunks.length} chunks for generative processing`,
        );

        let bestAnswer = '';
        let bestRelevance = 0;

        // Try generation on each chunk and find the most relevant answer
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          console.log(
            `🔄 Processing generative chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`,
          );

          // Create a more detailed prompt for better answers
          const generativePrompt = `Document Content:
${chunk}

Question: ${userQuestion}

Based on the document content above, provide a detailed and informative answer to the question. If the information is not in the document, say so clearly. Be specific and include relevant details from the document.

Answer:`;

          try {
            // Use a better generative model for text generation
            const response = await axios.post(
              `${this.HUGGING_FACE_API_URL}/google/flan-t5-base`,
              {
                inputs: generativePrompt,
                parameters: {
                  max_length: 512,
                  temperature: 0.8,
                  do_sample: true,
                  top_p: 0.9,
                  repetition_penalty: 1.2,
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${this.HUGGING_FACE_TOKEN}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            // Handle different response formats from different models
            let generatedAnswer = '';

            if (
              response.data &&
              Array.isArray(response.data) &&
              response.data[0]
            ) {
              // Format for models that return array (like flan-t5)
              generatedAnswer =
                response.data[0].generated_text || response.data[0];
            } else if (response.data && response.data.generated_text) {
              // Format for models that return object
              generatedAnswer = response.data.generated_text;
            } else if (typeof response.data === 'string') {
              // Format for models that return string directly
              generatedAnswer = response.data;
            }

            if (generatedAnswer) {
              // Clean up the answer
              generatedAnswer = generatedAnswer
                .replace(generativePrompt, '')
                .replace(/^Answer:\s*/i, '')
                .replace(/^\s*[\-\*]\s*/, '')
                .trim();

              // Check relevance by seeing if the answer contains keywords from the question
              const questionWords = userQuestion
                .toLowerCase()
                .split(' ')
                .filter((w) => w.length > 3);
              const answerLower = generatedAnswer.toLowerCase();
              const relevanceScore = questionWords.filter(
                (word) =>
                  answerLower.includes(word) ||
                  chunk.toLowerCase().includes(word),
              ).length;

              if (
                generatedAnswer.length > 10 &&
                relevanceScore > bestRelevance
              ) {
                bestAnswer = generatedAnswer;
                bestRelevance = relevanceScore;
                console.log(
                  `✅ Better answer found in chunk ${i + 1} (relevance: ${relevanceScore})`,
                );
              }
            }

            // Add delay to avoid rate limiting
            if (i < chunks.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          } catch (chunkError) {
            console.log(`⚠️ Chunk ${i + 1} failed: ${chunkError.message}`);
            continue;
          }
        }

        console.log('🤖 HUGGING FACE GENERATIVE MODEL RESPONSE:');
        console.log('='.repeat(60));
        console.log('📊 Best Answer from all chunks:');
        console.log(`Answer: ${bestAnswer}`);
        console.log(`Relevance Score: ${bestRelevance}`);
        console.log('='.repeat(60));

        if (bestAnswer && bestAnswer.length > 10) {
          console.log('✅ CHAT - GENERATIVE AI ANSWER:');
          console.log('='.repeat(60));
          console.log(`🤖 Final Answer: ${bestAnswer}`);
          console.log(`📊 Answer Length: ${bestAnswer.length} characters`);
          console.log(`📊 Relevance Score: ${bestRelevance}`);
          console.log('='.repeat(60));
          return bestAnswer;
        }
      } catch (hfError) {
        console.log(
          '⚠️ Hugging Face generative model failed, using extractive Q&A fallback',
        );
      }

      // Fallback to comprehensive text-based analysis using the FULL document content
      console.log(
        '🔄 Using comprehensive text analysis with FULL document content...',
      );
      const comprehensiveAnswer = this.generateComprehensiveResponse(
        userQuestion,
        documentContent, // Pass the ENTIRE document content
      );

      if (comprehensiveAnswer && comprehensiveAnswer.length > 20) {
        console.log('✅ CHAT - COMPREHENSIVE TEXT ANALYSIS ANSWER:');
        console.log('='.repeat(60));
        console.log(`🤖 Comprehensive Answer: ${comprehensiveAnswer}`);
        console.log(
          `📊 Answer Length: ${comprehensiveAnswer.length} characters`,
        );
        console.log(
          `📊 Used Full Document: ${documentContent.length} characters`,
        );
        console.log('='.repeat(60));
        return comprehensiveAnswer;
      }

      // Final fallback to DialoGPT model
      try {
        const response = await axios.post(
          `${this.HUGGING_FACE_API_URL}/microsoft/DialoGPT-medium`,
          {
            inputs: prompt,
            parameters: {
              max_length: 200,
              temperature: 0.7,
              do_sample: true,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${this.HUGGING_FACE_TOKEN}`,
              'Content-Type': 'application/json',
            },
          },
        );

        console.log('🤖 HUGGING FACE TEXT GENERATION RESPONSE:');
        console.log('='.repeat(60));
        console.log('📊 Raw API Response:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('='.repeat(60));

        if (
          response.data &&
          response.data[0] &&
          response.data[0].generated_text
        ) {
          const generatedAnswer = response.data[0].generated_text
            .replace(prompt, '')
            .trim();
          console.log('✅ CHAT - AI TEXT GENERATION ANSWER:');
          console.log('='.repeat(60));
          console.log(`🤖 Generated Answer: ${generatedAnswer}`);
          console.log(`📊 Answer Length: ${generatedAnswer.length} characters`);
          console.log('='.repeat(60));
          return generatedAnswer;
        }
      } catch (genError) {
        console.log(
          '⚠️ Hugging Face text generation failed, using simple fallback',
        );
      }

      // Simple fallback response
      const fallbackAnswer = this.generateSimpleResponse(
        userQuestion,
        documentContent,
      );
      console.log('🔄 CHAT - USING SIMPLE FALLBACK RESPONSE:');
      console.log('='.repeat(60));
      console.log(`🤖 Fallback Answer: ${fallbackAnswer}`);
      console.log(`📊 Answer Length: ${fallbackAnswer.length} characters`);
      console.log('='.repeat(60));
      return fallbackAnswer;
    } catch (error) {
      this.logger.error(`Error generating AI response: ${error.message}`);
      return 'I apologize, but I encountered an error while processing your question. Please try again.';
    }
  }

  private generateSimpleResponse(question: string, content: string): string {
    const lowerQuestion = question.toLowerCase();
    const lowerContent = content.toLowerCase();

    // Simple keyword-based responses
    if (
      lowerQuestion.includes('amount') ||
      lowerQuestion.includes('cost') ||
      lowerQuestion.includes('price')
    ) {
      const amounts = content.match(
        /₹[\d,]+\.?\d*|\$[\d,]+\.?\d*|€[\d,]+\.?\d*/g,
      );
      if (amounts && amounts.length > 0) {
        return `Based on the document, I found these amounts: ${amounts.join(', ')}.`;
      }
    }

    if (lowerQuestion.includes('date') || lowerQuestion.includes('when')) {
      const dates = content.match(
        /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}/g,
      );
      if (dates && dates.length > 0) {
        return `The document mentions these dates: ${dates.join(', ')}.`;
      }
    }

    if (lowerQuestion.includes('email') || lowerQuestion.includes('contact')) {
      const emails = content.match(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      );
      if (emails && emails.length > 0) {
        return `The document contains these email addresses: ${emails.join(', ')}.`;
      }
    }

    if (lowerQuestion.includes('phone') || lowerQuestion.includes('number')) {
      const phones = content.match(/[\+]?[1-9][\d]{0,15}/g);
      if (phones && phones.length > 0) {
        return `The document mentions these phone numbers: ${phones.slice(0, 3).join(', ')}.`;
      }
    }

    // Search for keywords in content
    const questionWords = question.split(' ').filter((word) => word.length > 3);
    for (const word of questionWords) {
      const regex = new RegExp(word, 'gi');
      const matches = content.match(regex);
      if (matches && matches.length > 0) {
        // Find sentences containing the keyword
        const sentences = content.split(/[.!?]+/);
        const relevantSentences = sentences.filter((sentence) =>
          sentence.toLowerCase().includes(word.toLowerCase()),
        );
        if (relevantSentences.length > 0) {
          return `Based on the document content: ${relevantSentences[0].trim()}.`;
        }
      }
    }

    return `I found your question about "${question}" but couldn't locate specific information in the document. Could you try rephrasing your question or asking about specific details mentioned in the document?`;
  }

  // Helper method to detect conversational messages
  private isConversationalMessage(lowerQuestion: string): boolean {
    const conversationalPatterns = [
      'hello',
      'hi',
      'hey',
      'good morning',
      'good afternoon',
      'good evening',
      'how are you',
      "what's up",
      'greetings',
      'salutations',
      'thanks',
      'thank you',
      'bye',
      'goodbye',
      'see you',
      'farewell',
      'ok',
      'okay',
      'alright',
      'got it',
      'understood',
      'cool',
      'nice',
      'yes',
      'no',
      'maybe',
      'sure',
      'definitely',
      'absolutely',
    ];

    // Check for exact matches or if question is very short and likely conversational
    return (
      conversationalPatterns.some(
        (pattern) =>
          lowerQuestion === pattern ||
          lowerQuestion.startsWith(pattern + ' ') ||
          lowerQuestion.endsWith(' ' + pattern),
      ) ||
      (lowerQuestion.length <= 3 &&
        ['hi', 'hey', 'ok', 'yes', 'no'].includes(lowerQuestion))
    );
  }

  // Generate comprehensive response using full document content
  private generateComprehensiveResponse(
    question: string,
    fullContent: string,
  ): string {
    const lowerQuestion = question.toLowerCase();
    const lowerContent = fullContent.toLowerCase();

    console.log(
      `🔍 COMPREHENSIVE ANALYSIS - Processing question: "${question}"`,
    );
    console.log(
      `📄 COMPREHENSIVE ANALYSIS - Using full content (${fullContent.length} chars)`,
    );

    // Employment/Work related questions
    if (
      lowerQuestion.includes('employ') ||
      lowerQuestion.includes('work') ||
      lowerQuestion.includes('job') ||
      lowerQuestion.includes('company')
    ) {
      const workSections = this.extractWorkExperience(fullContent);
      if (workSections.length > 0) {
        return `Based on the resume, here's the detailed employment information:\n\n${workSections.join('\n\n')}`;
      }
    }

    // Education related questions
    if (
      lowerQuestion.includes('educat') ||
      lowerQuestion.includes('school') ||
      lowerQuestion.includes('college') ||
      lowerQuestion.includes('university') ||
      lowerQuestion.includes('degree')
    ) {
      const educationInfo = this.extractEducation(fullContent);
      if (educationInfo.length > 0) {
        return `Here's the detailed educational background:\n\n${educationInfo}`;
      }
    }

    // Skills related questions
    if (
      lowerQuestion.includes('skill') ||
      lowerQuestion.includes('technolog') ||
      lowerQuestion.includes('programming') ||
      lowerQuestion.includes('language')
    ) {
      const skillsInfo = this.extractSkills(fullContent);
      if (skillsInfo.length > 0) {
        return `Here are the technical skills and technologies:\n\n${skillsInfo}`;
      }
    }

    // Projects related questions
    if (
      lowerQuestion.includes('project') ||
      lowerQuestion.includes('built') ||
      lowerQuestion.includes('develop')
    ) {
      const projectsInfo = this.extractProjects(fullContent);
      if (projectsInfo.length > 0) {
        return `Here are the detailed projects:\n\n${projectsInfo}`;
      }
    }

    // Achievements related questions
    if (
      lowerQuestion.includes('achieve') ||
      lowerQuestion.includes('award') ||
      lowerQuestion.includes('rank') ||
      lowerQuestion.includes('contest')
    ) {
      const achievementsInfo = this.extractAchievements(fullContent);
      if (achievementsInfo.length > 0) {
        return `Here are the achievements and accomplishments:\n\n${achievementsInfo}`;
      }
    }

    // Contact/Personal info questions
    if (
      lowerQuestion.includes('contact') ||
      lowerQuestion.includes('email') ||
      lowerQuestion.includes('phone') ||
      lowerQuestion.includes('location')
    ) {
      const contactInfo = this.extractContactInfo(fullContent);
      if (contactInfo.length > 0) {
        return `Here's the contact and personal information:\n\n${contactInfo}`;
      }
    }

    // General "about" questions - provide comprehensive overview
    if (
      lowerQuestion.includes('about') ||
      lowerQuestion.includes('summary') ||
      lowerQuestion.includes('overview') ||
      lowerQuestion.includes('describe')
    ) {
      return this.generateFullSummary(fullContent);
    }

    // If no specific category matches, search for keywords in the full content
    const questionWords = question.split(' ').filter((word) => word.length > 3);
    let relevantSections = [];

    for (const word of questionWords) {
      const regex = new RegExp(word, 'gi');
      const sentences = fullContent.split(/[.!?]+/);
      const matchingSentences = sentences.filter((sentence) =>
        sentence.toLowerCase().includes(word.toLowerCase()),
      );

      if (matchingSentences.length > 0) {
        relevantSections.push(...matchingSentences.slice(0, 3)); // Take top 3 matching sentences
      }
    }

    if (relevantSections.length > 0) {
      const uniqueSections = [...new Set(relevantSections)];
      return `Based on the document content, here's what I found related to your question:\n\n${uniqueSections.map((section) => `• ${section.trim()}`).join('\n')}`;
    }

    return `I couldn't find specific information about "${question}" in the document. The document contains information about education, work experience, technical skills, projects, and achievements. Could you try asking about any of these specific areas?`;
  }

  // Extract work experience with full details
  private extractWorkExperience(content: string): string[] {
    const workSections = [];
    const experienceMatch = content.match(
      /Experience([\s\S]*?)(?=Projects|Technical Skills|Achievements|$)/i,
    );

    if (experienceMatch) {
      const experienceText = experienceMatch[1];
      const positions = experienceText.split(
        /(?=Backend Engineer|Software Engineer|Engineer|Intern)/i,
      );

      for (const position of positions) {
        if (position.trim().length > 20) {
          workSections.push(`${position.trim()}`);
        }
      }
    }

    return workSections;
  }

  // Extract education information
  private extractEducation(content: string): string {
    const educationMatch = content.match(
      /Education([\s\S]*?)(?=Experience|Projects|$)/i,
    );
    if (educationMatch) {
      return educationMatch[1].trim();
    }

    // Fallback: look for common education patterns
    const patterns = [
      /B\.Tech[\s\S]*?\d{4}/gi,
      /Bachelor[\s\S]*?\d{4}/gi,
      /Institute[\s\S]*?\d{4}/gi,
      /University[\s\S]*?\d{4}/gi,
      /College[\s\S]*?\d{4}/gi,
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        return matches.join('\n');
      }
    }

    return '';
  }

  // Extract skills information
  private extractSkills(content: string): string {
    const skillsMatch = content.match(
      /Technical Skills([\s\S]*?)(?=Achievements|Projects|$)/i,
    );
    if (skillsMatch) {
      return skillsMatch[1].trim();
    }

    // Look for technology mentions
    const techKeywords = ['Languages:', 'Frameworks:', 'Databases:', 'Tools'];
    const skillSections = [];

    for (const keyword of techKeywords) {
      const regex = new RegExp(
        `${keyword}([^\\n]*?)(?=Languages:|Frameworks:|Databases:|Tools|$)`,
        'gi',
      );
      const matches = content.match(regex);
      if (matches) {
        skillSections.push(...matches);
      }
    }

    return skillSections.join('\n');
  }

  // Extract projects information
  private extractProjects(content: string): string {
    const projectsMatch = content.match(
      /Projects([\s\S]*?)(?=Technical Skills|Achievements|$)/i,
    );
    if (projectsMatch) {
      return projectsMatch[1].trim();
    }
    return '';
  }

  // Extract achievements information
  private extractAchievements(content: string): string {
    const achievementsMatch = content.match(/Achievements([\s\S]*?)$/i);
    if (achievementsMatch) {
      return achievementsMatch[1].trim();
    }
    return '';
  }

  // Extract contact information
  private extractContactInfo(content: string): string {
    const contactInfo = [];

    // Email
    const emailMatch = content.match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    );
    if (emailMatch) {
      contactInfo.push(`Email: ${emailMatch[0]}`);
    }

    // Phone
    const phoneMatch = content.match(/[\+]?[1-9][\d\s\-\(\)]{8,15}/);
    if (phoneMatch) {
      contactInfo.push(`Phone: ${phoneMatch[0]}`);
    }

    // Name
    const nameMatch = content.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/);
    if (nameMatch) {
      contactInfo.push(`Name: ${nameMatch[1]}`);
    }

    return contactInfo.join('\n');
  }

  // Generate full comprehensive summary
  private generateFullSummary(content: string): string {
    const sections = [];

    // Extract name
    const nameMatch = content.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/);
    if (nameMatch) {
      sections.push(`This document is about ${nameMatch[1]}.`);
    }

    // Work experience summary
    const workExp = this.extractWorkExperience(content);
    if (workExp.length > 0) {
      sections.push(`\nPROFESSIONAL EXPERIENCE:\n${workExp.join('\n\n')}`);
    }

    // Education summary
    const education = this.extractEducation(content);
    if (education) {
      sections.push(`\nEDUCATION:\n${education}`);
    }

    // Skills summary
    const skills = this.extractSkills(content);
    if (skills) {
      sections.push(`\nTECHNICAL SKILLS:\n${skills}`);
    }

    // Projects summary
    const projects = this.extractProjects(content);
    if (projects) {
      sections.push(`\nPROJECTS:\n${projects}`);
    }

    // Achievements summary
    const achievements = this.extractAchievements(content);
    if (achievements) {
      sections.push(`\nACHIEVEMENTS:\n${achievements}`);
    }

    return sections.join('\n');
  }

  // Chunk content specifically for Q&A processing
  private chunkContentForQA(content: string, maxChunkSize: number): string[] {
    const chunks: string[] = [];
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);

    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      // If adding this sentence would exceed the limit, save current chunk and start new one
      if (
        currentChunk.length + trimmedSentence.length + 1 > maxChunkSize &&
        currentChunk.length > 0
      ) {
        chunks.push(currentChunk.trim());
        currentChunk = trimmedSentence;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      }
    }

    // Add the last chunk if it has content
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    // If no chunks were created (very long sentences), fall back to character-based chunking
    if (chunks.length === 0) {
      for (let i = 0; i < content.length; i += maxChunkSize) {
        chunks.push(content.substring(i, i + maxChunkSize));
      }
    }

    return chunks;
  }

  // Generate friendly conversational responses
  private generateConversationalResponse(
    lowerQuestion: string,
    documentContent: string,
  ): string {
    // Determine document type for context
    let documentType = 'document';
    if (
      documentContent.toLowerCase().includes('experience') &&
      documentContent.toLowerCase().includes('education')
    ) {
      documentType = 'resume';
    } else if (documentContent.toLowerCase().includes('invoice')) {
      documentType = 'invoice';
    } else if (documentContent.toLowerCase().includes('contract')) {
      documentType = 'contract';
    }

    // Greeting responses
    if (
      lowerQuestion.includes('hello') ||
      lowerQuestion.includes('hi') ||
      lowerQuestion.includes('hey')
    ) {
      return `Hello! I'm here to help you understand your ${documentType}. Feel free to ask me any questions about its content - like specific details, dates, amounts, or anything else you'd like to know!`;
    }

    // Gratitude responses
    if (lowerQuestion.includes('thank') || lowerQuestion.includes('thanks')) {
      return `You're welcome! I'm happy to help you analyze your ${documentType}. Do you have any other questions about its content?`;
    }

    // Farewell responses
    if (
      lowerQuestion.includes('bye') ||
      lowerQuestion.includes('goodbye') ||
      lowerQuestion.includes('see you')
    ) {
      return `Goodbye! Feel free to come back anytime if you have more questions about your ${documentType}. Have a great day!`;
    }

    // Affirmative responses
    if (
      [
        'yes',
        'ok',
        'okay',
        'alright',
        'got it',
        'understood',
        'cool',
        'nice',
        'sure',
      ].includes(lowerQuestion)
    ) {
      return `Great! Is there anything specific you'd like to know about your ${documentType}? I can help you find information about dates, amounts, names, or any other details.`;
    }

    // Negative responses
    if (['no', 'nope', 'not really'].includes(lowerQuestion)) {
      return `No problem! If you change your mind and want to ask about anything in your ${documentType}, just let me know. I'm here to help!`;
    }

    // Default friendly response
    return `I understand! I'm here to help you with your ${documentType}. You can ask me questions like "What's the total amount?", "When is the due date?", "What's the email address?", or anything else you'd like to know from the content.`;
  }
}
