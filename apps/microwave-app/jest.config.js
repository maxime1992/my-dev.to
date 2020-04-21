module.exports = {
  name: 'microwave-app',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/microwave-app',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js',
  ],
};
