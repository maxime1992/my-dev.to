module.exports = {
  name: 'common-jest-utility',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/common/jest-utility',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
