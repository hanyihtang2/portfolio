import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    tags: z.array(z.string()),
    githubUrl: z.url().optional(),
    liveUrl: z.url().optional(),
    mockupImage: z.string().optional(),
    mockupCaption: z.string().optional(),
    mobileMockupImage: z.string().optional(),
    mobileMockupCaption: z.string().optional(),
    featured: z.boolean().default(false),
    status: z.enum(['Completed', 'In Progress', 'Concept']).default('Completed'),
    role: z.string().optional(),
    timeline: z.string().optional(),
    metrics: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          description: z.string().optional(),
        })
      )
      .optional(),
    techStack: z
      .object({
        languages: z.array(z.string()).optional(),
        frameworks: z.array(z.string()).optional(),
        tools: z.array(z.string()).optional(),
        infrastructure: z.array(z.string()).optional(),
      })
      .optional(),
    roadmap: z
      .array(
        z.object({
          phase: z.string(),
          title: z.string(),
          status: z.enum(['Completed', 'In Progress', 'Planned']),
          targetQuarter: z.string().optional(),
          summary: z.string(),
          deliverables: z.array(z.string()),
        })
      )
      .optional(),
  }),
});

export const collections = { projects };
