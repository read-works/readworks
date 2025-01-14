export const appLogger = (
  data: any,
  event: string = '',
  channel: 'logEntryBackend' | 'logEntryTransformer' = 'logEntryBackend',
) => {
  if (!['string', 'number'].includes(typeof data)) {
    data = JSON.stringify(data, null, '\t');
  }

  if (!process.env.READWORKS_PROJECT) {
    console.log(
      new Date().toISOString(),
      'engine' + (event.length ? ':' + event : ''),
      !!data ? data : '',
    );
    return;
  }

  //@ts-expect-error if electron is not imported this causes errors
  process.parentPort.postMessage({
    event: channel,
    payload: {
      event: 'engine' + (event.length ? ':' + event : ''),
      data,
    },
  });
};
