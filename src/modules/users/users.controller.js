import * as usersService from './users.service.js';

export const listUsers = async (_req, res) => {
  const users = await usersService.getAllUsers();

  res.status(200).json({
    success: true,
    data: users,
  });
};
