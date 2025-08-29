
import React from 'react';

const Footer: React.FC = () => {
  const handlePrivacyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    alert('Our Privacy Policy is being updated and will be available soon. Thank you for your patience!');
  };

  return (
    <footer id="footer" className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-xl font-bold mb-4">ImpactHub</h3>
            <p className="text-gray-400">Creating a better world, one donation at a time.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#causes" className="hover:text-emerald-400 transition-colors">Our Causes</a></li>
              <li><a href="#about" className="hover:text-emerald-400 transition-colors">About Us</a></li>
              <li><a href="#" onClick={handlePrivacyClick} className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <p className="text-gray-400">Follow us on social media for updates and stories of impact.</p>
            {/* Social media icons would go here */}
          </div>
        </div>
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} ImpactHub. All rights reserved. This is a fictional website for demonstration purposes.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;