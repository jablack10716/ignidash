'use node';

import { ConvexError } from 'convex/values';
import { APIError, OpenAI } from 'openai';
import { internalAction } from './_generated/server';
import type { Id, Doc } from './_generated/dataModel';
import { internal } from './_generated/api';

import type { SubscriptionType } from './utils/ai_utils';

let openaiChat: OpenAI | null = null;
let openaiInsights: OpenAI | null = null;

const CHAT_MODEL = 'grok-4-fast';
const INSIGHTS_MODEL = 'grok-4-fast';

const apiKey = process.env.OPENAI_API_KEY;
const endpoint = process.env.OPENAI_ENDPOINT;
if (apiKey && endpoint) {
  openaiChat = new OpenAI({
    apiKey,
    baseURL: endpoint,
  });

  openaiInsights = new OpenAI({
    apiKey,
    baseURL: endpoint,
  });
}

type StreamChatParams = {
  userId: string;
  messages: Doc<'messages'>[];
  assistantMessageId: Id<'messages'>;
  systemPrompt: string;
  subscriptionStartTime: number;
  subscriptionType: SubscriptionType;
};

export const streamChat = internalAction({
  handler: async (
    ctx,
    { userId, messages, assistantMessageId, systemPrompt, subscriptionStartTime, subscriptionType }: StreamChatParams
  ) => {
    if (!openaiChat) {
      const errorMessage = 'The required Azure OpenAI environment variables (OPENAI_API_KEY, OPENAI_ENDPOINT) are not set.';
      console.error(errorMessage);

      await ctx.runMutation(internal.messages.setBody, { messageId: assistantMessageId, body: errorMessage, isLoading: false });
      throw new ConvexError(errorMessage);
    }

    const hasBody = (msg: Doc<'messages'>): msg is Doc<'messages'> & { body: string } => msg.body !== undefined;

    try {
      const stream = await openaiChat.chat.completions.create({
        model: CHAT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.filter(hasBody).map((msg) => ({ role: msg.author, content: msg.body })),
        ],
        stream: true,
        stream_options: { include_usage: true },
        max_completion_tokens: 1024,
      });

      let body = '';
      let lastWriteTime = Date.now();

      for await (const part of stream) {
        if (part.choices.length > 0) {
          const choice = part.choices[0];

          if (choice.finish_reason === 'content_filter') {
            body += '\n\n**[Response was cut short by content filter]**';
          }

          if (choice.delta.content) {
            body += choice.delta.content;
            const now = Date.now();
            if (now - lastWriteTime > 1000) {
              await ctx.runMutation(internal.messages.setBody, { messageId: assistantMessageId, body });
              lastWriteTime = now;
            }
          }
        }

        if (part.usage) {
          await ctx.runMutation(internal.messages.setUsage, {
            messageId: assistantMessageId,
            userId,
            inputTokens: part.usage.prompt_tokens,
            cachedInputTokens: part.usage.prompt_tokens_details?.cached_tokens ?? 0,
            outputTokens: part.usage.completion_tokens,
            totalTokens: part.usage.total_tokens,
            subscriptionStartTime,
            subscriptionType,
          });
        }
      }

      await ctx.runMutation(internal.messages.setBody, { messageId: assistantMessageId, body, isLoading: false });
    } catch (error) {
      if (error instanceof APIError) {
        console.error(error);

        const body = `An unexpected error occurred: ${error.message}.`;
        await ctx.runMutation(internal.messages.setBody, { messageId: assistantMessageId, body, isLoading: false });
      } else {
        const body = 'An unexpected error occurred. Please try again later.';
        await ctx.runMutation(internal.messages.setBody, { messageId: assistantMessageId, body, isLoading: false });

        throw error;
      }
    }
  },
});

type StreamInsightsParams = {
  userId: string;
  insightId: Id<'insights'>;
  systemPrompt: string;
  subscriptionStartTime: number;
  subscriptionType: SubscriptionType;
};

export const streamInsights = internalAction({
  handler: async (ctx, { userId, insightId, systemPrompt, subscriptionStartTime, subscriptionType }: StreamInsightsParams) => {
    if (!openaiInsights) {
      const errorMessage = 'The required Azure OpenAI environment variables (OPENAI_API_KEY, OPENAI_ENDPOINT) are not set.';
      console.error(errorMessage);

      await ctx.runMutation(internal.insights.setContent, { insightId, content: errorMessage, isLoading: false });
      throw new ConvexError(errorMessage);
    }

    try {
      const stream = await openaiInsights.chat.completions.create({
        model: INSIGHTS_MODEL,
        messages: [{ role: 'system', content: systemPrompt }],
        stream: true,
        stream_options: { include_usage: true },
        max_completion_tokens: 8192,
      });

      let content = '';
      let lastWriteTime = Date.now();

      for await (const part of stream) {
        if (part.choices.length > 0) {
          const choice = part.choices[0];

          if (choice.finish_reason === 'content_filter') {
            content += '\n\n**[Response was cut short by content filter]**';
          }

          if (choice.delta.content) {
            content += choice.delta.content;
            const now = Date.now();
            if (now - lastWriteTime > 5000) {
              await ctx.runMutation(internal.insights.setContent, { insightId, content });
              lastWriteTime = now;
            }
          }
        }

        if (part.usage) {
          await ctx.runMutation(internal.insights.setUsage, {
            insightId,
            userId,
            inputTokens: part.usage.prompt_tokens,
            cachedInputTokens: part.usage.prompt_tokens_details?.cached_tokens ?? 0,
            outputTokens: part.usage.completion_tokens,
            totalTokens: part.usage.total_tokens,
            subscriptionStartTime,
            subscriptionType,
          });
        }
      }

      await ctx.runMutation(internal.insights.setContent, { insightId, content, isLoading: false });
    } catch (error) {
      if (error instanceof APIError) {
        console.error(error);

        const content = `An unexpected error occurred: ${error.message}.`;
        await ctx.runMutation(internal.insights.setContent, { insightId, content, isLoading: false });
      } else {
        const content = 'An unexpected error occurred. Please try again later.';
        await ctx.runMutation(internal.insights.setContent, { insightId, content, isLoading: false });

        throw error;
      }
    }
  },
});
