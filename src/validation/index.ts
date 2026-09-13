import { z } from "zod";

export const requiredText = z.string().trim().min(1);
