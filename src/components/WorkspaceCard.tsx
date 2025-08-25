import { Card, CardContent } from '@/components/ui/card';
import { WorkspaceItem } from '@/types/workspace';
import { ExternalLink, Monitor, FolderKanban, Globe, ChartPieIcon, Briefcase, Smartphone, Laptop, Palette, 
  BarChart3, Zap, Wrench, FileText, Target, Rocket, 
  Lock, Cloud, Lightbulb, Package, Users, 
  LayoutGrid, Clock, Calendar, Mail, Inbox, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '@/hooks/useWorkspaceStore';
import { useState } from 'react';

interface WorkspaceCardProps {
  item: WorkspaceItem;
}

export const WorkspaceCard = ({ item }: WorkspaceCardProps) => {
  const navigate = useNavigate();
  const { items } = useWorkspaceStore();
  const [expanded, setExpanded] = useState(false);
  
  // Get child items if this is a nested card
  const childItems = item.type === 'nested' 
    ? items.filter(child => child.parentId && child.parentId !== 'none' && child.parentId === item.id)
    : [];

  const getIconComponent = (iconName: string) => {
    switch(iconName) {
      case 'globe': return <Globe className="w-8 h-8" />;
      case 'chart': return <ChartPieIcon className="w-8 h-8" />;
      case 'briefcase': return <Briefcase className="w-8 h-8" />;
      case 'mobile': return <Smartphone className="w-8 h-8" />;
      case 'laptop': return <Laptop className="w-8 h-8" />;
      case 'palette': return <Palette className="w-8 h-8" />;
      case 'chart2': return <BarChart3 className="w-8 h-8" />;
      case 'zap': return <Zap className="w-8 h-8" />;
      case 'wrench': return <Wrench className="w-8 h-8" />;
      case 'file': return <FileText className="w-8 h-8" />;
      case 'target': return <Target className="w-8 h-8" />;
      case 'rocket': return <Rocket className="w-8 h-8" />;
      case 'lock': return <Lock className="w-8 h-8" />;
      case 'cloud': return <Cloud className="w-8 h-8" />;
      case 'bulb': return <Lightbulb className="w-8 h-8" />;
      case 'package': return <Package className="w-8 h-8" />;
      case 'kanban': return <FolderKanban className="w-8 h-8" />;
      case 'users': return <Users className="w-8 h-8" />;
      case 'grid': return <LayoutGrid className="w-8 h-8" />;
      case 'clock': return <Clock className="w-8 h-8" />;
      case 'calendar': return <Calendar className="w-8 h-8" />;
      case 'mail': return <Mail className="w-8 h-8" />;
      case 'inbox': return <Inbox className="w-8 h-8" />;
      case 'search': return <Search className="w-8 h-8" />;
      default: return <Globe className="w-8 h-8" />;
    }
  };

  const handleClick = () => {
    if (item.type === 'external') {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else if (item.type === 'embed') {
      navigate(`/embed/${item.id}`);
    } else if (item.type === 'nested') {
      // Navigate to a nested view instead of expanding
      navigate(`/nested/${item.id}`);
    }
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg backdrop-blur-sm relative overflow-hidden h-[280px] w-full max-w-[240px] mx-auto"
      onClick={handleClick}
    >
      {/* Inset shadow for depth */}
      <div className="absolute inset-0 shadow-inner pointer-events-none" />
      
      <CardContent className="p-6 relative overflow-hidden flex flex-col justify-between h-full">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex flex-col items-center text-center h-full">
          {/* Modern icon container with glassmorphism effect */}
          <div className="relative mt-4">
            <div className={`w-16 h-16 rounded-2xl ${item.color || 'bg-gradient-to-br from-blue-500 to-indigo-600'} flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-2xl backdrop-blur-sm border border-white/20 relative overflow-hidden`}>
              {/* Fancy shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out" />
              {typeof item.icon === 'string' && getIconComponent(item.icon)}
            </div>
            {/* Glow effect */}
            <div className={`absolute inset-0 w-16 h-16 rounded-2xl ${item.color || 'bg-gradient-to-br from-blue-500 to-indigo-600'} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`} />
          </div>
          
          <div className="space-y-2 flex-grow flex flex-col justify-center my-3 px-2">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:bg-clip-text transition-all duration-500 line-clamp-2 group-hover:scale-105">
              {item.title}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
              {item.description}
            </p>
          </div>

          {/* Modern type indicator */}
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100/50 group-hover:bg-blue-100/50 transition-colors duration-300 backdrop-blur-sm mb-4">
            {item.type === 'external' ? (
              <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors duration-300" />
            ) : item.type === 'embed' ? (
              <Monitor className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors duration-300" />
            ) : (
              <FolderKanban className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors duration-300" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};