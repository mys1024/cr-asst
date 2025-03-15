import OpenAI from 'openai';
import { defineTools } from './ai/tools';
import { chat } from './ai/chat';
import type { CodeReviewOptions } from '../types';

const { tools, toolCallsHandler } = defineTools([
  {
    type: 'function',
    function: {
      name: 'getWeather',
      description: 'get weather info',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'city name' },
        },
        required: ['city'],
      },
    },
    functionImpl: (args: { city: string }) => {
      const weathers = ['sunny', 'rainy', 'cloudy', 'snowy', 'windy'];
      return {
        city: args.city,
        weather: weathers[randomInt(0, weathers.length)],
        temperature: `${randomInt(-20, 40)}°C`,
      };
    },
  },
]);

function randomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min));
}

export async function play(options: CodeReviewOptions) {
  // options
  const { model, apiKey, baseUrl } = options;

  // create openai client
  const client = new OpenAI({
    baseURL: baseUrl,
    apiKey,
  });

  chat({
    client,
    model,
    tools,
    toolCallsHandler,
    messages: [{ role: 'user', content: '今天深圳和上海天气怎么样' }],
  });
}
