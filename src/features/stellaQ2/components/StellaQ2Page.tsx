import '../stellaQ2.css'
import { useLabMachine } from '../state/useLabMachine'
import BuildWorkspace from './BuildWorkspace'
import LandingScreen from './LandingScreen'

export default function StellaQ2Page() {
  const { state, dispatch } = useLabMachine()

  if (state.mode === 'intro') {
    return <LandingScreen onBegin={() => dispatch({ type: 'START_BUILD' })} />
  }

  return <BuildWorkspace state={state} dispatch={dispatch} />
}
