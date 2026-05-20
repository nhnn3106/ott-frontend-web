import React from 'react';
import type { NavigationItemProps } from '../../interfaces';

const NavigationItem: React.FC<NavigationItemProps> = ({ item, onItemClick }) => {
  const badgeCount = Math.max(0, Number(item.badge || 0));
  const hasBadge = badgeCount > 0;
  const badgeLabel = badgeCount > 99 ? "99+" : String(badgeCount);
  const badgeAriaLabel = `${badgeLabel} tin nhắn chưa đọc`;

  return (
    <button
      onClick={() => onItemClick?.(item.id)}
      className={`
        cursor-pointer 
        relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 group
        ${item.isActive 
          ? 'bg-primary-500 text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-primary-500'
        }
      `}
      title={item.label}
    >
      {item.icon}
      {hasBadge && item.isActive && (
        <span
          className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-bold leading-none text-white shadow-[0_4px_10px_rgba(239,68,68,0.22)]"
          aria-label={badgeAriaLabel}
        >
          {badgeLabel}
        </span>
      )}
      {hasBadge && !item.isActive && (
        <span
          className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-bold leading-none text-white shadow-[0_4px_10px_rgba(239,68,68,0.22)]"
          aria-label={badgeAriaLabel}
        >
          {badgeLabel}
        </span>
      )}
    </button>
  );
};

export default NavigationItem;
