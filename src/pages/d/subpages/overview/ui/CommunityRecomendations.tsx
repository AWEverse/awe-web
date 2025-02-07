import CommRecCard from "@/entities/CommRecCard";
import FlatList from "@/entities/FlatList";
import useHorizontalScroll from "@/shared/hooks/DOM/useHorizontalScroll";
import { useRef } from "react";

const CommunityRecomendations = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useHorizontalScroll(containerRef, {
    isDisabled: false,
    shouldPreventDefault: true,
    scrollSpeedMultiplier: 1,
  });

  return (
    <div ref={containerRef} className="flex gap-2 overflow-x-auto">
      <FlatList
        disableWrapper
        horizontal
        data={communities}
        keyExtractor={(item) => item.title}
        renderItem={({ title, value, description }) => (
          <CommRecCard
            avatarSrc="https://i.pravatar.cc/300"
            desc={description}
            title={title}
            value={value}
          />
        )}
      />
    </div>
  );
};

const communities = [
  {
    title: "TechInnovators",
    description: "Technology innovation hub",
    value: "95,431",
  },
  {
    title: "ArtLoversHub",
    description: "Community for art enthusiasts",
    value: "95,431",
  },
  {
    title: "HealthAndWellness",
    description: "Health and wellness discussions",
    value: "95,431",
  },
  {
    title: "FitnessFreaks",
    description: "Fitness and workout tips",
    value: "95,431",
  },
  {
    title: "BookwormsUnited",
    description: "For book lovers and readers",
    value: "95,431",
  },
  {
    title: "GamingLegends",
    description: "Gaming community",
    value: "95,431",
  },
  {
    title: "TravelAdventurers",
    description: "Travel adventures and tips",
    value: "95,431",
  },
  {
    title: "MusicMakers",
    description: "Music creation and appreciation",
    value: "95,431",
  },
  {
    title: "FoodiesCorner",
    description: "Culinary experiences and recipes",
    value: "95,431",
  },
  {
    title: "StartupSuccess",
    description: "Entrepreneurship and startups",
    value: "95,431",
  },
  {
    title: "PhotographyPros",
    description: "Photography tips and techniques",
    value: "95,431",
  },
  {
    title: "PetLovers",
    description: "Community for pet owners",
    value: "95,431",
  },
  {
    title: "ScienceGeeks",
    description: "Science discoveries and facts",
    value: "95,431",
  },
  {
    title: "MovieBuffs",
    description: "Film discussions and reviews",
    value: "95,431",
  },
  {
    title: "DIYCreators",
    description: "DIY projects and creativity",
    value: "95,431",
  },
];

export default CommunityRecomendations;
