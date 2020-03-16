export function generateName(length = 3) {
  let words = [
    "Alpha",
    "Aching",
    "Amber",
    "Angry",
    "Attack",
    "Autumn",
    "Axe",
    "Bar",
    "Bear",
    "Bird",
    "Black",
    "Blade",
    "Blaze",
    "Blood",
    "Blue",
    "Bone",
    "Bright",
    "Broken",
    "Brute",
    "Buried",
    "Burn",
    "Burnt",
    "Cave",
    "Century",
    "Changing",
    "Chaos",
    "Chaotic",
    "Charge",
    "Child",
    "City",
    "Clear",
    "Cloud",
    "Coded",
    "Cold",
    "Comfort",
    "Compute",
    "Conquer",
    "Cool",
    "Crown",
    "Crying",
    "Cutting",
    "Dagger",
    "Danger",
    "Dark",
    "Dash",
    "Delta",
    "Desert",
    "Diamond",
    "Distressed",
    "Dove",
    "Dreadnaught",
    "Dream",
    "Drip",
    "Dull",
    "Earth",
    "Edge",
    "Ember",
    "Emerald",
    "Eve",
    "Eye",
    "Eye",
    "Fall",
    "Fate",
    "Fear",
    "Fierce",
    "Fight",
    "Fighting",
    "Fire",
    "First",
    "Five",
    "Five",
    "Flame",
    "Flower",
    "Fog",
    "Force",
    "Fortune",
    "Fox",
    "Frog",
    "Future",
    "Fuzzy",
    "Gentle",
    "Ghost",
    "Global",
    "Glow",
    "Glowing",
    "Gold",
    "Halo",
    "Hammer",
    "Hand",
    "Happy",
    "Hard",
    "Harmony",
    "Hate",
    "Heart",
    "Heat",
    "Hope",
    "Human",
    "Hyper",
    "Imperfect",
    "Inferno",
    "Island",
    "Jagged",
    "Jewel",
    "Key",
    "Lake",
    "Laser",
    "Last",
    "Leaf",
    "Letter",
    "Lie",
    "Life",
    "Light",
    "Lightning",
    "Lily",
    "Lost",
    "Lotus",
    "Love",
    "Machine",
    "Man",
    "Midight",
    "Mill",
    "Mist",
    "Mood",
    "Moon",
    "Mountain",
    "Move",
    "Neon",
    "Night",
    "Note",
    "Ocean",
    "Omega",
    "Paradigm",
    "Peace",
    "Perfect",
    "Plain",
    "Protection",
    "Rage",
    "Rainbow",
    "Redemption",
    "Retribution",
    "Reality",
    "Red",
    "Rider",
    "Rising",
    "River",
    "Rock",
    "Rose",
    "Rough",
    "Ruby",
    "Runner",
    "Rush",
    "Rust",
    "Sad",
    "Saphire",
    "Sea",
    "Serene",
    "Shine",
    "Silent",
    "Silver",
    "Skull",
    "Sleep",
    "Sleeping",
    "Slow",
    "Snake",
    "Soft",
    "Sonic",
    "Soul",
    "Space",
    "Sphinx",
    "Spring",
    "Star",
    "Steam",
    "Steel",
    "Still",
    "Stone",
    "Storm",
    "Stream",
    "Strength",
    "Strong",
    "Sublime",
    "Summer",
    "Sun",
    "Sunken",
    "Swift",
    "Sword",
    "Tear",
    "Thunder",
    "Tiger",
    "Tired",
    "Tree",
    "Tribute",
    "Trunk",
    "Truth",
    "Tulip",
    "Tundra",
    "Turbo",
    "Ultra",
    "Unique",
    "Warm",
    "Water",
    "Whisper",
    "White",
    "Wind",
    "Wing",
    "Winter",
    "Wolf",
    "Woman",
    "Worship",
    "Worry",
    "Zero"
  ];
  let name = [];
  for (let i = 0; i < length; i++) {
    let randomI = Math.floor(Math.random() * words.length - 1);
    name.push(words[randomI]);
  }
  return name.join(" "); //.replace(/ (.)/, l => l.toLowerCase());
}
