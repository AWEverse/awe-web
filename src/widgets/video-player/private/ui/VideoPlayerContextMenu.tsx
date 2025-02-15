import ContextMenu from "@/entities/context-menu";
import { ContextMenuProps } from "@/entities/context-menu/public/ContextMenu";
import ActionButton from "@/shared/ui/ActionButton";
import MenuSeparator from "@/shared/ui/MenuSeparator";
import {
	RepeatOutlined,
	LoopRounded,
	ControlPointDuplicateSharp,
	LibraryAddRounded,
	ArrowRightRounded,
	ArrowLeftRounded,
} from "@mui/icons-material";
import { AnimatePresence, motion } from "motion/react";
import { FC, useState, useCallback, memo } from "react";

interface VideoPlayerContextMenuProps
	extends Omit<ContextMenuProps, "children"> {}

const VideoPlayerContextMenu: FC<VideoPlayerContextMenuProps> = (props) => {
	// Rename state to clearly indicate which menu is showing.
	const [showSavingActions, setShowSavingActions] = useState(false);

	const openSavingActions = useCallback(() => {
		setShowSavingActions(true);
	}, []);

	const goBack = useCallback(() => {
		setShowSavingActions(false);
	}, []);

	return (
		<ContextMenu {...props}>
			<AnimatePresence initial={false}>
				<motion.div
					key={showSavingActions ? "savingActions" : "main"}
					initial={{ x: showSavingActions ? "100%" : "-100%" }}
					animate={{ x: 0 }}
					exit={{ x: showSavingActions ? "100%" : "-100%" }}
					transition={{ duration: 0.125 }}
					className="relative flex gap-2 "
				>
					{showSavingActions ? (
						<div className="">
							<ActionButton
								size="sm"
								variant="contained"
								fullWidth
								onClick={goBack}
							>
								<ArrowLeftRounded />
								<span>Go back</span>
							</ActionButton>

							<MenuSeparator size="thick" />

							<ActionButton
								size="sm"
								variant="contained"
								fullWidth
								onClick={goBack}
							>
								<ArrowLeftRounded />
								<span>Save video frame as...</span>
							</ActionButton>

							<ActionButton
								size="sm"
								variant="contained"
								fullWidth
								onClick={goBack}
							>
								<ArrowLeftRounded />
								<span>Save video as...</span>
							</ActionButton>

							{/* You can add additional saving action buttons here */}
						</div>
					) : (
						<div>
							<ActionButton size="sm" variant="contained" fullWidth>
								<RepeatOutlined />
								<span>Repeat</span>
							</ActionButton>
							<ActionButton size="sm" variant="contained" fullWidth>
								<LoopRounded />
								<span>Loop</span>
							</ActionButton>
							<ActionButton size="sm" variant="contained" fullWidth>
								<ControlPointDuplicateSharp />
								<span>Show controls</span>
							</ActionButton>
							<MenuSeparator size="thick" />
							<ActionButton
								size="sm"
								variant="contained"
								fullWidth
								onClick={openSavingActions}
							>
								<LibraryAddRounded />
								<span>Saving actions</span>
								<ArrowRightRounded />
							</ActionButton>
						</div>
					)}
				</motion.div>
			</AnimatePresence>
		</ContextMenu>
	);
};

export default memo(VideoPlayerContextMenu);
