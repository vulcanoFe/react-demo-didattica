import { memo } from "react"
import styled from "styled-components"
import { useLifecycleLogger } from "../hooks/useLifecycleLogger"

interface BottoneProps {
  $primario: boolean
}

// 💡 attenzione: lo styled component viene creato UNA VOLTA
const StyledButton = styled.button<BottoneProps>`
  background-color: ${(props) => {
    console.log("🎨 [STYLE EVAL] Bottone:", props.$primario)
    return props.$primario ? "blue" : "gray"
  }};
  color: white;
  padding: 10px;
  margin: 10px;
`
function Bottone(props: BottoneProps) {
	useLifecycleLogger("Bottone", {primario: props.$primario})

	console.log("🔄 RENDER Bottone");
	
  return (
    <StyledButton {...props}>
      Bottone dinamico
    </StyledButton>
  )

}
export default memo(Bottone);