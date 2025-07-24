import categories from '@/config/categories.json';

export class CategorizationService {
  private categoryMap: Map<string, string[]>;

  constructor() {
    this.categoryMap = new Map(Object.entries(categories));
  }

  public categorize(description: string): string {
    for (const [category, keywords] of this.categoryMap.entries()) {
      for (const keyword of keywords) {
        if (description.includes(keyword)) {
          return category;
        }
      }
    }
    return '其他';
  }
}
