module.exports = {
  name: 'enigma',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/enigma',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js',
  ],
};
