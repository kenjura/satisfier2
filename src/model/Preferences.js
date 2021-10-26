// @flow

export type EnabledAlts = Array<string>;

export function getEnabledAlts(): EnabledAlts {
  const enabledAlts = loadEnabledAlts();
  return enabledAlts;
}

export function setEnabledAlts(newEnabledAlts: EnabledAlts): void {
  saveEnabledAlts(newEnabledAlts);
}

function loadEnabledAlts() {
  const json = localStorage.getItem("enabledAlts") || "[]";
  return JSON.parse(json);
}

function saveEnabledAlts(newEnabledAlts: EnabledAlts): void {
  const json = JSON.stringify(newEnabledAlts);
  localStorage.setItem("enabledAlts", json);
}
