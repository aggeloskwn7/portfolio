import { Link } from "wouter";
import { useState, useEffect } from "react";
export function MobileNavigation() {
    const [activeSection, setActiveSection] = useState("about");
    const downloadResume = () => {
        const link = document.createElement("a");
        link.href = "/favicon_io-2/Aggelos_Kwn-CV.pdf";
        link.download = "Aggelos_Kwn-CV.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    useEffect(() => {
        const handleScroll = () => {
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
    return (<nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white py-3 px-6 z-10 shadow-xl">
      <ul className="flex justify-between items-center">
        <li>
          <a href="#about" onClick={(e) => scrollToSection("about", e)} className={`flex flex-col items-center text-gray-700 hover:text-accent transition-colors duration-300 ${activeSection === "about" ? "text-accent" : ""}`}>
            <i className="fas fa-user text-xl"></i>
            <span className="text-xs font-medium mt-1">About</span>
          </a>
        </li>
        <li>
          <a href="#projects" onClick={(e) => scrollToSection("projects", e)} className={`flex flex-col items-center text-gray-700 hover:text-accent transition-colors duration-300 ${activeSection === "projects" ? "text-accent" : ""}`}>
            <i className="fas fa-folder text-xl"></i>
            <span className="text-xs font-medium mt-1">Projects</span>
          </a>
        </li>
        <li>
          <button onClick={downloadResume} className="flex flex-col items-center text-accent transition-colors duration-300">
            <i className="fas fa-download text-xl"></i>
            <span className="text-xs font-medium mt-1">CV</span>
          </button>
        </li>
        <li>
          <a href="#analytics" onClick={(e) => scrollToSection("analytics", e)} className={`flex flex-col items-center text-gray-700 hover:text-accent transition-colors duration-300 ${activeSection === "analytics" ? "text-accent" : ""}`}>
            <i className="fas fa-chart-line text-xl"></i>
            <span className="text-xs font-medium mt-1">Analytics</span>
          </a>
        </li>
        <li>
          <a href="#contact" onClick={(e) => scrollToSection("contact", e)} className={`flex flex-col items-center text-gray-700 hover:text-accent transition-colors duration-300 ${activeSection === "contact" ? "text-accent" : ""}`}>
            <i className="fas fa-envelope text-xl"></i>
            <span className="text-xs font-medium mt-1">Contact</span>
          </a>
        </li>
      </ul>
    </nav>);
}
