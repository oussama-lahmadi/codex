import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import open from "open";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../web")));

app.post("/api/message", (req, res) => {
  res.json({ reply: "Not implemented" });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Codex web interface running at http://localhost:${port}/`);
  open(`http://localhost:${port}/`).catch(() => {});
});
