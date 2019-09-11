module.exports = {
  name: 'common-object-utility',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/common/object-utility',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js',
  ],
};
