//########### CLOUD CARBON FOOTPRINT ANALYZER ###########

/**
 * @fileoverview Cloud Carbon Footprint & Green Gamification engine for Google Drive Smart Scan.
 *
 * Estimates the energy consumption (kWh) and greenhouse gas emissions (kg CO2e)
 * associated with cloud storage, calculating tangible real-world equivalents
 * (car miles, smartphone charges, tree absorption) and gamifying digital cleanup
 * as environmental climate action.
 *
 * Based on research from IEA, Google Environmental Reports, and Microsoft Sustainability.
 *
 * @author Drive Cleaner Dev Team
 * @version 1.0.0
 */

/**
 * Carbon Calculation Constants
 *
 * - KWH_PER_GB_YEAR: 0.0001 kWh per GB per year (conservative average accounting for Google PUE ~1.1)
 * - GRID_CARBON_INTENSITY: 0.5 kg CO2e per kWh (global average grid intensity)
 */
const KWH_PER_GB_YEAR = 0.0001;
const GRID_CARBON_INTENSITY = 0.5;

/**
 * Relatable real-world activity carbon equivalents (in kg CO2e)
 */
const CO2_EQUIVALENTS = {
  driving_1_mile: 0.411,        // Average passenger vehicle
  driving_1_km: 0.255,          // Average passenger vehicle per km
  smartphone_charge: 0.008,     // One full smartphone charge
  tree_year: 21.0,              // Mature tree absorption over 1 year
  burger: 2.5,                  // Average beef burger
  flight_1_mile: 0.257,         // Domestic flight per passenger mile
  laptop_hour: 0.02,            // 1 hour of laptop use
  coffee_cup: 0.05              // Cup of brewed coffee
};

/**
 * Calculate annual energy and CO2 emissions for a given storage in GB
 * @param {number} storageGB - Storage amount in Gigabytes
 * @returns {Object} { energy_kwh: number, co2_kg: number, co2_tonnes: number }
 * @private
 */
function calculateCO2Emissions_(storageGB) {
  const gb = Math.max(0, storageGB || 0);
  const energyKWh = gb * KWH_PER_GB_YEAR;
  const co2Kg = energyKWh * GRID_CARBON_INTENSITY;

  return {
    energy_kwh: energyKWh,
    co2_kg: co2Kg,
    co2_tonnes: co2Kg / 1000
  };
}

/**
 * Generate human-relatable equivalents from kg CO2
 * @param {number} co2Kg - Amount of CO2 in kilograms
 * @returns {Object} Equivalents object with counts and headline text
 * @private
 */
function getRelatableEquivalents_(co2Kg) {
  const kg = Math.max(0, co2Kg || 0);

  const carMiles = kg / CO2_EQUIVALENTS.driving_1_mile;
  const carKm = kg / CO2_EQUIVALENTS.driving_1_km;
  const smartphoneCharges = Math.round(kg / CO2_EQUIVALENTS.smartphone_charge);
  const treeYears = kg / CO2_EQUIVALENTS.tree_year;
  const burgers = kg / CO2_EQUIVALENTS.burger;
  const laptopHours = Math.round(kg / CO2_EQUIVALENTS.laptop_hour);
  const coffeeCups = Math.round(kg / CO2_EQUIVALENTS.coffee_cup);

  // Generate most appropriate headline equivalent based on scale
  let headline = '';
  if (kg < 0.05) {
    headline = `${smartphoneCharges} smartphone charges`;
  } else if (kg < 1.0) {
    headline = `${carMiles.toFixed(1)} miles driven in a car`;
  } else if (kg < 15.0) {
    headline = `${carMiles.toFixed(0)} car miles or ${Math.round(burgers)} beef burgers`;
  } else {
    headline = `${Math.ceil(treeYears)} tree${treeYears > 1 ? 's' : ''} needed to absorb for a year`;
  }

  return {
    headline,
    car_miles: parseFloat(carMiles.toFixed(1)),
    car_km: parseFloat(carKm.toFixed(1)),
    smartphone_charges: smartphoneCharges,
    tree_years: parseFloat(treeYears.toFixed(2)),
    burgers: parseFloat(burgers.toFixed(1)),
    laptop_hours: laptopHours,
    coffee_cups: coffeeCups
  };
}

/**
 * Categorize files into media groups and calculate their carbon emissions
 * @param {Array<Object>} files - Structured files list
 * @returns {Object} Grouped carbon emissions by media type
 * @private
 */
function categorizeCarbonByType_(files) {
  const groups = {
    videos: { count: 0, size_bytes: 0, label: 'Videos', icon: '📽️', color: 'rose' },
    photos: { count: 0, size_bytes: 0, label: 'Photos & Images', icon: '🖼️', color: 'amber' },
    documents: { count: 0, size_bytes: 0, label: 'Documents & Sheets', icon: '📄', color: 'blue' },
    other: { count: 0, size_bytes: 0, label: 'Archives & Other', icon: '📦', color: 'purple' }
  };

  for (const file of files) {
    if (file.mime_type === 'application/vnd.google-apps.folder') continue;

    const mime = (file.mime_type || '').toLowerCase();
    const size = file.size_bytes || 0;

    if (mime.startsWith('video/')) {
      groups.videos.count++;
      groups.videos.size_bytes += size;
    } else if (mime.startsWith('image/')) {
      groups.photos.count++;
      groups.photos.size_bytes += size;
    } else if (
      mime.startsWith('application/vnd.google-apps.') ||
      mime.includes('document') ||
      mime.includes('sheet') ||
      mime.includes('presentation') ||
      mime.includes('pdf') ||
      mime.startsWith('text/')
    ) {
      groups.documents.count++;
      groups.documents.size_bytes += size;
    } else {
      groups.other.count++;
      groups.other.size_bytes += size;
    }
  }

  const totalBytes = Object.values(groups).reduce((acc, g) => acc + g.size_bytes, 0) || 1;

  for (const key in groups) {
    const gb = groups[key].size_bytes / (1024 * 1024 * 1024);
    const emissions = calculateCO2Emissions_(gb);
    groups[key].size_gb = parseFloat(gb.toFixed(2));
    groups[key].annual_co2_kg = parseFloat(emissions.co2_kg.toFixed(3));
    groups[key].annual_energy_kwh = parseFloat(emissions.energy_kwh.toFixed(4));
    groups[key].percentage = Math.round((groups[key].size_bytes / totalBytes) * 100);
  }

  return groups;
}

/**
 * Determine eco rating based on annual emissions and storage volume
 * @param {number} annualCO2Kg - Total annual CO2 emissions in kg
 * @param {number} storageGB - Total storage in GB
 * @returns {Object} Eco rating object with level, color, and badge
 * @private
 */
function calculateEcoRating_(annualCO2Kg, storageGB) {
  let rating;

  if (annualCO2Kg <= 0.25 || storageGB <= 5) {
    rating = {
      level: 'Eco Champion',
      color: 'emerald',
      icon: '🌟',
      badge: 'Minimal Carbon Impact',
      message: 'Your cloud storage has an ultra-low carbon footprint.'
    };
  } else if (annualCO2Kg <= 1.0 || storageGB <= 20) {
    rating = {
      level: 'Low Impact',
      color: 'blue',
      icon: '🌱',
      badge: 'Green Storage',
      message: 'Your footprint is well below typical cloud averages.'
    };
  } else if (annualCO2Kg <= 5.0 || storageGB <= 100) {
    rating = {
      level: 'Moderate',
      color: 'amber',
      icon: '🌿',
      badge: 'Moderate Impact',
      message: 'Noticeable cloud storage emissions. Cleanup can reduce ongoing energy.'
    };
  } else {
    rating = {
      level: 'High Impact',
      color: 'rose',
      icon: '⚠️',
      badge: 'High Emissions',
      message: 'Substantial cloud footprint. Prioritize deleting large obsolete files.'
    };
  }

  return rating;
}

/**
 * Calculate Green Gamification achievements progress
 * @param {number} potentialSavedCO2Kg - Potential kg CO2 that can be saved
 * @param {number} currentCO2Kg - Current annual footprint
 * @returns {Array<Object>} List of achievements with unlock status
 * @private
 */
function calculateGreenAchievements_(potentialSavedCO2Kg, currentCO2Kg) {
  return [
    {
      id: 'sapling_saver',
      name: 'Sapling Saver',
      icon: '🌱',
      description: 'Potential to save 0.05 kg CO2 (~1 GB deleted)',
      unlocked: potentialSavedCO2Kg >= 0.05,
      progress: Math.min(100, Math.round((potentialSavedCO2Kg / 0.05) * 100))
    },
    {
      id: 'tree_planter',
      name: 'Tree Planter',
      icon: '🌳',
      description: 'Offset equivalent of 1 tree for a year (21 kg CO2)',
      unlocked: potentialSavedCO2Kg >= 21.0,
      progress: Math.min(100, Math.round((potentialSavedCO2Kg / 21.0) * 100))
    },
    {
      id: 'carbon_neutral',
      name: 'Drive Carbon Neutral',
      icon: '♻️',
      description: 'Clean enough obsolete files to offset your entire annual Drive footprint',
      unlocked: potentialSavedCO2Kg >= currentCO2Kg && currentCO2Kg > 0,
      progress: currentCO2Kg > 0 ? Math.min(100, Math.round((potentialSavedCO2Kg / currentCO2Kg) * 100)) : 100
    },
    {
      id: 'forest_guardian',
      name: 'Forest Guardian',
      icon: '🌲',
      description: 'Save 100 kg CO2 through comprehensive cleanup',
      unlocked: potentialSavedCO2Kg >= 100.0,
      progress: Math.min(100, Math.round((potentialSavedCO2Kg / 100.0) * 100))
    }
  ];
}

/**
 * Calculate comprehensive Cloud Carbon Footprint metrics
 *
 * Primary entry point for Cloud Carbon Footprint analysis.
 *
 * @param {Array<Object>} structuredFiles - File list from analysis context
 * @param {Object} categoryResults - Results from other analyzers (duplicates, temp, rot)
 * @returns {Object} Complete carbon footprint analysis
 */
function calculateCarbonFootprint(structuredFiles, categoryResults = {}) {
  console.log('Calculating Cloud Carbon Footprint...');

  if (!structuredFiles || structuredFiles.length === 0) {
    return {
      storage_gb: 0,
      annual_energy_kwh: 0,
      annual_co2_kg: 0,
      annual_co2_tonnes: 0,
      equivalents: getRelatableEquivalents_(0),
      breakdown_by_type: {},
      potential_savings: {
        cleanup_gb: 0,
        co2_saved_kg: 0,
        equivalents: getRelatableEquivalents_(0)
      },
      eco_rating: calculateEcoRating_(0, 0),
      achievements: calculateGreenAchievements_(0, 0)
    };
  }

  // 1. Current Storage & Emissions
  const totalSizeBytes = structuredFiles.reduce((sum, f) => sum + (f.size_bytes || 0), 0);
  const totalGB = totalSizeBytes / (1024 * 1024 * 1024);
  const emissions = calculateCO2Emissions_(totalGB);
  const equivalents = getRelatableEquivalents_(emissions.co2_kg);

  // 2. Breakdown by Media Type
  const breakdownByType = categorizeCarbonByType_(structuredFiles);

  // 3. Potential Cleanup & Emissions Savings
  // Determine cleanup bytes from duplicates + temp files + ROT redundant/obsolete/trivial
  let potentialCleanupBytes = 0;
  if (categoryResults.duplicates) {
    potentialCleanupBytes += categoryResults.duplicates.total_size_bytes || 0;
  }
  if (categoryResults.temp_files) {
    potentialCleanupBytes += categoryResults.temp_files.total_size_bytes || 0;
  }
  if (categoryResults.rot_analysis && categoryResults.rot_analysis.total_size_bytes) {
    // ROT redundant items already overlap with duplicates; add obsolete non-duplicate files
    const obsoleteBytes = categoryResults.rot_analysis.breakdown?.obsolete?.total_size_bytes || 0;
    const trivialBytes = categoryResults.rot_analysis.breakdown?.trivial?.total_size_bytes || 0;
    potentialCleanupBytes += (obsoleteBytes + trivialBytes);
  }

  const cleanupGB = potentialCleanupBytes / (1024 * 1024 * 1024);
  const potentialSavingsEmissions = calculateCO2Emissions_(cleanupGB);
  const potentialSavingsEquivalents = getRelatableEquivalents_(potentialSavingsEmissions.co2_kg);

  // 4. Rating & Achievements
  const ecoRating = calculateEcoRating_(emissions.co2_kg, totalGB);
  const achievements = calculateGreenAchievements_(potentialSavingsEmissions.co2_kg, emissions.co2_kg);

  console.log(`Carbon Footprint complete: ${totalGB.toFixed(2)} GB -> ${emissions.co2_kg.toFixed(4)} kg CO2/yr (${ecoRating.level})`);

  return {
    storage_gb: parseFloat(totalGB.toFixed(2)),
    storage_bytes: totalSizeBytes,
    annual_energy_kwh: parseFloat(emissions.energy_kwh.toFixed(4)),
    annual_co2_kg: parseFloat(emissions.co2_kg.toFixed(3)),
    annual_co2_tonnes: parseFloat(emissions.co2_tonnes.toFixed(6)),
    equivalents,
    breakdown_by_type: breakdownByType,
    potential_savings: {
      cleanup_gb: parseFloat(cleanupGB.toFixed(2)),
      cleanup_bytes: potentialCleanupBytes,
      co2_saved_kg: parseFloat(potentialSavingsEmissions.co2_kg.toFixed(3)),
      energy_saved_kwh: parseFloat(potentialSavingsEmissions.energy_kwh.toFixed(4)),
      equivalents: potentialSavingsEquivalents
    },
    eco_rating: ecoRating,
    achievements
  };
}
