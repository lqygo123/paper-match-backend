const { Appointment, Branch, Timetable, Client } = require("../../models");

const deleteOldAppointment = async (appointmentId) => {
  const oldAppointment = await Appointment.findById(appointmentId);
  const oldBranch = await Branch.findById(oldAppointment.clientFillIn.branchId);
  const oldTimetable = await Timetable.findById(
    oldBranch.timetable.get(oldAppointment.clientFillIn.date)
  );
  const oldAppointments =
    oldTimetable[
      oldAppointment.clientFillIn.period === "morning"
        ? "morningAppointments"
        : "afternoonAppointments"
    ];
  oldAppointments.splice(oldAppointments.indexOf(oldAppointment._id), 1);
  await oldTimetable.save();
};

module.exports = {
  deleteOldAppointment,
};
