import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export const userRegSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z]+$/, "Must Be a String")
    .trim(),
  lastname: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z]+$/, "Must Be a String")
    .trim(),
  id: z
    .string()
    .regex(/^\d{6}$/)
    .length(6),
  email: z
    .string()
    .email()
    .regex(/@unisabana\.edu\.co$/),
  password: z.string().min(6),
  contact: z.string().regex(/^\d/).min(10),
  photo: z
    .any()
    .optional()
    .refine((file) => !file || file.size <= 1048576, {
      message: "El archivo no debe pesar más de 1MB",
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.mimetype), {
      message: "El archivo debe ser una imagen PNG o JPG",
    }),
});



export const vehicleSchema = z.object({
  id_driver: z.number().int().min(100000).max(999999),
  plate: z.string().regex(/^([A-Z]{3})(\d{3})$/),
  brand: z.string(),
  model: z.string(),
  seats: z.number().min(1).max(6),
  SOAT: z.string(),
  photo: z.string(),
});
export const rideSchema = z.object({
  id_driver: z.number().int().min(100000).max(999999),
  origin: z.string(),
  destination: z.string(),
  route: z.array(z.string()),
  departure: z.string().datetime(),
  available_seats: z.number().min(1).max(6),
  fee: z.number().positive(),
});

export const formatZodErrors = (errors) => {
  const formattedErrors = [];

  for (const key in errors) {
    if (errors[key]?._errors?.length) {
      // Formatea el mensaje para cada campo
      formattedErrors.push({ key: errors[key]._errors.join(", ") });
    }
  }

  return { validationErrors: formattedErrors };
};
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
