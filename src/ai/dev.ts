'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/ai-tech-generation.ts';
import '@/ai/flows/contribution-generation.ts';
import '@/ai/flows/project-description-generation.ts';
import '@/ai/flows/project-details-generation.ts';
import '@/ai/flows/review-rewriting.ts';
