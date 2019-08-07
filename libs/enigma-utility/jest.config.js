module.exports = {
  name: 'enigma-utility',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/enigma-utility',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
