import React from 'react';
import Icon from './UI/Icon';
import { iconInfo, IconName } from '../assets/icons';

const AssetShowcase: React.FC = () => {
  const iconNames: IconName[] = Object.keys(iconInfo) as IconName[];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Cosmotree Assets Showcase</h1>
      
      {/* Icons Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">SVG Icons</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {iconNames.map((iconName) => {
            const info = iconInfo[iconName];
            return (
              <div 
                key={iconName}
                className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="flex justify-center mb-2">
                  <Icon name={iconName} size={48} />
                </div>
                <h3 className="font-medium text-gray-900 text-sm">{info.name}</h3>
                <p className="text-xs text-gray-500">{info.size}</p>
                <p className="text-xs text-gray-400 mt-1">{info.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage Examples */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Usage Examples</h2>
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Icon name="rocket" size={20} />
            <span>Small rocket icon (20px)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Icon name="moonStars" size={32} className="text-blue-600" />
            <span>Medium moon & stars with custom styling</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Icon name="book" size={24} />
            <span>Learning resources icon</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Icon name="planet" size={28} />
            <span>Planet exploration theme</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Icon name="arrowBack" size={16} className="rotate-180" />
            <span>Forward arrow (rotated back arrow)</span>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Code Examples</h2>
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm">
          <div className="space-y-2">
            <div>&lt;Icon name="rocket" size={24} /&gt;</div>
            <div>&lt;Icon name="moonStars" size={48} className="text-blue-500" /&gt;</div>
            <div>&lt;Icon name="arrowBack" size={20} className="rotate-180" /&gt;</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetShowcase;