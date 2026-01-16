const mongoose = require("mongoose");
const db = require("../test-db");

const Medication = require("../../models/Medication");
const medicationController = require("../../controllers/medicationController");

let res;

// mock response
beforeEach(() => {
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
});

beforeAll(async () => {
  await db.connect();
});

afterEach(async () => {
  await db.clearDatabase();
  jest.clearAllMocks();
});

afterAll(async () => {
  await db.closeDatabase();
});


// --------------------------------------------------------
// CREATE
// --------------------------------------------------------
test("should create medication successfully", async () => {
  const req = {
    body: {
      userId: "123",
      drugName: "Paracetamol",
      dosage: "500mg",
      type: "Tablet",
      time: ["08:00"],
    },
  };

  await medicationController.addMedication(req, res);

  expect(res.json).toHaveBeenCalledWith({
    message: "Medication saved successfully ✅",
  });

  const meds = await Medication.find();
  expect(meds.length).toBe(1);
});


// --------------------------------------------------------
// GET MEDICATIONS
// --------------------------------------------------------
test("should return medications for a user", async () => {
  await Medication.create({
    userId: "user1",
    drugName: "Ibuprofen",
    dosage: "200mg",
    type: "Capsule",
    time: ["09:00"],
  });

  const req = { params: { userId: "user1" } };

  await medicationController.getMedications(req, res);

  expect(res.json.mock.calls[0][0].medications.length).toBe(1);
});


// --------------------------------------------------------
// UPDATE
// --------------------------------------------------------
test("should update medication fields", async () => {
  const med = await Medication.create({
    userId: "u2",
    drugName: "Vitamin D",
    dosage: "10mg",
    type: "Tablet",
    time: ["07:00"],
  });

  const req = {
    params: { id: med._id.toString() },
    body: { dosage: "20mg" },
  };

  await medicationController.updateMedication(req, res);

  expect(res.json).toHaveBeenCalledWith({
    message: "Medication updated successfully ✅",
    medication: expect.any(Object),
  });

  const updated = await Medication.findById(med._id);
  expect(updated.dosage).toBe("20mg");
});


// --------------------------------------------------------
// UPDATE NOT FOUND
// --------------------------------------------------------
test("should return 404 for non-existing medication update", async () => {
  const req = {
    params: { id: new mongoose.Types.ObjectId().toString() },
    body: { dosage: "X" },
  };

  await medicationController.updateMedication(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    error: "Medication not found ❌",
  });
});


// --------------------------------------------------------
// DELETE
// --------------------------------------------------------
test("should delete medication", async () => {
  const med = await Medication.create({
    userId: "u3",
    drugName: "Aspirin",
    dosage: "100mg",
    type: "Tablet",
    time: ["06:00"],
  });

  const req = { params: { id: med._id.toString() } };

  await medicationController.deleteMedication(req, res);

  expect(res.json).toHaveBeenCalledWith({
    message: "Medication deleted ✅",
  });

  const remaining = await Medication.find();
  expect(remaining.length).toBe(0);
});
