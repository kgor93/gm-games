import { PHASE } from "../../common";
import { idb } from "../db";
import { g } from "../util";
import { GetOutput, UpdateEvents } from "../../common/types";

async function updateHistory(inputs: GetOutput, updateEvents: UpdateEvents) {
	if (
		updateEvents.includes("firstRun") ||
		(updateEvents.includes("newPhase") && g.phase === PHASE.DRAFT_LOTTERY)
	) {
		const [awards, teams] = await Promise.all([
			idb.getCopies.awards(),
			idb.getCopies.teamsPlus({
				attrs: ["tid", "abbrev", "region", "name"],
				seasonAttrs: ["season", "playoffRoundsWon", "won", "lost", "tied"],
			}),
		]);
		const awardNames =
			process.env.SPORT === "basketball"
				? ["finalsMvp", "mvp", "dpoy", "smoy", "mip", "roy"]
				: ["finalsMvp", "mvp", "dpoy", "oroy", "droy"];
		const seasons = awards.map(a => {
			return {
				season: a.season,
				finalsMvp: a.finalsMvp,
				mvp: a.mvp,
				dpoy: a.dpoy,
				smoy: a.smoy,
				mip: a.mip,
				roy: a.roy,
				oroy: a.oroy,
				droy: a.droy,
				runnerUp: undefined,
				champ: undefined,
			};
		});

		for (let i = 0; i < seasons.length; i++) {
			// Use this rather than numGamesPlayoffSeries in case configuration changes during a league
			const maxPlayoffRoundsWon = teams.reduce((max, t) => {
				for (const seasonAttrs of t.seasonAttrs) {
					if (seasonAttrs.season === seasons[i].season) {
						return seasonAttrs.playoffRoundsWon > max
							? seasonAttrs.playoffRoundsWon
							: max;
					}
				}

				return max;
			}, 0);

			for (const t of teams) {
				// Find corresponding entries in seasons and t.seasonAttrs. Can't assume they are the same because they aren't if some data has been deleted (Delete Old Data)
				let found = false;
				let j;

				for (j = 0; j < t.seasonAttrs.length; j++) {
					if (t.seasonAttrs[j].season === seasons[i].season) {
						found = true;
						break;
					}
				}

				if (!found) {
					continue;
				}

				if (t.seasonAttrs[j].playoffRoundsWon === maxPlayoffRoundsWon) {
					seasons[i].champ = {
						tid: t.tid,
						abbrev: t.abbrev,
						region: t.region,
						name: t.name,
						won: t.seasonAttrs[j].won,
						lost: t.seasonAttrs[j].lost,
						tied: t.seasonAttrs[j].tied,
						count: 0,
					};
				} else if (
					t.seasonAttrs[j].playoffRoundsWon ===
					maxPlayoffRoundsWon - 1
				) {
					seasons[i].runnerUp = {
						tid: t.tid,
						abbrev: t.abbrev,
						region: t.region,
						name: t.name,
						won: t.seasonAttrs[j].won,
						lost: t.seasonAttrs[j].lost,
						tied: t.seasonAttrs[j].tied,
					};
				}
			}
		}

		// Count up number of championships per team
		const championshipsByTid = Array(g.numTeams).fill(0);

		for (let i = 0; i < seasons.length; i++) {
			if (seasons[i].champ) {
				championshipsByTid[seasons[i].champ.tid] += 1;
			}

			if (seasons[i].champ) {
				seasons[i].champ.count = championshipsByTid[seasons[i].champ.tid];
			}
		}

		return {
			awards: awardNames,
			seasons,
			teamAbbrevsCache: g.teamAbbrevsCache,
			ties: g.ties,
			userTid: g.userTid,
		};
	}
}

export default {
	runBefore: [updateHistory],
};
