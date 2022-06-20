import Character from '../../../common/Character';

export default interface NodeCharacterProvider {
  getIncomingEdgeFirstCharacter: () => Character;
}
