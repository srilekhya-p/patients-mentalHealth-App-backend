// postController.test.js
const mongoose = require("mongoose");
const db = require("../test-db");

const Post = require("../../models/post");
const postController = require("../../controllers/postController");

// ⭐️ MOCK THE MODERATION MODULE ⭐️
// We need to mock the external dependency (moderation) before importing the controller
const moderation = require('../../util/moderation');
jest.mock('../../util/moderation'); // Jest handles mocking the file path

let res;

// -----------------------------
// Mock Response Before Each Test
// -----------------------------
beforeEach(() => {
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
});

// Connect / Clean / Close DB
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


// ======================================================
// CREATE POST
// ======================================================

// ---------------------------------
// MODERATION TESTS for createPost
// ---------------------------------
test("should block post and return 403 if content is unsafe", async () => {
  // 1. Mock the moderation function to return an UNSAFE result
  moderation.isContentSafe.mockResolvedValue({
    isSafe: false,
    reasoning: "Contains hate speech.",
    harmCategory: "HATE_SPEECH",
  });

  const req = {
    body: { userName: "TrollUser", message: "Everyone who disagrees with me is an idiot and should be banned from the internet!" },
  };

  await postController.createPost(req, res);

  // 2. Assert the controller blocked the post
  expect(moderation.isContentSafe).toHaveBeenCalledWith(req.body.message);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({
    message: "Content was flagged as unsafe. Please revise your post according to community guidelines.",
    blockedReason: "HATE_SPEECH",
  });

  // 3. Assert the post was NOT saved to the database
  const posts = await Post.find();
  expect(posts.length).toBe(0);
});

test("should create a post successfully if moderation passes", async () => {
  // 1. Mock the moderation function to return a SAFE result
  moderation.isContentSafe.mockResolvedValue({
    isSafe: true,
    reasoning: "Content is supportive and on-topic.",
    harmCategory: "NONE",
  });

  const req = {
    body: { userName: "Sri", message: "Hello world!" },
  };

  await postController.createPost(req, res);

  // 2. Assert the moderation was called and the controller continued
  expect(moderation.isContentSafe).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      userName: "Sri",
      message: "Hello world!",
    })
  );

  const posts = await Post.find();
  expect(posts.length).toBe(1);
});
// ---------------------------------

test("should return 400 if userName or message missing on create", async () => {
  const req = { body: { userName: "" } };

  await postController.createPost(req, res);

  expect(moderation.isContentSafe).not.toHaveBeenCalled(); // Should fail before moderation check
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    error: "Missing userName or message",
  });
});


// ======================================================
// GET POSTS (No moderation needed here)
// ======================================================
test("should fetch all posts", async () => {
  await Post.create({ userName: "A", message: "One" });
  await Post.create({ userName: "B", message: "Two" });

  const req = {};

  await postController.getPosts(req, res);

  const result = res.json.mock.calls[0][0];
  expect(result.length).toBe(2);
});


// ======================================================
// REPLY TO POST
// ======================================================

// ---------------------------------
// MODERATION TESTS for replyToPost
// ---------------------------------
test("should block reply and return 403 if content is unsafe", async () => {
  const post = await Post.create({
    userName: "User1",
    message: "Original post",
  });

  // 1. Mock the moderation function to return an UNSAFE result
  moderation.isContentSafe.mockResolvedValue({
    isSafe: false,
    reasoning: "Contains self-harm encouragement.",
    harmCategory: "SELF_HARM",
  });

  const req = {
    params: { postId: post._id.toString() },
    body: { userName: "UnsafeUser", message: "I feel so hopeless and I am going to end it all tonight." },
  };

  await postController.replyToPost(req, res);

  // 2. Assert the controller blocked the reply
  expect(moderation.isContentSafe).toHaveBeenCalledWith(req.body.message);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({
    message: "Content was flagged as unsafe. Please revise your post according to community guidelines.",
    blockedReason: "SELF_HARM",
  });

  // 3. Assert the reply was NOT saved to the database
  const updatedPost = await Post.findById(post._id);
  expect(updatedPost.replies.length).toBe(0);
});

test("should add a reply to a post successfully if moderation passes", async () => {
  const post = await Post.create({
    userName: "User1",
    message: "Original post",
  });

  // 1. Mock the moderation function to return a SAFE result
  moderation.isContentSafe.mockResolvedValue({
    isSafe: true,
    reasoning: "Comment is supportive.",
    harmCategory: "NONE",
  });

  const req = {
    params: { postId: post._id.toString() },
    body: { userName: "Replier", message: "Nice and helpful comment!" },
  };

  await postController.replyToPost(req, res);

  // 2. Assert the moderation was called and the controller continued
  expect(moderation.isContentSafe).toHaveBeenCalled();
  const updatedPost = await Post.findById(post._id);

  expect(updatedPost.replies.length).toBe(1);
  expect(updatedPost.replies[0].message).toBe("Nice and helpful comment!");

  expect(res.status).toHaveBeenCalledWith(200);
});
// ---------------------------------

test("should return 400 if reply userName or message missing", async () => {
  const post = await Post.create({
    userName: "Sri",
    message: "Hi",
  });

  const req = {
    params: { postId: post._id.toString() },
    body: { userName: "" },
  };

  await postController.replyToPost(req, res);

  expect(moderation.isContentSafe).not.toHaveBeenCalled(); // Should fail before moderation check
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    error: "Missing userName or message",
  });
});


test("should return 404 if replying to non-existing post", async () => {
  // We don't need to mock moderation here, as the check for postId happens after moderation in your controller.
  // However, for consistency, let's assume moderation would pass if it were called.
  moderation.isContentSafe.mockResolvedValue({ isSafe: true, reasoning: "Safe.", harmCategory: "NONE" });

  const req = {
    params: { postId: new mongoose.Types.ObjectId().toString() },
    body: { userName: "X", message: "Hello" },
  };

  await postController.replyToPost(req, res);

  expect(moderation.isContentSafe).toHaveBeenCalled(); // Moderation is called first in your controller
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "Post not found" });
});