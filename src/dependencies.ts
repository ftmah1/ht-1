import { db } from "./db";
import { FormRepositoryClass } from "./forms/formRepository/formRepositoryClass";
import { lookupPostcode } from "./providers/idealpostcodes";
import { notifyTeamAndUpdateEmailSent } from "./shared/notifyTeamAndUpdateEmailSent";


export function createDependencies() {
  return {
    formRepository: new FormRepositoryClass(db),
    lookupPostcode,
    notifyTeam: notifyTeamAndUpdateEmailSent,
  };
}

export const dependencies = createDependencies();
