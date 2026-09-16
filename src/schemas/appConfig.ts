import { z } from "zod";

export const appConfigSchema = z.object({
  port: z.coerce.number(),
});

export type AppConfig = z.infer<typeof appConfigSchema>;
