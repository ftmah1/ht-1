import app from "./app";
import { sweepPendingEmail } from "./sweepPendingEmail";
import { dependencies } from "./dependencies";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Schedule the sweepPendingEmail function to run every 60 seconds
setInterval(() => sweepPendingEmail(dependencies.formRepository), 60000);