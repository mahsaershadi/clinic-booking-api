import * as doctorsService from './doctors.service.js';

export const listDoctors = async (_req, res) => {
  const doctors = await doctorsService.getAllDoctors();

  res.status(200).json({
    success: true,
    data: doctors,
  });
};

export const createDoctor = async (req, res) => {
  const doctor = await doctorsService.createDoctor(req.body);

  res.status(201).json({
    success: true,
    message: 'Doctor created successfully',
    data: doctor,
  });
};
