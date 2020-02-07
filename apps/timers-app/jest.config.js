module.exports = {
  name: 'timers-app',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/timers-app',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js',
  ],
};
