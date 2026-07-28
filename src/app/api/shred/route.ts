import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is missing. Please set OPENAI_API_KEY in process.env.' },
        { status: 500 }
      );
    }

    const { task, spiciness } = await req.json();

    if (!task || typeof task !== 'string' || !task.trim()) {
      return NextResponse.json(
        { error: 'Please enter a valid task.' },
        { status: 400 }
      );
    }

    const granularity = Number(spiciness) || 3;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: `You are an executive function coach. Shred the user's task into microscopic, physical, low-activation-energy steps based on Granularity Level (1=Milestones, 5=Tiny physical actions under 2 mins). Rules: 1. Every step must take 30s to 2 mins at level 5. 2. Output strictly in JSON format matching schema: {'estimated_total_time_mins': number, 'micro_steps': [{'action': string, 'estimated_mins': number}]}`,
        },
        {
          role: 'user',
          content: `Task: "${task.trim()}"\nGranularity Level (Spiciness): ${granularity}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Failed to generate response from OpenAI.');
    }

    const data = JSON.parse(content);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in /api/shred:', error);
    return NextResponse.json(
      { error: error?.message || 'An error occurred while shredding your task.' },
      { status: 500 }
    );
  }
}