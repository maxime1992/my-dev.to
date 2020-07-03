module.exports = {
  name: 'time-s-up',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/time-s-up',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js',
  ],
};
