const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

async function convertExcelToJSON() {
  try {
    const filePath = path.join(__dirname, '../data/chocolates_database.xlsx');
    const workbook = XLSX.readFile(filePath);

    // Convert Chocolates Database sheet
    const chocolatesSheet = workbook.Sheets['Chocolates Database'];
    const chocolatesData = XLSX.utils.sheet_to_json(chocolatesSheet);

    // Convert List sheet
    const listSheet = workbook.Sheets['List'];
    const listData = XLSX.utils.sheet_to_json(listSheet);

    // Clean and structure the data
    const processedChocolates = chocolatesData.map(chocolate => ({
      id: chocolate.id,
      name: chocolate.name,
      brand: chocolate.brand,
      maker_country: chocolate.maker_country,
      origin_country: chocolate.origin_country,
      origin_region: chocolate.origin_region,
      type: chocolate.type,
      cocoa_percentage: chocolate.cocoa_percentage,
      bean_variety: chocolate.bean_variety,
      flavor_notes_primary: chocolate.flavor_notes_primary,
      flavor_notes_secondary: chocolate.flavor_notes_secondary,
      flavor_notes_tertiary: chocolate.flavor_notes_tertiary,
      texture_mouthfeel: chocolate.texture_mouthfeel,
      texture_melt: chocolate.texture_melt,
      texture_snap: chocolate.texture_snap,
      finish_length: chocolate.finish_length,
      finish_character: chocolate.finish_character,
      rating: chocolate.rating,
      production_craft_level: chocolate.production_craft_level,
      sustainability_certifications: chocolate.sustainability_certifications,
      pairings_wine: chocolate.pairings_wine,
      pairings_spirits: chocolate.pairings_spirits,
      pairings_cheese: chocolate.pairings_cheese,
      pairings_fruits: chocolate.pairings_fruits,
      pairings_nuts: chocolate.pairings_nuts,
      price_retail: chocolate.price_retail,
      tasting_notes: chocolate.tasting_notes,
      expert_review: chocolate.expert_review
    }));

    // Process lists for filters
    const processedLists = {
      maker_countries: [...new Set(listData.map(item => item.maker_country).filter(Boolean))],
      origin_countries: [...new Set(listData.map(item => item.origin_country).filter(Boolean))],
      origin_regions: [...new Set(listData.map(item => item.origin_region).filter(Boolean))],
      types: [...new Set(listData.map(item => item.type).filter(Boolean))],
      bean_varieties: [...new Set(listData.map(item => item.bean_variety).filter(Boolean))],
      flavors: [...new Set(listData.map(item => item.flavors).filter(Boolean))],
      textures_mouthfeel: [...new Set(listData.map(item => item.texture_mouthfeel).filter(Boolean))],
      finish_lengths: [...new Set(listData.map(item => item.finish_length).filter(Boolean))],
      craft_levels: [...new Set(listData.map(item => item.production_craft_level).filter(Boolean))],
      certifications: [...new Set(listData.map(item => item.sustainability_certifications).filter(Boolean))],
      wine_pairings: [...new Set(listData.map(item => item.pairings_wine).filter(Boolean))],
      spirit_pairings: [...new Set(listData.map(item => item.pairings_spirits).filter(Boolean))],
      cheese_pairings: [...new Set(listData.map(item => item.pairings_cheese).filter(Boolean))],
      fruit_pairings: [...new Set(listData.map(item => item.pairings_fruits).filter(Boolean))],
      nut_pairings: [...new Set(listData.map(item => item.pairings_nuts).filter(Boolean))]
    };

    // Save processed data
    fs.writeFileSync(
      path.join(__dirname, '../data/chocolates.json'),
      JSON.stringify(processedChocolates, null, 2)
    );

    fs.writeFileSync(
      path.join(__dirname, '../data/filters.json'),
      JSON.stringify(processedLists, null, 2)
    );

    console.log(`✅ Conversion completed successfully!`);
    console.log(`📊 ${processedChocolates.length} chocolates converted`);
    console.log(`🎛️ Filter options prepared`);

  } catch (error) {
    console.error('❌ Error converting Excel file:', error);
  }
}

convertExcelToJSON();