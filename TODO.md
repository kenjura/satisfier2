# Bugs
- Detect when a recipe is impossible (i.e. some recipes use Polymer Resin which can't be produced directly, only by alternate recipes)
  - Another example: electrode aluminum scrap -> petroleum coke
  - This is interesting because Petroleum Coke may get excluded by the default alt score threshold

# Code Health
- Consider renaming Preferences.js to EnabledAlts.js (future preferences can have their own model)
- Consider refactoring get/setEnabledAlts to be a hook
- Handle localStorage failures


# UX
- Better styles for checkboxes, buttons, DesiredPart selectors



# Model
- Improve data model of data/recipes.js
- Better persistence for data/recipes.js



