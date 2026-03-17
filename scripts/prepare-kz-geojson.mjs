import fs from "node:fs";

const inputPath = "./src/shared/assets/maps/kz.raw.geojson";
const outputPath = "./src/shared/assets/maps/kz.regions.geojson";

const REGION_META = {
  "Akmola": { code: "akmola", backendName: "Akmola", kind: "region" },
  "Aktobe": { code: "aktobe", backendName: "Aktobe", kind: "region" },
  "Almaty": { code: "almaty-region", backendName: "Almaty", kind: "region" },
  "Almaty (city)": { code: "almaty-city", backendName: "Almaty (city)", kind: "city" },
  "Atyrau": { code: "atyrau", backendName: "Atyrau", kind: "region" },
  "Abai": { code: "abai", backendName: "Abai", kind: "region" },
  "Jambyl": { code: "jambyl", backendName: "Jambyl", kind: "region" },
  "Ulytau": { code: "ulytau", backendName: "Ulytau", kind: "region" },
  "Kostanay": { code: "kostanay", backendName: "Kostanay", kind: "region" },
  "Kyzylorda": { code: "kyzylorda", backendName: "Kyzylorda", kind: "region" },
  "Mangystau": { code: "mangystau", backendName: "Mangystau", kind: "region" },
  "North Kazakhstan": { code: "north-kazakhstan", backendName: "North Kazakhstan", kind: "region" },
  "Astana": { code: "astana-city", backendName: "Astana", kind: "city" },
  "Pavlodar": { code: "pavlodar", backendName: "Pavlodar", kind: "region" },
  "Shymkent (city)": { code: "shymkent-city", backendName: "Shymkent (city)", kind: "city" },
  "Turkestan": { code: "turkestan", backendName: "Turkestan", kind: "region" },
  "West Kazakhstan": { code: "west-kazakhstan", backendName: "West Kazakhstan", kind: "region" },
  "Karaganda": { code: "karaganda", backendName: "Karaganda", kind: "region" },
  "Jetisu": { code: "jetisu", backendName: "Jetisu", kind: "region" },
  "East Kazakhstan": { code: "east-kazakhstan", backendName: "East Kazakhstan", kind: "region" }
};

const raw = fs.readFileSync(inputPath, "utf-8");
const geo = JSON.parse(raw);

if (geo.type !== "FeatureCollection" || !Array.isArray(geo.features)) {
  throw new Error("Input file is not a valid GeoJSON FeatureCollection");
}

geo.features = geo.features.map((feature) => {
  const name = feature?.properties?.name;

  if (!name || !REGION_META[name]) {
    throw new Error(`No REGION_META mapping found for: ${name}`);
  }

  return {
    ...feature,
    properties: {
      ...feature.properties,
      ...REGION_META[name]
    }
  };
});

fs.writeFileSync(outputPath, JSON.stringify(geo, null, 2), "utf-8");
console.log(`Done: ${outputPath}`);