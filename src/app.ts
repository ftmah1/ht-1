import express, { Request, Response } from "express";
import { ingestFormService } from "./forms/services/ingestFormService";
import { retryIngestService } from "./forms/services/retryIngestService";
import { statusMap } from "./shared/responseBody";
import { createDependencies } from "./shared/dependencies";

const app = express();

app.use(express.json());

const deps = createDependencies();

app.post("/ingest", async (req: Request, res: Response) => {
  const result = await ingestFormService(req.body, deps);
  return res.status(statusMap[result.outcome]).json({ outcome: result.outcome });
});

app.post("/retry/forms/:id", async (req: Request<{ id: string }>, res: Response) => {
  const result = await retryIngestService(req.params.id, deps);
  return res.status(statusMap[result.outcome]).json({ outcome: result.outcome });
});

export default app;
