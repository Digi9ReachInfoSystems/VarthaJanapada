/**
 * Location mapping from:
 * new-impetiondocs/Location_Mapping Data Karnataka.xlsx
 *
 * Public API expects DistrictName (case-insensitive).
 * Also accepts DistrictCode and common slug/alias variants.
 */
const DISTRICT_ROWS = [
  { code: "KA_BD", name: "Bidar" },
  { code: "KA_BG", name: "Belagavi" },
  { code: "KA_BJ", name: "Vijayapura" },
  { code: "KA_BK", name: "Bagalkot" },
  { code: "KA_BL", name: "Ballari" },
  { code: "KA_BN", name: "Bengaluru Urban" },
  { code: "KA_BR", name: "Bengaluru Rural" },
  { code: "KA_CJ", name: "Chamarajnagar" },
  { code: "KA_CK", name: "Chikkaballapur" },
  { code: "KA_CM", name: "Chikkamagaluru" },
  { code: "KA_CT", name: "Chitradurga" },
  { code: "KA_DA", name: "Davanagere" },
  { code: "KA_DH", name: "Dharwad" },
  { code: "KA_DK", name: "Dakshina Kannada" },
  { code: "KA_GA", name: "Gadag" },
  { code: "KA_GU", name: "Kalaburagi" },
  { code: "KA_HS", name: "Hassan" },
  { code: "KA_HV", name: "Haveri" },
  { code: "KA_KD", name: "Kodagu" },
  { code: "KA_KL", name: "Kolar" },
  { code: "KA_KP", name: "Koppal" },
  { code: "KA_MA", name: "Mandya" },
  { code: "KA_MY", name: "Mysuru" },
  { code: "KA_RA", name: "Raichur" },
  { code: "KA_RM", name: "Ramanagara" },
  { code: "KA_SH", name: "Shimoga" },
  { code: "KA_TU", name: "Tumakuru" },
  { code: "KA_UD", name: "Udupi" },
  { code: "KA_UK", name: "Uttara Kannada" },
  { code: "KA_VI", name: "Vijayanagara" },
  { code: "KA_YG", name: "Yadgir" },
];

/** Extra aliases → canonical DistrictName from the xlsx */
const EXTRA_ALIASES = {
  // Belagavi
  belgaum: "Belagavi",
  belagavi: "Belagavi",
  // Vijayapura
  bijapur: "Vijayapura",
  vijayapura: "Vijayapura",
  // Ballari
  bellary: "Ballari",
  ballari: "Ballari",
  // Bengaluru
  bangalore: "Bengaluru Urban",
  "bangalore urban": "Bengaluru Urban",
  "bengaluru urban": "Bengaluru Urban",
  bengaluru: "Bengaluru Urban",
  "bangalore rural": "Bengaluru Rural",
  "bengaluru rural": "Bengaluru Rural",
  // Chamarajanagar
  chamarajanagar: "Chamarajnagar",
  chamarajnagar: "Chamarajnagar",
  // Chikkamagaluru
  chikmagalur: "Chikkamagaluru",
  chikkamagalur: "Chikkamagaluru",
  chikkamagaluru: "Chikkamagaluru",
  // Davanagere
  davangere: "Davanagere",
  davanagere: "Davanagere",
  // Dakshina Kannada
  "dakshina kannada": "Dakshina Kannada",
  mangalore: "Dakshina Kannada",
  mangaluru: "Dakshina Kannada",
  dk: "Dakshina Kannada",
  // Kalaburagi
  gulbarga: "Kalaburagi",
  kalaburagi: "Kalaburagi",
  // Mysuru
  mysore: "Mysuru",
  mysuru: "Mysuru",
  // Shimoga / Shivamogga
  shimoga: "Shimoga",
  shivamogga: "Shimoga",
  // Tumakuru
  tumkur: "Tumakuru",
  tumakuru: "Tumakuru",
  // Uttara Kannada
  "uttara kannada": "Uttara Kannada",
  karwar: "Uttara Kannada",
  uk: "Uttara Kannada",
  // Yadgir
  yadagir: "Yadgir",
  yadgir: "Yadgir",
  // Vijayanagara
  vijayanagara: "Vijayanagara",
  // Common slug forms (hyphen/underscore stripped later)
  "chikka-ballapur": "Chikkaballapur",
  chikkaballapura: "Chikkaballapur",
};

function slugKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

const DISTRICT_LOOKUP = new Map();

for (const row of DISTRICT_ROWS) {
  DISTRICT_LOOKUP.set(slugKey(row.name), row.name);
  DISTRICT_LOOKUP.set(slugKey(row.code), row.name);
  DISTRICT_LOOKUP.set(slugKey(row.code.replace(/^KA_/, "")), row.name);
}

for (const [alias, name] of Object.entries(EXTRA_ALIASES)) {
  DISTRICT_LOOKUP.set(slugKey(alias), name);
}

const SUPPORTED_DISTRICTS = DISTRICT_ROWS.map((row) => row.name);

function normalizeDistrict(district) {
  if (typeof district !== "string" || !district.trim()) return null;
  return DISTRICT_LOOKUP.get(slugKey(district)) || null;
}

function listDistrictMapping() {
  return DISTRICT_ROWS.map((row) => ({
    stateCode: "KA",
    stateName: "KARNATAKA",
    districtCode: row.code,
    districtName: row.name,
  }));
}

module.exports = {
  DISTRICT_ROWS,
  SUPPORTED_DISTRICTS,
  normalizeDistrict,
  listDistrictMapping,
};
