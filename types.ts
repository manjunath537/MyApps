export interface User {
  id: string;
  username: string;
}

export interface HousePreferences {
  style: string;
  country: string;
  bedrooms: number;
  bathrooms: number;
  stories: number;
  squareFootage: number;
  features: string[];
  colorPalette: string;
  additionalRequests: string;
}

export interface RoomDesign {
  area: string;
  description: string;
  imageUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  preferences: HousePreferences;
  designs: RoomDesign[];
  createdAt: Date;
  trendAnalysis?: string;
}