import type { Quest } from "../types/quest";

export const quests: Quest[] = [
  {
    id: "scenic-route",
    title: "Take the scenic route",
    description:
      "Take a turn you usually walk past. Find one small thing you’ve never noticed before.",
    category: "Outdoors",
    minutes: 25,
    xp: 50,
    symbol: "↟",
    color: "sage",
    steps: [
      "Choose a familiar walk and take a different turn.",
      "Notice a small detail: a doorway, a tree, or a patch of light.",
      "Pause for a moment before heading home.",
    ],
  },
  {
    id: "table-for-one",
    title: "A table for one",
    description:
      "A warm drink, a cosy corner, and a little time in your own company.",
    category: "Slow living",
    minutes: 30,
    xp: 40,
    symbol: "☕",
    color: "peach",
    steps: [
      "Visit a café, or make a café corner at home.",
      "Choose a drink you’ll enjoy.",
      "Put your phone away and savour ten quiet minutes.",
    ],
  },
  {
    id: "collect-a-colour",
    title: "Collect a colour",
    description:
      "Pick a colour and follow it. Your everyday surroundings have a palette of their own.",
    category: "Creative",
    minutes: 20,
    xp: 40,
    symbol: "◒",
    color: "lilac",
    steps: [
      "Choose a colour before heading out.",
      "Find five things in that colour.",
      "Photograph or sketch your discoveries.",
    ],
  },
  {
    id: "little-sunshine",
    title: "Send a little sunshine",
    description:
      "Make someone’s ordinary day a little brighter with a handwritten note.",
    category: "Connection",
    minutes: 15,
    xp: 30,
    symbol: "✉",
    color: "peach",
    steps: [
      "Think of someone you appreciate.",
      "Write a favourite memory or a simple thank you.",
      "Send your note or give it to them.",
    ],
  },
  {
    id: "green-escape",
    title: "A little green escape",
    description:
      "Trade a little screen time for green time. There’s a quieter world outside.",
    category: "Outdoors",
    minutes: 20,
    xp: 35,
    symbol: "❋",
    color: "sage",
    steps: [
      "Find a park, garden, or leafy street.",
      "Look for three different plants.",
      "Stay still and listen to the sounds around you.",
    ],
  },
  {
    id: "golden-hour",
    title: "Catch the golden hour",
    description:
      "Let the day wind down with a quiet moment beneath the evening sky.",
    category: "Slow living",
    minutes: 15,
    xp: 45,
    symbol: "☀",
    color: "butter",
    steps: [
      "Find a comfortable spot near sunset.",
      "Notice how the light changes.",
      "Write down one good thing from today.",
    ],
  },
];

export function getQuest(id: string) {
  return quests.find((quest) => quest.id === id);
}