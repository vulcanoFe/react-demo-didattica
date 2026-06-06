/**
 * AccordionContext.ts
 * ====================
 * Definisce il Context React che funge da "canale di comunicazione"
 * tra il root Accordion e tutti i suoi sotto-componenti (Item, Header, Panel).
 *
 * PERCHÉ UN CONTEXT?
 *   Nel pattern Compound Components, i sotto-componenti devono condividere
 *   uno stato comune (quale pannello è aperto) senza che il consumer esterno
 *   debba passare props manualmente a ciascuno di essi (prop drilling).
 *   Il Context risolve questo: lo stato vive nel root Accordion e viene
 *   "trasmesso" automaticamente a chiunque si trovi dentro l'albero.
 *
 * STRUTTURA DEL CONTEXT:
 *   - openId:    l'id del pannello attualmente aperto (null = tutti chiusi)
 *   - setOpenId: la funzione per cambiare quale pannello è aperto
 *
 * PERCHÉ `null` come valore di default del createContext?
 *   Serve come sentinella: se un sotto-componente viene usato FUORI
 *   dall'Accordion (senza Provider), il context vale null e il custom
 *   hook useAccordion può lanciare un errore descrittivo invece di
 *   fallire silenziosamente con un crash oscuro.
 */

import { createContext, type Dispatch, type SetStateAction } from "react"

/**
 * Forma del valore condiviso dal Context.
 * Entrambe le proprietà sono richieste: non ha senso leggere openId
 * senza poterlo cambiare, e viceversa.
 */
export type AccordionContextType = {
	/** ID del pannello attualmente aperto. `null` significa tutti chiusi. */
	openId: string | null
	/** Setter di openId — esposto ai sotto-componenti che devono aprire/chiudere pannelli. */
	setOpenId: Dispatch<SetStateAction<string | null>>
}

/**
 * Il Context vero e proprio.
 * Inizializzato a `null` deliberatamente: il valore reale viene
 * iniettato da <AccordionContext.Provider> dentro il root Accordion.
 */
export const AccordionContext = createContext<AccordionContextType | null>(null)