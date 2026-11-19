const dict = {
  en: {
    listings: "Listings", searches: "Searches", total: "Listings", newToday: "New (24h)", activeSearches: "Active searches",
    lastRun: "Last run", all: "All", newOnly: "New", price: "Price", surface: "Surface", rooms: "Rooms", city: "City",
    source: "Source", found: "Found", score: "Fit", empty: "No listings yet", emptyHint: "The agent is searching. Results appear here as soon as they are saved.",
    never: "never", runNow: "Run now", started: "Run started", agentDown: "Agent unreachable", every: "Every", status: "Status",
    active: "Active", noRuns: "No run yet", history: "Recent runs", new: "new", fresh: "New", open: "Open",
    // onboarding
    welcome: "What are you looking for?", step1: "Project", step2: "Place & budget", step3: "Monitoring",
    buy: "Buy", rent: "Rent", flat: "Apartment", house: "House", where: "Cities or postal codes", whereHint: "Press Enter to add",
    maxPrice: "Max budget", minSurface: "Min surface", minRooms: "Min rooms", notes: "Anything else?", notesHint: "Quiet street, balcony, no ground floor…",
    sources: "Sites", frequency: "Check", next: "Next", back: "Back", start: "Start searching", name: "Name",
    h1: "every hour", h6: "every 6 hours", h24: "every day", needPlace: "Add at least one city",
  },
  fr: {
    listings: "Annonces", searches: "Recherches", total: "Annonces", newToday: "Nouvelles (24 h)", activeSearches: "Recherches actives",
    lastRun: "Dernier passage", all: "Toutes", newOnly: "Nouvelles", price: "Prix", surface: "Surface", rooms: "Pièces", city: "Ville",
    source: "Source", found: "Trouvées", score: "Adéquation", empty: "Aucune annonce pour l'instant", emptyHint: "L'agent cherche. Les résultats apparaissent ici dès qu'ils sont enregistrés.",
    never: "jamais", runNow: "Lancer", started: "Recherche lancée", agentDown: "Agent injoignable", every: "Toutes les", status: "Statut",
    active: "Active", noRuns: "Aucun passage", history: "Derniers passages", new: "nouvelles", fresh: "Nouveau", open: "Ouvrir",
    welcome: "Que recherchez-vous ?", step1: "Projet", step2: "Lieu et budget", step3: "Surveillance",
    buy: "Acheter", rent: "Louer", flat: "Appartement", house: "Maison", where: "Villes ou codes postaux", whereHint: "Entrée pour ajouter",
    maxPrice: "Budget max", minSurface: "Surface min", minRooms: "Pièces min", notes: "Autre chose ?", notesHint: "Rue calme, balcon, pas de rez-de-chaussée…",
    sources: "Sites", frequency: "Vérifier", next: "Suivant", back: "Retour", start: "Lancer la recherche", name: "Nom",
    h1: "toutes les heures", h6: "toutes les 6 heures", h24: "tous les jours", needPlace: "Ajoutez au moins une ville",
  },
} as const;

export type Key = keyof (typeof dict)["en"];
export const lang: "en" | "fr" = process.env.APP_LANG === "en" ? "en" : "fr";
export const t = (k: Key): string => dict[lang][k];
export const dictionary = dict[lang];
