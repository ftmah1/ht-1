import express, { Request, Response } from "express";
import { ingestFormService } from "./forms/services/ingestFormService";
import { retryIngestService } from "./forms/services/retryIngestService";
import { statusMap } from "./responseBody";

const app = express();

app.use(express.json());

app.post("/ingest", async (req: Request, res: Response) => {
  const result = await ingestFormService(req.body);
  return res.status(statusMap[result.outcome]).json({ outcome: result.outcome });
});

app.post(
  "/retry/forms/:applicationRef",
  async (req: Request<{ applicationRef: string }>, res: Response) => {
    const result = await retryIngestService(req.params.applicationRef);
    return res.status(statusMap[result.outcome]).json({ outcome: result.outcome });
  },
);

export default app;
