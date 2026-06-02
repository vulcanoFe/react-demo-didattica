import ControlledInput from "../components/ControlledInput"
import UncontrolledInput from "../components/UncontrolledInput"
import { useForm } from "../hooks/useForm"
import { useLifecycleLogger } from "../hooks/useLifecycleLogger"
import styles from "./FormDemo.module.css"

function FormDemo() {
	useLifecycleLogger("FormDemo")

	console.log("🔄 RENDER FormDemo")


	const validateNameEmail = (values: Record<string, string>) => {
		const errors: Record<string, string> = {}

		if (!values.name) errors.name = "Campo obbligatorio"
		if (!values.email) errors.email = "Campo obbligatorio"
		else if (!values.email.includes("@")) errors.email = "Email non valida"

		return errors
	}


	const { values, handleChange, handleSubmit, errors } = useForm(
		{ name: "", email: "" },
		validateNameEmail
	)

	return (
		<div>
			<h2>Controlled vs Uncontrolled</h2>

			<ControlledInput />

			<hr />

			<UncontrolledInput />

			<hr />

			<form
				className={styles.form}
				onSubmit={handleSubmit(console.log)}
			>
				<div className={styles.formField}>
					<label htmlFor="name">Nome</label>
					<input
						name="name"
						value={values.name}
						onChange={handleChange}
						className={`${styles.input} ${errors.name ? styles.inputError : ""
							}`}
					/>

					<div className={styles.errorContainer}>
						{errors.name && (
							<span className={styles.error}>{errors.name}</span>
						)}
					</div>
				</div>

				<div className={styles.formField}>
					<label htmlFor="email">Email</label>
					<input
						name="email"
						value={values.email}
						onChange={handleChange}
						className={`${styles.input} ${errors.email ? styles.inputError : ""
							}`}
					/>

					<div className={styles.errorContainer}>
						{errors.email && (
							<span className={styles.error}>{errors.email}</span>
						)}
					</div>
				</div>

				<div className={styles.buttonRow}>
					<button type="submit">Invia</button>
				</div>
			</form>

		</div>
	)
}

export default FormDemo