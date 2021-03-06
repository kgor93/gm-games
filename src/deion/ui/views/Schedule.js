import PropTypes from "prop-types";
import React from "react";
import { CompletedGame, UpcomingGame } from "../components";
import useTitleBar from "../hooks/useTitleBar";

const Schedule = ({ abbrev, completed, season, upcoming }) => {
	useTitleBar({
		title: "Schedule",
		dropdownView: "schedule",
		dropdownFields: { teams: abbrev },
	});

	return (
		<>
			<div className="row">
				<div className="col-sm-6">
					<h2>Upcoming Games</h2>
					<ul className="list-group">
						{upcoming.map(({ gid, teams }) => (
							<UpcomingGame key={gid} teams={teams} />
						))}
					</ul>
				</div>
				<div className="col-sm-6 d-none d-sm-block">
					<h2>Completed Games</h2>
					<ul className="list-group">
						{completed === undefined
							? "Loading..."
							: completed.map(({ gid, overtime, result, score, teams }) => {
									return (
										<CompletedGame
											key={gid}
											abbrev={abbrev}
											gid={gid}
											overtime={overtime}
											result={result}
											score={score}
											season={season}
											teams={teams}
										/>
									);
							  })}
					</ul>
				</div>
			</div>
		</>
	);
};

Schedule.propTypes = {
	abbrev: PropTypes.string.isRequired,
	completed: PropTypes.arrayOf(PropTypes.object),
	season: PropTypes.number.isRequired,
	upcoming: PropTypes.arrayOf(
		PropTypes.shape({
			gid: PropTypes.number.isRequired,
			teams: PropTypes.arrayOf(
				PropTypes.shape({
					abbrev: PropTypes.string.isRequired,
					name: PropTypes.string.isRequired,
					region: PropTypes.string.isRequired,
					seasonAttrs: PropTypes.shape({
						lost: PropTypes.number.isRequired,
						won: PropTypes.number.isRequired,
					}).isRequired,
				}),
			).isRequired,
		}),
	).isRequired,
};

export default Schedule;
