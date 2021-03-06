import { idb } from "../db";

async function updateNewLeague({ lid }: { lid?: number }) {
	if (lid !== undefined) {
		// Importing!
		const l = await idb.meta.leagues.get(lid);

		if (l) {
			return {
				lid,
				difficulty: l.difficulty,
				name: l.name,
				lastSelectedTid: l.tid,
			};
		}
	}

	let newLid: number | undefined = undefined; // Find most recent league and add one to the LID

	await idb.meta.leagues.iterate("prev", (l, shortCircuit) => {
		newLid = l.lid + 1;
		shortCircuit();
	});

	if (newLid === undefined) {
		newLid = 1;
	}

	let lastSelectedTid = await idb.meta.attributes.get("lastSelectedTid");

	if (typeof lastSelectedTid !== "number" || Number.isNaN(lastSelectedTid)) {
		lastSelectedTid = -1;
	}

	return {
		lid: undefined,
		difficulty: undefined,
		name: `League ${newLid}`,
		lastSelectedTid,
	};
}

export default {
	runBefore: [updateNewLeague],
};
