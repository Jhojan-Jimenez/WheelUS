import { z } from 'zod';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

export const userRegSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z]+$/, 'Must Be a String')
    .trim(),
  lastname: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z]+$/, 'Must Be a String')
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
      message: 'El archivo no debe pesar más de 1MB',
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.mimetype), {
      message: 'El archivo debe ser una imagen PNG o JPG',
    }),
});

export const vehicleSchema = z.object({
  id_driver: z
    .string()
    .regex(/^\d{6}$/)
    .length(6),
  plate: z.string().regex(/^([A-Z]{3})(\d{3})$/),
  brand: z.string(),
  model: z.string(),
  seats: z
    .string()
    .regex(/^[1-6]$/)
    .transform((val) => Number(val)),
  soat: z
    .any()
    .refine((file) => file, {
      message: 'El SOAT es obligatorio',
    })
    .refine((file) => !file || file.size <= 1048576, {
      message: 'El archivo no debe pesar más de 1MB',
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.mimetype), {
      message: 'El archivo debe ser una imagen PNG o JPG',
    }),
  vehiclePhoto: z
    .any()
    .refine((file) => file, {
      message: 'La foto del vehículo es obligatoria',
    })
    .refine((file) => !file || file.size <= 1048576, {
      message: 'El archivo no debe pesar más de 1MB',
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.mimetype), {
      message: 'El archivo debe ser una imagen PNG o JPG',
    }),
});
export const rideSchema = z.object({
  vehicle_plate: z
    .string()
    .regex(
      /^([A-Z]{3})(\d{3})$/,
      'Debe contener 3 letras en mayuscula y 3 numeros'
    ),
  origin: z.string(),
  destination: z.string(),
  route: z.array(z.string()),
  departure: z.string().datetime(),
  available_seats: z.number().min(1).max(6),
  fee: z.number().positive(),
});
export const userPatchSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z]+$/, 'Must Be a String')
    .trim()
    .optional(),
  lastname: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z]+$/, 'Must Be a String')
    .trim()
    .optional(),
  contact: z.string().regex(/^\d/).min(10).optional(),
  photo: z
    .any()
    .optional()
    .refine((file) => !file || file.size <= 1048576, {
      message: 'El archivo no debe pesar más de 1MB',
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.mimetype), {
      message: 'El archivo debe ser una imagen PNG o JPG',
    }),
});
export const vehiclePatchSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  soat: z
    .any()
    .optional()
    .refine((file) => !file || file.size <= 1048576, {
      message: 'El archivo no debe pesar más de 1MB',
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.mimetype), {
      message: 'El archivo debe ser una imagen PNG o JPG',
    }),
  vehiclePhoto: z
    .any()
    .optional()
    .refine((file) => !file || file.size <= 1048576, {
      message: 'El archivo no debe pesar más de 1MB',
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.mimetype), {
      message: 'El archivo debe ser una imagen PNG o JPG',
    }),
});

export const formatZodErrors = (errors) => {
  const formattedErrors = [];

  for (const key in errors) {
    if (errors[key]?._errors?.length) {
      formattedErrors.push({ key: errors[key]._errors.join(', ') });
    }
  }

  return { validationErrors: formattedErrors };
};
export const validatePatchUser = (obj) => {
  const allowedAttributes = ['name', 'lastname', 'photo', 'contact'];
  const objectAttributes = Object.keys(obj);
  const invalidAttributes = objectAttributes.filter(
    (attr) => !allowedAttributes.includes(attr)
  );

  if (invalidAttributes.length > 0) {
    throw new Error(
      `No puedes modificar o crear el atributo: ${invalidAttributes.join(', ')}`
    );
  }
};
export const validatePatchVehicle = (obj) => {
  const allowedAttributes = ['brand', 'model', 'photo', 'soat'];
  const objectAttributes = Object.keys(obj);
  const invalidAttributes = objectAttributes.filter(
    (attr) => !allowedAttributes.includes(attr)
  );

  if (invalidAttributes.length > 0) {
    throw new Error(
      `No puedes modificar o crear el atributo: ${invalidAttributes.join(', ')}`
    );
  }
};
