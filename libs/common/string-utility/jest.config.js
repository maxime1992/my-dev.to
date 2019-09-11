module.exports = {
  name: 'common-string-utility',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/common/string-utility',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js',
  ],
};
