import type { Express, Request, Response } from "express";
function getClientIp(req: Request): string | null {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
        return forwarded.split(",")[0]?.trim() || null;
    }
    if (Array.isArray(forwarded)) {
        return forwarded[0]?.split(",")[0]?.trim() || null;
    }
    return req.socket?.remoteAddress ?? null;
}
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { insertMessageSchema, insertProfileSchema, insertVisitSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only image files are allowed!"));
    }
});
export async function registerRoutes(app: Express): Promise<Server> {
    app.get("/api/profile", async (req: Request, res: Response) => {
        try {
            const profile = await storage.getProfile();
            if (!profile) {
                return res.status(404).json({ message: "Profile not found" });
            }
            res.json(profile);
        }
        catch (error) {
            console.error("Error fetching profile:", error);
            res.status(500).json({ message: "Failed to fetch profile" });
        }
    });
    app.patch("/api/profile", async (req: Request, res: Response) => {
        try {
            const result = insertProfileSchema.partial().safeParse(req.body);
            if (!result.success) {
                const errorMessage = fromZodError(result.error).message;
                return res.status(400).json({ message: errorMessage });
            }
            const updatedProfile = await storage.updateProfile(result.data);
            if (!updatedProfile) {
                return res.status(404).json({ message: "Profile not found" });
            }
            res.json(updatedProfile);
        }
        catch (error) {
            console.error("Error updating profile:", error);
            res.status(500).json({ message: "Failed to update profile" });
        }
    });
    app.post("/api/profile/image", upload.single("image"), async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No image file provided" });
            }
            const imageBuffer = req.file.buffer;
            const filename = req.file.originalname;
            const imagePath = await storage.updateProfileImage(imageBuffer, filename);
            res.json({ imagePath });
        }
        catch (error) {
            console.error("Error uploading profile image:", error);
            res.status(500).json({ message: "Failed to upload profile image" });
        }
    });
    app.get("/api/projects", async (req: Request, res: Response) => {
        try {
            const projects = await storage.getAllProjects();
            res.json(projects);
        }
        catch (error) {
            console.error("Error fetching projects:", error);
            res.status(500).json({ message: "Failed to fetch projects" });
        }
    });
    app.get("/api/projects/featured", async (req: Request, res: Response) => {
        try {
            const project = await storage.getFeaturedProject();
            if (!project) {
                return res.status(404).json({ message: "No featured project found" });
            }
            res.json(project);
        }
        catch (error) {
            console.error("Error fetching featured project:", error);
            res.status(500).json({ message: "Failed to fetch featured project" });
        }
    });
    app.post("/api/analytics/visit", async (req: Request, res: Response) => {
        try {
            const result = insertVisitSchema.safeParse({
                ...req.body,
                ipAddress: getClientIp(req),
            });
            if (!result.success) {
                const errorMessage = fromZodError(result.error).message;
                return res.status(400).json({ message: errorMessage });
            }
            const visit = await storage.recordVisit(result.data);
            res.status(201).json(visit);
        }
        catch (error) {
            console.error("Error recording visit:", error);
            res.status(500).json({ message: "Failed to record visit" });
        }
    });
    app.get("/api/analytics/stats", async (req: Request, res: Response) => {
        try {
            const range = req.query.range === "week" || req.query.range === "year" ? req.query.range : "month";
            const stats = await storage.getVisitStats(range);
            if (!stats) {
                return res.status(404).json({ message: "No stats found" });
            }
            res.json(stats);
        }
        catch (error) {
            console.error("Error fetching stats:", error);
            res.status(500).json({ message: "Failed to fetch stats" });
        }
    });
    app.get("/api/analytics/locations", async (req: Request, res: Response) => {
        try {
            const locations = await storage.getVisitsByLocation();
            res.json(locations);
        }
        catch (error) {
            console.error("Error fetching locations:", error);
            res.status(500).json({ message: "Failed to fetch locations" });
        }
    });
    app.get("/api/analytics/referrers", async (req: Request, res: Response) => {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            const referrers = await storage.getTopReferrers(limit);
            res.json(referrers);
        }
        catch (error) {
            console.error("Error fetching referrers:", error);
            res.status(500).json({ message: "Failed to fetch referrers" });
        }
    });
    app.post("/api/contact", async (req: Request, res: Response) => {
        try {
            const result = insertMessageSchema.safeParse(req.body);
            if (!result.success) {
                const errorMessage = fromZodError(result.error).message;
                return res.status(400).json({ message: errorMessage });
            }
            const message = await storage.createMessage(result.data);
            const { sendContactEmail } = await import('./emailService');
            const emailSent = await sendContactEmail(message);
            res.status(201).json({
                success: true,
                message: emailSent
                    ? "Message sent successfully. You'll receive a reply soon!"
                    : "Message saved successfully, but email notification failed.",
                id: message.id,
                emailSent
            });
        }
        catch (error) {
            console.error("Error submitting contact form:", error);
            res.status(500).json({ message: "Failed to send message" });
        }
    });
    const httpServer = createServer(app);
    return httpServer;
}
