// src / app / constants / food.constant.ts;

export type FoodType = 'Beef' | 'Chicken' | 'Fish' | 'Vegetarian' | 'Vegan' | 'Mixed';
export const FOODTYPESARRAY: FoodType[] = [
  'Beef',
  'Chicken',
  'Fish',
  'Vegetarian',
  'Vegan',
  'Mixed',
];

export interface FoodOption {
  id: number;
  name: string;
  type: FoodType;
  tags?: ('Halal' | 'Gluten-Free')[];
}

export const FOODOPTIONS: FoodOption[] = [
  { id: 1, name: 'Grilled Ribeye', type: 'Beef', tags: ['Halal'] },
  { id: 2, name: 'Beef Stroganoff', type: 'Beef' },
  { id: 3, name: 'Roast Chicken', type: 'Chicken' },
  { id: 4, name: 'Grilled Chicken Skewers', type: 'Chicken', tags: ['Halal', 'Gluten-Free'] },
  { id: 5, name: 'Grilled Salmon', type: 'Fish', tags: ['Gluten-Free'] },
  { id: 6, name: 'Baked Cod', type: 'Fish' },
  { id: 7, name: 'Vegetable Lasagna', type: 'Vegetarian' },
  { id: 8, name: 'Stuffed Peppers', type: 'Vegetarian', tags: ['Gluten-Free'] },
  { id: 9, name: 'Vegan Burger', type: 'Vegan' },
  { id: 10, name: 'Quinoa Salad', type: 'Vegan', tags: ['Gluten-Free'] },
];
