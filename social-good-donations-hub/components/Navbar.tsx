import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Donation Hub</h1>
        <ul className="flex gap-6">
          <li><a href="#about" className="hover:underline">About</a></li>
          <li><a href="#causes" className="hover:underline">Causes</a></li>
          <li><a href="#contact" className="hover:underline">Contact</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
