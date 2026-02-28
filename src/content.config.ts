import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

const portfolios = defineCollection({
    loader: file("src/data/domains.json", {
        parser: (text) => {
            const raw = JSON.parse(text);
            return raw.map(
                (entry: {
                    id: number;
                    domain: string;
                    name: string;
                    role: string | null;
                }) => ({
                    id: entry.domain,
                    domain: entry.domain,
                    name: entry.name,
                    role: entry.role,
                }),
            );
        },
    }),
    schema: z.object({
        domain: z.string(),
        name: z.string(),
        role: z.string().nullable(),
    }),
});

export const collections = { portfolios };
