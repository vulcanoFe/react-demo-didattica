import { createContext, type Dispatch, type SetStateAction } from "react"
export type AccordionContextType = {
	openId: string | null
	setOpenId: Dispatch<SetStateAction<string | null>>
}

export const AccordionContext = createContext<AccordionContextType | null>(null)