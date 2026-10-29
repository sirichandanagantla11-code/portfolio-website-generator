require("dotenv").config();

const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  );
}

function databaseReady(res) {
  if (!supabase) {
    res.status(503).json({
      error: "Database is not configured. Copy .env.example to .env and add your Supabase URL and server-side secret key."
    });
    return false;
  }
  return true;
}

function validatePortfolio(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Invalid portfolio data.";
  }

  for (const field of ["name", "title"]) {
    if (typeof data[field] !== "string" || !data[field].trim()) {
      return `${field} is required.`;
    }
  }

  for (const field of ["name", "title", "email", "bio", "photo", "linkedin", "github"]) {
    if (data[field] !== undefined &&
        (typeof data[field] !== "string" || data[field].length > 5000)) {
      return `Invalid ${field}.`;
    }
  }

  if (data.name.trim().length > 100 || data.title.trim().length > 150) {
    return "Name or title is too long.";
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return "Please provide a valid email address.";
  }

  for (const field of ["skills", "education", "projects"]) {
    if (data[field] !== undefined && !Array.isArray(data[field])) {
      return `${field} must be a list.`;
    }
    if (Array.isArray(data[field]) && data[field].length > 50) {
      return `Too many ${field} entries.`;
    }
  }

  return null;
}

function validId(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

app.post("/api/portfolios", async (req, res) => {
  if (!databaseReady(res)) return;
  try {
    const data = req.body;
    const validationError = validatePortfolio(data);
    if (validationError) return res.status(400).json({ error: validationError });

    const { data: saved, error } = await supabase
      .from("portfolios")
      .insert({
        name: data.name.trim(),
        email: data.email || null,
        title: data.title.trim(),
        portfolio_data: data
      })
      .select("id, name, email, title, created_at")
      .single();

    if (error) throw error;
    res.status(201).json({ message: "Portfolio saved successfully!", portfolio: saved });
  } catch (error) {
    console.error("Save error:", error.message);
    res.status(500).json({ error: "Unable to save portfolio. Check the database setup." });
  }
});

app.get("/api/portfolios", async (req, res) => {
  if (!databaseReady(res)) return;
  try {
    const { data, error } = await supabase
      .from("portfolios")
      .select("id, name, email, title, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("List error:", error.message);
    res.status(500).json({ error: "Unable to load portfolios." });
  }
});

app.get("/api/portfolios/:id", async (req, res) => {
  if (!databaseReady(res)) return;
  if (!validId(req.params.id)) return res.status(400).json({ error: "Invalid portfolio ID." });

  try {
    const { data, error } = await supabase
      .from("portfolios")
      .select("id, name, email, title, portfolio_data, created_at")
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Portfolio not found." });
    res.json(data);
  } catch (error) {
    console.error("Read error:", error.message);
    res.status(500).json({ error: "Unable to load portfolio." });
  }
});

app.delete("/api/portfolios/:id", async (req, res) => {
  if (!databaseReady(res)) return;
  if (!validId(req.params.id)) return res.status(400).json({ error: "Invalid portfolio ID." });

  try {
    const { data, error } = await supabase
      .from("portfolios")
      .delete()
      .eq("id", req.params.id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Portfolio not found." });
    res.json({ message: "Portfolio deleted successfully." });
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({ error: "Unable to delete portfolio." });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Portfolio Generator running at http://localhost:${PORT}`);
});
