export class UserNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UserNotFoundError';
  }
}
export class PatchInmutableAtributes extends Error {
  constructor(message) {
    super(message);
    this.name = 'PatchInmutableAtributes';
  }
}
export const validationErrors = (validationResult, res) => {
  if (!validationResult.success) {
    return res.status(400).json({
      message: 'Error en la validación de datos',
      errors: validationResult.error.format(),
    });
  }
  return true;
};
