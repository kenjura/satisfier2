# 0.10.0
- Added missing recipes
- Fixed stack logic
- Added select all/none to recipes page
- Added input quantities to table

# 0.9.0
- Added input and byproduct parts to the CalculatorPage output

# 0.8.0
- DesiredParts are now persisted to localStorage
- calculator is now sorted by "stack" (recursion depth, starting from desired parts). Not as good as stage, but it's reliable and automatic.
- calculator now has an "export to TSV" button
- removed debug textarea from CalculatorPage
- added some debug tooltips to help mk2/mk3 planning
- checkbox to enable alt recipe now only shows if recipe is, in fact, an alternate
- fixed a bug in data for silicon high-speed connector

# 0.7.0
- Enabled editing of enabled alts
- Enabled alts now persist to localStorage
- Enabled alts are now considered by calculator

# 0.6.0
- Calculator actually works
- cleaned up lint issues

# 0.5.0
- Added CalculatorPage (with desired part selector)

# 0.4.0
- Split Nav and RecipesPage off into separate components
- Changed color scheme, added CSS vars for color
- Started using Prettier (probably not on all files yet)

# 0.3.0
- Added SASS/SCSS

# 0.2.0
- Added wouter
- Added rudimentary CSS

# 0.1.0
- Created React App
- Got Flow working with stubs of Part and Recipe
