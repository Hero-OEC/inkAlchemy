import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { MiniCard } from "@/components/mini-card";
import { Button } from "@/components/button-variations";
import { ArrowLeft, Calendar, Crown, MapPin, Sword, Shield, Users, Zap, Heart, Skull, Eye, Lightbulb, PenTool, FileText, Edit, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, Event, Character, Location, Relationship } from "@shared/schema";

// Event type icons (same as timeline)
const EVENT_TYPE_ICONS = {
  battle: Sword,
  meeting: Users,
  discovery: Eye,
  political: Crown,
  personal: Heart,
  death: Skull,
  travel: MapPin,
  magic: Zap,
  other: Calendar
};

// Writing stage colors (same as timeline)
const STAGE_COLORS = {
  planning: {
    bg: "bg-brand-200",
    border: "border-brand-300",
    icon: "text-brand-900",
    stageIcon: Lightbulb
  },
  writing: {
    bg: "bg-brand-400", 
    border: "border-brand-500",
    icon: "text-white",
    stageIcon: PenTool
  },
  "first-draft": {
    bg: "bg-brand-600",
    border: "border-brand-700", 
    icon: "text-white",
    stageIcon: FileText
  },
  editing: {
    bg: "bg-brand-800",
    border: "border-brand-900",
    icon: "text-white",
    stageIcon: Edit
  },
  complete: {
    bg: "bg-brand-950",
    border: "border-brand-950",
    icon: "text-white",
    stageIcon: CheckCircle
  }
};

export default function EventDetails() {
  const { projectId, eventId } = useParams();
  const [, setLocation] = useLocation();
  
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: event } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: [`/api/projects/${projectId}/locations`],
  });

  const { data: relationships = [] } = useQuery<Relationship[]>({
    queryKey: [`/api/projects/${projectId}/relationships`],
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/timeline`);
  };

  const handleCharacterClick = (characterId: number) => {
    setLocation(`/projects/${projectId}/characters/${characterId}`);
  };

  const handleLocationClick = (locationId: number) => {
    setLocation(`/projects/${projectId}/locations/${locationId}`);
  };

  const handleEditEvent = () => {
    setLocation(`/projects/${projectId}/events/${event?.id}/edit`);
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-brand-50">
        <Navbar 
          hasActiveProject={true} 
          currentPage="timeline"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <main className="container mx-auto px-6 py-8" style={{ marginLeft: '100px', marginRight: '100px' }}>
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-brand-900 mb-4">Event not found</h1>
            <button 
              onClick={handleBack}
              className="text-brand-600 hover:text-brand-700"
            >
              ← Back to Timeline
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Get event relationships
  const eventRelationships = relationships.filter(rel => 
    rel.fromElementType === 'event' && rel.fromElementId === event.id
  );
  
  const eventCharacters = eventRelationships
    .filter(rel => rel.toElementType === 'character')
    .map(rel => characters.find(char => char.id === rel.toElementId))
    .filter(Boolean) as Character[];
  
  const eventLocation = event.locationId 
    ? locations.find(loc => loc.id === event.locationId)
    : undefined;

  const stageConfig = STAGE_COLORS[event.stage as keyof typeof STAGE_COLORS] || STAGE_COLORS.planning;
  const IconComponent = EVENT_TYPE_ICONS[event.type as keyof typeof EVENT_TYPE_ICONS] || Calendar;

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true} 
        currentPage="timeline"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="container mx-auto px-6 py-8" style={{ marginLeft: '100px', marginRight: '100px' }}>
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Timeline
          </Button>
        </div>

        {/* Event Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className={cn("p-3 rounded-lg", stageConfig.bg, stageConfig.border)}>
            <IconComponent className={cn("w-6 h-6", stageConfig.icon)} />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-brand-900 mb-2">{event.title}</h1>
            <div className="flex items-center gap-3">
              <div className={cn("inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm", stageConfig.bg, stageConfig.border)}>
                <stageConfig.stageIcon className={cn("w-4 h-4", stageConfig.icon)} />
                <span className={cn("capitalize font-medium", stageConfig.icon)}>{event.stage}</span>
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-secondary border border-border">
                <IconComponent className="w-4 h-4 text-muted-foreground" />
                <span className="capitalize text-secondary-foreground">{event.type}</span>
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-brand-100 border border-brand-200">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span className="text-brand-800 font-medium">
                  Year {event.year}, Month {event.month}, Day {event.day}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={handleEditEvent}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Event
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Event Description */}
          <div className="lg:col-span-2">
            <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
              <h2 className="text-xl font-semibold text-brand-900 mb-4">Event Description</h2>
              {event.description ? (
                <div className="prose prose-brand max-w-none">
                  <p className="text-brand-700 leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              ) : (
                <p className="text-brand-500 italic">
                  No description provided for this event.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar - Location & Characters */}
          <div className="space-y-6">
            {/* Location Section */}
            <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
              <h3 className="text-lg font-semibold text-brand-900 mb-4">Location</h3>
              {eventLocation ? (
                <MiniCard
                  icon={MapPin}
                  title={eventLocation.name}
                  badge={eventLocation.type}
                  badgeVariant="type"
                  onClick={() => handleLocationClick(eventLocation.id)}
                  className="w-full"
                />
              ) : (
                <p className="text-brand-500 italic text-sm">
                  No location specified for this event.
                </p>
              )}
            </div>

            {/* Characters Section */}
            <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
              <h3 className="text-lg font-semibold text-brand-900 mb-4">Characters Involved</h3>
              {eventCharacters.length > 0 ? (
                <div className="space-y-3">
                  {eventCharacters.map((character) => (
                    <MiniCard
                      key={character.id}
                      icon={Users}
                      title={character.name}
                      badge={character.type}
                      badgeVariant="type"
                      onClick={() => handleCharacterClick(character.id)}
                      className="w-full"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-brand-500 italic text-sm">
                  No characters specified for this event.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}