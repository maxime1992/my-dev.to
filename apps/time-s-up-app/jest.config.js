module.exports = {
  name: 'time-s-up-app',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/time-s-up-app',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js',
  ],
};
