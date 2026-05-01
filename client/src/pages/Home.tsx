import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { MobileNavigation } from "@/components/MobileNavigation";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { FadeInSection } from "@/components/FadeInSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import type { Profile, Project } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
const contactFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    subject: z.string().min(2, { message: "Subject must be at least 2 characters." }),
    message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});
export default function Home() {
    const { toast } = useToast();
    useEffect(() => {
        const recordVisit = async () => {
            try {
                await apiRequest("POST", "/api/analytics/visit", {
                    path: "/",
                    referrer: document.referrer,
                    userAgent: navigator.userAgent,
                });
            }
            catch (error) {
                console.error("Failed to record visit:", error);
            }
        };
        recordVisit();
    }, []);
    const { data: profileData } = useQuery<Profile>({
        queryKey: ['/api/profile'],
    });
    const { data: projectsData } = useQuery<Project[]>({
        queryKey: ['/api/projects'],
    });
    const { data: featuredProject } = useQuery<Project>({
        queryKey: ['/api/projects/featured'],
    });
    const form = useForm<z.infer<typeof contactFormSchema>>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
    });
    const onSubmit = async (values: z.infer<typeof contactFormSchema>) => {
        try {
            console.log("Form submitted with values:", values);
            console.log("Form validation state:", form.formState.isValid);
            if (Object.keys(form.formState.errors).length > 0) {
                console.error("Form validation errors:", form.formState.errors);
                toast({
                    title: "Validation Error",
                    description: "Please check the form for errors and try again.",
                    variant: "destructive",
                });
                return;
            }
            const response = await apiRequest("POST", "/api/contact", values);
            console.log("API response status:", response.status);
            if (response.ok) {
                const data = await response.json();
                console.log("API response data:", data);
                if (data.emailSent) {
                    toast({
                        title: "Message sent successfully!",
                        description: "Your message has been sent to my email. I'll get back to you soon!",
                    });
                }
                else {
                    toast({
                        title: "Message received",
                        description: "Your message was saved, but there was an issue with the email notification. I'll still see your message in my dashboard.",
                        variant: "default",
                    });
                }
                form.reset();
            }
            else {
                console.error("Error response from server:", response.status);
                const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
                console.error("Error details:", errorData);
                toast({
                    title: "Error",
                    description: errorData.message || "Failed to send your message. Please try again later.",
                    variant: "destructive",
                });
            }
        }
        catch (error) {
            console.error("Failed to send message:", error);
            toast({
                title: "Error",
                description: "Failed to send your message. Please try again later.",
                variant: "destructive",
            });
        }
    };
    return (<div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        
        <section className="bg-gradient-to-br from-white via-white to-gray-100 py-20 px-6">
          <div className="max-w-5xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between">
            <FadeInSection className="md:w-2/3" delay={100}>
              <span className="inline-block bg-accent-100 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
                Full Stack Developer
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
                Hi, I'm <span className="text-accent">{profileData?.name || "Aggelos Kwn"}</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Young developer passionate about creating impactful digital experiences. Building the web, one line of code at a time. <span className="font-semibold text-accent"></span>
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#projects" className="btn-primary">
                  View My Work
                </a>
                <a href="#contact" className="btn-secondary">
                  Get In Touch
                </a>
              </div>
            </FadeInSection>
            
            <FadeInSection className="mb-8 md:mb-0 relative" delay={300}>
              <div className="w-52 h-52 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img src="/profile-image.jpg" alt="Profile" className="w-full h-full object-cover"/>
              </div>
            </FadeInSection>
          </div>
        </section>
        
        
        <section id="about" className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <FadeInSection className="text-center mb-16">
              <span className="inline-block bg-accent-100 text-accent px-4 py-2 rounded-full text-sm font-medium mb-3">
                About Me
              </span>
              <h2 className="text-4xl font-bold text-gray-900">Who I Am</h2>
            </FadeInSection>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <FadeInSection className="card hover:border-accent/20" delay={100}>
                <div className="w-14 h-14 bg-accent-100 text-accent rounded-xl flex items-center justify-center mb-5">
                  <i className="fas fa-user text-2xl"></i>
                </div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Personal Info</h3>
                </div>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="font-medium w-24 text-gray-700">Name:</span>
                    <span>{profileData?.name || "Aggelos Kwn"}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="font-medium w-24 text-gray-700">Age:</span>
                    <span>{profileData?.age || 18}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="font-medium w-24 text-gray-700">Location:</span>
                    <span>{profileData?.location || "Greece"}</span>
                  </li>
                </ul>
              </FadeInSection>
              
              
              <FadeInSection className="card hover:border-accent/20" delay={200}>
                <div className="w-14 h-14 bg-accent-100 text-accent rounded-xl flex items-center justify-center mb-5">
                  <i className="fas fa-code text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {([
            "TypeScript",
            "JavaScript",
            "React",
            "GoLang",
            "C++",
            "C#",
            "React Native",
        ] as const).map((skill) => (<span key={skill} className="inline-flex items-center rounded-full border border-accent/25 bg-accent-100 px-3 py-1.5 text-sm font-medium text-accent">
                      {skill}
                    </span>))}
                </div>
              </FadeInSection>
              
              
              <FadeInSection className="card hover:border-accent/20" delay={300}>
                <div className="w-14 h-14 bg-accent-100 text-accent rounded-xl flex items-center justify-center mb-5">
                  <i className="fas fa-book-open text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Education</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-accent text-sm font-semibold">2023 - Present</p>
                    <h4 className="font-bold text-gray-800 mt-1">High School Diploma</h4>
                    <p className="text-sm text-gray-600 mt-1">Currently attending high school</p>
                  </div>
                  <div>
                    <p className="text-accent text-sm font-semibold">2022 - Present</p>
                    <h4 className="font-bold text-gray-800 mt-1">Multiple Professional Level Courses</h4>
                    <p className="text-sm text-gray-600 mt-1">Ongoing professional development</p>
                  </div>
                  <div>
                    <p className="text-accent text-sm font-semibold">2021 - 2022</p>
                    <h4 className="font-bold text-gray-800 mt-1">Introduction to Programming</h4>
                    <p className="text-sm text-gray-600 mt-1">Self-taught</p>
                  </div>
                </div>
              </FadeInSection>
            </div>
            
            
            <FadeInSection className="mt-16 card border-2 border-accent/20" delay={400}>
              <h3 className="text-2xl font-bold mb-5 text-gray-900">My Story</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                I'm Aggelos, a full-stack developer from Greece with a passion for building web applications that are both functional and visually engaging. I specialize in React and JavaScript with back-end experience in Node JS and PostgreSQL, I also work within the field of mobile / desktop app development with React Native, and for desktop applications, C++ / C#. I'm currently freelancing and continuously learning through self-driven projects and online certifications.
              </p>
            </FadeInSection>
          </div>
        </section>
        
        
        <section id="projects" className="py-20 px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <FadeInSection className="text-center mb-16">
              <span className="inline-block bg-accent-100 text-accent px-4 py-2 rounded-full text-sm font-medium mb-3">
                My Work
              </span>
              <h2 className="text-4xl font-bold text-gray-900">Recent Projects</h2>
            </FadeInSection>
            
            
            {featuredProject ? (<FadeInSection className="mb-16" delay={100}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                  <div className="md:flex">
                    <div className="md:w-1/2 relative">
                      <img src={featuredProject.imageUrl || "/kevox.png"} alt={featuredProject.title || "Kevox Tokens"} className="w-full h-full object-cover"/>
                      <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Featured
                      </div>
                    </div>
                    <div className="p-8 md:p-10 md:w-1/2">
                      <div className="flex items-center mb-5">
                        <span className="bg-accent text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md">
                          Gaming & Wagering
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">{featuredProject.title}</h3>
                      <p className="text-gray-600 mb-6 text-lg">
                        {featuredProject.description}
                      </p>
                      <div className="flex flex-wrap gap-3 mb-8">
                        {featuredProject.tags?.map((tag: string, index: number) => {
                const colors = {
                    "React": "bg-blue-50 text-blue-700 border-blue-200",
                    "Next.js": "bg-gray-900 text-white border-gray-700",
                    "TypeScript": "bg-blue-50 text-blue-800 border-blue-300",
                    "Tailwind CSS": "bg-teal-50 text-teal-700 border-teal-200",
                    "PostgreSQL": "bg-indigo-50 text-indigo-700 border-indigo-200",
                    "Tailwind": "bg-teal-50 text-teal-700 border-teal-200"
                };
                const color = colors[tag as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200";
                console.log(`Featured Project: ${featuredProject.title}, Tag: "${tag}"`, tag === "Tailwind CSS");
                const isTailwindTag = tag === "Tailwind" || tag === "Tailwind CSS";
                return (<span key={index} className={`${color} text-sm font-medium px-4 py-2 rounded-full border flex items-center`}>
                              {tag === "React" && <i className="fab fa-react mr-1.5"></i>}
                              {tag === "Next.js" && <i className="fas fa-bolt mr-1.5"></i>}
                              {tag === "TypeScript" && <i className="fas fa-code mr-1.5"></i>}
                              {isTailwindTag && <i className="fab fa-css3 mr-1.5"></i>}
                              {tag === "PostgreSQL" && <i className="fas fa-database mr-1.5"></i>}
                              {tag}
                            </span>);
            })}
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {featuredProject.projectUrl && (<a href={featuredProject.projectUrl} className="btn-primary flex items-center" target="_blank" rel="noopener noreferrer">
                            <span>View Live</span>
                            <i className="fas fa-external-link-alt ml-2"></i>
                          </a>)}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInSection>) : null}
            
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projectsData?.filter((p: Project) => !p.featured).map((project: Project, index: number) => (<FadeInSection key={project.id} delay={200 + (index * 100)} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                  <div className="relative">
                    <img src={project.imageUrl || `https://via.placeholder.com/400x200?text=${encodeURIComponent(project.title)}`} alt={project.title} className="w-full h-56 sm:h-64 md:h-72 object-cover object-top"/>
                    <div className="absolute inset-0 bg-accent/80 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {project.projectUrl && (<a href={project.projectUrl} className="bg-white text-accent px-5 py-2 rounded-lg font-medium transition transform hover:scale-105" target="_blank" rel="noopener noreferrer">
                          View Project
                        </a>)}
                      {project.githubUrl && (<a href={project.githubUrl} className="bg-gray-900 text-white px-5 py-2 rounded-lg font-medium transition transform hover:scale-105 flex items-center" target="_blank" rel="noopener noreferrer">
                          <i className="fab fa-github mr-2"></i>
                          Source Code
                        </a>)}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{project.title}</h3>
                    <p className="text-gray-600 mb-4">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags?.map((tag: string, tagIndex: number) => {
                const colors = {
                    "React": "bg-blue-50 text-blue-700 border-blue-200",
                    "Tailwind CSS": "bg-teal-50 text-teal-700 border-teal-200",
                    "PostgreSQL": "bg-indigo-50 text-indigo-700 border-indigo-200",
                    "Firebase": "bg-amber-50 text-amber-700 border-amber-200",
                    "Tailwind": "bg-teal-50 text-teal-700 border-teal-200",
                    "JavaScript": "bg-yellow-50 text-yellow-700 border-yellow-200",
                    "API": "bg-green-50 text-green-700 border-green-200",
                    "CSS": "bg-pink-50 text-pink-700 border-pink-200"
                };
                const color = colors[tag as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200";
                console.log(`Project: ${project.title}, Tag: "${tag}"`, tag === "Tailwind");
                const isTailwindTag = tag === "Tailwind" || tag === "Tailwind CSS";
                return (<span key={tagIndex} className={`${color} text-xs font-medium px-2.5 py-1.5 rounded-full border flex items-center`}>
                            {tag === "React" && <i className="fab fa-react mr-1"></i>}
                            {isTailwindTag && <i className="fab fa-css3 mr-1"></i>}
                            {tag === "Firebase" && <i className="fas fa-fire mr-1"></i>}
                            {tag === "PostgreSQL" && <i className="fas fa-database mr-1"></i>}
                            {tag === "JavaScript" && <i className="fab fa-js mr-1"></i>}
                            {tag === "API" && <i className="fas fa-cloud mr-1"></i>}
                            {tag === "CSS" && <i className="fab fa-css3-alt mr-1"></i>}
                            {tag}
                          </span>);
            })}
                    </div>
                  </div>
                </FadeInSection>))}
            </div>
          </div>
        </section>
        
        
        <AnalyticsCharts />
        
        
        <section id="contact" className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <FadeInSection className="text-center mb-16">
              <span className="inline-block bg-accent-100 text-accent px-4 py-2 rounded-full text-sm font-medium mb-3">
                Contact
              </span>
              <h2 className="text-4xl font-bold text-gray-900">Get In Touch</h2>
              <p className="mt-4 text-gray-600 max-w-lg mx-auto">
                Have a question or want to work together? Feel free to contact me!
              </p>
            </FadeInSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FadeInSection className="md:col-span-1" delay={100}>
                <div className="bg-gray-50 rounded-xl p-8 shadow-md h-full">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-gray-900">Contact Information</h3>
                      <p className="text-gray-600">
                        Reach out through any of these channels and I'll respond as soon as possible.
                      </p>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-accent text-white rounded-lg flex items-center justify-center mr-4 shadow-md flex-shrink-0">
                        <i className="fas fa-envelope text-xl"></i>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold mb-1 text-gray-800">Email</h4>
                        <a href="mailto:k1ngsx@icloud.com" className="text-gray-600 hover:text-accent transition-colors">
                          k1ngsx@icloud.com
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-accent text-white rounded-lg flex items-center justify-center mr-4 shadow-md flex-shrink-0">
                        <i className="fas fa-map-marker-alt text-xl"></i>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold mb-1 text-gray-800">Location</h4>
                        <p className="text-gray-600">
                          {profileData?.location || "Athens, Greece"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-accent text-white rounded-lg flex items-center justify-center mr-4 shadow-md flex-shrink-0">
                        <i className="fas fa-share-alt text-xl"></i>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold mb-2 text-gray-800">Social Media</h4>
                        <div className="flex flex-wrap gap-3">
                          <a href="https://github.com/aggeloskwn7" className="w-10 h-10 bg-gray-200 text-gray-700 hover:bg-accent hover:text-white rounded-full flex items-center justify-center transition-colors" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-github text-xl"></i>
                          </a>
                          <a href="https://www.linkedin.com/in/aggeloskwn/" className="w-10 h-10 bg-gray-200 text-gray-700 hover:bg-accent hover:text-white rounded-full flex items-center justify-center transition-colors" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-linkedin-in text-xl"></i>
                          </a>
                          <a href="https://x.com/aggeloskwn" className="w-10 h-10 bg-gray-200 text-gray-700 hover:bg-accent hover:text-white rounded-full flex items-center justify-center transition-colors" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-twitter text-xl"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInSection>
              
              <FadeInSection className="md:col-span-2" delay={200}>
                <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
                  <h3 className="text-xl font-bold mb-6 text-gray-900">Send Me a Message</h3>
                  <Form {...form}>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Your name" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors text-gray-800"/>
                              </FormControl>
                              <FormMessage className="text-red-500"/>
                            </FormItem>)}/>
                        <FormField control={form.control} name="email" render={({ field }) => (<FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Your email" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors text-gray-800"/>
                              </FormControl>
                              <FormMessage className="text-red-500"/>
                            </FormItem>)}/>
                      </div>
                      <FormField control={form.control} name="subject" render={({ field }) => (<FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Subject</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Subject" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors text-gray-800"/>
                            </FormControl>
                            <FormMessage className="text-red-500"/>
                          </FormItem>)}/>
                      <FormField control={form.control} name="message" render={({ field }) => (<FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Message</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Your message" rows={5} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors text-gray-800"/>
                            </FormControl>
                            <FormMessage className="text-red-500"/>
                          </FormItem>)}/>
                      <Button type="submit" className="btn-primary w-full" disabled={form.formState.isSubmitting} onClick={form.handleSubmit(onSubmit)}>
                        {form.formState.isSubmitting ? (<span className="flex items-center justify-center">
                            <i className="fas fa-spinner animate-spin mr-2"></i>
                            Sending...
                          </span>) : ("Send Message")}
                      </Button>
                    </div>
                  </Form>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>
      </main>
      
      <MobileNavigation />
      
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-white mb-2">Aggelos <span className="text-accent">Kwn</span></h3>
              <p className="text-gray-400 max-w-md">Young full-stack developer building impactful web experiences with modern technologies.</p>
            </div>
            
            <div className="flex space-x-4">
              <a href="https://github.com/aggeloskwn7" className="w-10 h-10 bg-gray-800 hover:bg-accent text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-colors" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-github text-xl"></i>
              </a>
              <a href="https://www.linkedin.com/in/aggeloskwn/" className="w-10 h-10 bg-gray-800 hover:bg-accent text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-colors" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin-in text-xl"></i>
              </a>
              <a href="https://x.com/aggeloskwn" className="w-10 h-10 bg-gray-800 hover:bg-accent text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-colors" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter text-xl"></i>
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">© {new Date().getFullYear()} {profileData?.name || "Aggelos Kwn"}. All rights reserved.</p>
            
            <div className="flex space-x-8">
              <a href="#about" className="text-sm text-gray-400 hover:text-accent transition-colors">About</a>
              <a href="#projects" className="text-sm text-gray-400 hover:text-accent transition-colors">Projects</a>
              <a href="#analytics" className="text-sm text-gray-400 hover:text-accent transition-colors">Analytics</a>
              <a href="#contact" className="text-sm text-gray-400 hover:text-accent transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>);
}
