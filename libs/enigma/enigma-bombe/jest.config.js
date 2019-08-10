module.exports = {
  name: 'enigma-bombe',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/enigma-bombe',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
