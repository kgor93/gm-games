import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import useTitleBar from "../hooks/useTitleBar";
import { toWorker } from "../util";

const Live = ({ games, gamesInProgress }) => {
	useTitleBar({ title: "Live Game Simulation" });

	return (
		<>
			<p>
				To view a live play-by-play summary of a game, select one of tomorrow's
				games below.
			</p>

			{gamesInProgress ? (
				<p className="text-danger">
					Stop the current game simulation to select a play-by-play game.
				</p>
			) : null}

			{games.map(gm => {
				return (
					<button
						key={gm.gid}
						className={classNames("btn float-left mb-3 mr-3", {
							"btn-light-bordered": !gm.highlight,
							"btn-success": gm.highlight,
						})}
						disabled={gamesInProgress}
						onClick={() => toWorker("actions.liveGame", gm.gid)}
					>
						{gm.awayRegion} {gm.awayName} at
						<br />
						{gm.homeRegion} {gm.homeName}
					</button>
				);
			})}
		</>
	);
};

Live.propTypes = {
	games: PropTypes.arrayOf(
		PropTypes.shape({
			awayName: PropTypes.string.isRequried,
			awayRegion: PropTypes.string.isRequried,
			gid: PropTypes.number.isRequried,
			highlight: PropTypes.bool.isRequried,
			homeName: PropTypes.string.isRequried,
			homeRegion: PropTypes.string.isRequried,
		}),
	),
	gamesInProgress: PropTypes.bool,
};

export default Live;
