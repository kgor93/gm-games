import { idb } from "../db";
import { g, random } from "../util";
import { UpdateEvents } from "../../common/types";

const updateFantasyDraft = async (inputs: {}, updateEvents: UpdateEvents) => {
	if (updateEvents.includes("firstRun")) {
		const teams = await idb.getCopies.teamsPlus({
			attrs: ["tid", "abbrev", "region", "name"],
		});
		random.shuffle(teams);
		return {
			phase: g.phase,
			teams,
			userTids: g.userTids,
		};
	}
};

export default {
	runBefore: [updateFantasyDraft],
};
