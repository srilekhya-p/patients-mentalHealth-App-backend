// tests/controllers/appointmentController.test.js
const mongoose = require('mongoose');
const httpMocks = require('node-mocks-http');
const Appointment = require('../../models/Appointment');
const controller = require('../../controllers/appointmentController');
const db = require('../test-db');

jest.setTimeout(30000);

beforeAll(async () => {
  await db.connect();
  jest.spyOn(console, 'error').mockImplementation(() => {}); // suppress console.error
});

afterAll(async () => {
  await db.closeDatabase();
  console.error.mockRestore();
});

afterEach(async () => {
  await db.clearDatabase();
});

describe('Appointment Controller Unit Tests', () => {

  test('createAppointment: should create appointment successfully', async () => {
    const req = httpMocks.createRequest({
      body: {
        userId: "123",
        specialization: "Cardiology",
        date: "2025-12-01",
        time: "10:00 AM",
        notes: "Checkup"
      }
    });
    const res = httpMocks.createResponse();

    await controller.createAppointment(req, res);

    expect(res.statusCode).toBe(201);
    const data = res._getJSONData();
    expect(data.message).toBe('Appointment created');
    expect(data.appointment.userId).toBe('123');
  });

  test('createAppointment: should return 500 when required fields missing (validation fail)', async () => {
    const req = httpMocks.createRequest({
      body: { userId: "123" } // Missing date, time, specialization
    });
    const res = httpMocks.createResponse();

    await controller.createAppointment(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Failed to create appointment' });
  });

  test('getAppointmentsForUser: should return all appointments for a user', async () => {
    await Appointment.create([
      { userId: "123", specialization: "Dentist", date: "2025-12-01", time: "09:00 AM" },
      { userId: "123", specialization: "Cardio", date: "2025-12-02", time: "10:00 AM" }
    ]);

    const req = httpMocks.createRequest({ params: { userId: "123" } });
    const res = httpMocks.createResponse();

    await controller.getAppointmentsForUser(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.appointments.length).toBe(2);
  });

  test('updateAppointment: should return 404 if appointment not found', async () => {
    const req = httpMocks.createRequest({
      params: { id: new mongoose.Types.ObjectId() },
      body: { notes: "Updated notes" }
    });
    const res = httpMocks.createResponse();

    await controller.updateAppointment(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: 'Appointment not found' });
  });

  test('deleteAppointment: should delete appointment successfully', async () => {
    const appointment = await Appointment.create({
      userId: "123",
      specialization: "Dermatology",
      date: "2025-12-05",
      time: "11:00 AM"
    });

    const req = httpMocks.createRequest({ params: { id: appointment._id } });
    const res = httpMocks.createResponse();

    await controller.deleteAppointment(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ message: 'Appointment deleted' });

    const deleted = await Appointment.findById(appointment._id);
    expect(deleted).toBeNull();
  });

});