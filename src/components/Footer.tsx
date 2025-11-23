import { Link } from "react-router-dom";
import { Mail, ExternalLink, Instagram } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 text-gray-700 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-gray-900 font-semibold text-lg mb-4">Food Club</h3>
            <p className="text-sm leading-relaxed mb-4">
              Your trusted food delivery platform connecting students and food lovers with amazing local cafes and restaurants. 
              Order from your favorite eateries and enjoy delicious meals delivered fresh to your doorstep.
            </p>
            <div className="flex gap-4 mt-4">
              <a
                href="https://www.instagram.com/mujfoodclub/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://whatsapp.com/channel/0029Vb6o7fREKyZFEb4y0V28"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                aria-label="Join our WhatsApp channel"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/cafes" 
                  className="hover:text-gray-900 transition-colors"
                >
                  All Cafes
                </Link>
              </li>
              <li>
                <Link 
                  to="/grabit" 
                  className="hover:text-gray-900 transition-colors"
                >
                  Grabit Store
                </Link>
              </li>
              <li>
                <Link 
                  to="/orders" 
                  className="hover:text-gray-900 transition-colors"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile" 
                  className="hover:text-gray-900 transition-colors"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h3 className="text-gray-900 font-semibold text-lg mb-4">Legal & Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/privacy-policy" 
                  className="hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms-of-service" 
                  className="hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:support@mujfoodclub.in" 
                  className="hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                  <Mail className="w-4 h-4" />
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="https://mujfoodclub.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                  Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm">
            <p className="text-gray-600">
              © {currentYear} Plattr Technologies LLP. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

