import { AppError } from '../utils/AppError.js';

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    return next(result.error);
  }

  if (result.data.body !== undefined) {
    req.body = result.data.body;
  }
  if (result.data.query !== undefined) {
    req.query = result.data.query;
  }
  if (result.data.params !== undefined) {
    req.params = result.data.params;
  }

  next();
};

//validate for body
export const validateBody = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return next(result.error);
  }

  req.body = result.data;
  next();
};

//validate for params
export const validateParams = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.params);

  if (!result.success) {
    return next(result.error);
  }

  req.params = result.data;
  next();
};
