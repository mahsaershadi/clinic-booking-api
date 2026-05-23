import * as appointmentsService from './appointments.service.js';

export const createAppointment = async (req, res) => {
  const appointment = await appointmentsService.createAppointment(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully',
    data: appointment,
  });
};

export const getMyAppointments = async (req, res) => {
  const appointments = await appointmentsService.getMyAppointments(req.user);

  res.status(200).json({
    success: true,
    data: appointments,
  });
};

export const cancelAppointment = async (req, res) => {
  const appointment = await appointmentsService.cancelAppointment(
    req.params.id,
    req.user
  );

  res.status(200).json({
    success: true,
    message: 'Appointment cancelled successfully',
    data: appointment,
  });
};

export const completeAppointment = async (req, res) => {
  const appointment = await appointmentsService.completeAppointment(
    req.params.id,
    req.user
  );

  res.status(200).json({
    success: true,
    message: 'Appointment marked as completed',
    data: appointment,
  });
};
