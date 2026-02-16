export interface FoodOption {
  id: number;
  name: string;
  type: FoodType;
  tags?: ('Halal' | 'Gluten-Free')[];
}

export type FoodType = 'Beef' | 'Chicken' | 'Fish' | 'Vegetarian' | 'Vegan' | 'Mixed';
