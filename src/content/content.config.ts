import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    tags: z.array(z.string()),
    githubUrl: z.string().url(),
    liveUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
    status: z.enum(['Completed', 'In Progress', 'Concept']).default('Completed'),
  }),
});

export const collections = { projects };