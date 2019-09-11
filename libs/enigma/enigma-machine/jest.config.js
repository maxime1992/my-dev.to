module.exports = {
  name: 'enigma-machine',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/enigma-machine',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js',
  ],
};
