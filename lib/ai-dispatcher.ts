// Applying pattern from: nextjs-fullstack-best-practices
import { generateVongCommentary } from './anthropic';
import { generateVongCommentaryWithGemini } from './gemini';
import { DrawnCard } from './tarot';

interface UserAIContext {
  name?: string | null;
  clan: string;
  erc: number;
  readingsCount: number;
  zodiacSign?: string;
  zodiacElement?: string;
  lifePathNumber?: number;
  lifePathDescription?: string;
  soulCardName?: string;
  historyContext?: string;
}

/**
 * Unified dispatch function that prioritizes Anthropic Claude (if configured),
 * then falls back to Google Gemini, and propagates the error if both fail.
 */
export async function generateVongCommentaryDispatch(
  user: UserAIContext,
  question: string,
  drawnCards: DrawnCard[],
  combo: { name: string; description: string } | null,
  elementalRelation: { relation: string; orientation: string } | null,
  celestialEvents?: { isFullMoon?: boolean; isNewMoon?: boolean; isMercuryRetrograde?: boolean }
): Promise<string> {
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.replace(/['"]/g, '').trim() !== '';
  
  if (hasAnthropicKey) {
    try {
      console.log('🤖 Dispatched to Anthropic Claude 3.5 Sonnet for Tarot commentary.');
      return await generateVongCommentary(user, question, drawnCards, combo, elementalRelation, celestialEvents);
    } catch (error) {
      console.warn('⚠️ Anthropic Claude generation failed, falling back to Gemini...', error);
    }
  }

  const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.replace(/['"]/g, '').trim() !== '';
  if (hasGeminiKey) {
    console.log('🤖 Dispatched to Google Gemini 1.5 Flash for Tarot commentary.');
    return await generateVongCommentaryWithGemini(user, question, drawnCards, combo, elementalRelation, celestialEvents);
  }

  throw new Error('No valid AI API keys found in environment variables (ANTHROPIC_API_KEY or GEMINI_API_KEY).');
}
