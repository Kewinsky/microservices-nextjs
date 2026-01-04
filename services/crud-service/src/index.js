import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { body, param, validationResult } from "express-validator";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";
import { authenticateToken } from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  logger.error(
    "Missing required environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

app.use(cors());
app.use(express.json());
app.use(logger.requestLogger.bind(logger));

const createItemValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 }),
  body("description").optional().trim().isLength({ max: 1000 }),
];

const updateItemValidation = [
  param("id").isUUID().withMessage("Invalid ID format"),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 }),
  body("description").optional().trim().isLength({ max: 1000 }),
];

/**
 * POST /api/items
 * Create a new record
 */
app.post(
  "/api/items",
  authenticateToken,
  createItemValidation,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Invalid input data",
          details: errors.array(),
        });
      }

      const { title, description } = req.body;
      const userId = req.user.id;

      const { data, error } = await supabase
        .from("items")
        .insert({
          title,
          description: description || null,
          user_id: userId,
        })
        .select()
        .single();

      if (error) {
        logger.error("Error creating record:", error);
        return res.status(500).json({ error: "Error creating record" });
      }

      logger.info(`Record created by user ${userId}`);

      res.status(201).json({
        message: "Record created successfully",
        item: data,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/items
 * Get all user records
 */
app.get("/api/items", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const { data, error, count } = await supabase
      .from("items")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      logger.error("Error fetching records:", error);
      return res.status(500).json({ error: "Error fetching records" });
    }

    res.json({
      items: data || [],
      total: count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/items/:id
 * Get a single record
 */
app.get(
  "/api/items/:id",
  authenticateToken,
  param("id").isUUID(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Invalid ID format",
          details: errors.array(),
        });
      }

      const { id } = req.params;
      const userId = req.user.id;

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return res.status(404).json({ error: "Record not found" });
        }
        logger.error("Error fetching record:", error);
        return res.status(500).json({ error: "Error fetching record" });
      }

      res.json({ item: data });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/items/:id
 * Update a record
 */
app.put(
  "/api/items/:id",
  authenticateToken,
  updateItemValidation,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Invalid input data",
          details: errors.array(),
        });
      }

      const { id } = req.params;
      const { title, description } = req.body;
      const userId = req.user.id;

      const { data, error } = await supabase
        .from("items")
        .update({
          title,
          description: description || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return res.status(404).json({ error: "Record not found" });
        }
        logger.error("Error updating record:", error);
        return res.status(500).json({ error: "Error updating record" });
      }

      if (!data) {
        return res
          .status(404)
          .json({ error: "Record not found or insufficient permissions" });
      }

      logger.info(`Record ${id} updated by user ${userId}`);

      res.json({
        message: "Record updated successfully",
        item: data,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/items/:id
 * Delete a record
 */
app.delete(
  "/api/items/:id",
  authenticateToken,
  param("id").isUUID(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Invalid ID format",
          details: errors.array(),
        });
      }

      const { id } = req.params;
      const userId = req.user.id;

      const { data, error } = await supabase
        .from("items")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        logger.error("Error deleting record:", error);
        return res.status(500).json({ error: "Error deleting record" });
      }

      if (!data) {
        return res
          .status(404)
          .json({ error: "Record not found or insufficient permissions" });
      }

      logger.info(`Record ${id} deleted by user ${userId}`);

      res.json({ message: "Record deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /health
 * Health check endpoint
 */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "crud-service",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`CRUD Service running on port ${PORT}`);
});
