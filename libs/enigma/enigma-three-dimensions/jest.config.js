module.exports = {
  name: 'enigma-enigma-three-dimensions',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/enigma/enigma-three-dimensions',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js',
  ],
};
