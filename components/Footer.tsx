import { Facebook, Linkedin, Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                A
              </span>
            </div>
            <span className="text-lg font-semibold text-foreground">
              Aheee NewsHub
            </span>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Stay informed with the latest news from Nigeria and around the world
          </p>

          <p className="text-xs text-muted-foreground">
            Powered by&nbsp;
            <a
              href="https://newsapi.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline">
              NewsAPI
            </a>
          </p>
          <p className="text-sm font-bold flex justify-center items-center gap-2">
            Built By&nbsp;Ahmad Idris
            <span className="flex gap-3 font-semibold">
              {/* WhatsApp link */}
              <a
                href="https://wa.me/2349030322692"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp">
                <FaWhatsapp className="w-5 h-5 text-green-500" />
              </a>
              {/* Email link */}
              <a
                href="mailto:ahmadgbodoti@gmail.com"
                aria-label="Send Email"
                className="hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>{" "}
              <a
                href="https://linkedin.com/in/teejayidrees"
                aria-label="LinkedIn"
                className="hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5 text-blue-500" />
              </a>
            </span>
          </p>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Aheee NewsHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
