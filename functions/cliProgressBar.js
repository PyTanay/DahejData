import { SingleBar } from 'cli-progress';

const b1 = new SingleBar({
  format:
    'File checking progress || {bar} || {percentage}% || {value}/{total} Files || ETA : {eta_formatted} || Time elapsed : {duration_formatted}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
});

export default b1;
