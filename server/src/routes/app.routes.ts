import { authenticateUser } from "@/middlewares/auth.middleware";
import { Router } from "express";
import { checkXTask, checkDiscordTask } from "@/controllers/app.controller";
import { discordCallback } from "@/controllers/auth.controller";

const router = Router();

router
  .post("/check-x/:id", authenticateUser, checkXTask)
  .post("/check-discord/:id", authenticateUser, checkDiscordTask)
  .get("/auth/discord/callback", authenticateUser, discordCallback);

export default router;