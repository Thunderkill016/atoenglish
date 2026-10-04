/**
 * Authored starter texts for the reading surface.
 *
 * Deliberately short and written inside the seed dictionary's coverage — the
 * texts are an on-ramp so an A0 learner can read immediately, not a content
 * library (spec-008 non-goal: authored content is not the product).
 */

export type StarterText = {
  readonly id: string;
  readonly title: string;
  readonly level: "A0" | "A1";
  readonly body: string;
};

export const STARTER_TEXTS: readonly StarterText[] = [
  {
    id: "starter-minh-first-day",
    title: "Ngày đầu của Minh",
    level: "A0",
    body: `Hello! My name is Minh. I am from Hanoi. I live with my family — my mother, my father and my sister. Today I go to work. I am a teacher. I am happy but tired. My friend says, "How are you?" I say, "I'm fine, thank you. And you?"`,
  },
  {
    id: "starter-coffee-shop",
    title: "Ở quán cà phê",
    level: "A0",
    body: `I am with my friend. The menu is small. Coffee, rice, noodles, chicken, soup, bread, water — the price is cheap. The bill is not expensive. We pay and say thank you.`,
  },
  {
    id: "starter-my-day",
    title: "Một ngày của tôi",
    level: "A1",
    body: `I am a teacher. I work in a school. In the morning I work with students. I am busy. At night I study with my friend. My family is happy. Tomorrow I work again.`,
  },
];
