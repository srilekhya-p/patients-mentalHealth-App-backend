const mongoose = require("mongoose");
const db = require("../test-db");

const User = require("../../models/User");
const profileController = require("../../controllers/profileController");

let res;

// Mock Response
beforeEach(() => {
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
});

// Connect / Cleanup / Close
beforeAll(async () => {
  await db.connect();
 // Suppress console.error during tests
  jest.spyOn(console, "error").mockImplementation(() => {});

});

afterEach(async () => {
  await db.clearDatabase();
  jest.clearAllMocks();
});

afterAll(async () => {
  await db.closeDatabase();
});


// ====================================================================
// GET USER PROFILE
// ====================================================================
test("should return full user profile when user exists", async () => {
  const user = await User.create({
    name: "Sri Lekhya",
    email: "sri@example.com",
    dob: "1999-03-14",
    height: 165,
    weight: 60,
    profileImage: "image123.png",
  });

  const req = { params: { userId: user._id.toString() } };

  await profileController.getUserProfile(req, res);

  expect(res.json).toHaveBeenCalledWith({
    user: expect.objectContaining({
      name: "Sri Lekhya",
      email: "sri@example.com",
      dob: "1999-03-14",
      height: 165,
      weight: 60,
      profileImage: "image123.png",
    }),
  });
});


// ====================================================================
// USER NOT FOUND
// ====================================================================
test("should return 404 when user is not found", async () => {
  const req = {
    params: { userId: new mongoose.Types.ObjectId().toString() },
  };

  await profileController.getUserProfile(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
});


// ====================================================================
// INTERNAL SERVER ERROR
// ====================================================================
test("should return 500 on internal server error", async () => {
  // Force a crashing error by mocking findById
  jest.spyOn(User, "findById").mockImplementation(() => {
    throw new Error("Database crash");
  });

  const req = {
    params: { userId: new mongoose.Types.ObjectId().toString() },
  };

  await profileController.getUserProfile(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    error: "Failed to load user details",
  });
});
