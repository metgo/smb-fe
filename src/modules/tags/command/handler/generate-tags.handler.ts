import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { ConfigService } from 'src/services/config/config.service';
import { GenerateTagsCommand } from '../generate-tags.command';
import { Tags } from '../../schema/tags.schema';
import { GenerateTagResponse } from '../../response/generate-tags.response';

// Helper utility for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

@CommandHandler(GenerateTagsCommand)
export class GenerateTagsHandler
implements ICommandHandler<GenerateTagsCommand> {
  private ai: GoogleGenAI;

  constructor(
    private configService: ConfigService,
    @InjectModel(Tags.name)
    private TagsModel: Model<Tags>,
  ) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.get('GEMINI_API_KEY'),
    });
  }

  async execute(command: GenerateTagsCommand): Promise<GenerateTagResponse[]> {
    const { name, description } = command;
    const cleanDescription = description
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

    const existingTags = await this.TagsModel.find()
      .select('name nameHe nameAr -_id')
      .lean();

    const tagList = existingTags
      .map(t => [t.name, t.nameHe, t.nameAr].filter(Boolean).join(' / '))
      .join(', ');

    const runAttempt = async (
      attemptNum: number,
    ): Promise<GenerateTagResponse[]> => {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Business: ${name}. Info: ${cleanDescription}`,
          config: {
            systemInstruction: `You are a fast tagging agent. Generate 6-10 tags. 
                       For each tag, provide English (en), Hebrew (he), and Arabic (ar).
                       Priority: Use these existing tags only if it is relevant: [${tagList}] else generate new tags other than the provided list`,
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  en: { type: 'string' },
                  he: { type: 'string' },
                  ar: { type: 'string' },
                },
                required: ['en', 'he', 'ar'],
              },
            },
            temperature: 1.0,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          },
        });

        return JSON.parse(response.text || '[]');
      } catch (error: any) {
        if ((error.status === 503 || error.status === 429) && attemptNum < 3) {
          // eslint-disable-next-line no-restricted-properties
          const waitTime = Math.pow(2, attemptNum) * 1000;
          await sleep(waitTime);
          return runAttempt(attemptNum + 1);
        }
        console.error('Gemini Tag Generation Failed:', error);
        return [];
      }
    };

    return runAttempt(1);
  }
}
