import { LeftColumnScreenType } from '@/pages/chat/types/LeftColumn';

export interface SharedScreenProps {
  className?: string;
  onScreenChange?: (screen: LeftColumnScreenType) => void;
}
