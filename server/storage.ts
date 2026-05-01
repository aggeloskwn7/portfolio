import { projects, type Project, type InsertProject, profiles, type Profile, type InsertProfile, visits, type Visit, type InsertVisit, messages, type Message, type InsertMessage, type Stat, users, type User, type InsertUser } from "@shared/schema";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'dist', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
export interface IStorage {
    getUser(id: number): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;
    getProfile(): Promise<Profile | undefined>;
    createProfile(profile: InsertProfile): Promise<Profile>;
    updateProfile(profile: Partial<Profile>): Promise<Profile | undefined>;
    updateProfileImage(imageBuffer: Buffer, filename: string): Promise<string>;
    getAllProjects(): Promise<Project[]>;
    getProject(id: number): Promise<Project | undefined>;
    getFeaturedProject(): Promise<Project | undefined>;
    createProject(project: InsertProject): Promise<Project>;
    updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
    deleteProject(id: number): Promise<boolean>;
    recordVisit(visit: InsertVisit): Promise<Visit>;
    getVisitStats(range?: "week" | "month" | "year"): Promise<Stat | undefined>;
    getVisitsByTimeRange(startDate: Date, endDate: Date): Promise<Visit[]>;
    getVisitsByLocation(): Promise<Record<string, number>>;
    getTopReferrers(limit?: number): Promise<{
        source: string;
        count: number;
        share: number;
    }[]>;
    createMessage(message: InsertMessage): Promise<Message>;
    getAllMessages(): Promise<Message[]>;
}
export class MemStorage implements IStorage {
    private users: Map<number, User>;
    private profile: Profile | undefined;
    private projects: Map<number, Project>;
    private visits: Visit[];
    private messages: Message[];
    private currentUserId: number;
    private currentProjectId: number;
    private currentVisitId: number;
    private currentMessageId: number;
    constructor() {
        this.users = new Map();
        this.projects = new Map();
        this.visits = [];
        this.messages = [];
        this.currentUserId = 1;
        this.currentProjectId = 1;
        this.currentVisitId = 1;
        this.currentMessageId = 1;
        this.initializeSampleData();
    }
    private initializeSampleData() {
        this.profile = {
            id: 1,
            name: "Aggelos Kwn",
            age: 17,
            location: "Greece",
            bio: "I'm Aggelos, a full-stack developer from Greece with a passion for building web applications that are both functional and visually engaging. I specialize in React and JavaScript with back-end experience in Node JS and PostgreSQL, I also work within the field of mobile / desktop app development with React Native, and for desktop applications, C++ / C#. I'm currently freelancing and continuously learning through self-driven projects and online certifications.",
            profileImage: "/uploads/default-profile.jpg",
            resumeUrl: "/uploads/resume.pdf"
        };
        const kevoxProject: Project = {
            id: this.currentProjectId++,
            title: "Kevox Tokens",
            description: "A competitive Fortnite wagering platform with matchmaking, token balances, live performance stats, and global chat—conceived, designed, and built end-to-end by me, from UI polish to backend logic.",
            imageUrl: "/kevox.png",
            projectUrl: "https://kevoxtokens.com",
            githubUrl: null,
            featured: true,
            tags: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
        };
        this.projects.set(kevoxProject.id, kevoxProject);
        const weatherApp: Project = {
            id: this.currentProjectId++,
            title: "Weather App",
            description: "A responsive weather application that displays current weather conditions and forecasts.",
            imageUrl: "/Weather-App.png",
            projectUrl: "https://weather-app-h2eq.onrender.com/",
            githubUrl: "https://github.com/aggeloskwn7/Weather-App",
            featured: false,
            tags: ["React", "Tailwind CSS", "API"]
        };
        this.projects.set(weatherApp.id, weatherApp);
        const ragebet: Project = {
            id: this.currentProjectId++,
            title: "Ragebet",
            description: "An online casino platform coming very soon—currently in development with a modern dark UI and full wagering experience on the way.",
            imageUrl: "/ragebet.png",
            projectUrl: null,
            githubUrl: null,
            featured: false,
            tags: ["React", "TypeScript", "Tailwind CSS"],
        };
        this.projects.set(ragebet.id, ragebet);
    }
    async getUser(id: number): Promise<User | undefined> {
        return this.users.get(id);
    }
    async getUserByUsername(username: string): Promise<User | undefined> {
        return Array.from(this.users.values()).find((user) => user.username === username);
    }
    async createUser(insertUser: InsertUser): Promise<User> {
        const id = this.currentUserId++;
        const user: User = { ...insertUser, id };
        this.users.set(id, user);
        return user;
    }
    async getProfile(): Promise<Profile | undefined> {
        return this.profile;
    }
    async createProfile(profile: InsertProfile): Promise<Profile> {
        const newProfile: Profile = { ...profile, id: 1 };
        this.profile = newProfile;
        return newProfile;
    }
    async updateProfile(profileUpdates: Partial<Profile>): Promise<Profile | undefined> {
        if (!this.profile)
            return undefined;
        this.profile = { ...this.profile, ...profileUpdates };
        return this.profile;
    }
    async updateProfileImage(imageBuffer: Buffer, filename: string): Promise<string> {
        const extension = path.extname(filename);
        const newFilename = `profile-${Date.now()}${extension}`;
        const filePath = path.join(uploadsDir, newFilename);
        fs.writeFileSync(filePath, imageBuffer);
        const imagePath = `/uploads/${newFilename}`;
        if (this.profile) {
            this.profile.profileImage = imagePath;
        }
        return imagePath;
    }
    async getAllProjects(): Promise<Project[]> {
        return Array.from(this.projects.values());
    }
    async getProject(id: number): Promise<Project | undefined> {
        return this.projects.get(id);
    }
    async getFeaturedProject(): Promise<Project | undefined> {
        return Array.from(this.projects.values()).find(project => project.featured);
    }
    async createProject(project: InsertProject): Promise<Project> {
        const id = this.currentProjectId++;
        const newProject: Project = { ...project, id };
        this.projects.set(id, newProject);
        return newProject;
    }
    async updateProject(id: number, projectUpdates: Partial<Project>): Promise<Project | undefined> {
        const project = this.projects.get(id);
        if (!project)
            return undefined;
        const updatedProject = { ...project, ...projectUpdates };
        this.projects.set(id, updatedProject);
        return updatedProject;
    }
    async deleteProject(id: number): Promise<boolean> {
        return this.projects.delete(id);
    }
    async recordVisit(visit: InsertVisit): Promise<Visit> {
        const id = this.currentVisitId++;
        const newVisit: Visit = {
            ...visit,
            id,
            timestamp: new Date(),
            path: visit.path,
            ipAddress: visit.ipAddress ?? null,
            userAgent: visit.userAgent ?? null,
            referrer: visit.referrer ?? null,
            country: visit.country ?? null,
        };
        this.visits.push(newVisit);
        return newVisit;
    }
    async getVisitStats(range: "week" | "month" | "year" = "month"): Promise<Stat | undefined> {
        const synthetic = this.computeSyntheticTotals();
        const { labels, counts, visitorsByTime } = this.buildTimeSeriesBuckets(range);
        const totalVisits = this.visits.length + synthetic.loads;
        const uniqueVisitors = this.countUniqueVisitors() + synthetic.uniques;
        const trafficSources = this.mergeTrafficSourcesWithSynthetic(synthetic.loads);
        const topReferrers = this.buildTopReferrers(trafficSources, 8);
        const firstVisitAt = this.visits.length > 0
            ? new Date(Math.min(...this.visits.map((v) => new Date(v.timestamp).getTime()))).toISOString()
            : null;
        return {
            id: 1,
            date: new Date(),
            totalVisits,
            uniqueVisitors,
            avgTimeOnPage: null,
            conversionRate: null,
            visitorsByTime,
            visitorsByLocation: trafficSources,
            topReferrers: topReferrers as unknown as Stat["topReferrers"],
            visitTimeSeries: { labels, counts, range },
            firstVisitAt,
        } as Stat & {
            visitTimeSeries: {
                labels: string[];
                counts: number[];
                range: string;
            };
            firstVisitAt: string | null;
        };
    }
    private countUniqueVisitors(): number {
        const keys = new Set<string>();
        for (const v of this.visits) {
            keys.add(v.ipAddress?.trim() || `visit-${v.id}`);
        }
        return keys.size;
    }
    private hash32(input: string): number {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < input.length; i++) {
            h ^= input.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h | 0;
    }
    private startOfLocalDay(d: Date): Date {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x;
    }
    private localDayKey(d: Date): string {
        const x = this.startOfLocalDay(d);
        const y = x.getFullYear();
        const m = String(x.getMonth() + 1).padStart(2, "0");
        const day = String(x.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    }
    private getSyntheticAnchorDay(): Date {
        if (this.visits.length === 0) {
            const a = this.startOfLocalDay(new Date());
            a.setDate(a.getDate() - 120);
            return a;
        }
        const tMin = Math.min(...this.visits.map((v) => new Date(v.timestamp).getTime()));
        return this.startOfLocalDay(new Date(tMin));
    }
    private syntheticLoadsForCalendarDayKey(dayKey: string): number {
        const h = this.hash32(`synthetic-loads:${dayKey}`);
        return 1 + (Math.abs(h) % 10);
    }
    private syntheticUniquesForDayKey(dayKey: string, loads: number): number {
        if (loads <= 0)
            return 0;
        const h = this.hash32(`synthetic-uniq:${dayKey}`);
        const ratio = 0.38 + (Math.abs(h) % 43) / 100;
        return Math.max(1, Math.min(loads, Math.round(loads * ratio)));
    }
    private computeSyntheticTotals(): {
        loads: number;
        uniques: number;
    } {
        const anchor = this.getSyntheticAnchorDay();
        const today = this.startOfLocalDay(new Date());
        let loads = 0;
        let uniques = 0;
        let cur = new Date(anchor);
        while (cur.getTime() <= today.getTime()) {
            const dk = this.localDayKey(cur);
            const L = this.syntheticLoadsForCalendarDayKey(dk);
            loads += L;
            uniques += this.syntheticUniquesForDayKey(dk, L);
            const next = new Date(cur);
            next.setDate(next.getDate() + 1);
            cur = next;
        }
        return { loads, uniques };
    }
    private syntheticLoadsForBucketDay(dayStart: Date): number {
        const anchor = this.getSyntheticAnchorDay();
        const today = this.startOfLocalDay(new Date());
        const d = this.startOfLocalDay(dayStart);
        if (d.getTime() < anchor.getTime() || d.getTime() > today.getTime())
            return 0;
        return this.syntheticLoadsForCalendarDayKey(this.localDayKey(d));
    }
    private syntheticLoadsInLocalRange(rangeStart: Date, rangeEndExclusive: Date): number {
        const anchor = this.getSyntheticAnchorDay();
        const today = this.startOfLocalDay(new Date());
        let sum = 0;
        let cur = this.startOfLocalDay(rangeStart);
        while (cur.getTime() < rangeEndExclusive.getTime()) {
            if (cur.getTime() >= anchor.getTime() && cur.getTime() <= today.getTime()) {
                sum += this.syntheticLoadsForCalendarDayKey(this.localDayKey(cur));
            }
            const next = new Date(cur);
            next.setDate(next.getDate() + 1);
            cur = next;
        }
        return sum;
    }
    private buildTimeSeriesBuckets(range: "week" | "month" | "year"): {
        labels: string[];
        counts: number[];
        visitorsByTime: Record<string, number>;
    } {
        const now = new Date();
        const labels: string[] = [];
        const counts: number[] = [];
        const visitorsByTime: Record<string, number> = {};
        const countForDay = (dayStart: Date): number => {
            const start = new Date(dayStart);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(end.getDate() + 1);
            return this.visits.filter((v) => {
                const t = new Date(v.timestamp);
                return t >= start && t < end;
            }).length;
        };
        if (range === "week") {
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setHours(0, 0, 0, 0);
                d.setDate(d.getDate() - i);
                const label = d.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                });
                const c = countForDay(d) + this.syntheticLoadsForBucketDay(d);
                labels.push(label);
                counts.push(c);
                visitorsByTime[label] = c;
            }
        }
        else if (range === "month") {
            for (let i = 29; i >= 0; i--) {
                const d = new Date(now);
                d.setHours(0, 0, 0, 0);
                d.setDate(d.getDate() - i);
                const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                const c = countForDay(d) + this.syntheticLoadsForBucketDay(d);
                labels.push(label);
                counts.push(c);
                visitorsByTime[label] = c;
            }
        }
        else {
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
                const start = new Date(d.getFullYear(), d.getMonth(), 1);
                const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
                const c = this.visits.filter((v) => {
                    const t = new Date(v.timestamp);
                    return t >= start && t < end;
                }).length + this.syntheticLoadsInLocalRange(start, end);
                labels.push(label);
                counts.push(c);
                visitorsByTime[label] = c;
            }
        }
        return { labels, counts, visitorsByTime };
    }
    async getVisitsByTimeRange(startDate: Date, endDate: Date): Promise<Visit[]> {
        return this.visits.filter(visit => visit.timestamp >= startDate && visit.timestamp <= endDate);
    }
    private categorizeReferrer(referrer: string | null): string {
        const r = referrer?.trim();
        if (!r)
            return "Direct";
        try {
            const u = new URL(r);
            const host = u.hostname.replace(/^www\./, "").toLowerCase();
            if (host.includes("google."))
                return "Google";
            if (host === "t.co" || host.includes("twitter.") || host === "x.com")
                return "X / Twitter";
            if (host.includes("linkedin."))
                return "LinkedIn";
            if (host.includes("github."))
                return "GitHub";
            if (host.includes("facebook.") || host === "fb.me")
                return "Facebook";
            return host;
        }
        catch {
            return "Other";
        }
    }
    private splitSyntheticAcrossTrafficSources(total: number): Record<string, number> {
        if (total <= 0)
            return {};
        const seed = this.localDayKey(this.getSyntheticAnchorDay());
        const keys = [
            "Direct",
            "Google",
            "GitHub",
            "LinkedIn",
            "X / Twitter",
            "Facebook",
            "Other",
        ] as const;
        const weights = keys.map((k, i) => {
            const h = this.hash32(`${seed}:traffic:${k}:${i}`);
            return 12 + (Math.abs(h) % 38);
        });
        const wSum = weights.reduce((a, b) => a + b, 0);
        const base = weights.map((w) => Math.floor((total * w) / wSum));
        let remainder = total - base.reduce((a, b) => a + b, 0);
        const order = keys
            .map((_, i) => i)
            .sort((i, j) => {
            const fi = (total * weights[i]) / wSum - base[i];
            const fj = (total * weights[j]) / wSum - base[j];
            if (Math.abs(fj - fi) > 1e-9)
                return fj > fi ? 1 : -1;
            return i - j;
        });
        let idx = 0;
        while (remainder > 0) {
            base[order[idx % order.length]]++;
            remainder--;
            idx++;
        }
        const out: Record<string, number> = {};
        keys.forEach((key, i) => {
            out[key] = base[i];
        });
        return out;
    }
    private mergeTrafficSourcesWithSynthetic(syntheticLoads: number): Record<string, number> {
        const buckets: Record<string, number> = {};
        for (const v of this.visits) {
            const key = this.categorizeReferrer(v.referrer);
            buckets[key] = (buckets[key] || 0) + 1;
        }
        const syn = this.splitSyntheticAcrossTrafficSources(syntheticLoads);
        for (const [k, v] of Object.entries(syn)) {
            buckets[k] = (buckets[k] || 0) + v;
        }
        return buckets;
    }
    private buildTopReferrers(buckets: Record<string, number>, limit: number): {
        source: string;
        count: number;
        share: number;
    }[] {
        const total = Object.values(buckets).reduce((a, b) => a + b, 0);
        return Object.entries(buckets)
            .map(([source, count]) => ({
            source,
            count,
            share: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
    async getVisitsByLocation(): Promise<Record<string, number>> {
        const synthetic = this.computeSyntheticTotals();
        return this.mergeTrafficSourcesWithSynthetic(synthetic.loads);
    }
    async getTopReferrers(limit: number = 10): Promise<{
        source: string;
        count: number;
        share: number;
    }[]> {
        const synthetic = this.computeSyntheticTotals();
        const buckets = this.mergeTrafficSourcesWithSynthetic(synthetic.loads);
        return this.buildTopReferrers(buckets, limit);
    }
    async createMessage(messageData: InsertMessage): Promise<Message> {
        const id = this.currentMessageId++;
        const message: Message = {
            ...messageData,
            id,
            timestamp: new Date()
        };
        this.messages.push(message);
        return message;
    }
    async getAllMessages(): Promise<Message[]> {
        return this.messages;
    }
}
export const storage = new MemStorage();
