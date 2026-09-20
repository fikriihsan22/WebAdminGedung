import { z } from "zod";

const id = z.string().uuid();
const name = z.string().trim().min(1, "Nama wajib diisi.").max(160);
const spaceName = z.string().trim().min(1, "Nama ruang wajib diisi.").max(120);

export const createBuildingSchema = z.object({
  name,
  spaces: z.array(spaceName).min(1, "Minimal satu ruang booking diperlukan.").max(20),
}).superRefine((value, context) => {
  const seen = new Set<string>();
  value.spaces.forEach((space, index) => {
    const normalized = space.toLocaleLowerCase("id-ID");
    if (seen.has(normalized)) context.addIssue({ code: "custom", message: "Nama ruang tidak boleh duplikat.", path: ["spaces", index] });
    seen.add(normalized);
  });
});

export const updateBuildingSchema = z.object({ buildingId: id, name });
export const buildingStatusSchema = z.object({ buildingId: id, isActive: z.boolean() });
export const createBookingSpaceSchema = z.object({ buildingId: id, name: spaceName });
export const updateBookingSpaceSchema = z.object({ spaceId: id, name: spaceName });
export const bookingSpaceStatusSchema = z.object({ spaceId: id, isActive: z.boolean() });
export const createBuildingAdminSchema = z.object({
  buildingId: id,
  name,
  username: z.string().trim().min(3, "Username minimal 3 karakter.").max(100),
  pin: z.string().min(6, "PIN minimal 6 karakter.").max(128),
});
export const assignBuildingAdminSchema = z.object({ userId: id, buildingId: id });
export const buildingAdminStatusSchema = z.object({ userId: id, isActive: z.boolean() });
