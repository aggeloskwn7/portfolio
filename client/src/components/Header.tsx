import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("about");
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
            const sections = ["about", "projects", "analytics", "contact"];
            let currentSection = sections[0];
            sections.forEach(section => {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 150 && rect.bottom >= 150) {
                        currentSection = section;
                    }
                }
            });
            setActiveSection(currentSection);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    const downloadResume = () => {
        const link = document.createElement("a");
        link.href = "/favicon_io-2/Aggelos_Kwn-CV.pdf";
        link.download = "Aggelos_Kwn-CV.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const scrollToSection = (sectionId: string, e: React.MouseEvent) => {
        e.preventDefault();
        const section = document.getElementById(sectionId);
        if (section) {
            window.scrollTo({
                top: section.offsetTop - 80,
                behavior: "smooth",
            });
            setActiveSection(sectionId);
        }
    };
    return (<header className={`bg-white py-4 px-6 sticky top-0 z-10 transition-all duration-300 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">
          <span className="text-accent font-extrabold">Aggelos</span> Kwn
        </h1>
        
        
        <nav className="hidden sm:block">
          <ul className="flex space-x-8 text-sm font-medium">
            <li>
              <a href="#about" onClick={(e) => scrollToSection("about", e)} className={`text-gray-800 hover:text-accent transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all hover:after:w-full ${activeSection === "about" ? "text-accent after:w-full" : ""}`}>
                About
              </a>
            </li>
            <li>
              <a href="#projects" onClick={(e) => scrollToSection("projects", e)} className={`text-gray-800 hover:text-accent transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all hover:after:w-full ${activeSection === "projects" ? "text-accent after:w-full" : ""}`}>
                Projects
              </a>
            </li>
            <li>
              <a href="#analytics" onClick={(e) => scrollToSection("analytics", e)} className={`text-gray-800 hover:text-accent transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all hover:after:w-full ${activeSection === "analytics" ? "text-accent after:w-full" : ""}`}>
                Analytics
              </a>
            </li>
            <li>
              <a href="#contact" onClick={(e) => scrollToSection("contact", e)} className={`text-gray-800 hover:text-accent transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all hover:after:w-full ${activeSection === "contact" ? "text-accent after:w-full" : ""}`}>
                Contact
              </a>
            </li>
          </ul>
        </nav>
        
        <Button onClick={downloadResume} className="btn-primary flex items-center justify-center transition duration-300 ease-in-out transform hover:-translate-y-1">
          <i className="fas fa-download mr-2"></i>
          Download CV
        </Button>
      </div>
    </header>);
}
