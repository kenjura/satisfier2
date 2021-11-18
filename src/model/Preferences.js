// @flow

import type { DesiredPart } from "./DesiredPart";

export type EnabledAlts = Array<string>;

export function getEnabledAlts(): EnabledAlts {
  const enabledAlts = loadEnabledAlts();
  return enabledAlts;
}

export function setEnabledAlts(newEnabledAlts: EnabledAlts): void {
  saveEnabledAlts(newEnabledAlts);
}

export function loadDesiredParts(): Array<DesiredPart> {
  const json = localStorage.getItem("desiredParts") || "[]";
  return JSON.parse(json);
}

export function saveDesiredParts(newDesiredParts: Array<DesiredPart>): void {
  const json = JSON.stringify(newDesiredParts);
  localStorage.setItem("desiredParts", json);
}

function loadEnabledAlts() {
  const json = localStorage.getItem("enabledAlts") || "[]";
  return JSON.parse(json);
}

function saveEnabledAlts(newEnabledAlts: EnabledAlts): void {
  const json = JSON.stringify(newEnabledAlts);
  localStorage.setItem("enabledAlts", json);
}
