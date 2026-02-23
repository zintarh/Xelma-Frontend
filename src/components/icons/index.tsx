import { Bell as LucideBell, Check as LucideCheck, Clock as LucideClock } from 'lucide-react';
import React from 'react';

// Icon wrapper — central place to swap in shadcn-native icons later.
// Currently re-exports lucide-react icons used across the app.

export const Bell = (props: React.ComponentProps<typeof LucideBell>) => <LucideBell {...props} />;
export const Check = (props: React.ComponentProps<typeof LucideCheck>) => <LucideCheck {...props} />;
export const Clock = (props: React.ComponentProps<typeof LucideClock>) => <LucideClock {...props} />;

export default { Bell, Check, Clock };
