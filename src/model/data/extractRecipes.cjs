// extractRecipes.js
// Usage: node extractRecipes.js
// Reads en-US.json and outputs recipes in recipes.js format (to stdout)

const fs = require('fs');
const path = require('path');
const altScoreMap = require('./altScores.cjs').default;

const inputPath = path.join(__dirname, 'data', 'raw-data-20250917.json');

function parseRecipeEntry(entry) {
  // This function should be adapted to the actual structure of recipe entries in en-US.json
  // Placeholder: you may need to adjust the field mappings below
  return {
    recipe: entry.name || entry.recipeName || '',
    output: entry.output || entry.result || '',
    outputQtyPerMin: entry.outputQtyPerMin || entry.resultQtyPerMin || null,
    item1: entry.item1 || null,
    itemQty1: entry.itemQty1 || null,
    item2: entry.item2 || null,
    itemQty2: entry.itemQty2 || null,
    item3: entry.item3 || null,
    itemQty3: entry.itemQty3 || null,
    item4: entry.item4 || null,
    itemQty4: entry.itemQty4 || null,
    byproduct: entry.byproduct || null,
    byproductQty: entry.byproductQty || null,
    megawatts: entry.megawatts || null,
    stage: entry.stage || null,
    building: entry.building || null,
    alternate: entry.alternate || 'no',
    // altScore is omitted
  };
}

function extractRecipes(data) {
  // This function should be adapted to the actual structure of en-US.json
  // For now, it assumes recipes are top-level objects or in a known array

  /**
   * source data structure:
   * root contains objects in the form:
   * {	
   *   "NativeClass": "native class name",
	 *	 "Classes": []
	 * }
   * the object for which NativeClass is "/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'" contains the recipe classes, which are in the form:
   * {
   *    "ClassName": "Recipe_ModularFrameHeavy_C",
				"FullName": "BlueprintGeneratedClass /Game/FactoryGame/Recipes/Manufacturer/Recipe_ModularFrameHeavy.Recipe_ModularFrameHeavy_C",
				"mDisplayName": "Heavy Modular Frame",
				"mIngredients": "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/ModularFrame/Desc_ModularFrame.Desc_ModularFrame_C'\",Amount=5),(ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/SteelPipe/Desc_SteelPipe.Desc_SteelPipe_C'\",Amount=20),(ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/SteelPlateReinforced/Desc_SteelPlateReinforced.Desc_SteelPlateReinforced_C'\",Amount=5),(ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronScrew/Desc_IronScrew.Desc_IronScrew_C'\",Amount=120))",
				"mProduct": "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/ModularFrameHeavy/Desc_ModularFrameHeavy.Desc_ModularFrameHeavy_C'\",Amount=1))",
   * }
   * in the top-level array, there is an object with NativeClass of ""NativeClass": "/Script/CoreUObject.Class'/Script/FactoryGame.FGItemDescriptor'" which contains this data
   * the part data objects are in the form:
   * {
				"ClassName": "Desc_AluminumIngot_C",
				"mDisplayName": "Aluminum Ingot"
      }
   */

  // create a Map of building class name to display name
  const buildingNameMap = new Map();
  if (data && Array.isArray(data)) {
    for (const obj of data) {
      if (obj.NativeClass === "/Script/CoreUObject.Class'/Script/FactoryGame.FGBuildableManufacturer'" && Array.isArray(obj.Classes)) {
        for (const cls of obj.Classes) {
          if (cls.ClassName && cls.mDisplayName) {
            buildingNameMap.set(cls.ClassName, cls.mDisplayName);
          }
        }
      }
    }
  }

  // create a map of recipe display name to alt score
  // altScoreMap is imported from altScores.js
  const altScoreMap = new Map();
  altScores.forEach(entry => {
    altScoreMap.set(entry.recipe, entry.score);
  });

  // create a Map of part class name to display name
  const partNameMap = new Map();
  if (data && Array.isArray(data)) {
    for (const obj of data) {
      if (obj.NativeClass === "/Script/CoreUObject.Class'/Script/FactoryGame.FGItemDescriptor'" && Array.isArray(obj.Classes)) {
        for (const cls of obj.Classes) {
          if (cls.ClassName && cls.mDisplayName) {
            partNameMap.set(cls.ClassName, cls.mDisplayName);
          }
        }
      }
    }
  }
  // create a Map of raw resource class names to display names
  const rawResourceFormMap = new Map();
  if (data && Array.isArray(data)) {
    for (const obj of data) {
      if (obj.NativeClass === "/Script/CoreUObject.Class'/Script/FactoryGame.FGItemDescriptor'" && Array.isArray(obj.Classes)) {
        for (const cls of obj.Classes) {
          if (cls.ClassName) {
            const form = cls.mForm === 'RF_SOLID' ? 'solid' : 'liquid';
            rawResourceFormMap.set(cls.ClassName, form);
          }
        }
      }
    }
  }
  const rawResourceNameMap = new Map();
  const wtfFormMap = new Map();
  if (data && Array.isArray(data)) {
    for (const obj of data) {
      if ((obj.NativeClass === "/Script/CoreUObject.Class'/Script/FactoryGame.FGResourceDescriptor'" || obj.NativeClass==="/Script/CoreUObject.Class'/Script/FactoryGame.FGItemDescriptorBiomass'") && Array.isArray(obj.Classes)) {
        for (const cls of obj.Classes) {
          if (cls.ClassName && cls.mDisplayName) {
            rawResourceNameMap.set(cls.ClassName, cls.mDisplayName);
            wtfFormMap.set(cls.ClassName, cls.mForm === 'RF_SOLID' ? 'solid' : 'liquid');
          }
        }
      }
    }
  }

  // create a Map of recipe class name to complete class object
  const classMap = new Map();
  const recipeBuildingMap = new Map();
  if (data && Array.isArray(data)) {
    for (const obj of data) {
      if (obj.NativeClass === "/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'" && Array.isArray(obj.Classes)) {
        for (const cls of obj.Classes) {
          if (cls.ClassName) {
            classMap.set(cls.ClassName, cls);
            recipeBuildingMap.set(cls.ClassName, buildingNameMap.get(cls.mProducedIn) || null);
          }
        }
      }
    }
  }
  let recipes = [];
  for (const [className, entry] of classMap.entries()) {
    console.log(`Processing ${className}`);
    console.log(entry);
    // ensure this is a "part", defined as mProducedIn matching one of 'Constructor', 'Assembler', 'Manufacturer', 'Refinery', 'Foundry'
    if (!entry.mProducedIn) {
      console.log(`Skipping ${className} due to missing mProducedIn`);
      continue;
    }
    const validBuildings = ['Constructor', 'Assembler', 'Manufacturer', 'Refinery', 'Foundry', 'Smelter', 'Packager', 'Blender'];
    if (!validBuildings.some(buildingName => entry.mProducedIn.match(buildingName))) {
      console.log(`Skipping ${className} due to mProducedIn not matching a valid building`);
      continue;
    }
    // parse ingredients and products from mIngredients and mProduct fields
    const ingredients = [];
    if (entry.mIngredients) {
      try {
        // ingredients format: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronPlate/Desc_IronPlate.Desc_IronPlate_C'\",Amount=6),(ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronScrew/Desc_IronScrew.Desc_IronScrew_C'\",Amount=12))"
        // the "Desc_IronPlate_C" string is the part class name. We can use the partNameMap to get the display name
        // Extract the array of ingredient objects from the string
        const ingStr = entry.mIngredients
          .replace(/(\w+)=/g, '"$1":')
          .replace(/ItemClass=/g, '"ItemClass":')
          .replace(/\(\(/g, '[{')
          .replace(/\)\)/g, '}]')
          .replace(/\(/g, '{')
          .replace(/\)/g, '}')
          .replace(/Amount=/g, '"Amount":');
        // Convert to valid JSON array
        const ingArr = JSON.parse(ingStr);
        for (const ing of ingArr) {
          // Extract class name, e.g. "Desc_IronPlate_C"
          const itemMatch = ing.ItemClass.match(/Desc_(.+?)\.Desc_/);
          let className = null;
          if (itemMatch) {
            className = `Desc_${itemMatch[1]}_C`;
          }
            let displayName = '';
            if (className && partNameMap.has(className)) {
            displayName = partNameMap.get(className);
            } else if (className && rawResourceNameMap.has(className)) {
            displayName = rawResourceNameMap.get(className);
            } else {
            displayName = className || '';
            }
            let isLiquid = rawResourceFormMap.get(className) === 'liquid' || wtfFormMap.get(className) === 'liquid';
          ingredients.push({ item: displayName, amount: ing.Amount, isLiquid });
        }
      } catch (e) {
        console.error(`Error parsing ingredients for ${className}:`, e);
      }
    }
    const products = [];
    let multiplier = 1;
    if (entry.mManufactoringDuration && !isNaN(Number(entry.mManufactoringDuration))) {
      multiplier = 60 / Number(entry.mManufactoringDuration);
    }
    if (entry.mProduct) {
      try {
      const prodStr = entry.mProduct
        .replace(/(\w+)=/g, '"$1":')
        .replace(/ItemClass=/g, '"ItemClass":')
        .replace(/\(\(/g, '[{')
        .replace(/\)\)/g, '}]')
        .replace(/\(/g, '{')
        .replace(/\)/g, '}')
        .replace(/Amount=/g, '"Amount":');
      const prodArr = JSON.parse(prodStr);
      for (const prod of prodArr) {
        const itemMatch = prod.ItemClass.match(/Desc_(.+?)\.Desc_/);
        let className = null;
        if (itemMatch) {
        className = `Desc_${itemMatch[1]}_C`;
        }
        let displayName = className && partNameMap.has(className)
        ? partNameMap.get(className)
        : className || '';
        let isLiquid = rawResourceFormMap.get(className) === 'liquid';
        if (isLiquid) {
          prod.Amount = prod.Amount / 1000; // convert to mL
        }
        products.push({ item: displayName, amount: prod.Amount * multiplier });
      }
      } catch (e) {
      console.error(`Error parsing products for ${className}:`, e);
      }
    }
    // Adjust ingredient amounts as well
    for (const ing of ingredients) {
      if (ing.isLiquid) {
        ing.amount = ing.amount / 1000;
      }
      ing.amount = ing.amount * multiplier;
    }
    if (products.length > 0) {
      const rec = {
        recipe: entry.mDisplayName || '',
        output: products[0].item,
        outputQtyPerMin: products[0].amount || null,
        item1: ingredients[0] ? ingredients[0].item : null,
        item1Qty: ingredients[0] ? ingredients[0].amount : null,
        item2: ingredients[1] ? ingredients[1].item : null,
        item2Qty: ingredients[1] ? ingredients[1].amount : null,
        item3: ingredients[2] ? ingredients[2].item : null,
        item3Qty: ingredients[2] ? ingredients[2].amount : null,
        item4: ingredients[3] ? ingredients[3].item : null,
        item4Qty: ingredients[3] ? ingredients[3].amount : null,
        building: recipeBuildingMap.get(className) || null,
        byproduct: products[1] ? products[1].item : null,
        byproductQty: products[1] ? products[1].amount : null,
        megawatts: entry.mPowerConsumption || null,
        stage: entry.mTechTier || null,
        alternate: entry.bAlternateRecipe ? 'yes' : 'no',
        altScore: altScoreMap.get(entry.mDisplayName) || null,
        // altScore omitted
      };
      recipes.push(rec);
    }
  }
  return recipes;
}

function main() {
  console.log('hello');
  const raw = fs.readFileSync(inputPath, 'utf8');
  // Remove any characters before the first '{' or '[' and after the last '}' or ']'
  const firstBrace = Math.min(
    ...['{', '['].map(c => raw.indexOf(c)).filter(i => i !== -1)
  );
  const lastBrace = Math.max(
    ...['}', ']'].map(c => raw.lastIndexOf(c)).filter(i => i !== -1)
  );
  const cleanedRaw = raw.slice(firstBrace, lastBrace + 1)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control chars
  console.log('cleanedRaw:', cleanedRaw.slice(0, 100) + '...');
  const data = JSON.parse(cleanedRaw);
  console.log('JSON parse succeeded');
  const recipes = extractRecipes(data);
  const jsFileContents = 'export default ' + JSON.stringify(recipes, null, 2) + ';\n';
  if (process.argv.length > 2) {
    const outputPath = process.argv[2];
    fs.writeFileSync(outputPath, jsFileContents, 'utf8');
    console.log(`Wrote recipes to ${outputPath}`);
  } else {
    process.stdout.write(jsFileContents);
  }

}

main();
