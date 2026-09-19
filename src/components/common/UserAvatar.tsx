import React, { useState } from 'react';

interface UserAvatarProps {
  src?: string;
  name: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showOnlineStatus?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  className = '',
  size = 'md',
  showOnlineStatus = false
}) => {
  const [hasError, setHasError] = useState(false);

  const getInitials = (fullName: string) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-16 h-16 text-lg',
  };

  const initials = getInitials(name);

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {!hasError && src && src.length > 5 ? (
        <img
          src={src}
          alt={name}
          onError={() => setHasError(true)}
          className={`${sizeClasses[size]} rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-900 text-white font-bold flex items-center justify-center border border-white/20 shadow-sm select-none`}
          title={name}
        >
          <span>{initials}</span>
        </div>
      )}

      {showOnlineStatus && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
      )}
    </div>
  );
};
