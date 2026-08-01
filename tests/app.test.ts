import request from "supertest";
import app from "../src/app";

describe("POST /ingest", () => {
  it("should return 400", async () => {
    const response = await request(app).post("/ingest");
    expect(response.status).toBe(400);
  });
});
