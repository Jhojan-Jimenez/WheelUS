import { z } from "zod";

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
//   id: z.number().int().positive().min(100000).max(999999),
  email: z
    .string()
    .email()
    .regex(/@unisabana\.edu\.co$/),
  password: z.string().min(6),
//   contact: z.number().int().positive().min(10000000).max(9999999999),
  photo: z.string().optional(),
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
      formattedErrors.push(
        `${capitalizeFirstLetter(key)}: ${errors[key]._errors.join(", ")}`
      );
    }
  }

  return { message: { incorrect_information: formattedErrors } };
};
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
