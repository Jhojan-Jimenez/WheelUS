import { z } from 'zod';
import { PatchInmutableAtributes } from '../errors/CustomErrors.js';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

export const userRegSchema = z.object({
  name: z
    .string()
    .min(1, 'Espacio requerido')
    .regex(/^[a-zA-Z\s]+$/, 'Debe contener solo letras')
    .trim(),
  lastname: z
    .string()
    .min(1, 'Espacio requerido')
    .regex(/^[a-zA-Z\s]+$/, 'Debe contener solo letras')
    .trim(),
  id: z
    .string()
    .length(6, 'Debe contener 6 numeros')
    .regex(/^\d{6}$/, 'Debe contener solo numeros'),
  email: z
    .string()
    .email()
    .regex(
      /@unisabana\.edu\.co$/,
      'Debe ser un correo institucional de la Universidad de la Sabana'
    ),
  password: z.string().min(6, 'Debe contener por lo menos 6 caracteres'),
  contact: z.string().regex(/^\d/, 'Debe contener solo numeros').min(10),
  photo: z
    .any()
    .optional()
    .refine((file) => !file || file.size <= 4194304, {
      message: 'El archivo no debe pesar más de 4MB',
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
  plate: z
    .string()
    .regex(/^([A-Z]{3})(\d{3})$/, 'Debe contener 3 letras y 3 Numeros')
    .min(1, 'Espacio requerido'),
  brand: z.string().min(1, 'Espacio requerido'),
  model: z.string().min(1, 'Espacio requerido'),
  seats: z
    .string()
    .min(1, 'Espacio requerido')
    .regex(/^[1-6]$/)
    .transform((val) => Number(val)),
  soat: z
    .any()
    .refine(
      (fileList) =>
        !fileList || fileList.length === 0 || fileList.size <= 4194304,
      {
        message: 'La foto no debe pesar más de 4MB',
      }
    )
    .refine(
      (fileList) =>
        !fileList ||
        fileList.length === 0 ||
        ACCEPTED_IMAGE_TYPES.includes(fileList.mimetype),
      {
        message: 'La foto debe ser una imagen en formato (JPEG, PNG o JPG)',
      }
    ),
  vehiclePhoto: z
    .any()
    .refine(
      (fileList) =>
        !fileList || fileList.length === 0 || fileList.size <= 4194304,
      {
        message: 'La foto no debe pesar más de 4MB',
      }
    )
    .refine(
      (fileList) =>
        !fileList ||
        fileList.length === 0 ||
        ACCEPTED_IMAGE_TYPES.includes(fileList.mimetype),
      {
        message: 'La foto debe ser una imagen en formato (JPEG, PNG o JPG)',
      }
    ),
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
    .min(1, 'Espacio requerido')
    .regex(/^[a-zA-Z\s]+$/, 'Debe contener solo letras')
    .trim()
    .optional(),
  lastname: z
    .string()
    .min(1, 'Espacio requerido')
    .regex(/^[a-zA-Z\s]+$/, 'Debe contener solo letras')
    .trim()
    .optional(),
  contact: z
    .string()
    .regex(/^\d/, 'Debe contener solo numeros')
    .min(10)
    .optional(),
  photo: z
    .any()
    .optional()
    .refine((file) => !file || file.size <= 4194304, {
      message: 'El archivo no debe pesar más de 4MB',
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
    .refine((file) => !file || file.size <= 4194304, {
      message: 'El archivo no debe pesar más de 4MB',
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.mimetype), {
      message: 'El archivo debe ser una imagen PNG o JPG',
    }),
  vehiclePhoto: z
    .any()
    .optional()
    .refine((file) => !file || file.size <= 4194304, {
      message: 'El archivo no debe pesar más de 4MB',
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
export const validatePatchUserFields = (obj) => {
  const allowedAttributes = ['name', 'lastname', 'photo', 'contact'];
  const objectAttributes = Object.keys(obj);
  const invalidAttributes = objectAttributes.filter(
    (attr) => !allowedAttributes.includes(attr)
  );

  if (invalidAttributes.length > 0) {
    throw new PatchInmutableAtributes(
      `No puedes modificar o crear el atributo: ${invalidAttributes.join(', ')}`
    );
  }
};
export const validatePatchVehicleFields = (obj) => {
  const allowedAttributes = ['brand', 'model', 'photo', 'soat'];
  const objectAttributes = Object.keys(obj);
  const invalidAttributes = objectAttributes.filter(
    (attr) => !allowedAttributes.includes(attr)
  );

  if (invalidAttributes.length > 0) {
    throw new PatchInmutableAtributes(
      `No puedes modificar o crear el atributo: ${invalidAttributes.join(', ')}`
    );
  }
};
