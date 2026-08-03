import {
  Utensils,
  Coffee,
  Car,
  Bus,
  Plane,
  ShoppingBag,
  ShoppingBasket,
  Film,
  Gamepad2,
  Music,
  Home,
  Zap,
  Wifi,
  HeartPulse,
  Dumbbell,
  GraduationCap,
  BookOpen,
  Briefcase,
  Laptop,
  TrendingUp,
  PiggyBank,
  Coins,
  DollarSign,
  CreditCard,
  Gift,
  Smile,
  Camera,
  Wrench,
  Fuel,
  Shield,
  Smartphone,
  Globe,
  Clock,
  Star,
  Tag,
  Sparkles,
  Award,
  Package,
  Heart,
  Store,
  Hotel,
  LucideIcon
} from 'lucide-react';

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  Coffee,
  Car,
  Bus,
  Plane,
  ShoppingBag,
  ShoppingBasket,
  Film,
  Gamepad2,
  Music,
  Home,
  Zap,
  Wifi,
  HeartPulse,
  Dumbbell,
  GraduationCap,
  BookOpen,
  Briefcase,
  Laptop,
  TrendingUp,
  PiggyBank,
  Coins,
  DollarSign,
  CreditCard,
  Gift,
  Smile,
  Camera,
  Wrench,
  Fuel,
  Shield,
  Smartphone,
  Globe,
  Clock,
  Star,
  Sparkles,
  Award,
  Package,
  Heart,
  Store,
  Hotel,
  Tag
};

export const AVAILABLE_CATEGORY_ICONS: { name: string; label: string; icon: LucideIcon }[] = [
  { name: 'Utensils', label: 'Food / Dining', icon: Utensils },
  { name: 'Coffee', label: 'Coffee / Drinks', icon: Coffee },
  { name: 'Car', label: 'Car / Transport', icon: Car },
  { name: 'Bus', label: 'Bus / Public Transit', icon: Bus },
  { name: 'Plane', label: 'Travel / Flights', icon: Plane },
  { name: 'ShoppingBag', label: 'Shopping', icon: ShoppingBag },
  { name: 'ShoppingBasket', label: 'Groceries', icon: ShoppingBasket },
  { name: 'Film', label: 'Movies / Entertainment', icon: Film },
  { name: 'Gamepad2', label: 'Gaming', icon: Gamepad2 },
  { name: 'Music', label: 'Music', icon: Music },
  { name: 'Home', label: 'Housing / Rent', icon: Home },
  { name: 'Zap', label: 'Utilities / Power', icon: Zap },
  { name: 'Wifi', label: 'Internet / Telecom', icon: Wifi },
  { name: 'HeartPulse', label: 'Healthcare / Pharmacy', icon: HeartPulse },
  { name: 'Dumbbell', label: 'Fitness / Gym', icon: Dumbbell },
  { name: 'GraduationCap', label: 'Education / School', icon: GraduationCap },
  { name: 'BookOpen', label: 'Books / Courses', icon: BookOpen },
  { name: 'Briefcase', label: 'Salary / Office', icon: Briefcase },
  { name: 'Laptop', label: 'Freelance / Work', icon: Laptop },
  { name: 'TrendingUp', label: 'Investment / Stocks', icon: TrendingUp },
  { name: 'PiggyBank', label: 'Savings / Deposit', icon: PiggyBank },
  { name: 'Coins', label: 'Cash / Income', icon: Coins },
  { name: 'DollarSign', label: 'Finance', icon: DollarSign },
  { name: 'CreditCard', label: 'Card / Payment', icon: CreditCard },
  { name: 'Gift', label: 'Gift / Bonus', icon: Gift },
  { name: 'Smile', label: 'Personal Care', icon: Smile },
  { name: 'Camera', label: 'Photography / Hobby', icon: Camera },
  { name: 'Wrench', label: 'Repairs / Service', icon: Wrench },
  { name: 'Fuel', label: 'Fuel / Gas', icon: Fuel },
  { name: 'Shield', label: 'Insurance', icon: Shield },
  { name: 'Smartphone', label: 'Gadgets', icon: Smartphone },
  { name: 'Globe', label: 'Online Services', icon: Globe },
  { name: 'Clock', label: 'Subscriptions', icon: Clock },
  { name: 'Star', label: 'Favorites', icon: Star },
  { name: 'Sparkles', label: 'Special / Rewards', icon: Sparkles },
  { name: 'Award', label: 'Achievement', icon: Award },
  { name: 'Package', label: 'Delivery / Parcel', icon: Package },
  { name: 'Heart', label: 'Donations / Family', icon: Heart },
  { name: 'Store', label: 'Retail Store', icon: Store },
  { name: 'Hotel', label: 'Hotel / Stays', icon: Hotel },
  { name: 'Tag', label: 'Others / General', icon: Tag },
];

export const getCategoryIcon = (
  categoryName: string,
  categoryIcons?: Record<string, string>
): LucideIcon => {
  if (!categoryName) return Tag;
  const norm = categoryName.trim();

  // 1. Check custom user-configured icon mapping
  const customIconName = categoryIcons?.[norm] || categoryIcons?.[norm.toLowerCase()];
  if (customIconName && CATEGORY_ICON_MAP[customIconName]) {
    return CATEGORY_ICON_MAP[customIconName];
  }

  // 2. Fallback to smart keyword matching
  const lowerNorm = norm.toLowerCase();
  if (lowerNorm.includes('food') || lowerNorm.includes('dining') || lowerNorm.includes('grocer') || lowerNorm.includes('စားသောက်') || lowerNorm.includes('အစားအသောက်') || lowerNorm.includes('ကုန်စုံ')) {
    return Utensils;
  }
  if (lowerNorm.includes('transport') || lowerNorm.includes('travel') || lowerNorm.includes('thukyan') || lowerNorm.includes('သယ်ယူ') || lowerNorm.includes('ခရီးသွား')) {
    return Car;
  }
  if (lowerNorm.includes('shop') || lowerNorm.includes('store') || lowerNorm.includes('ဈေးဝယ်')) {
    return ShoppingBag;
  }
  if (lowerNorm.includes('entertain') || lowerNorm.includes('movie') || lowerNorm.includes('ဖျော်ဖြေ')) {
    return Film;
  }
  if (lowerNorm.includes('hous') || lowerNorm.includes('rent') || lowerNorm.includes('အိမ်')) {
    return Home;
  }
  if (lowerNorm.includes('util') || lowerNorm.includes('bill') || lowerNorm.includes('မီတာ') || lowerNorm.includes('ဖုန်းဘေလ်')) {
    return Zap;
  }
  if (lowerNorm.includes('health') || lowerNorm.includes('well') || lowerNorm.includes('gym') || lowerNorm.includes('ကျန်းမာရေး') || lowerNorm.includes('ဆေးဝါး') || lowerNorm.includes('ဂျင်')) {
    return HeartPulse;
  }
  if (lowerNorm.includes('educat') || lowerNorm.includes('school') || lowerNorm.includes('ပညာရေး') || lowerNorm.includes('သင်တန်း')) {
    return GraduationCap;
  }
  if (lowerNorm.includes('salar') || lowerNorm.includes('လစာ')) {
    return Briefcase;
  }
  if (lowerNorm.includes('free') || lowerNorm.includes('consult') || lowerNorm.includes('လွတ်လပ်') || lowerNorm.includes('အလွတ်တန်း') || lowerNorm.includes('အကြံပေး')) {
    return Laptop;
  }
  if (lowerNorm.includes('invest') || lowerNorm.includes('dividend') || lowerNorm.includes('ရင်းနှီးမြှုပ်နှံ') || lowerNorm.includes('အစုရှယ်ယာ')) {
    return TrendingUp;
  }
  if (lowerNorm.includes('gift') || lowerNorm.includes('bonus') || lowerNorm.includes('grant') || lowerNorm.includes('လက်ဆောင်') || lowerNorm.includes('ဆုကြေး') || lowerNorm.includes('ထောက်ပံ့')) {
    return Gift;
  }

  return Tag;
};
