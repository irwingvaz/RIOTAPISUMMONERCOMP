import { z } from "zod";
import { REGION_OPTIONS } from "@/utils/constants";

const validRegions = REGION_OPTIONS.map((r) => r.value);

export const regionSchema = z
  .string()
  .refine((val) => validRegions.includes(val), { message: "Invalid region" });

// use lastIndexOf so names with # in them still parse correctly (matches parseRiotId)
export const riotIdSchema = z
  .string()
  .transform((s) => s.trim())
  .pipe(
    z
      .string()
      .min(3, "Riot ID too short")
      .max(64, "Riot ID too long")
      .refine((val) => val.includes("#"), {
        message: "Format: Name#Tag (e.g. Faker#KR1)",
      })
      .refine(
        (val) => {
          const idx = val.lastIndexOf("#");
          return val.slice(0, idx).trim().length >= 1 && val.slice(idx + 1).trim().length >= 1;
        },
        { message: "Both game name and tag are required" }
      )
  );

export const compareInputSchema = z.object({
  p1: riotIdSchema,
  p2: riotIdSchema,
  r1: regionSchema,
  r2: regionSchema,
});

export const summonerInputSchema = z.object({
  name: riotIdSchema,
  region: regionSchema,
});

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((e) => e.message).join(". ");
}

export function classifyApiError(error: unknown): { message: string; status: number } {
  const axiosResponse = (error as { response?: { status?: number; data?: { status?: { message?: string } } } })?.response;
  const statusCode = axiosResponse?.status;
  const riotMessage = axiosResponse?.data?.status?.message;

  if (statusCode === 404) return { message: "Player not found — double-check the Riot ID and region.", status: 404 };
  if (statusCode === 403) return { message: "API key is invalid or expired.", status: 403 };
  if (statusCode === 429) return { message: "Rate limit hit — wait a moment and try again.", status: 429 };

  const msg = riotMessage || (error instanceof Error ? error.message : "Unknown error");
  console.error("[riot api] unhandled error:", statusCode, msg);
  return { message: `Request failed: ${msg}`, status: 500 };
}
