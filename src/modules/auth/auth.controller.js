import * as authService from './auth.service.js';

//signing up
export const register = async (req, res) => {
  const data = await authService.registerPatient(req.body);

  res.status(201).json({
    success: true,
    message: 'Patient registered successfully',
    data,
  });
};

//logging in
export const login = async (req, res) => {
  const data = await authService.login(req.body);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data,
  });
};
