module.exports = {
  name: 'timers',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/timers',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js',
  ],
};
