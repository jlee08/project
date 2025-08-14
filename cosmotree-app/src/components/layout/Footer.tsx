import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white py-6 md:py-10 px-4 md:px-5">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-14 text-start">
          <div className="w-full md:w-80">
            <h4 className="text-xl md:text-2xl font-gowun text-black mb-2 md:mb-4 leading-relaxed tracking-tight">
              Contact
            </h4>
            <div>
              <p className="text-lg md:text-2xl font-gowun text-black leading-relaxed tracking-tight break-all md:break-normal">
                hello@cosmotree.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
