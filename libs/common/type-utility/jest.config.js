module.exports = {
  name: 'common-type-utility',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/common/type-utility',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js',
  ],
};
