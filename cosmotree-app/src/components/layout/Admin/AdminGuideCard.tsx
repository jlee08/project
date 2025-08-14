// src/components/layout/Admin/AdminGuideCard.tsx
import React from 'react';
import Icon from '../../UI/Icon';

interface AdminGuideCardProps {
  title: string;
  description: string;
  tips: string[];
  icon: string;
}

export const AdminGuideCard: React.FC<AdminGuideCardProps> = ({ 
  title, 
  description, 
  tips, 
  icon 
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon name={icon} className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          
          {tips.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Tips:</h4>
              <ul className="space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <Icon name="check" className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
