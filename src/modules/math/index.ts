import { mathSprintModule } from './mathSprint';
import { singleDigitAdditionModule } from './singleDigitAddition';
import { singleDigitSubtractionModule } from './singleDigitSubtraction';
import { numberBonds10Module } from './numberBonds10';
import { skipCountingModule } from './skipCounting';
import { greaterLessThanModule } from './greaterLessThan';
import { placeValueBlocksModule } from './placeValueBlocks';
import { coinIdentificationModule } from './coinIdentification';
import { shapesGeometryModule } from './shapesGeometry';
import { clockReadingModule } from './clockReading';
import { dotCountingModule } from './dotCounting';

export const mathModules = [
  mathSprintModule,
  singleDigitAdditionModule,
  singleDigitSubtractionModule,
  numberBonds10Module,
  skipCountingModule,
  greaterLessThanModule,
  placeValueBlocksModule,
  coinIdentificationModule,
  shapesGeometryModule,
  clockReadingModule,
  dotCountingModule,
];

export * from './mathSprint';
export * from './singleDigitAddition';
export * from './singleDigitSubtraction';
export * from './numberBonds10';
export * from './skipCounting';
export * from './greaterLessThan';
export * from './placeValueBlocks';
export * from './coinIdentification';
export * from './shapesGeometry';
export * from './clockReading';
export * from './dotCounting';
