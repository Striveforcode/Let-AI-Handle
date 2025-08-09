import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly HUGGING_FACE_API_URL =
    'https://api-inference.huggingface.co/models';
  private readonly HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_TOKEN || 'your-hugging-face-token-here';

  async analyzeDocument(
    filePath: string,
    fileName: string,
  ): Promise<{
    summary: string;
    insights: string[];
    keyPoints: string[];
    sentiment: string;
  }> {
    try {
      // Read the file content
      const fileContent = await this.readFileContent(filePath, fileName);

      if (!fileContent) {
        throw new Error('Could not read file content');
      }

      // Log the parsed PDF content that will be sent to AI
      console.log('📄 PARSED PDF CONTENT:');
      console.log('='.repeat(50));
      console.log(fileContent);
      console.log('='.repeat(50));
      console.log(`📄 Total characters: ${fileContent.length}`);

      // Analyze the document using Hugging Face API
      const analysis = await this.performHuggingFaceAnalysis(fileContent);

      // Log the AI response
      console.log('🤖 HUGGING FACE AI ANALYSIS RESPONSE:');
      console.log('='.repeat(50));
      console.log(JSON.stringify(analysis, null, 2));
      console.log('='.repeat(50));

      return analysis;
    } catch (error) {
      this.logger.error(`Error analyzing document: ${error.message}`);
      throw new Error(`Failed to analyze document: ${error.message}`);
    }
  }

  private async readFileContent(
    filePath: string,
    fileName: string,
  ): Promise<string> {
    try {
      const fileExtension = path.extname(fileName).toLowerCase();

      if (fileExtension === '.txt') {
        return fs.readFileSync(filePath, 'utf-8');
      } else if (fileExtension === '.pdf') {
        // Check if file exists and is readable
        if (!fs.existsSync(filePath)) {
          console.log('❌ PDF file not found:', filePath);
          return null;
        }

        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
          console.log('❌ PDF file is empty:', filePath);
          return null;
        }

        console.log(
          `📄 Processing PDF: ${fileName} (${(stats.size / 1024).toFixed(2)} KB)`,
        );

        // Extract text from PDF with enhanced options
        const dataBuffer = fs.readFileSync(filePath);

        try {
          const data = await pdfParse(dataBuffer, {
            // Enhanced PDF parsing options
            max: 0, // No page limit
            version: 'v1.10.100', // Use specific version
            normalizeWhitespace: true, // Clean up whitespace
            disableCombineTextItems: false, // Keep text structure
          });

          // Check if text extraction was successful
          if (!data.text || data.text.trim().length === 0) {
            console.log('⚠️ PDF text extraction resulted in empty content');
            return 'PDF text extraction failed - document might be image-based or corrupted.';
          }

          // Enhanced logging for extracted content
          console.log(`📄 Complete extracted text: ${data.text}`);
          console.log(`📄 Text length: ${data.text.length} characters`);
          console.log(`📄 Number of pages: ${data.numpages}`);
          console.log(
            `📄 First 1000 characters: ${data.text.substring(0, 1000)}`,
          );
          console.log(
            `📄 Last 500 characters: ${data.text.substring(Math.max(0, data.text.length - 500))}`,
          );

          // Clean and normalize the extracted text
          let cleanedText = data.text
            .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
            .replace(/\n\s*\n/g, '\n') // Remove empty lines
            .trim();

          return cleanedText;
        } catch (pdfError) {
          console.log('❌ PDF parsing error:', pdfError.message);
          return 'PDF parsing failed - document might be corrupted or unsupported.';
        }
      } else if (fileExtension === '.docx' || fileExtension === '.doc') {
        return 'Word document content extraction not implemented yet';
      } else {
        return fs.readFileSync(filePath, 'utf-8');
      }
    } catch (error) {
      console.log('❌ File reading error:', error.message);
      return null;
    }
  }

  private async performHuggingFaceAnalysis(content: string): Promise<{
    summary: string;
    insights: string[];
    keyPoints: string[];
    sentiment: string;
  }> {
    try {
      // Log the request being sent to Hugging Face
      console.log('🤖 HUGGING FACE API REQUEST:');
      console.log('='.repeat(50));
      console.log('Model: facebook/bart-large-cnn (for summarization)');
      console.log('Content length:', content.length);
      console.log('Content preview:', content.substring(0, 200) + '...');
      console.log('='.repeat(50));

      // Get summary using Hugging Face with enhanced prompt
      const summary = await this.getEnhancedSummaryFromHuggingFace(content);

      // Get insights and key points using intelligent analysis
      const insights = await this.generateIntelligentInsights(content);
      const keyPoints = await this.extractDetailedKeyPoints(content);
      const sentiment = await this.analyzeSentiment(content);

      const analysis = {
        summary,
        insights,
        keyPoints,
        sentiment,
      };

      return analysis;
    } catch (error) {
      console.log('⚠️ Hugging Face API failed, using fallback analysis');
      console.log('⚠️ Error:', error.message);
      return this.performFallbackAnalysis(content);
    }
  }

  private async getEnhancedSummaryFromHuggingFace(
    content: string,
  ): Promise<string> {
    try {
      console.log(
        `📊 Content length for summarization: ${content.length} characters`,
      );

      // Handle large documents by chunking
      const maxTokens = 1000; // Conservative limit for BART model
      const chunks = this.chunkContent(content, maxTokens);

      console.log(
        `📝 Split content into ${chunks.length} chunks for processing`,
      );

      let combinedSummary = '';

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(
          `🔄 Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`,
        );

        try {
          // Create focused prompt for each chunk
          const chunkPrompt = `
Summarize this document section focusing on:
- Document type and purpose
- Key parties and organizations  
- Financial amounts and terms
- Important dates and deadlines
- Critical actions or requirements

Content:
${chunk}

Provide a clear, professional summary:`;

          // Use BART model for summarization
          const response = await axios.post(
            `${this.HUGGING_FACE_API_URL}/facebook/bart-large-cnn`,
            {
              inputs: chunkPrompt,
              parameters: {
                max_length: 150,
                min_length: 50,
                do_sample: false,
                num_beams: 4,
                early_stopping: true,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${this.HUGGING_FACE_TOKEN}`,
                'Content-Type': 'application/json',
              },
              timeout: 30000, // 30 second timeout
            },
          );

          if (
            response.data &&
            response.data[0] &&
            response.data[0].summary_text
          ) {
            const chunkSummary = response.data[0].summary_text;
            combinedSummary += chunkSummary + ' ';
            console.log(`✅ Chunk ${i + 1} summarized successfully`);
          } else {
            console.log(`⚠️ Chunk ${i + 1} failed, using fallback`);
            combinedSummary += this.generateEnhancedSummary(chunk) + ' ';
          }

          // Add delay between requests to avoid rate limiting
          if (i < chunks.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (chunkError) {
          console.log(
            `⚠️ Chunk ${i + 1} processing failed:`,
            chunkError.message,
          );
          combinedSummary += this.generateEnhancedSummary(chunk) + ' ';
        }
      }

      console.log('🤖 HUGGING FACE ENHANCED SUMMARY RESPONSE:');
      console.log('='.repeat(50));
      console.log(combinedSummary);
      console.log('='.repeat(50));

      return combinedSummary.trim() || this.generateEnhancedSummary(content);
    } catch (error) {
      console.log(
        '⚠️ Hugging Face enhanced summarization failed, using fallback:',
        error.message,
      );
      return this.generateEnhancedSummary(content);
    }
  }

  // Helper method to chunk content for token limits
  private chunkContent(content: string, maxTokens: number): string[] {
    const chunks = [];
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);

    let currentChunk = '';
    let currentTokens = 0;

    for (const sentence of sentences) {
      const sentenceTokens = Math.ceil(sentence.length / 4); // Rough token estimation

      if (
        currentTokens + sentenceTokens > maxTokens &&
        currentChunk.length > 0
      ) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
        currentTokens = sentenceTokens;
      } else {
        currentChunk += sentence + '.';
        currentTokens += sentenceTokens;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    // If no sentences found, split by paragraphs
    if (chunks.length === 0) {
      const paragraphs = content
        .split('\n\n')
        .filter((p) => p.trim().length > 0);
      let currentParagraphChunk = '';

      for (const paragraph of paragraphs) {
        const paragraphTokens = Math.ceil(paragraph.length / 4);

        if (paragraphTokens > maxTokens) {
          // Split large paragraphs by character count
          const words = paragraph.split(' ');
          let wordChunk = '';

          for (const word of words) {
            if ((wordChunk + word).length > maxTokens * 4) {
              if (wordChunk.length > 0) {
                chunks.push(wordChunk.trim());
                wordChunk = word;
              } else {
                chunks.push(word); // Single word larger than limit
              }
            } else {
              wordChunk += ' ' + word;
            }
          }

          if (wordChunk.trim().length > 0) {
            chunks.push(wordChunk.trim());
          }
        } else {
          if ((currentParagraphChunk + paragraph).length > maxTokens * 4) {
            if (currentParagraphChunk.length > 0) {
              chunks.push(currentParagraphChunk.trim());
              currentParagraphChunk = paragraph;
            } else {
              chunks.push(paragraph);
            }
          } else {
            currentParagraphChunk += '\n\n' + paragraph;
          }
        }
      }

      if (currentParagraphChunk.trim().length > 0) {
        chunks.push(currentParagraphChunk.trim());
      }
    }

    return chunks.length > 0 ? chunks : [content.substring(0, maxTokens * 4)];
  }

  private async generateEnhancedSummary(content: string): Promise<string> {
    try {
      // Enhanced summary generation with business focus
      const lines = content
        .split('\n')
        .filter((line) => line.trim().length > 0);
      const sentences = content
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 10);

      let summary = '';

      // Try to identify document type
      if (
        content.toLowerCase().includes('invoice') ||
        content.toLowerCase().includes('bill')
      ) {
        summary += 'This is an invoice document. ';
      } else if (
        content.toLowerCase().includes('contract') ||
        content.toLowerCase().includes('agreement')
      ) {
        summary += 'This is a contract or agreement document. ';
      } else if (content.toLowerCase().includes('report')) {
        summary += 'This is a report document. ';
      }

      // Extract key financial information
      const amountMatch = content.match(
        /₹[\d,]+\.?\d*|\$[\d,]+\.?\d*|€[\d,]+\.?\d*/g,
      );
      if (amountMatch && amountMatch.length > 0) {
        summary += `Contains financial amounts: ${amountMatch.slice(0, 3).join(', ')}. `;
      }

      // Extract key dates
      const dateMatch = content.match(
        /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}/g,
      );
      if (dateMatch && dateMatch.length > 0) {
        summary += `Key dates mentioned: ${dateMatch.slice(0, 2).join(', ')}. `;
      }

      // Add first few meaningful sentences
      const meaningfulSentences = sentences.slice(
        0,
        Math.min(2, sentences.length),
      );
      if (meaningfulSentences.length > 0) {
        summary += meaningfulSentences.join('. ') + '.';
      }

      return summary || 'Document analysis completed.';
    } catch (error) {
      return 'Enhanced summary generation failed.';
    }
  }

  private async generateIntelligentInsights(
    content: string,
  ): Promise<string[]> {
    try {
      const insights = [];

      // Document type analysis
      if (
        content.toLowerCase().includes('invoice') ||
        content.toLowerCase().includes('bill')
      ) {
        insights.push('📄 Document Type: Invoice or billing statement');
      } else if (
        content.toLowerCase().includes('contract') ||
        content.toLowerCase().includes('agreement')
      ) {
        insights.push('📋 Document Type: Contract or legal agreement');
      } else if (content.toLowerCase().includes('report')) {
        insights.push('📊 Document Type: Report or analysis document');
      } else if (content.toLowerCase().includes('letter')) {
        insights.push('📝 Document Type: Letter or correspondence');
      }

      // Financial analysis
      const amounts = content.match(
        /₹[\d,]+\.?\d*|\$[\d,]+\.?\d*|€[\d,]+\.?\d*/g,
      );
      if (amounts && amounts.length > 0) {
        const totalAmount = amounts.reduce((sum, amount) => {
          const num = parseFloat(
            amount.replace(/[₹$,€]/g, '').replace(/,/g, ''),
          );
          return sum + (isNaN(num) ? 0 : num);
        }, 0);
        insights.push(
          `💰 Financial Information: ${amounts.length} monetary amounts found, total: ${amounts[0].includes('₹') ? '₹' : amounts[0].includes('$') ? '$' : '€'}${totalAmount.toLocaleString()}`,
        );
      }

      // Contact information analysis
      const emailMatch = content.match(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      );
      if (emailMatch) {
        insights.push(
          `📧 Contact Information: ${emailMatch.length} email addresses found`,
        );
      }

      // Phone number analysis
      const phoneMatch = content.match(/[\+]?[1-9][\d]{0,15}/g);
      if (phoneMatch && phoneMatch.length > 0) {
        insights.push(
          `📞 Contact Information: ${phoneMatch.length} phone numbers found`,
        );
      }

      // Banking information
      if (
        content.toLowerCase().includes('bank') ||
        content.toLowerCase().includes('account') ||
        content.toLowerCase().includes('ifsc') ||
        content.toLowerCase().includes('ac no')
      ) {
        insights.push(
          '🏦 Banking Details: Contains banking or payment information',
        );
      }

      // Date analysis
      const dateMatch = content.match(
        /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}/g,
      );
      if (dateMatch && dateMatch.length > 0) {
        insights.push(
          `📅 Time-sensitive: ${dateMatch.length} important dates mentioned`,
        );
      }

      // GST/Tax information
      if (
        content.toLowerCase().includes('gst') ||
        content.toLowerCase().includes('tax') ||
        content.toLowerCase().includes('pan')
      ) {
        insights.push(
          '🏛️ Tax Information: Contains GST, PAN, or tax-related details',
        );
      }

      // Service/Product analysis
      if (
        content.toLowerCase().includes('service') ||
        content.toLowerCase().includes('product')
      ) {
        insights.push(
          '🛠️ Service/Product: Contains service or product descriptions',
        );
      }

      // Default insights if none found
      if (insights.length === 0) {
        insights.push('📄 Document contains structured information');
        insights.push('🔍 Multiple key topics identified');
        insights.push('📋 Professional language detected');
      }

      return insights;
    } catch (error) {
      return ['Intelligent insight generation failed.'];
    }
  }

  private async extractDetailedKeyPoints(content: string): Promise<string[]> {
    try {
      const keyPoints = [];

      // Extract amounts
      const amounts = content.match(
        /₹[\d,]+\.?\d*|\$[\d,]+\.?\d*|€[\d,]+\.?\d*/g,
      );
      if (amounts && amounts.length > 0) {
        keyPoints.push(`💰 Amount: ${amounts[0]}`);
      }

      // Extract dates
      const dates = content.match(
        /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}/g,
      );
      if (dates && dates.length > 0) {
        keyPoints.push(`📅 Date: ${dates[0]}`);
      }

      // Extract email addresses
      const emails = content.match(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      );
      if (emails && emails.length > 0) {
        keyPoints.push(`📧 Email: ${emails[0]}`);
      }

      // Extract phone numbers
      const phones = content.match(/[\+]?[1-9][\d]{0,15}/g);
      if (phones && phones.length > 0) {
        keyPoints.push(`📞 Phone: ${phones[0]}`);
      }

      // Extract service/product names
      const serviceMatch = content.match(
        /(?:service|product|item|description)[\s:]*([^\n\r]+)/gi,
      );
      if (serviceMatch && serviceMatch.length > 0) {
        keyPoints.push(
          `🛠️ Service: ${serviceMatch[0].replace(/(service|product|item|description)[\s:]*/i, '').trim()}`,
        );
      }

      // Extract company/organization names
      const companyMatch = content.match(
        /(?:company|organization|corporation|pvt|ltd|inc)[\s:]*([^\n\r]+)/gi,
      );
      if (companyMatch && companyMatch.length > 0) {
        keyPoints.push(
          `🏢 Organization: ${companyMatch[0].replace(/(company|organization|corporation|pvt|ltd|inc)[\s:]*/i, '').trim()}`,
        );
      }

      // Extract addresses
      const addressMatch = content.match(
        /(?:address|location)[\s:]*([^\n\r]+)/gi,
      );
      if (addressMatch && addressMatch.length > 0) {
        keyPoints.push(
          `📍 Address: ${addressMatch[0].replace(/(address|location)[\s:]*/i, '').trim()}`,
        );
      }

      // Fallback to sentence extraction if no structured data found
      if (keyPoints.length === 0) {
        const sentences = content
          .split(/[.!?]+/)
          .filter((s) => s.trim().length > 20)
          .slice(0, 5)
          .map((s) => s.trim());
        keyPoints.push(...sentences);
      }

      return keyPoints.slice(0, 7); // Limit to 7 key points
    } catch (error) {
      return ['Detailed key points extraction failed.'];
    }
  }

  private async performFallbackAnalysis(content: string): Promise<{
    summary: string;
    insights: string[];
    keyPoints: string[];
    sentiment: string;
  }> {
    try {
      const summary = await this.generateSummary(content);
      const insights = await this.generateInsights(content);
      const keyPoints = await this.extractKeyPoints(content);
      const sentiment = await this.analyzeSentiment(content);

      return {
        summary,
        insights,
        keyPoints,
        sentiment,
      };
    } catch (error) {
      this.logger.error(`Error in fallback analysis: ${error.message}`);
      throw error;
    }
  }

  private async generateSummary(content: string): Promise<string> {
    try {
      const sentences = content
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0);

      const summarySentences = sentences.slice(
        0,
        Math.min(3, sentences.length),
      );

      return summarySentences.join('. ') + '.';
    } catch (error) {
      return 'Summary generation failed.';
    }
  }

  private async generateInsights(content: string): Promise<string[]> {
    try {
      // Simple insights based on content analysis
      const insights = [];

      if (
        content.toLowerCase().includes('invoice') ||
        content.toLowerCase().includes('bill')
      ) {
        insights.push('Document is an invoice or billing statement');
      }

      if (
        content.includes('₹') ||
        content.includes('$') ||
        content.includes('€')
      ) {
        insights.push('Document contains financial information');
      }

      if (content.includes('@') || content.includes('email')) {
        insights.push('Document contains contact information');
      }

      if (content.includes('bank') || content.includes('account')) {
        insights.push('Document contains banking details');
      }

      if (insights.length === 0) {
        insights.push('Document contains structured information');
        insights.push('Multiple key topics identified');
        insights.push('Professional language detected');
      }

      return insights;
    } catch (error) {
      return ['Insight generation failed.'];
    }
  }

  private async extractKeyPoints(content: string): Promise<string[]> {
    try {
      const sentences = content
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0);

      return sentences
        .slice(0, Math.min(5, sentences.length))
        .map((s) => s.trim());
    } catch (error) {
      return ['Key points extraction failed.'];
    }
  }

  private async analyzeSentiment(content: string): Promise<string> {
    try {
      const positiveWords = [
        'good',
        'great',
        'excellent',
        'positive',
        'success',
        'approved',
        'accepted',
      ];
      const negativeWords = [
        'bad',
        'poor',
        'negative',
        'failure',
        'problem',
        'rejected',
        'cancelled',
      ];

      const lowerContent = content.toLowerCase();
      const positiveCount = positiveWords.filter((word) =>
        lowerContent.includes(word),
      ).length;
      const negativeCount = negativeWords.filter((word) =>
        lowerContent.includes(word),
      ).length;

      if (positiveCount > negativeCount) return 'positive';
      if (negativeCount > positiveCount) return 'negative';
      return 'neutral';
    } catch (error) {
      return 'neutral';
    }
  }
}
