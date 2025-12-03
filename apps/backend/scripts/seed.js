import { fakerTR as faker } from "@faker-js/faker";
import { readFile, writeFile } from "node:fs/promises";

const BASE_URL = process.env.SEED_BASE_URL || "http://localhost:1111/api";
const TOKEN_FILE = process.env.SEED_TOKEN_FILE || ".admin-token";

let token = null;
let serverReady = false;

// ============================================================================
// API Helpers
// ============================================================================

async function apiPost(path, body) {
  const res = await fetch(BASE_URL + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `POST ${path} failed: ${res.status} ${res.statusText} - ${text}`
    );
  }

  return res.json();
}

async function apiGet(path) {
  const res = await fetch(BASE_URL + path, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `GET ${path} failed: ${res.status} ${res.statusText} - ${text}`
    );
  }

  return res.json();
}

async function waitForApiServer() {
  while (!serverReady) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) serverReady = true;
    } catch (e) {
      console.log("Waiting for API server to start...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

async function loadTokenFromFile() {
  try {
    const fileContent = await readFile(TOKEN_FILE, "utf-8");
    const value = fileContent.trim();
    if (value) {
      token = value;
    }
  } catch {
    // Dosya yoksa sorun değil
  }
}

async function saveTokenToFile(newToken) {
  try {
    await writeFile(TOKEN_FILE, newToken, "utf-8");
  } catch (err) {
    console.warn("Could not persist admin token:", err);
  }
}

async function loginToApi() {
  // 1) Varsa daha önce kaydedilmiş token'ı kullanmayı dene
  await loadTokenFromFile();

  if (token) {
    try {
      const me = await apiGet("/auth/admins/me");
      if (me && me.id && me.email) {
        console.log("Using cached admin token for", me.email);
        return;
      }
    } catch (err) {
      console.log("Cached admin token invalid, will re-authenticate...");
      token = null;
    }
  }

  const credentials = {
    email: "admin@manifest.build",
    password: "admin",
    confirmPassword: "admin",
  };

  // 2) Önce admin kullanıcısını oluşturmayı dene
  try {
    const signupRes = await fetch(BASE_URL + "/auth/admins/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (signupRes.ok) {
      const data = await signupRes.json();
      token = data.token;
      await saveTokenToFile(token);
      console.log("Admin registered via /auth/admins/signup");
      return;
    }

    const text = await signupRes.text().catch(() => "");
    console.log(
      "Signup failed, falling back to login:",
      signupRes.status,
      signupRes.statusText,
      text
    );
  } catch (err) {
    console.log("Signup request error, falling back to login:", err);
  }

  // 3) Kullanıcı zaten varsa login ol
  const loginRes = await fetch(BASE_URL + "/auth/admins/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  if (!loginRes.ok) {
    const text = await loginRes.text().catch(() => "");
    throw new Error(
      `POST /auth/admins/login failed: ${loginRes.status} ${loginRes.statusText} - ${text}`
    );
  }

  token = (await loginRes.json()).token;
  await saveTokenToFile(token);
  console.log("Admin logged in via /auth/admins/login");
}

// ============================================================================
// Utility Functions
// ============================================================================

function normalizeTurkish(text = "") {
  return text
    .toString()
    .trim()
    .toLowerCase("tr")
    .normalize("NFD")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[\u0300-\u036f]/g, "");
}

function slugify(text = "") {
  return normalizeTurkish(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
}

function getDataArray(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

async function seedAgencies() {
  const presets = [
    { name: "İstanbul – Alibeyköy", city: "İstanbul", district: "Alibeyköy" },
    { name: "İstanbul – Bayrampaşa", city: "İstanbul", district: "Bayrampaşa" },
    { name: "Ankara – AŞTİ", city: "Ankara", district: "AŞTİ" },
    { name: "Ankara – Kızılay", city: "Ankara", district: "Kızılay" },
    { name: "İzmir – Otogar", city: "İzmir", district: "Otogar" },
    { name: "İzmir – Bornova", city: "İzmir", district: "Bornova" },
    { name: "Bursa – Otogar", city: "Bursa", district: "Osmangazi" },
    { name: "Antalya – Otogar", city: "Antalya", district: "Kepez" },
    { name: "Adana – Otogar", city: "Adana", district: "Seyhan" },
    { name: "Gaziantep – Otogar", city: "Gaziantep", district: "Şehitkamil" },
    { name: "Trabzon – Otogar", city: "Trabzon", district: "Ortahisar" },
    { name: "Samsun – Otogar", city: "Samsun", district: "Canik" },
    { name: "Eskişehir – Otogar", city: "Eskişehir", district: "Tepebaşı" },
    { name: "Konya – Otogar", city: "Konya", district: "Selçuklu" },
    { name: "Kayseri – Otogar", city: "Kayseri", district: "Kocasinan" },
    { name: "Mersin – Otogar", city: "Mersin", district: "Akdeniz" },
    { name: "Diyarbakır – Otogar", city: "Diyarbakır", district: "Kayapınar" },
    { name: "Van – Otogar", city: "Van", district: "İpekyolu" },
  ];

  const existing = getDataArray(await apiGet("/collections/agencies"));
  const existingSlugs = new Set(existing.map((a) => a.slug || slugify(a.name)));
  const created = [...existing];

  for (const a of presets) {
    const slug = slugify(`${a.city}-${a.district}`);
    if (existingSlugs.has(slug)) continue;

    const agency = await apiPost("/collections/agencies", { ...a, slug });
    created.push(agency);
    existingSlugs.add(slug);
  }

  return created;
}

async function seedCompanies() {
  const names = [
    "Atlas Lines",
    "Metro Express",
    "KamilKoç",
    "Pamukkale",
    "Anadolu Star",
    "Ege Tur",
    "Marmara Travel",
    "Karadeniz Ekspres",
    "Toros Lines",
    "Kapadokya Tur",
    "Trakya Coach",
    "İç Anadolu",
    "Edirne Express",
    "Nemrut Travel",
    "Pamphylia",
    "Vangölü Turizm",
    "Has Diyarbakır",
    "Ben Turizm",
    "Seç Turizm",
    "Lüks Karadeniz",
  ];

  const existing = getDataArray(await apiGet("/collections/companies"));
  const existingNames = new Set(existing.map((c) => normalizeTurkish(c.name)));
  const companies = [...existing];

  for (const name of names) {
    if (existingNames.has(normalizeTurkish(name))) continue;

    const code = slugify(name).substring(0, 3).toUpperCase();
    const company = await apiPost("/collections/companies", {
      name,
      code,
      color: faker.color.rgb({ format: "css", includeAlpha: true }),
    });
    companies.push(company);
    existingNames.add(normalizeTurkish(name));
  }

  return companies;
}

async function seedTrips(agencies, companies) {
  const trips = [];
  const now = new Date();

  const MIN_OFFSET_MS = 5 * 60 * 60 * 1000; // şimdi + 5 saat
  const MAX_OFFSET_MS = 30 * 24 * 60 * 60 * 1000; // yaklaşık 30 gün
  const ROUTES_PER_FROM = 2; // Her kalkış ajansı için en fazla 2 farklı varış ajansı
  const MIN_TRIPS_PER_ROUTE = 4;
  const MAX_TRIPS_PER_ROUTE = 6;

  // Benzersiz from/to rota çiftlerini oluştur
  const routeKeys = new Set();
  const routes = [];

  for (const from of agencies) {
    const candidates = agencies.filter(
      (a) => a.id !== from.id && a.city && from.city && a.city !== from.city
    );

    if (!candidates.length) continue;

    const sampleSize = Math.min(ROUTES_PER_FROM, candidates.length);

    for (let i = 0; i < sampleSize; i++) {
      const to = faker.helpers.arrayElement(candidates);
      const key = `${from.id}-${to.id}`;
      if (routeKeys.has(key)) continue;
      routeKeys.add(key);
      routes.push({ from, to });
    }
  }

  // Her rota için en az 4 adet trip üret
  for (const { from, to } of routes) {
    const tripCount = faker.number.int({
      min: MIN_TRIPS_PER_ROUTE,
      max: MAX_TRIPS_PER_ROUTE,
    });

    for (let i = 0; i < tripCount; i++) {
      const company = faker.helpers.arrayElement(companies);
      const offsetMs = faker.number.int({
        min: MIN_OFFSET_MS,
        max: MAX_OFFSET_MS,
      });
      const departure = new Date(now.getTime() + offsetMs);
      const arrival = addHours(departure, faker.number.int({ min: 4, max: 8 }));
      const price = faker.number.int({ min: 300, max: 800 });

      const created = await apiPost("/collections/trips", {
        departure: departure.toISOString(),
        arrival: arrival.toISOString(),
        price,
        fromAgencyId: from.id,
        toAgencyId: to.id,
        companyId: company.id,
      });

      trips.push(created);
    }
  }

  console.log(
    `✓ ${trips.length} trips across ${routes.length} routes (min ${MIN_TRIPS_PER_ROUTE}/route)`
  );

  return trips;
}

function buildSeatLayout(layoutType) {
  const rowCount = layoutType === "2+2" ? 5 : 4;
  const corridorIndex = 2;

  const totalCols = 13;
  const middleDoorColIndex = 6;

  const grid = [];

  for (let col = 0; col < totalCols; col++) {
    const column = [];
    const isMiddleDoorCol = col === middleDoorColIndex;

    for (let row = 0; row < rowCount; row++) {
      const isCorridor = row === corridorIndex;

      if (isCorridor) {
        column.push("corridor");
      } else if (isMiddleDoorCol && (row === 0 || row === 1)) {
        column.push("door");
      } else {
        column.push("seat");
      }
    }

    grid.push(column);
  }

  return {
    grid,
    rows: totalCols,
    cols: rowCount,
    layoutType,
  };
}

/**
 * Grid'den koltuk listesi oluşturur.
 * Numaralandırma dikey olarak yapılır (yukarıdan aşağıya, soldan sağa).
 */
function generateSeatsFromLayout(layout) {
  const { grid, layoutType } = layout;
  const seats = [];
  let seatNo = 1;

  // Dikey numaralandırma: Her sütun için yukarıdan aşağıya
  for (let col = 0; col < grid.length; col++) {
    const column = grid[col];

    for (let row = 0; row < column.length; row++) {
      if (column[row] === "seat") {
        seats.push({
          seatNo,
          row: row + 1, // 1-based index
          col: col + 1, // 1-based index
          status: faker.helpers.weightedArrayElement([
            { value: "empty", weight: 7 },
            { value: "taken", weight: 3 },
          ]),
        });
        seatNo++;
      }
    }
  }

  return seats;
}

async function seedSeatSchemasAndSeats(trips) {
  const schemas = [];

  for (const trip of trips) {
    // Rastgele layout tipi seç
    const layoutType = faker.helpers.arrayElement(["2+1", "2+2"]);
    const layout = buildSeatLayout(layoutType);
    const unitPrice = faker.number.int({ min: 300, max: 800 });

    // SeatSchema oluştur
    const seatSchema = await apiPost("/collections/seat-schemas", {
      layoutType,
      seatLayouts: [
        {
          rows: layout.rows,
          cols: layout.cols,
          cells: JSON.stringify(layout.grid),
        },
      ],
      unitPrice,
      tripId: trip.id,
    });

    schemas.push(seatSchema);

    // Koltukları oluştur
    const seatData = generateSeatsFromLayout(layout);

    for (const seat of seatData) {
      await apiPost("/collections/seats", {
        seatNo: seat.seatNo,
        row: seat.row,
        col: seat.col,
        status: seat.status,
        tripId: trip.id,
        seatSchemaId: seatSchema.id,
      });
      console.log(`✓ ${seat.seatNo}: ${seat.status}`);
    }

    console.log(
      `✓ ${trip.id}: ${layoutType} layout, ${seatData.length} seats created`
    );
  }

  return schemas;
}

async function main() {
  await waitForApiServer();
  await loginToApi();

  console.log("Seeding database...\n");

  const agencies = await seedAgencies();
  console.log(`✓ ${agencies.length} agencies`);

  const companies = await seedCompanies();
  console.log(`✓ ${companies.length} companies`);

  const trips = await seedTrips(agencies, companies);
  console.log(`✓ ${trips.length} trips\n`);

  console.log("Creating seat schemas and seats...");
  const seatSchemas = await seedSeatSchemasAndSeats(trips);
  console.log(`\n✓ ${seatSchemas.length} seat schemas with seats`);

  console.log("\n✅ Seeding completed.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
