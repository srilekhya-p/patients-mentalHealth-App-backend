const mongoose = require('mongoose');
const MedicalHistory = require('../../models/MedicalHistory');
const controller = require('../../controllers/medicalHistoryController');
const httpMocks = require('node-mocks-http');
const { s3 } = require('../../S3Setup'); 
const db = require('../test-db');  // ✅ import test-db.js

jest.mock('../../S3Setup', () => ({
  s3: {
    send: jest.fn(),
  },
}));

jest.setTimeout(30000);

// --------------------------------------------
// DB SETUP USING test-db.js
// --------------------------------------------
beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.closeDatabase();
});

afterEach(async () => {
  jest.clearAllMocks();
  await db.clearDatabase();
});

// --------------------------------------------
// TEST SUITE
// --------------------------------------------
describe('MedicalHistory Controller', () => {

  test('uploadHistory: should return 400 if title or userId missing', async () => {
    const req = httpMocks.createRequest({ body: {} });
    const res = httpMocks.createResponse();

    await controller.uploadHistory(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'Missing title or userId' });
  });

  test('uploadHistory: should return 400 if file missing', async () => {
    const req = httpMocks.createRequest({ body: { title: 'Test', userId: '123' } });
    const res = httpMocks.createResponse();

    await controller.uploadHistory(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'File not uploaded' });
  });

  test('uploadHistory: should save file successfully', async () => {
    const req = httpMocks.createRequest({
      body: { title: 'Test File', userId: '123' },
      file: { location: 'http://mock-url/file.pdf' },
    });
    const res = httpMocks.createResponse();

    await controller.uploadHistory(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.message).toBe('Uploaded successfully');
    expect(data.fileUrl).toBe('http://mock-url/file.pdf');

    const dbEntry = await MedicalHistory.findOne({ userId: '123' });
    expect(dbEntry.title).toBe('Test File');
  });

  test('getFiles: should return files for user', async () => {
    await MedicalHistory.create({ userId: '123', title: 'File1', fileUrl: 'url1' });
    await MedicalHistory.create({ userId: '123', title: 'File2', fileUrl: 'url2' });

    const req = httpMocks.createRequest({ params: { userId: '123' } });
    const res = httpMocks.createResponse();

    await controller.getFiles(req, res);

    expect(res.statusCode).toBe(200);
    const files = res._getJSONData().files;
    expect(files.length).toBe(2);
    expect(files[0].title).toBe('File2'); // sorted descending
  });

  test('deleteFile: should delete file successfully', async () => {
    const file = await MedicalHistory.create({
      userId: '123',
      title: 'File1',
      fileUrl: 'http://mock/file.pdf'
    });

    s3.send.mockResolvedValue({}); // mock S3 delete

    const req = httpMocks.createRequest({ params: { fileId: file._id } });
    const res = httpMocks.createResponse();

    await controller.deleteFile(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ message: 'File deleted successfully' });

    const dbFile = await MedicalHistory.findById(file._id);
    expect(dbFile).toBeNull();
  });

});