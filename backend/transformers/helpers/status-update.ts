import { MigrationMetaData } from '../../../domain/interfaces';

export const broadcastStatusUpdate = (payload: MigrationMetaData) => {
  //@ts-expect-error if electron is not imported this causes errors
  process.parentPort.postMessage({
    event: 'statusUpdateTransformer',
    payload: payload,
  });
};
