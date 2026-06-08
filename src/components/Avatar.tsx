/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFlowStore } from '../store/flowStore';

interface AvatarProps {
  name?: string;
  avatar?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name = '',
  avatar,
  size = 'md',
  className = ''
}) => {
  const { user } = useFlowStore();
  
  // Generate initials fallback
  const initials = React.useMemo(() => {
    const trimmed = name.trim();
    if (!trimmed) return '??';
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    const first = parts[0]?.[0] || '';
    const last = parts[parts.length - 1]?.[0] || '';
    return (first + last).slice(0, 2).toUpperCase();
  }, [name]);

  // Determine size classes
  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm font-semibold',
    lg: 'h-14 w-14 text-base font-extrabold',
    xl: 'h-24 w-24 text-xl font-black',
    custom: '',
  }[size];

  // Monochromatic styles matched to user preferences (zinc, slate, stone, neutral)
  const accent = user?.grayAccent || 'zinc';
  const colorMap = {
    zinc: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700',
    slate: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
    stone: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700',
    neutral: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700',
  };
  const accentClass = colorMap[accent] || colorMap.zinc;

  const [imgError, setImgError] = React.useState(false);

  // Reset img error state when image URL changes
  React.useEffect(() => {
    setImgError(false);
  }, [avatar]);

  // If we have an avatar URL and no previous load error, attempt to render the image
  if (avatar && !imgError) {
    return (
      <img
        src={avatar}
        alt={name}
        onError={() => setImgError(true)}
        referrerPolicy="no-referrer"
        className={`rounded-full border border-neutral-200/80 object-cover dark:border-neutral-800 shrink-0 ${sizeClasses} ${className}`}
      />
    );
  }

  // Fallback monogram avatar container
  return (
    <div
      className={`rounded-full border flex items-center justify-center tracking-tight select-none shrink-0 ${accentClass} ${sizeClasses} ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};
