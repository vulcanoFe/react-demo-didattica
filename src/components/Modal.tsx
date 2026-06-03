
import { createPortal } from "react-dom";
import { useLifecycleLogger } from "../hooks/useLifecycleLogger";

type ModalProps = {
	isOpen: boolean;
	onClose: () => void;
	children?: React.ReactNode;
};

export default function Modal({ isOpen, onClose, children }: ModalProps) {
	const modalRoot = document.getElementById("modal-root");

	useLifecycleLogger("Modal", { isOpen });

	if (!isOpen) {
		console.log("[Modal] NOT rendered (isOpen = false)");
		return null;
	}

	console.log("[Modal] rendering via Portal into #modal-root");

	const handleOverlayClick = () => {
		console.log("[Modal] click su overlay → chiudo modal");
		onClose();
	};

	const handleContentClick = (e) => {
		e.stopPropagation(); // 🔥 evita chiusura modal
		console.log("[Modal] click dentro contenuto (propagation stoppata)");
	};

	const modalContent = (
		<div className="modal-overlay" onClick={handleOverlayClick}>
			<div className="modal" onClick={handleContentClick}>
				<h2>Modal Portal</h2>
				<p>Questo contenuto NON è dentro #root ma dentro #modal-root</p>

				{children}

				<button onClick={onClose}>Chiudi</button>
			</div>
		</div>
	);

	// 🔥 QUI avviene la magia del Portal
	return createPortal(modalContent, modalRoot);
}