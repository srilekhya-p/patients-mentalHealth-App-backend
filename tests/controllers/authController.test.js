const { connect, closeDatabase, clearDatabase } = require("../test-db");
const authController = require("../../controllers/authController");
const User = require("../../models/User");
const bcrypt = require("bcrypt");

// -------------------- MOCK req & res --------------------
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Auth Controller", () => {

  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  // -------------------------------------------------------
  // TEST: REGISTER USER
  // -------------------------------------------------------
  test("should register user successfully", async () => {
    const req = {
      body: {
        name: "Sri",
        email: "sri@test.com",
        password: "password123",
        dob: "1999-03-14",
        height: 165,
        weight: 55
      }
    };

    const res = mockResponse();

    await authController.registerUser(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "User registered successfully"
      })
    );

    const user = await User.findOne({ email: "sri@test.com" });
    expect(user).toBeTruthy();
  });

  // -------------------------------------------------------
  // TEST: USER ALREADY EXISTS
  // -------------------------------------------------------
  test("should return error if user already exists", async () => {
    await User.create({
      name: "Sri",
      email: "sri@test.com",
      password: "hashed"
    });

    const req = {
      body: {
        name: "Sri",
        email: "sri@test.com",
        password: "password123"
      }
    };
    const res = mockResponse();

    await authController.registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "User already exists" })
    );
  });

  // -------------------------------------------------------
  // TEST: LOGIN USER
  // -------------------------------------------------------
  test("should login user with correct credentials", async () => {
    const hashed = await bcrypt.hash("password123", 10);

    await User.create({
      name: "Sri",
      email: "login@test.com",
      password: hashed
    });

    const req = {
      body: {
        email: "login@test.com",
        password: "password123"
      }
    };
    const res = mockResponse();

    await authController.loginUser(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Login successful",
        token: expect.any(String),
        userId: expect.any(String)
      })
    );
  });

  // -------------------------------------------------------
  // TEST: INVALID PASSWORD
  // -------------------------------------------------------
  test("should return error for invalid password", async () => {
    const hashed = await bcrypt.hash("password123", 10);

    await User.create({
      name: "Sri",
      email: "wrongpass@test.com",
      password: hashed
    });

    const req = {
      body: {
        email: "wrongpass@test.com",
        password: "wrong"
      }
    };
    const res = mockResponse();

    await authController.loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Invalid password" })
    );
  });

});
