import { idb } from "../db";
import { g, helpers } from "../util";
import { GetOutput, UpdateEvents } from "../../common/types";

async function updatePlayers(
	inputs: GetOutput,
	updateEvents: UpdateEvents,
	state: any,
) {
	if (
		updateEvents.includes("gameSim") ||
		inputs.abbrev !== state.abbrev ||
		inputs.season !== state.season
	) {
		let feats: any = await idb.getCopies.playerFeats(); // Put fake fid on cached feats

		let maxFid = 0;

		for (const feat of feats) {
			if (feat.fid !== undefined) {
				if (feat.fid > maxFid) {
					maxFid = feat.fid;
				}
			} else {
				maxFid += 1;
				feat.fid = maxFid;
			}
		}

		if (inputs.abbrev !== "all") {
			feats = feats.filter(
				feat => g.teamAbbrevsCache[feat.tid] === inputs.abbrev,
			);
		}

		if (inputs.season !== "all") {
			feats = feats.filter(feat => feat.season === inputs.season);
		}

		for (const feat of feats) {
			feat.stats.trb = feat.stats.orb + feat.stats.drb;
			feat.stats.fgp =
				feat.stats.fga > 0 ? (100 * feat.stats.fg) / feat.stats.fga : 0;
			feat.stats.tpp =
				feat.stats.tpa > 0 ? (100 * feat.stats.tp) / feat.stats.tpa : 0;
			feat.stats.ftp =
				feat.stats.fta > 0 ? (100 * feat.stats.ft) / feat.stats.fta : 0;

			if (feat.overtimes === 1) {
				feat.score += " (OT)";
			} else if (feat.overtimes > 1) {
				feat.score += ` (${feat.overtimes}OT)`;
			}

			feat.abbrev = g.teamAbbrevsCache[feat.tid];
			feat.oppAbbrev = g.teamAbbrevsCache[feat.oppTid];
			feat.stats.gmsc = helpers.gameScore(feat.stats); // Type

			if (feat.playoffs) {
				feat.type = "Playoffs";
			} else if (feat.tid === -1 || feat.tid === -2) {
				feat.type = "All-Star";
			} else {
				feat.type = "Regular Season";
			}
		}

		const stats =
			process.env.SPORT === "basketball"
				? [
						"gs",
						"min",
						"fg",
						"fga",
						"fgp",
						"tp",
						"tpa",
						"tpp",
						"ft",
						"fta",
						"ftp",
						"orb",
						"drb",
						"trb",
						"ast",
						"tov",
						"stl",
						"blk",
						"pf",
						"pts",
						"gmsc",
				  ]
				: [
						"pssCmp",
						"pss",
						"pssYds",
						"pssTD",
						"rus",
						"rusYds",
						"rusTD",
						"rec",
						"recYds",
						"recTD",
						"defInt",
						"defIntTD",
						"defFmbFrc",
						"defFmbRec",
						"defFmbTD",
						"defSk",
						"defSft",
						"prTD",
						"krTD",
				  ];
		return {
			abbrev: inputs.abbrev,
			feats,
			season: inputs.season,
			stats,
			userTid: g.userTid,
		};
	}
}

export default {
	runBefore: [updatePlayers],
};
