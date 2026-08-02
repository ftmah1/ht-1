import { db } from "../db";
import { lookupPostcode } from "../providers/idealpostcodes";
import { notifyTeamAndUpdateEmailSent } from "./notifyTeamAndUpdateEmailSent";
import { FormRepositoryClass } from "../forms/formRepository/formRepositoryClass";

export const initiasedDb = new FormRepositoryClass(db);

export function createDependencies() {
  return {
    formRepository: initiasedDb,
    lookupPostcode,
    notifyTeam: notifyTeamAndUpdateEmailSent,
  };
}
