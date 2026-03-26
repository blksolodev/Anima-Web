import React from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../constants';
import { Twitter, Instagram, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0D0D14] border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-1 mb-4">
              <span className="text-2xl font-bold tracking-tight text-white">
                anima
              </span>
              <span 
                className="w-2 h-2 rounded-full mt-2" 
                style={{ backgroundColor: COLORS.accentPrimary }}
              />
            </Link>
            <p className="text-[#A0A0B0] max-w-xs mb-6">
              The social universe built for anime fans. Join the guild, level up, and connect.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Github].map((Icon, idx) => (
                <a key={idx} href="#" className="text-[#A0A0B0] hover:text-white transition-colors">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/download" className="text-[#A0A0B0] hover:text-white transition-colors">Download</Link></li>
              <li><Link to="/features" className="text-[#A0A0B0] hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/about" className="text-[#A0A0B0] hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-[#A0A0B0] hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-[#A0A0B0] hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-[#A0A0B0] hover:text-white transition-colors">Community Guidelines</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center text-[#6B6B7B] text-sm">
          &copy; {new Date().getFullYear()} Anima Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};