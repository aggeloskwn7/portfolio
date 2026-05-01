import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
});
export const insertUserSchema = createInsertSchema(users).pick({
    username: true,
    password: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export const profiles = pgTable("profiles", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    age: integer("age").notNull(),
    location: text("location").notNull(),
    bio: text("bio"),
    profileImage: text("profile_image"),
    resumeUrl: text("resume_url"),
});
export const insertProfileSchema = createInsertSchema(profiles).pick({
    name: true,
    age: true,
    location: true,
    bio: true,
    profileImage: true,
    resumeUrl: true,
});
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
export const projects = pgTable("projects", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    imageUrl: text("image_url"),
    projectUrl: text("project_url"),
    githubUrl: text("github_url"),
    featured: boolean("featured").default(false),
    tags: text("tags").array(),
});
export const insertProjectSchema = createInsertSchema(projects).pick({
    title: true,
    description: true,
    imageUrl: true,
    projectUrl: true,
    githubUrl: true,
    featured: true,
    tags: true,
});
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export const visits = pgTable("visits", {
    id: serial("id").primaryKey(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    referrer: text("referrer"),
    path: text("path").notNull(),
    country: text("country"),
});
export const insertVisitSchema = createInsertSchema(visits).pick({
    ipAddress: true,
    userAgent: true,
    referrer: true,
    path: true,
    country: true,
});
export type InsertVisit = z.infer<typeof insertVisitSchema>;
export type Visit = typeof visits.$inferSelect;
export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
});
export const insertMessageSchema = createInsertSchema(messages).pick({
    name: true,
    email: true,
    subject: true,
    message: true,
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export const stats = pgTable("stats", {
    id: serial("id").primaryKey(),
    date: timestamp("date").notNull(),
    totalVisits: integer("total_visits").notNull(),
    uniqueVisitors: integer("unique_visitors").notNull(),
    avgTimeOnPage: text("avg_time_on_page"),
    conversionRate: text("conversion_rate"),
    visitorsByLocation: jsonb("visitors_by_location"),
    visitorsByTime: jsonb("visitors_by_time"),
    topReferrers: jsonb("top_referrers"),
});
export const insertStatSchema = createInsertSchema(stats).pick({
    date: true,
    totalVisits: true,
    uniqueVisitors: true,
    avgTimeOnPage: true,
    conversionRate: true,
    visitorsByLocation: true,
    visitorsByTime: true,
    topReferrers: true,
});
export type InsertStat = z.infer<typeof insertStatSchema>;
export type Stat = typeof stats.$inferSelect;
