import Character from '../../../lib/Character';

export default interface NodeCharacterProvider {
  getIncomingEdgeFirstCharacter: () => Character;
}
