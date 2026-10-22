import { sightWordsModule } from './sightWords';
import { letterIdentificationModule } from './letterIdentification';
import { beginningLetterSoundsModule } from './beginningLetterSounds';
import { rhymeMatchingModule } from './rhymeMatching';
import { oppositesAntonymsModule } from './oppositesAntonyms';
import { pluralFormsModule } from './pluralForms';
import { letterHeroModule } from './letterHero';

export const languageModules = [
  sightWordsModule,
  letterIdentificationModule,
  beginningLetterSoundsModule,
  rhymeMatchingModule,
  oppositesAntonymsModule,
  pluralFormsModule,
  letterHeroModule,
];

export * from './sightWords';
export * from './letterIdentification';
export * from './beginningLetterSounds';
export * from './rhymeMatching';
export * from './oppositesAntonyms';
export * from './pluralForms';
export * from './letterHero';
