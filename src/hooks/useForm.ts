import { useState } from "react"

export function useForm(
	initialValues: Record<string, string>,
	validate?: (values: Record<string, string>) => Record<string, string>
) {
	const [values, setValues] = useState(initialValues)
	const [errors, setErrors] = useState<Record<string, string>>({})

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target

		setValues((prev) => ({
			...prev,
			[name]: value
		}))
	}

	const handleSubmit = (onSubmit: (values: Record<string, string>) => void) => {
		return (e: React.SubmitEvent) => {
			e.preventDefault()

			const validationErrors = validate ? validate(values) : {}

			if (Object.keys(validationErrors).length > 0) {
				setErrors(validationErrors)
				return
			}

			onSubmit(values)
		}
	}

	return {
		values,
		errors,
		handleChange,
		handleSubmit
	}
}
``