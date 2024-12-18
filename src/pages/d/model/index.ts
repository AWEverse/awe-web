interface Tags {
  name: string;
  posts: number;
}

interface Subcategory {
  name: string;
  desc: string;
  posts: number;
  tags?: Tags[];
}

interface Category {
  name: string;
  desc: string;
  posts: number;
  subcategories: Subcategory[];
}

type Categories = Category[];

export type { Category, Subcategory, Categories, Tags };
