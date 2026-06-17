import type { routes } from "@db/schema";

type Route = typeof routes.$inferSelect;

export interface WSMRequest {
  budgetDay: number;
  days: number;
  season: string;
  group: string;
  fitness: number;
  goal: string;
  regions: string[];
  wNature: number;
  wCulture: number;
  wComfort: number;
  wCost: number;
  wAdventure: number;
}

export interface WSMResult {
  route: Route;
  score: number;
  explanation: string;
  componentScores: {
    nature: number;
    culture: number;
    comfort: number;
    cost: number;
    adventure: number;
    rating: number;
  };
  rank: number;
}

const GOAL_MULTIPLIERS: Record<string, { key: string; mult: number }[]> = {
  "Природа": [{ key: "wNature", mult: 1.5 }],
  "Культура": [{ key: "wCulture", mult: 1.5 }],
  "Приключения": [{ key: "wAdventure", mult: 1.5 }],
  "Семейный": [{ key: "wComfort", mult: 2.0 }],
  "Бюджетный": [{ key: "wCost", mult: 1.5 }],
};

export function detectProfile(req: WSMRequest): string {
  const weights: Record<string, number> = {
    wNature: req.wNature,
    wCulture: req.wCulture,
    wComfort: req.wComfort,
    wCost: req.wCost,
    wAdventure: req.wAdventure,
  };

  const goal = req.goal;
  const multis = GOAL_MULTIPLIERS[goal] || [];
  for (const m of multis) {
    weights[m.key] = (weights[m.key] || 0) * m.mult;
  }

  if (req.group === "Семья") {
    weights.wComfort = (weights.wComfort || 0) * 1.5;
  }

  let maxW = 0;
  let profile = "Adventure";
  const map: [string, number][] = [
    ["Экотурист", weights.wNature || 0],
    ["Культурный", weights.wCulture || 0],
    ["Adventure", weights.wAdventure || 0],
    ["Семейный", weights.wComfort || 0],
    ["Бюджетный", weights.wCost || 0],
  ];
  for (const [p, v] of map) {
    if (v > maxW) {
      maxW = v;
      profile = p;
    }
  }
  return profile;
}

function seasonMatch(routeSeason: string, userSeason: string): number {
  if (userSeason === "Любой" || userSeason === "Любой") return 1.0;
  const rs = routeSeason.toLowerCase();
  const us = userSeason.toLowerCase();
  if (rs.includes("круглый") || rs.includes("все")) return 1.0;
  if (us === "лето" && (rs.includes("лето") || rs.includes("май") || rs.includes("сен"))) return 1.0;
  if (us === "зима" && (rs.includes("зим") || rs.includes("лыж") || rs.includes("фрирайд"))) return 1.0;
  if (us.includes("весна") && (rs.includes("весн") || rs.includes("май"))) return 0.8;
  if (us.includes("осен") && (rs.includes("осен") || rs.includes("сен"))) return 0.8;
  return 0.1;
}

function getSeasonMatchScore(routeSeason: string, userSeason: string): number {
  return seasonMatch(routeSeason, userSeason);
}

export function runWSM(routes: Route[], req: WSMRequest): WSMResult[] {
  const userBudgetTotal = req.budgetDay * req.days;
  const results: WSMResult[] = [];

  for (const route of routes) {
    // Level 1: Hard filters
    if (route.budgetPerDay > userBudgetTotal * 1.6) continue;
    if (route.durationDays > req.days * 1.8) continue;
    if (req.group === "Семья" && route.difficulty > 6) continue;
    if (route.difficulty > req.fitness * 2 + 2) continue;

    const sm = getSeasonMatchScore(route.season, req.season);
    if (sm < 0.2 && req.season !== "Любой") continue;

    if (!req.regions.includes(route.region) && !req.regions.includes("Все")) continue;

    // Level 2: WSM scoring
    const sumW = req.wNature + req.wCulture + req.wComfort + req.wCost + req.wAdventure;
    if (sumW === 0) continue;
    const nw = {
      nature: req.wNature / sumW,
      culture: req.wCulture / sumW,
      comfort: req.wComfort / sumW,
      cost: req.wCost / sumW,
      adventure: req.wAdventure / sumW,
    };

    const comps = {
      nature: (route.natureScore - 1) / 9,
      culture: (route.cultureScore - 1) / 9,
      comfort: (route.comfortScore - 1) / 9,
      adventure: (route.adventureScore - 1) / 9,
      cost: Math.max(0, 1 - route.budgetPerDay / (req.budgetDay * 1.2)),
      rating: (route.rating - 3) / 2,
    };

    const wsm =
      nw.nature * comps.nature +
      nw.culture * comps.culture +
      nw.comfort * comps.comfort +
      nw.cost * comps.cost +
      nw.adventure * comps.adventure;

    const ratingBonus = comps.rating * 0.05;
    const finalScore = Math.min(100, Math.round((wsm * 0.95 + ratingBonus) * (0.7 + sm * 0.3) * 100));

    // Generate explanation
    const contributions = [
      { key: "nature", label: "Природа", value: nw.nature * comps.nature },
      { key: "culture", label: "Культура", value: nw.culture * comps.culture },
      { key: "comfort", label: "Комфорт", value: nw.comfort * comps.comfort },
      { key: "cost", label: "Стоимость", value: nw.cost * comps.cost },
      { key: "adventure", label: "Приключения", value: nw.adventure * comps.adventure },
    ];
    contributions.sort((a, b) => b.value - a.value);
    const top2 = contributions.slice(0, 2);
    const explanation = `Высокий балл по критериям: ${top2.map((c) => `${c.label} (${Math.round(c.value * 100)}%)`).join(" и ")}`;

    results.push({
      route,
      score: finalScore,
      explanation,
      componentScores: {
        nature: Math.round(comps.nature * 100),
        culture: Math.round(comps.culture * 100),
        comfort: Math.round(comps.comfort * 100),
        cost: Math.round(comps.cost * 100),
        adventure: Math.round(comps.adventure * 100),
        rating: Math.round(comps.rating * 100),
      },
      rank: 0,
    });
  }

  results.sort((a, b) => b.score - a.score);
  results.forEach((r, i) => {
    r.rank = i + 1;
  });

  return results.slice(0, 5);
}
