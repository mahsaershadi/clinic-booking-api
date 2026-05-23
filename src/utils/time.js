const APPOINTMENT_DURATION_MS = 30 * 60 * 1000;
const CANCELLATION_WINDOW_MS = 2 * 60 * 60 * 1000;

export const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60 * 1000);
};

export const getAppointmentEndTime = (startTime) => {
  return new Date(startTime.getTime() + APPOINTMENT_DURATION_MS);
};

export const isValidSlotMinutes = (date) => {
  const minutes = date.getMinutes();
  return minutes === 0 || minutes === 30;
};

export const isFutureDateTime = (date) => {
  return date.getTime() > Date.now();
};

export const canCancelAppointment = (startTime) => {
  return startTime.getTime() - Date.now() >= CANCELLATION_WINDOW_MS;
};

export const parseTimeToMinutes = (timeValue) => {
  const [hours, minutes] = timeValue.split(':').map(Number);
  return hours * 60 + minutes;
};

export const getTimeMinutesFromDate = (date) => {
  return date.getHours() * 60 + date.getMinutes();
};

export const isWithinWorkingHours = (appointmentStart, workStart, workEnd) => {
  const startMinutes = getTimeMinutesFromDate(appointmentStart);
  const endMinutes = startMinutes + 30;
  const workStartMinutes = parseTimeToMinutes(workStart);
  const workEndMinutes = parseTimeToMinutes(workEnd);

  return startMinutes >= workStartMinutes && endMinutes <= workEndMinutes;
};
